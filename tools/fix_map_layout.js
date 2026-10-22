#!/usr/bin/env node
/**
 * tools/fix_map_layout.js
 *
 * 重排副本小地图坐标（只改 world/area/fb1/fbN.js 里的 this.map，不碰房间文件、不碰玩法）。
 *
 * 什么时候需要它：
 *   src/map.js 的渲染兜底只保证「不管数据多烂都画得不重叠、不画进虚空」，
 *   但那是把错的坐标挪开——线条虽然落地了，却未必连到真正的邻居。
 *   如果想让 p 本身就是自洽的（A 走 north 到 B ⇔ B 就在 A 的北格），用这个脚本。
 *
 * 做法：按 room 文件里的真实 exits 从入口 BFS 重新发坐标
 *   1. 能画出来的 8 个方向 → 放到 p+delta 上；
 *   2. 撞格子 → 贴着最近的已放置邻居找空位；
 *   3. 和入口断开的房间 → 单独成块放到下方，块内照样按方向摆；
 *   4. map 里的 exits 只保留「真实存在且目标正好落在那格」的方向，不造假线。
 *
 * 用法：
 *   node tools/fix_map_layout.js                # 全量预演，只打印差异
 *   node tools/fix_map_layout.js fb11 fb12      # 只处理指定副本
 *   node tools/fix_map_layout.js --apply fb11   # 真正写回
 *
 * 注意：正在用 patch_area.py 重建的副本（bt/bh/pm/ym/tl/th/yh/gm/xx/gm2/jncz/
 * zs/xd 等）不要跑这个，否则会和 patch_area 抢同一份 this.map。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./check_map_layout.js');

const { DELTA, drawDir } = C;

// 出口遍历顺序：先正交再斜向，保证同一份数据每次跑出同样的布局
const DIR_ORDER = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd', 'enter', 'out'];
const dirRank = (d) => {
  const i = DIR_ORDER.indexOf(C.shortDir(d));
  return i < 0 ? 99 : i;
};

const cellKey = (p) => p[0] + ',' + p[1];
const esc = (s) => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/** 从 (x,y) 起按切比雪夫半径由内向外找第一个空格子，方向顺序稳定。 */
function nearestFree([x, y], used) {
  if (!used.has(cellKey([x, y]))) return [x, y];
  for (let r = 1; r <= 256; r++) {
    const ring = [];
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        ring.push([x + dx, y + dy]);
      }
    }
    ring.sort((a, b) => {
      const ra = Math.atan2(a[1] - y, a[0] - x) + Math.PI;
      const rb = Math.atan2(b[1] - y, b[0] - x) + Math.PI;
      return ra - rb || a[1] - b[1] || a[0] - b[0];
    });
    for (const p of ring) if (!used.has(cellKey(p))) return p;
  }
  return [x, y + 512];
}

/** 把 keep 里的房间摆到网格上。 */
function layout(keep, adj, rev, first) {
  const pos = new Map();
  const used = new Map();
  const place = (id, p) => { pos.set(id, p); used.set(cellKey(p), id); };

  function from(root, origin) {
    if (!keep.has(root) || pos.has(root)) return;
    place(root, origin);
    const queue = [root];
    while (queue.length) {
      const cur = queue.shift();
      const cp = pos.get(cur);
      const outs = (adj.get(cur) || []).slice().sort((a, b) => dirRank(a[0]) - dirRank(b[0]));
      for (const [dir, to] of outs) {
        if (pos.has(to) || !keep.has(to)) continue;
        const d = drawDir(dir);
        if (!d) continue;                    // u/d/enter/out 画不出来，交给第二轮
        const want = [cp[0] + DELTA[d][0], cp[1] + DELTA[d][1]];
        if (used.has(cellKey(want))) continue;
        place(to, want);
        queue.push(to);
      }
    }
  }

  // 第二轮：撞格子 / 只有非网格方向的房间，贴着最近的已放置邻居找空位
  function settle(originX) {
    let progress = true;
    while (progress) {
      progress = false;
      for (const id of keep) {
        if (pos.has(id)) continue;
        const nbs = (rev.get(id) || []).filter(([fr]) => pos.has(fr));
        if (!nbs.length) continue;
        let done = false;
        for (const [fr, dir] of nbs.sort((a, b) => dirRank(a[1]) - dirRank(b[1]))) {
          const d = drawDir(dir);
          if (!d) continue;
          const want = [pos.get(fr)[0] + DELTA[d][0], pos.get(fr)[1] + DELTA[d][1]];
          if (!used.has(cellKey(want))) { place(id, want); done = true; break; }
        }
        if (!done) place(id, nearestFree(pos.get(nbs[0][0]), used));
        progress = true;
      }
    }
  }

  const bounds = () => {
    let x0 = 0, y1 = 0;
    for (const p of pos.values()) {
      if (p[0] < x0) x0 = p[0];
      if (p[1] > y1) y1 = p[1];
    }
    return { x0, y1 };
  };

  from(first, [0, 0]);
  settle(0);

  // 第三轮：和入口断开的房间，单独成块放到下方
  for (let guard = 0; guard < keep.size + 4; guard++) {
    const rest = [...keep].filter((id) => !pos.has(id));
    if (!rest.length) break;
    const { x0, y1 } = bounds();
    let root = rest[0], best = -1;
    for (const cand of rest) {
      const deg = (adj.get(cand) || []).length + (rev.get(cand) || []).length;
      if (deg > best) { best = deg; root = cand; }
    }
    from(root, [x0, y1 + 2]);
    settle(x0);
  }
  // 彻底孤立的房间：排到右边一行
  let col = 0;
  for (const id of keep) {
    if (pos.has(id)) continue;
    const { y1 } = bounds();
    place(id, nearestFree([col, y1 + 2], used));
    col += 2;
  }

  // 哪些真实出口没能在网格上画出来
  const broken = [];
  for (const [id, outs] of adj) {
    if (!pos.has(id)) continue;
    for (const [dir, to] of outs) {
      if (!pos.has(to) || !keep.has(to)) continue;
      const d = drawDir(dir);
      if (!d) continue;
      const want = [pos.get(id)[0] + DELTA[d][0], pos.get(id)[1] + DELTA[d][1]];
      if (want[0] !== pos.get(to)[0] || want[1] !== pos.get(to)[1]) broken.push({ from: id, dir, to });
    }
  }
  return { pos, broken };
}

/** 生成 this.map = [ ... ]; 的数组字面量文本（沿用原文件的缩进）。 */
function renderArray(area, entries) {
  const src = area.src;
  const mline = /(^[ \t]*)this\.map\s*=\s*\[/m.exec(src);
  const indent = mline ? mline[1] : '';
  const inner = src.slice(area.span.start, area.span.end + 1);
  const mi = /^([ \t]*)\{\s*n\s*:/m.exec(inner);
  const itemIndent = mi ? mi[1] : indent + '    ';
  const lines = entries.map((e) =>
    `${itemIndent}{ n: "${esc(e.n)}", id: "${esc(e.id)}", p: [${e.p[0]}, ${e.p[1]}], exits: [${e.exits.map((x) => `"${x}"`).join(', ')}] },`);
  return `[\n${lines.join('\n')}\n${indent}]`;
}

function processArea(file) {
  const area = C.loadArea(file);
  if (area.err) return { area, skipped: area.err };
  const prefix = area.prefix;
  if (!prefix) return { area, skipped: '无法确定房间前缀' };

  const disk = C.listRoomIds(prefix);
  if (!disk.length) return { area, skipped: `world/map/${prefix}/ 下没有房间文件` };

  const first = area.first && disk.includes(area.first) ? area.first : null;
  const reachable = new Set();
  if (first) {
    reachable.add(first);
    const q = [first];
    while (q.length) {
      const cur = q.shift();
      const r = C.loadRoom(cur); if (!r) continue;
      for (const ts of Object.values(r.exits)) {
        for (const t of ts) {
          if (!t.startsWith(prefix + '/') || reachable.has(t) || !disk.includes(t)) continue;
          reachable.add(t); q.push(t);
        }
      }
    }
  }
  // 节点集合 = 从入口可达的房间 ∪ 原本就在图里的房间
  //（后者避免把历史上的孤儿文件重新塞进地图）
  const oldIds = area.entries.filter((e) => e && disk.includes(e.id)).map((e) => e.id);
  const keep = new Set([...reachable, ...oldIds]);
  if (first) keep.add(first);

  const adj = new Map();
  const rev = new Map();
  for (const id of keep) {
    const r = C.loadRoom(id); if (!r) continue;
    for (const [dir, ts] of Object.entries(r.exits)) {
      for (const t of ts) {
        if (t === id || !keep.has(t)) continue;
        if (!adj.has(id)) adj.set(id, []);
        adj.get(id).push([dir, t]);
        if (!rev.has(t)) rev.set(t, []);
        rev.get(t).push([id, dir]);
      }
    }
  }

  const root = first || [...keep][0];
  const { pos, broken } = layout(keep, adj, rev, root);

  const entries = [...pos.keys()].sort((a, b) => {
    const pa = pos.get(a), pb = pos.get(b);
    return pa[0] - pb[0] || pa[1] - pb[1];
  }).map((id) => {
    const room = C.loadRoom(id);
    const p = pos.get(id);
    const ex = [];
    for (const [dir, ts] of Object.entries((room && room.exits) || {})) {
      const d = drawDir(dir);
      if (!d || ex.includes(d)) continue;
      const hit = ts.some((t) => {
        if (!keep.has(t) || !pos.has(t)) return false;
        const q = pos.get(t);
        return q[0] === p[0] + DELTA[d][0] && q[1] === p[1] + DELTA[d][1];
      });
      if (hit) ex.push(d);
    }
    ex.sort((a, b) => dirRank(a) - dirRank(b));
    return { n: (room && room.name) || id, id, p, exits: ex };
  });

  const next = area.src.slice(0, area.span.start) + renderArray(area, entries)
    + area.src.slice(area.span.end + 1);

  return {
    area, entries, pos, broken, next, keep, reachable,
    changed: next !== area.src,
    skipped: null,
    dropped: area.entries.filter((e) => e && !disk.includes(e.id)).map((e) => e.id),
    unreachable: [...keep].filter((id) => !reachable.has(id)),
  };
}

function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  const only = argv.filter((a) => !a.startsWith('--'));

  let files = fs.readdirSync(C.AREA_DIR).filter((f) => /^fb.*\.js$/.test(f)).sort();
  if (only.length) files = files.filter((f) => only.includes(f.replace(/\.js$/, '')));

  let changed = 0;
  for (const f of files) {
    const file = path.join(C.AREA_DIR, f);
    const r = processArea(file);
    if (r.skipped) { console.log(`- ${f}: 跳过（${r.skipped}）`); continue; }
    const flags = [];
    if (r.dropped.length) flags.push(`丢弃磁盘上已不存在的条目 ${r.dropped.length}: ${r.dropped.join(',')}`);
    if (r.unreachable.length) flags.push(`入口不可达但保留 ${r.unreachable.length}: ${r.unreachable.join(',')}`);
    if (r.broken.length) flags.push(`网格上摆不下的出口 ${r.broken.length}: ` +
      r.broken.map((b) => `${b.from.split('/').pop()}--${C.shortDir(b.dir)}-->${b.to.split('/').pop()}`).join(' '));
    console.log(`${r.changed ? (apply ? '✎ 写入' : '· 待改') : '= 不变'} ${f} [${r.area.prefix}] ${r.area.entries.length} → ${r.entries.length} 间` +
      (flags.length ? '\n    ' + flags.join('\n    ') : ''));
    if (r.changed) {
      changed++;
      if (apply) fs.writeFileSync(file, r.next, 'utf8');
    }
  }
  console.log(`\n${apply ? '已写入' : '待写入'} ${changed} / ${files.length} 个副本文件${apply ? '' : '（加 --apply 生效）'}`);
}

module.exports = { layout, renderArray, processArea, nearestFree };

if (require.main === module) main();
