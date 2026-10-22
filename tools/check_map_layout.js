#!/usr/bin/env node
/**
 * tools/check_map_layout.js
 *
 * 副本「小地图」数据离线校验器。
 *
 * 渲染链路：world/area/fb1/fbN.js 的 this.map  →  服务端 world/cmd/dialog/map.js
 *          原样 JSON 下发给客户端  →  src/map.js 的 ShowMap(map, id) 用 p:[x,y]
 *          摆房间、用 exits 的方向画连线。
 *
 * 于是 this.map 必须满足：
 *   - 每个条目有 n / id / p(两个整数) / exits(数组)
 *   - 同一个副本里 p 不能重复（否则两个房间叠在一个格子里）
 *   - id 必须对应 world/map/<prefix>/<id>.js 真实存在
 *   - exits 里的每个「可画方向」在 p+DELTA[dir] 上必须真的有个房间
 *     （否则那条线会画到虚空里，或者穿过别的房间）
 *   - 房间文件里通往本副本内部的出口，目标必须在 this.map 里（否则地图缺房间）
 *   - first（副本入口）必须在 this.map 里
 *
 * 用法：
 *   node tools/check_map_layout.js              # 校验全部 fb*.js
 *   node tools/check_map_layout.js fb11 fb12    # 只校验指定副本
 *   node tools/check_map_layout.js --quiet      # 只显示有 ERROR 的
 *   node tools/check_map_layout.js --warn       # 连 WARN 一起显示
 *
 * 退出码：0 = 没有 ERROR（WARN 不影响退出码）；1 = 有 ERROR；2 = 环境问题。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const AREA_DIR = path.join(ROOT, 'world/area/fb1');
const MAP_DIR = path.join(ROOT, 'world/map');

// ── 与 src/map.js 完全一致的「方向 → 网格增量」 ─────────────────────────
// src/map.js 的 ShowMap() 只为以下 8 个方向画线；
// u/d/enter/out 虽然能走，但画不出来，所以对 p 没有几何约束。
const DELTA = {
  n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0],
  ne: [1, -1], nw: [-1, -1], se: [1, 1], sw: [-1, 1],
};
const DRAWN = new Set(Object.keys(DELTA));

const LONG_TO_SHORT = {
  west: 'w', east: 'e', north: 'n', south: 's',
  northwest: 'nw', northeast: 'ne', southwest: 'sw', southeast: 'se',
  up: 'u', down: 'd',
  westdown: 'wd', eastdown: 'ed', northdown: 'nd', southdown: 'sd',
  westup: 'wu', eastup: 'eu', northup: 'nu', southup: 'su',
  enter: 'enter', out: 'out',
};

/** 长名/复合名 → 短名，例如 northup → nu。 */
function shortDir(d) {
  if (LONG_TO_SHORT[d]) return LONG_TO_SHORT[d];
  const m = /^([a-z]{1,2})(\d*)([dlu]?)$/.exec(d);
  if (!m) return d;
  const b = m[1];
  return (b.length === 2 && !['nw', 'ne', 'sw', 'se'].includes(b)) ? b[0] : b;
}

/** 短名 → 渲染器真正会画的那个方向（复刻 src/map.js 的 parseDir）；画不出来返回 null。 */
function drawDir(d) {
  const s = shortDir(d);
  if (s === 'enter' || s === 'out') return null;
  const m = /^([a-z]{1,2})(\d*)([dlu]?)$/.exec(s);
  if (!m) return null;
  let b = m[1];
  if (b.length === 2) b = ['nw', 'ne', 'sw', 'se'].includes(b) ? b : b[0];
  return DRAWN.has(b) ? b : null;
}

/** 从 openIdx 处的左括号起配平括号，返回内部文本（跳过字符串字面量）。 */
function bracketBody(src, openIdx, open, close) {
  let depth = 0, quote = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(openIdx + 1, i); }
  }
  return null;
}

function evalLiteral(text) {
  return vm.runInNewContext('(' + text + ')', Object.create(null), { timeout: 5000 });
}

// ── 房间文件 ───────────────────────────────────────────────────────────
const roomCache = new Map();
function loadRoom(id) {
  if (roomCache.has(id)) return roomCache.get(id);
  const file = path.join(MAP_DIR, id + '.js');
  let info = null;
  if (fs.existsSync(file)) {
    const src = fs.readFileSync(file, 'utf8');
    info = { file, name: null, exits: {} };
    const nm = /this\.name\s*=\s*"((?:[^"\\]|\\.)*)"/.exec(src);
    if (nm) info.name = nm[1];
    const m = /this\.exits\s*=\s*\{/.exec(src);
    if (m) {
      const body = bracketBody(src, m.index + m[0].length - 1, '{', '}');
      if (body) {
        try {
          const obj = evalLiteral('{' + body + '}');
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            info.exits[k] = Array.isArray(v) ? v.filter((x) => typeof x === 'string') : (typeof v === 'string' ? [v] : []);
          }
        } catch (e) {
          const re = /"([^"]+)"\s*:\s*"([^"]+)"/g; let mm;
          while ((mm = re.exec(body))) info.exits[mm[1]] = [mm[2]];
        }
      }
    }
  }
  roomCache.set(id, info);
  return info;
}

/** world/map/<prefix>/ 下的全部房间 id。 */
function listRoomIds(prefix) {
  const dir = path.join(MAP_DIR, prefix);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()
    .map((f) => prefix + '/' + f.slice(0, -3));
}

// ── 副本文件 ───────────────────────────────────────────────────────────
function loadArea(file) {
  const src = fs.readFileSync(file, 'utf8');
  const area = {
    file, src, name: path.basename(file, '.js'), areaName: null, prefix: null,
    first: null, entries: [], span: null, err: null,
  };
  const sid = /\bid\s*:\s*"([^"]*)"/.exec(src);
  if (sid) area.areaName = sid[1];
  const snm = /\bname\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(src);
  if (snm) area.areaName = snm[1];
  const srp = /room_path\s*:\s*"([^"]*)"/.exec(src);
  if (srp) area.prefix = srp[1].replace(/\/+$/, '');
  const sf = /\bfirst\s*:\s*"([^"]*)"/.exec(src);
  if (sf) area.first = sf[1];

  const m = /this\.map\s*=\s*\[/.exec(src);
  if (!m) { area.err = '没有 this.map 数组'; return area; }
  const openIdx = m.index + m[0].length - 1;
  const body = bracketBody(src, openIdx, '[', ']');
  if (body === null) { area.err = 'this.map 方括号不配平'; return area; }
  area.span = { start: openIdx, end: openIdx + body.length + 1 };
  try {
    const arr = evalLiteral('[' + body + ']');
    if (!Array.isArray(arr)) throw new Error('不是数组');
    area.entries = arr;
  } catch (e) {
    area.err = 'this.map 解析失败: ' + e.message;
    return area;
  }
  if (!area.prefix) {
    const f0 = arr.find((x) => x && typeof x.id === 'string' && x.id.includes('/'));
    if (f0) area.prefix = f0.id.slice(0, f0.id.lastIndexOf('/'));
  }
  return area;
}

// ── 校验 ───────────────────────────────────────────────────────────────
function checkArea(area) {
  const out = { error: [], warn: [] };
  const E = (kind, detail) => out.error.push({ kind, detail });
  const W = (kind, detail) => out.warn.push({ kind, detail });
  const prefix = area.prefix;

  if (area.err) { E('结构', area.err); return out; }
  if (!prefix) { E('结构', '无法确定副本房间前缀'); return out; }

  const byId = new Map();
  const byPos = new Map();
  area.entries.forEach((e, i) => {
    if (!e || typeof e !== 'object') { E('结构', `第 ${i} 项不是对象`); return; }
    const tag = (e.id || `#${i}`) + (e.n ? `(${e.n})` : '');
    if (typeof e.id !== 'string' || !e.id) { E('结构', `第 ${i} 项缺 id`); return; }
    if (typeof e.n !== 'string' || !e.n) E('结构', `${tag} 缺 n（房间名）`);
    // 房间没有任何出口时，this.map 里通常会省略 exits 字段（src/map.js 也按可选处理）
    if (e.exits !== undefined && !Array.isArray(e.exits)) E('结构', `${tag} 的 exits 不是数组`);
    if (!Array.isArray(e.p) || e.p.length !== 2 || !e.p.every(Number.isInteger)) {
      E('结构', `${tag} 的 p 不是两个整数: ${JSON.stringify(e.p)}`);
      return;
    }
    if (byId.has(e.id)) E('重复房间', `${tag} 在 this.map 里出现多次`);
    else byId.set(e.id, { idx: i, e });
    const k = e.p[0] + ',' + e.p[1];
    if (!byPos.has(k)) byPos.set(k, []);
    byPos.get(k).push({ idx: i, id: e.id });
  });

  // 1) 坐标重复（房间叠在一起）
  for (const [k, list] of byPos) {
    if (list.length > 1) {
      E('坐标重复', `p=[${k}] 被 ${list.length} 个房间占用: ` +
        list.map((x) => `${x.id}(#${x.idx})`).join(', '));
    }
  }

  // 2)+3) id 存在性与出口一致性
  for (const [id, { e }] of byId) {
    if (!id.startsWith(prefix + '/')) E('前缀不符', `${id} 不在副本前缀 ${prefix}/ 下`);
    const room = loadRoom(id);
    if (!room) { E('房间缺失', `world/map/${id}.js 不存在`); continue; }
    if (e.n && room.name && room.name !== e.n) {
      W('名称不符', `${id}：map 写「${e.n}」，房间文件是「${room.name}」`);
    }

    // 小地图会用到的方向集合（按渲染基方向归一）
    const mapDirs = [...new Set((e.exits || []).map(drawDir).filter(Boolean))];
    const realDirs = [...new Set(Object.keys(room.exits).map(drawDir).filter(Boolean))];

    // 4) 假连线：map 里有方向，房间文件里没有
    for (const d of mapDirs) {
      if (!realDirs.includes(d)) E('假连线', `${id} 的 exits 有 ${d}，但房间文件没有这个出口`);
    }
    // 5) 少画：房间有出口但 map 没列
    for (const d of realDirs) {
      if (!mapDirs.includes(d)) W('少画方向', `${id} 有 ${d} 出口，但 map 的 exits 没列（小地图上不显示这条线）`);
    }

    // 6) 落点空缺：画出来的线必须正好落到一个房间上
    for (const d of mapDirs) {
      const want = [e.p[0] + DELTA[d][0], e.p[1] + DELTA[d][1]];
      const occ = byPos.get(want[0] + ',' + want[1]);
      if (!occ) E('落点空缺', `${id}(${e.n})[${e.p}] 画了 ${d} 的出线，但 [${want}] 上没有房间（线会画进虚空）`);
    }

    // 7) 悬空连线 / 坐标冲突：房间文件的真实出口
    for (const [dir, targets] of Object.entries(room.exits)) {
      for (const t of targets) {
        if (t === id) { W('自环出口', `${id}(${room.name}) 的 ${dir} 出口指向自己`); continue; }
        if (!t.startsWith(prefix + '/')) continue;
        const dst = byId.get(t);
        if (!dst) { E('悬空连线', `${id}(${room.name}) 的 ${dir} 出口 → ${t}，但 ${t} 不在 this.map 里`); continue; }
        const d = drawDir(dir);
        if (!d) continue;
        const want = [e.p[0] + DELTA[d][0], e.p[1] + DELTA[d][1]];
        if (want[0] !== dst.e.p[0] || want[1] !== dst.e.p[1]) {
          W('坐标冲突', `${id}[${e.p}] --${d}--> ${t}[${dst.e.p}]（按 ${d} 应在 [${want}]）`);
        }
      }
      // 同方向多目标
      const ts = targets.filter((t) => t !== id && t.startsWith(prefix + '/'));
      if (new Set(ts).size > 1) W('方向多目标', `${id} 的 ${dir} 出口指向多个房间: ${[...new Set(ts)].join(' / ')}`);
    }
  }

  // 8) 入口必须在图里
  if (area.first) {
    if (!byId.has(area.first)) E('入口缺席', `first="${area.first}" 不在 this.map 里（进入副本后小地图不会高亮当前房间）`);
    else {
      const st = byPos.get(byId.get(area.first).e.p.join(','));
      if (st && st.length > 1) E('入口缺席', `入口 ${area.first} 和其他房间重叠`);
    }
  }

  // 9) 副本里可达但没进图（地图缺房间）
  if (area.first && loadRoom(area.first)) {
    const seen = new Set([area.first]); const q = [area.first];
    while (q.length) {
      const cur = q.shift(); const r = loadRoom(cur); if (!r) continue;
      for (const ts of Object.values(r.exits)) {
        for (const t of ts) {
          if (!t.startsWith(prefix + '/') || seen.has(t)) continue;
          seen.add(t); q.push(t);
        }
      }
    }
    const missingReachable = [...seen].filter((id) => !byId.has(id) && loadRoom(id));
    if (missingReachable.length) {
      E('缺房间', `从入口可达但未进图: ${missingReachable.join(', ')}`);
    }
    // 10) 单向出口（原版设计里就有，仅提示）
    const OPP = { n: 's', s: 'n', e: 'w', w: 'e', ne: 'sw', sw: 'ne', nw: 'se', se: 'nw', u: 'd', d: 'u', enter: 'out', out: 'enter' };
    for (const id of seen) {
      const r = loadRoom(id); if (!r) continue;
      for (const [dir, ts] of Object.entries(r.exits)) {
        const back = OPP[shortDir(dir)];
        if (!back) continue;
        for (const t of ts) {
          if (!t.startsWith(prefix + '/') || t === id) continue;
          const d2 = loadRoom(t); if (!d2) continue;
          const ok = Object.entries(d2.exits).some(([dd, tt]) => shortDir(dd) === back && tt.includes(id));
          if (!ok) W('单向出口', `${id} --${shortDir(dir)}--> ${t}，但 ${t} 没有回到 ${id} 的 ${back} 口`);
        }
      }
    }
  }

  return out;
}

// ── main ───────────────────────────────────────────────────────────────
function main() {
  const argv = process.argv.slice(2);
  const quiet = argv.includes('--quiet');
  const showWarn = argv.includes('--warn');
  const only = argv.filter((a) => !a.startsWith('--'));

  if (!fs.existsSync(AREA_DIR)) { console.error('找不到 ' + AREA_DIR); process.exit(2); }
  let files = fs.readdirSync(AREA_DIR).filter((f) => /^fb.*\.js$/.test(f)).sort();
  if (only.length) files = files.filter((f) => only.includes(f.replace(/\.js$/, '')));

  const rows = [];
  let errTotal = 0, warnTotal = 0, badAreas = 0;

  for (const f of files) {
    const area = loadArea(path.join(AREA_DIR, f));
    const res = checkArea(area);
    const errBy = {}; const warnBy = {};
    for (const x of res.error) errBy[x.kind] = (errBy[x.kind] || 0) + 1;
    for (const x of res.warn) warnBy[x.kind] = (warnBy[x.kind] || 0) + 1;
    rows.push({ area, res, errBy, warnBy });
    errTotal += res.error.length;
    warnTotal += res.warn.length;
    if (res.error.length) badAreas++;
  }

  for (const r of rows) {
    const a = r.area;
    const head = `${a.name}${a.areaName ? '(' + a.areaName + ')' : ''} [${a.prefix}]  ${a.entries.length} 间房`;
    if (!r.res.error.length && !r.res.warn.length) {
      if (!quiet) console.log(`✓ ${head}  无问题`);
      continue;
    }
    if (!r.res.error.length && !showWarn) {
      if (!quiet) console.log(`✓ ${head}  0 ERROR，${r.res.warn.length} WARN（加 --warn 看细节）`);
      continue;
    }
    console.log(`\n${r.res.error.length ? '✗' : '!'} ${head}`);
    const fmt = (o) => Object.entries(o).map(([k, n]) => `${k}×${n}`).join('  ');
    if (r.res.error.length) console.log('  ERROR: ' + fmt(r.errBy));
    if (r.res.warn.length) console.log('  WARN : ' + fmt(r.warnBy));
    for (const x of r.res.error) console.log(`   - [E/${x.kind}] ${x.detail}`);
    if (showWarn) for (const x of r.res.warn) console.log(`   - [W/${x.kind}] ${x.detail}`);
  }

  console.log('\n' + '='.repeat(78));
  console.log('副本文件'.padEnd(12) + '前缀'.padEnd(16) + '房间'.padStart(5) + 'ERROR'.padStart(7) + 'WARN'.padStart(6) + '  分类');
  for (const r of rows) {
    const k = Object.entries(r.errBy).map(([a, b]) => `${a}×${b}`).join(' ');
    console.log(String(r.area.name).padEnd(12) + String(r.area.prefix).padEnd(16) +
      String(r.area.entries.length).padStart(5) + String(r.res.error.length).padStart(7) +
      String(r.res.warn.length).padStart(6) + '  ' + k);
  }
  console.log('='.repeat(78));
  console.log(`合计：${files.length} 个副本，${badAreas} 个有 ERROR，ERROR ${errTotal} 个，WARN ${warnTotal} 个`);
  if (errTotal === 0) console.log('✓ 小地图数据校验通过（0 ERROR）');
  process.exit(errTotal === 0 ? 0 : 1);
}

module.exports = {
  ROOT, AREA_DIR, MAP_DIR, DELTA, DRAWN, LONG_TO_SHORT,
  shortDir, drawDir, bracketBody, evalLiteral, loadRoom, listRoomIds, loadArea, checkArea,
};

if (require.main === module) main();
