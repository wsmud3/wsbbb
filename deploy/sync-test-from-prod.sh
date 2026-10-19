#!/bin/bash
# 测试服同步器：跟随正式服 HEAD，但**保留朋友的本地修改**
#
# ── 为什么需要这样 ─────────────────────────────────────────────
# 旧实现每 2 分钟用 `rsync --delete` 从 prod HEAD 全量覆盖测试服，
# 于是朋友在 /home/mud/mud-test 里的任何改动都在 2 分钟内被抹掉。
#
# 但"两服必须同版本"也有真实理由：曾因令牌格式不一致导致测试服无法登录。
# 所以不能简单取消同步。
#
# ── 方案：三段式 ───────────────────────────────────────────────
#   1) 同步前：把"与基线不同"的文件识别为**本地修改**，快照到 overrides/
#   2) 全量同步 prod HEAD（保证 99% 的文件与正式服一致、令牌格式兼容）
#   3) 把快照的本地修改**覆盖回去**，使其长期生效
#
#   基线（pristine）每次同步后从 stage（= prod HEAD 原样）重算，因此：
#     · 朋友改了文件        → 与基线不同 → 被保留
#     · 朋友把文件改回上游  → 与基线相同 → 自动退出 override，不再遮蔽上游
#     · 上游也改了同一文件  → 记为**冲突**，在日志与 restart-test.sh 里醒目提示
#
# ── 安全边界 ───────────────────────────────────────────────────
#   data/ log/ node_modules/ .env 是指向正式服的软链接 → rsync 排除，绝不替换
#   www/ _logs/ .git/ 排除（前端产物由正式服提供，测试服只跑游戏服代码）
#   不能用 --delete-excluded（会把被排除项也删掉，实测会删掉上述软链接）

set -uo pipefail

SRC=/home/mud/mud
DEST=/home/mud/mud-test
STATE=/srv/mud-test-sync/state
MARKER=$STATE/synced-from-prod
LOG=/var/log/mud-test-sync.log
STAGE=/srv/mud-test-sync/stage
OVER=/srv/mud-test-sync/overrides
BASE=$STATE/pristine.sha256
LIST=$STATE/local-edits.txt
EDITS_HASH_FILE=$STATE/edits.hash

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" >> "$LOG"; }

# 755 而不是 700：清单要让 mudmod 组（朋友）能读，否则他不知道哪些改动在生效
install -d -m 755 -o root -g root "$STATE"
REV=$(sudo -u mud git -C "$SRC" rev-parse HEAD 2>/dev/null) || exit 0
[ -n "$REV" ] || exit 0

# ── 校验和快照：只覆盖参与同步的路径 ──────────────────────────
snapshot() {
    local root=$1 out=$2
    ( cd "$root" 2>/dev/null || return 1
      find . \
        -path ./data -prune -o -path ./log -prune -o \
        -path ./node_modules -prune -o -path ./.env -prune -o \
        -path ./www -prune -o -path ./_logs -prune -o \
        -path ./.git -prune -o \
        -type f -print0 2>/dev/null \
        | sort -z | xargs -0 -r sha256sum 2>/dev/null ) > "$out"
    return 0
}

LAST=$(cat "$MARKER" 2>/dev/null || true)
REV_CHANGED=0
[ "$REV" != "$LAST" ] && REV_CHANGED=1

# 即使 REV 没变，本地修改也可能新增/变化，因此仍需跑一遍（成本很低）
log "开始同步：正式服 ${LAST:0:7} -> ${REV:0:7}（REV_CHANGED=$REV_CHANGED）"

rm -rf "$STAGE"; mkdir -p "$STAGE"
if ! sudo -u mud git -C "$SRC" archive "$REV" | tar -x -C "$STAGE" 2>>"$LOG"; then
    log "导出失败，跳过"
    rm -rf "$STAGE"
    exit 0
fi

# ── 1) 识别本地修改 ───────────────────────────────────────────
snapshot "$STAGE" /tmp/mts-new.sha256
snapshot "$DEST"  /tmp/mts-cur.sha256

# 用 python 做集合运算（bash 处理大文件太慢）
read -r N_EDITS N_CONFLICT < <(python3 - "$BASE" /tmp/mts-cur.sha256 /tmp/mts-new.sha256 "$OVER" "$DEST" "$LIST" <<'PY'
import sys, os, shutil

base_p, cur_p, new_p, over_dir, dest, listing = sys.argv[1:7]

def load(p):
    d = {}
    try:
        with open(p, 'r', encoding='utf-8', errors='replace') as f:
            for line in f:
                line = line.rstrip('\n')
                if not line:
                    continue
                h, sep, path = line.partition('  ')
                if sep and path:
                    d[path] = h
    except FileNotFoundError:
        return None
    return d

base = load(base_p)
cur = load(cur_p) or {}
new = load(new_p) or {}

# 首次运行（没有基线）：把当前状态当作基线，不产生 override
if base is None:
    print('0 0')
    sys.exit(0)

# 本地修改 = 当前内容与基线不同的文件（新增文件也算）
edits = sorted([p for p, h in cur.items() if base.get(p) != h])

# 上游改动 = 新版本与基线不同的文件
upstream = set(p for p, h in new.items() if base.get(p) != h)
conflicts = sorted([p for p in edits if p in upstream])

# 刷新 override 快照
shutil.rmtree(over_dir, ignore_errors=True)
os.makedirs(over_dir, exist_ok=True)
kept = []
for p in edits:
    src = os.path.join(dest, p.lstrip('./'))
    if not os.path.isfile(src):
        continue
    dst = os.path.join(over_dir, p.lstrip('./'))
    os.makedirs(os.path.dirname(dst) or over_dir, exist_ok=True)
    try:
        shutil.copy2(src, dst)
        kept.append(p)
    except Exception:
        pass

# 写清单，供 restart-test.sh 与人工查看
with open(listing, 'w', encoding='utf-8') as f:
    f.write('# 测试服上被保留的本地修改（会遮蔽上游同名文件）\n')
    f.write('# 生成时间: %s\n' % __import__('time').strftime('%Y-%m-%d %H:%M:%S'))
    f.write('# 把文件改回与上游一致即可自动移除；上游也改了同一文件会标 [冲突]\n')
    for p in kept:
        f.write(('[冲突] ' if p in conflicts else '       ') + p.lstrip('./') + '\n')
    if not kept:
        f.write('（无）\n')

print('%d %d' % (len(kept), len(conflicts)))
PY
)

N_EDITS=${N_EDITS:-0}
N_CONFLICT=${N_CONFLICT:-0}
[ "$N_EDITS" -gt 0 ] && log "检测到本地修改 $N_EDITS 个（其中与上游冲突 $N_CONFLICT 个）"
[ "$N_CONFLICT" -gt 0 ] && log "⚠ 冲突文件（本地版本会遮蔽上游改动）：$(grep '^\[冲突\]' "$LIST" 2>/dev/null | sed 's/^\[冲突\] //' | tr '\n' ' ')"

# ── 2) 全量同步 prod HEAD ─────────────────────────────────────
rsync -a --delete \
    --exclude=/data --exclude=/log --exclude=/node_modules --exclude=/.env \
    --exclude=/www --exclude=/_logs --exclude=/.git \
    2>>"$LOG" "$STAGE/" "$DEST/"
if [ $? -ne 0 ]; then log "rsync 失败，不重启"; rm -rf "$STAGE"; exit 0; fi

# ── 3) 把本地修改覆盖回去 ────────────────────────────────────
if [ -d "$OVER" ] && [ -n "$(ls -A "$OVER" 2>/dev/null)" ]; then
    rsync -a 2>>"$LOG" "$OVER/" "$DEST/"
    log "已恢复本地修改 $N_EDITS 个到测试服"
fi

# 复核：软链接必须还在，否则立即停手
for l in data log node_modules .env; do
    if [ ! -L "$DEST/$l" ]; then
        log "严重：$DEST/$l 不是软链接，停止同步并请人工检查"
        rm -rf "$STAGE"
        exit 1
    fi
done

# 基线 = 上游原样（不含本地修改）；下次据此判断"谁改过"
mv -f /tmp/mts-new.sha256 "$BASE" 2>/dev/null || true
chown root:root "$BASE" 2>/dev/null || true
chmod 644 "$LIST" 2>/dev/null || true

# 测试服的 release 标记（os/release.js 读 <根>/.git/HEAD）
install -d -m 755 -o mud -g mudmod "$DEST/.git"
printf '%s\n' "$REV" > "$DEST/.git/HEAD"
chown mud:mudmod "$DEST/.git/HEAD"
chmod 644 "$DEST/.git/HEAD"

# 变更的 js 语法自检（只查 os/**，语法错会拦住服务启动）
BAD=0
for f in $(cd "$STAGE" && find os -name '*.js' 2>/dev/null); do
    if [ -f "$DEST/$f" ] && ! node --check "$DEST/$f" >/dev/null 2>&1; then
        log "os/ 语法错误：$f"; BAD=$((BAD+1))
    fi
done
if [ "$BAD" -gt 0 ]; then
    log "os/ 下 $BAD 个语法错误 → 已同步但不重启测试服"
    printf '%s' "$REV" > "$MARKER"
    rm -rf "$STAGE"
    exit 0
fi

# 属主与权限：朋友在 mudmod 组，必须能写才能改
chown mud:mudmod "$DEST"
chown -R mud:mudmod "$DEST" 2>/dev/null || true
chmod g+ws "$DEST" 2>/dev/null || true
find "$DEST" -type d -exec chmod g+ws {} + 2>/dev/null || true
find "$DEST" -type f -exec chmod g+w {} + 2>/dev/null || true

# 本地修改集合是否变化（决定要不要重启，让朋友的改动生效）
# 注意：不能把清单里的"生成时间"注释算进哈希，否则每轮都判定为变化，
# 导致测试服每 2 分钟重启一次（会打断朋友的测试）。
CUR_EDITS_HASH=$( { grep -v '^#' "$LIST" 2>/dev/null; find "$OVER" -type f -print0 2>/dev/null | sort -z | xargs -0 -r sha256sum 2>/dev/null; } | sha256sum | cut -d' ' -f1)
PREV_EDITS_HASH=$(cat "$EDITS_HASH_FILE" 2>/dev/null || true)
printf '%s' "$CUR_EDITS_HASH" > "$EDITS_HASH_FILE"

NEED_RESTART=0
[ "$REV_CHANGED" = "1" ] && NEED_RESTART=1
[ "$CUR_EDITS_HASH" != "$PREV_EDITS_HASH" ] && NEED_RESTART=1

if [ "$NEED_RESTART" = "1" ]; then
    if sudo -u mud env PM2_HOME=/home/mud/.pm2 pm2 restart mud-game-test >>"$LOG" 2>&1; then
        log "已同步并重启测试服（跟随正式服 ${REV:0:7}，本地修改 ${N_EDITS} 个）"
    else
        log "同步完成但重启失败"
    fi
else
    log "无需变更（版本与本地修改均未变）"
fi

printf '%s' "$REV" > "$MARKER"
rm -rf "$STAGE"
