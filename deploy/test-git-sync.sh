#!/bin/bash
# 测试服代码双向同步：GitHub 的 test-server 分支  ⇄  服务器上的直接修改
#
# ── 要解决的问题 ───────────────────────────────────────────────
# 朋友有两种改法，都要支持：
#   (a) 在 GitHub 上往 test-server 分支提交
#   (b) 直接在服务器 /home/mud/mud-test 里改
#
# ── 核心模型 ───────────────────────────────────────────────────
# **test-server 分支 = main + 朋友的改动（overrides）**
# 每轮：
#   1. 取 origin/main 与 origin/test-server
#   2. 若分支上有"不是我们推的"新提交，把那些文件导入 overrides/
#   3. 把 clone 重置到 origin/main，叠加 overrides，提交并**强制推送** test-server
#      → 分支永远精确等于"当前 main + 当前 overrides"
#   4. 调用主同步器，把 overrides 应用回测试服
#
# ── 关键防呆：只在"我们上次推送之后"的提交里找朋友的新改动 ──────
# test-server 曾落后 main 81 个提交。若直接 diff main..test-server，
# 会把大量旧版本当成"朋友的改动"灌进 overrides（灾难性）。
# 因此用 last-pushed-sha 记录我们自己上次推的提交，只 diff 它之后的部分。
#
# 冲突策略：**服务器上的版本优先**（朋友正在那里调试，最贴近真实状态），
#          被覆盖的远端版本存到 conflicts/ 供事后比对，并在日志里告警。
#
# 安全：只强制推送 test-server，绝不碰 main。
set -uo pipefail

STATE=/srv/mud-test-sync/state
OVER=/srv/mud-test-sync/overrides
GITDIR=/srv/mud-test-sync/git
CONFLICT=$STATE/conflicts
SENTINEL=$STATE/last-pushed-sha
BRANCH=test-server
REMOTE=git@github.com:wsmud3/wsbbb.git
LOG=/var/log/mud-test-git-sync.log
LOCK=$STATE/sync.lock
SYNC=/home/mud/bin/sync-mud-test-from-prod.sh

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" >> "$LOG"; }

install -d -m 755 -o root -g root "$STATE"
install -d -m 775 -o mud -g mudmod "$CONFLICT" 2>/dev/null || true

mkdir -p "$OVER"
chown -R mud:mudmod "$OVER" 2>/dev/null || true

# 先跑一次主同步器：它负责"识别服务器上的本地改动"并写入 overrides/。
# **必须在拿锁之前调用** —— 主同步器自己也抢这把锁，若我们持有锁再调它，
# 它会 flock 失败直接 exit 0（实测：导致 overrides 一直是旧状态、推送漏文件）。
if [ -x "$SYNC" ]; then bash "$SYNC" >>"$LOG" 2>&1; fi

# 与主同步器互斥（后面的 git 操作与 overrides 修改）
exec 9>"$LOCK" 2>/dev/null || exit 0
flock -n 9 || exit 0

# ── 1. 准备 clone（以 mud 身份，用它的部署密钥）──────────────────
if [ ! -d "$GITDIR/.git" ]; then
    log "初始化 git 工作区 $GITDIR"
    rm -rf "$GITDIR"
    install -d -m 775 -o mud -g mudmod "$GITDIR"
    if ! sudo -u mud git clone -q "$REMOTE" "$GITDIR" >>"$LOG" 2>&1; then
        log "克隆失败，跳过本轮"
        exit 0
    fi
fi
chown -R mud:mudmod "$GITDIR" 2>/dev/null || true
G() { sudo -u mud git -C "$GITDIR" "$@"; }

# ── 2. 取最新 main 与 test-server ─────────────────────────────
G fetch -q origin "+refs/heads/main:refs/remotes/origin/main" 2>>"$LOG" || { log "fetch main 失败"; exit 0; }
G fetch -q origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" 2>>"$LOG" || true

G rev-parse -q --verify "refs/remotes/origin/main" >/dev/null 2>&1 || { log "无 origin/main"; exit 0; }
MAIN_SHA=$(G rev-parse "refs/remotes/origin/main")

HAS_BRANCH=0
G rev-parse -q --verify "refs/remotes/origin/$BRANCH" >/dev/null 2>&1 && HAS_BRANCH=1
BR_SHA=""
[ "$HAS_BRANCH" = "1" ] && BR_SHA=$(G rev-parse "refs/remotes/origin/$BRANCH")

LAST=$(cat "$SENTINEL" 2>/dev/null || true)

# ── 3. 首次运行：建立哨兵，不导入（避免把 81 个旧提交误当朋友改动）──
if [ -z "$LAST" ]; then
    printf '%s' "${BR_SHA:-$MAIN_SHA}" > "$SENTINEL"
    chmod 644 "$SENTINEL"
    log "首次运行：哨兵初始化为 ${BR_SHA:0:7}${MAIN_SHA:0:7}，本轮不导入（避免历史误判）"
    LAST="${BR_SHA:-$MAIN_SHA}"
fi

# ── 4. 导入朋友在 GitHub 上推的新改动 ─────────────────────────
IMPORT=0; CONFLICTED=0
if [ "$HAS_BRANCH" = "1" ] && [ -n "$BR_SHA" ] && [ "$BR_SHA" != "$LAST" ]; then
    if G merge-base --is-ancestor "$LAST" "$BR_SHA" 2>/dev/null; then
        mapfile -t CHANGED < <(G diff --name-only "$LAST" "$BR_SHA" 2>/dev/null | sed '/^$/d')
        if [ "${#CHANGED[@]}" -gt 0 ]; then
            log "检测到 GitHub 分支新提交（${LAST:0:7} → ${BR_SHA:0:7}，${#CHANGED[@]} 个文件）"
            for f in "${CHANGED[@]}"; do
                tmp=$(mktemp)
                if ! G show "$BR_SHA:$f" > "$tmp" 2>/dev/null; then
                    rm -f "$tmp"; continue        # 该文件在分支上被删除 → 以 main 为准
                fi
                dst="$OVER/$f"
                if [ -f "$dst" ]; then
                    if cmp -s "$tmp" "$dst"; then rm -f "$tmp"; continue; fi
                    mkdir -p "$CONFLICT/$(dirname "$f")"
                    cp -f "$tmp" "$CONFLICT/$f"
                    log "⚠ 冲突 $f：保留服务器版本，远端版本存于 conflicts/$f"
                    CONFLICTED=$((CONFLICTED+1)); rm -f "$tmp"; continue
                fi
                mkdir -p "$(dirname "$dst")"
                mv -f "$tmp" "$dst"
                chown mud:mudmod "$dst" 2>/dev/null || true
                IMPORT=$((IMPORT+1))
            done
        fi
    else
        log "分支被外部强制改写（$LAST 不是 $BR_SHA 的祖先），本轮不导入，仅采纳新哨兵"
        printf '%s' "$BR_SHA" > "$SENTINEL"
    fi
fi
if [ "$IMPORT" -gt 0 ]; then
    log "已从 GitHub 导入 $IMPORT 个文件"
    # 关键：**直接写进测试服目录**，然后再跑同步器。
    # 不能只丢在 overrides 里就去跑同步器 —— 同步器会先清空 overrides、
    # 再从"测试服现状 vs 基线"重建，于是"已导入但还没落地"的文件会被删掉
    # （实测过：导入成功但测试服上就是没有那个文件）。
    rsync -a "$OVER/" /home/mud/mud-test/ 2>>"$LOG"
    chown -R mud:mudmod /home/mud/mud-test 2>/dev/null || true
fi

# ── 5. 把 overrides 推回分支（分支 = main + overrides）──────────
PUSHED=0; NEW_SHA=""
# 分支的**定义**就是"main + overrides"，所以无论 overrides 有无内容都要对齐一次：
#   · 有内容 → 提交后推送
#   · 没内容 → 直接把分支指回 main（否则分支会一直带着旧文件，
#     下一轮又会被当成"朋友在 GitHub 上的改动"导入回来，形成死循环）
if G checkout -q -f -B "$BRANCH" "$MAIN_SHA" 2>>"$LOG"; then
    G reset -q --hard "$MAIN_SHA"
    if [ -d "$OVER" ] && [ -n "$(ls -A "$OVER" 2>/dev/null)" ]; then
        rsync -a --exclude='/.git' "$OVER/" "$GITDIR/" 2>>"$LOG"
        chown -R mud:mudmod "$GITDIR" 2>/dev/null || true
    fi
    if [ -n "$(G status --porcelain)" ]; then
        G add -A >>"$LOG" 2>&1
        G -c user.name=mud -c user.email=mud@localhost commit -q \
            -m "chore(test-server): 同步服务器上的改动（$(date '+%F %T')）" >>"$LOG" 2>&1 || true
    fi
    NEW_SHA=$(G rev-parse HEAD)
    if [ "$NEW_SHA" != "$BR_SHA" ]; then
        if G push -q -f origin "$BRANCH" >>"$LOG" 2>&1; then
            PUSHED=1
            NF=$(G diff --name-only "$MAIN_SHA" HEAD | wc -l)
            if [ "$NF" = "0" ]; then
                log "分支 $BRANCH 已对齐 main（无本地修改）"
            else
                log "已推送分支 $BRANCH（$NF 个文件相对 main）"
            fi
        else
            log "推送失败（检查 mud 的部署密钥写权限，或分支保护规则）"
        fi
    fi
else
    log "checkout $BRANCH 失败"
fi

# ── 6. 更新哨兵，然后应用回测试服 ────────────────────────────
if [ -n "$NEW_SHA" ]; then
    printf '%s' "$NEW_SHA" > "$SENTINEL"; chmod 644 "$SENTINEL"
elif [ "$HAS_BRANCH" = "1" ] && [ -n "$BR_SHA" ] && [ "$BR_SHA" != "$LAST" ]; then
    printf '%s' "$BR_SHA" > "$SENTINEL"; chmod 644 "$SENTINEL"
fi

# 释放锁，再跑一次同步器：刷新 local-edits.txt 清单、应用 main、必要时重启测试服。
# （同步器抢同一把锁，所以必须先放锁）
exec 9>&- 2>/dev/null || true
if [ -x "$SYNC" ]; then bash "$SYNC" >>"$LOG" 2>&1; fi

log "本轮完成：导入 $IMPORT，冲突 $CONFLICTED，推送 $PUSHED"
