// Offline acceptance probes. Only read source; all accounts, sockets and storage are fake.
// --strict exits nonzero for findings. No production database or network is used.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const rootArg = process.argv.indexOf('--root');
if (rootArg >= 0 && !process.argv[rootArg + 1]) throw Error('--root requires a source directory');
const root = rootArg >= 0 ? path.resolve(process.argv[rootArg + 1]) : path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const quiet = { log() {}, error() {}, warn() {}, time() {}, timeEnd() {} };
const results = [];
function result(id, expected, actual, pass) { results.push({ id, pass, expected, actual: JSON.parse(JSON.stringify(actual)) }); }
function sandbox(extra = {}) { return { module: { exports: {} }, require: n => n === '../util/legacy-sws' ? require('../os/util/legacy-sws') : require(n), console: quiet, Buffer, process, __dirname: root, ...extra }; }
function part(file, from, to) {
  const source = read(file), start = source.indexOf(from), end = source.indexOf(to, start);
  if (start < 0 || end < 0) throw Error('Missing source anchors: ' + file);
  return source.slice(start, end);
}
function makeWorld() {
  const c = sandbox({ require: () => ({}) });
  vm.runInNewContext(read('os/world.js'), c);
  return { c, world: c.WORLD };
}
function loadProps() {
  const c = sandbox({ CHARACTER: function () {}, USER: function () {}, FOLLOWER: function () {}, require: () => ({}) });
  c.USER.prototype = Object.create(c.CHARACTER.prototype);
  vm.runInNewContext(read('os/char/chara_prop.js'), c);
  vm.runInNewContext(read('world/extends/char/user.js'), c);
  return c;
}
function fakePlayer(roleDisk) {
  return {
    id: 'offline', name: '离线角色', is_player: true, level: 5, temp: {}, items: [], bits: {},
    query_temp(k, d) { return this.temp[k] ?? d; }, set_temp(k, v) { this.temp[k] = v; },
    remove_temp(k) { delete this.temp[k]; }, query_bool(k, b) { return !!((this.bits[k] || 0) & (1 << b)); },
    set_bool(k, b, v) { this.bits[k] = v ? (this.bits[k] || 0) | (1 << b) : (this.bits[k] || 0) & ~(1 << b); },
    add_exp() {}, notify() {}, send() {}, recount() {}, notify_hp() {},
    add_obj(o) {
      if (this.rejectPath === o.path) return null;
      const existing = this.items.find(i => i.path === o.path);
      if (existing) { existing.count += o.count; return existing; }
      this.items.push(o); return o;
    },
    remove_obj(o, count) { o.count -= count; if (o.count === 0) this.items.splice(this.items.indexOf(o), 1); return o; },
    saveSync() {
      if (roleDisk) roleDisk[this.id] = this.items.map(i => ({ path: i.path, count: i.count, unit: i.unit, color_name: i.color_name }));
      return true;
    }
  };
}
function loadSws(disk) {
  const c = sandbox({
    AREA: function () {}, __PATH: { DATA: '/offline/' },
    WORLD: { DATA: { query_temp: (k, d) => d, set_temp() {} } },
    BASE: { read_json: () => disk.text ? JSON.parse(disk.text) : null, write_json: (p, o) => { disk.text = JSON.stringify(o); return true; } },
    OBJ: { CREATE: (p, count) => ({ path: p, count, unit: '个', color_name: p }) },
    UTIL: { to_c: String }, ROOM: { Get: () => null }, COMMAND: { DO() {} }, USER: { prototype: { die() {} } }
  });
  vm.createContext(c);
  const area = { inherits() {}, set(o) { Object.assign(this, o); }, random: () => 0 };
  vm.compileFunction(read('world/area/map/sws.js'), [], { parsingContext: c }).call(area);
  // Choice generation is unrelated to reward commit boundaries and uses engine Array.random.
  area.sws_roll_picks = () => [];
  area.sws_show_picks = () => {};
  return area;
}
async function run() {
  // Verify permissions using synthetic credentials only. No credentials are printed.
  let dbReads = 0;
  const config = { DESIV: crypto.randomBytes(16), SESSION_SECRET: 'offline-test-session-secret-1234', MD5: 'offline', DB: { getUserBySync: () => { dbReads++; return { id: 123, pwd: '0'.repeat(32), level: 0, state: 1 }; } } };
  const authContext = sandbox({ __CONFIG: config }); vm.runInNewContext(read('os/auth-token.js'), authContext);
  const auth = authContext.module.exports;
  const bc = sandbox({ __CONFIG: config, require: n => n === '../os/auth-token' ? auth : require(n) }); vm.runInNewContext(read('api/base.js'), bc);
  const Base = bc.module.exports, base = new Base({ cookies: {}, session: { id: 'offline-session-key' } }, { cookie() {} });
  const key = 'offline-only-key-12345', cert = base.encryptUser(123, 'offline_user', '0'.repeat(32), key, 0);
  // Alter the signed payload without recomputing its HMAC; a client must not
  // be able to turn a level-0 account into an administrator.
  const alteredParts = cert.split('.');
  const alteredPayload = Buffer.from(JSON.stringify({ id: 123, name: 'offline_user', pwd: '0'.repeat(32), issuedAt: Date.now(), level: 5 })).toString('base64url');
  const altered = alteredParts[0] + '.' + alteredPayload + '.' + alteredParts[2];
  const accepted = base.deEncryptUser(key, altered);
  const ac = sandbox({ __CONFIG: config, require: n => n === './base' ? Base : n === '../os/auth-token' ? auth : require(n) });
  vm.runInNewContext(read('api/admin.js'), ac);
  const admin = new ac.module.exports(); admin.getUser = () => accepted;
  let adminAllowed = false; try { adminAllowed = !!admin._requireAdmin(); } catch (_) {}
  result('R01-credential-integrity', 'Modified claims rejected; current DB privileges checked', { level: accepted?.level, adminAllowed, dbReads }, !adminAllowed);
  admin.getUser = () => ({ id: 123, level: 0 });
  let rejected = false; try { admin._requireAdmin(); } catch (_) { rejected = true; }
  result('PASS-admin-floor', 'Level 0 rejected', rejected, rejected);
  let resets = 0;
  const uc = sandbox({ __CONFIG: { DB: { getUserBy: async () => ({ id: 1, phone: '13000000000' }), updateUser: async () => { resets++; return true; } } }, require: n => n === './base' ? Base : n === 'svg-captcha' ? {} : require(n) });
  vm.runInNewContext(read('api/user.js'), uc);
  const userApi = new uc.module.exports({ session: { valno: 'abcd' } }, {});
  const reset = await userApi.resetpwd({ name: 'offline', phone: '13000000000', vcode: 'abcd', pwd: 'offline-new' });
  result('R02-reset-identity', 'Account + phone + public image challenge insufficient', { resetCode: reset.code, writes: resets }, resets === 0);

  const userSource = read('os/char/user.js');
  const migration = userSource.slice(userSource.indexOf('function repairLegacySwsTemp'), userSource.indexOf('USER.prototype.loadData')) +
    part('os/char/user.js', 'var rawRoleData = role.data;', 'for (var i = 0; i < SAVE_NUMPROP.length; i++)');
  const parse = raw => { const c = sandbox({ role: { data: raw }, JSON: { toObject: JSON.parse } }); vm.runInNewContext(migration, c); return c.data; };
  const valid = JSON.stringify({ settings: { note: 'literal [object Object]' }, temp: { sws_active: 1 } });
  result('PASS-valid-save', 'Valid note unchanged', parse(valid).settings.note, parse(valid).settings.note === 'literal [object Object]');
  const mixed = '{"settings":{"note":"sws_buffs: [object Object]"},"temp":{"sws_buffs":[object Object]}}';
  const migrated = parse(mixed);
  result('R03-mixed-save-repair', 'Preserve note while repairing invalid temp', migrated.settings.note, migrated.settings.note === 'sws_buffs: [object Object]');

  const wc = sandbox(); vm.runInNewContext(read('os/net-ws.js'), wc);
  function frame(text, opcode = 1, fin = true) {
    const b = Buffer.from(text), m = Buffer.from([1, 2, 3, 4]);
    const h = b.length < 126 ? Buffer.from([(fin ? 128 : 0) | opcode, 128 | b.length]) : Buffer.from([(fin ? 128 : 0) | opcode, 254, b.length >> 8, b.length & 255]);
    return Buffer.concat([h, m, Buffer.from(b.map((v, i) => v ^ m[i % 4]))]);
  }
  function socket() { return { messages: [], writes: [], destroyed: false, write(b) { this.writes.push(b); }, end() { this.ended = true; }, destroy() { this.destroyed = true; } }; }
  function feed(s, b) { wc.protocols.var1.readData(b, s, { onReceive: m => s.messages.push(m) }); }
  const packet = frame('查看房间'.repeat(50)); let splitsPass = true;
  for (let i = 1; i < packet.length; i++) { const s = socket(); feed(s, packet.subarray(0, i)); splitsPass &&= s.messages.length === 0; feed(s, packet.subarray(i)); splitsPass &&= s.messages.length === 1 && s.messages[0] === '查看房间'.repeat(50); }
  result('PASS-ws-split-all-offsets', 'Exactly one full UTF-8 message at every split', { offsets: packet.length - 1, splitsPass }, splitsPass);
  const malformed = socket(); feed(malformed, Buffer.concat([frame('look ', 1, false), frame('north', 1, false), frame('', 0, true)]));
  result('R04-ws-fragment-state', 'Reject new text frame during fragmented message', { destroyed: malformed.destroyed, messages: malformed.messages }, malformed.destroyed && malformed.messages.length === 0);
  const closed = socket(); feed(closed, Buffer.concat([frame('', 8), frame('look')]));
  result('R04-ws-after-close', 'No application message after Close', closed.messages, closed.messages.length === 0);
  const events = {}, tcp = { on(k, fn) { events[k] = fn; }, setTimeout() {}, destroy() {}, write() {} };
  let tcpCalls = 0;
  wc.onClientConnect.call({ onClientClose() {}, onClientError() {}, onClientTimeout() {}, onSocketIn() {}, onTcpReceive() { tcpCalls++; } }, tcp);
  events.data(Buffer.concat([Buffer.from([4]), Buffer.from('look')]));
  result('R04-raw-tcp-regression', 'Existing length-prefixed TCP branch still reached', { tcpCalls, buffered: tcp._handshakeBuffer?.length }, tcpCalls === 1);

  const props = loadProps(), ch = new props.USER();
  Object.assign(ch, { str: 100, con: 100, dex: 100, int: 100, hp: 100, max_mp: 100, prop: {} });
  ch.recount(); const baseline = ch.mz;
  ch._apply_zc_stack('zongheng', 'mz', 0.1, 10); const boosted = ch.mz;
  ch.recount();
  result('R05-stack-recount', 'Active stack survives real USER.recount', { baseline, boosted, afterRecount: ch.mz, count: ch._zc_stacks.zongheng.count }, ch.mz === boosted);
  const c2 = new props.CHARACTER(); c2.mz = 100;
  c2._apply_zc_stack('zongheng', 'mz', 0.1, 10); c2._apply_zc_stack('weaken_mz', 'mz', -0.1, 10); c2._apply_zc_stack('zongheng', 'mz', 0.1, 10); c2._clear_zc_stacks();
  result('R05-interleaved-clear', 'All mixed stacks restore base 100', c2.mz, Math.abs(c2.mz - 100) < 1e-9);

  const zc = sandbox({ WORLD: { COMMANDS: {} } }); vm.runInNewContext(read('world/zhenyi.js'), zc);
  const zp = fakePlayer(); zp.family = { id: 'XIAOYAO' }; zp.mz = 100;
  const familyKey = zc.WORLD.ZHENYI.DATA.XIAOYAO.key;
  Object.assign(zp.temp, { wd100: 1, zy_migrate_version: '20260823b:XIAOYAO', zy_active: familyKey + '_2', ['zy_level_' + familyKey + '_2']: 1, ['zy_' + familyKey + '_2']: 1, zy_lingbo: 1 });
  const skill = { grade: 3, family: zp.family };
  const par = {}, shots = [];
  for (let i = 0; i < 2; i++) { zc.WORLD.ZHENYI.prepare_attack(zp, {}, par, skill); shots.push(zc.WORLD.ZHENYI.modify_attack(zp, {}, par, 100, skill)); }
  result('R06-zhenyi-attack-context', 'Second attack using reused params has no one-shot bonus', shots, shots[0] > 100 && shots[1] === 100);

  const disk = {}, roleDisk = {}, sws = loadSws(disk), p = fakePlayer(roleDisk); p.temp.sws_layer = 10;
  sws.sws_on_npc_die({ destroy() {} }, p);
  await new Promise(resolve => setImmediate(resolve));
  const claims = JSON.parse(disk.text).players[p.id].m10;
  // Simulate a restart after the role save.  The new player is reconstructed
  // from the role snapshot, so claims and bag must agree.
  const reboot = loadSws(disk), p2 = fakePlayer(roleDisk);
  p2.items = (roleDisk[p.id] || []).map(i => ({ ...i }));
  reboot.sws_player_sync(p2);
  result('R07-reward-crash-boundary', 'Claim and bag survive together, or reward is recoverable', { claims, bagAfterRestart: p2.items.length, pending: reboot.sws_player_get(p2).pending.length }, p2.items.some(i => i.path === 'book/wd'));
  const pd = reboot.sws_player_get(p2);
  const beforeDuplicate = JSON.stringify(p2.items);
  pd.pending.push({ key: 'm10:10', layer: 10, rewards: [{ path: 'book/wd', count: 20 }, { path: 'st/yuanjing', count: 1 }] });
  reboot.sws_retry_pending(p2);
  result('R07-pending-already-claimed', 'Already claimed key cannot grant again', p2.items.map(i => [i.path, i.count]), JSON.stringify(p2.items) === beforeDuplicate);

  const { c, world } = makeWorld(), ticks = [];
  world.USERS = [{ name: 'bad', heart_beat() { ticks.push('bad'); throw Error('injected'); } }, { name: 'good', heart_beat() { ticks.push('good'); } }];
  world.RUN_ROOMS = [{ heart_beat() { ticks.push('room'); } }]; world.on_heart_beat = () => ticks.push('global');
  world.heart_beat();
  result('OS01-heartbeat-isolation', 'Bad object cannot starve other actors/global work', ticks, ticks.includes('good') && ticks.includes('room'));
  ticks.length = 0; world.USERS = [{ heart_beat() { ticks.push('first'); world.USERS.shift(); } }, { heart_beat() { ticks.push('second'); } }]; world.RUN_ROOMS = [];
  world.heart_beat();
  result('OS01-heartbeat-removal', 'Self-removal does not skip following actor', ticks, ticks.includes('second'));
  const shutdown = "let shutdownPromise = null;" + part('main.js', 'async function gracefulShutdown(signal)', "process.on('SIGINT'");
  const logs = [], sc = { WORLD: { save: async () => false }, console: { log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push(a.join(' ')) }, process: { exit(code) { this.exitCode = code; } } };
  vm.runInNewContext(shutdown, sc); await sc.gracefulShutdown('OFFLINE');
  result('R08-shutdown-failed-save', 'Do not report failed save as clean exit', { exitCode: sc.process.exitCode, logs }, sc.process.exitCode !== 0);

  const dc = sandbox({ __CONFIG: { DB: { saveRole: async r => { if (r.id === 'bad') throw Error('offline disk failure'); return { changes: 1 }; } } }, __PATH: { DATA: '/offline/' }, require: n => n === 'fs' ? { promises: { mkdir: async () => {}, writeFile: async (p, text) => { dc.backup = JSON.parse(text); } } } : require(n) });
  vm.runInNewContext(read('os/util/data.js'), dc);
  let failedIds = [];
  try { await dc.module.exports.saveRoles(['first', 'bad', 'third'].map(id => ({ id, userid: 1, data: '{}' }))); } catch (e) { failedIds = e.failures.map(f => f.id); }
  result('PASS-save-partial-failure', 'Good roles saved; failed role is retained in the recovery snapshot and reported', { backedUp: dc.backup.map(r => r.id), failedIds }, dc.backup.length === 3 && failedIds[0] === 'bad');
  result('R08-failed-snapshot-recovery', 'Recoverable snapshot retained when DB write fails', dc.backup.map(r => r.id), dc.backup.some(r => r.id === 'bad'));

  const reflection = sandbox({ CHARACTER: function () {}, WORLD: {} });
  vm.runInNewContext(part('world/extends/char/combat.js', 'CHARACTER.prototype.damage =', 'CHARACTER.prototype.damage2 ='), reflection);
  function fighter() {
    const f = new reflection.CHARACTER();
    Object.assign(f, { hp: 1000, max_hp: 1000, max_mp: 100, fy: 0, diff_fy_per: 0, diff_sh_per: 0,
      force_skill: {}, query_prop: k => k === 'zc_rebound' ? 0.2 : 0, send_combat() {}, add_hp(v) { this.hp += v; } });
    return f;
  }
  const fa = fighter(), fb = fighter(); fa.damage(100, fb, 0);
  result('PASS-basic-double-reflect', 'Direct damage 100; reflection 20; no recursive reflection', [fa.hp, fb.hp], fa.hp === 900 && fb.hp === 980);

  const statusContext = sandbox({ CHARACTER: function () {}, clearTimeout() {}, require: () => ({}) });
  vm.runInNewContext(read('os/char/chara_skill.js'), statusContext);
  vm.runInNewContext(part('world/zhenyi.js', 'function addControl(', 'function modifyAttack('), statusContext);
  const controlled = Object.assign(new statusContext.CHARACTER(), fakePlayer(), {
    hp: 100, query_prop() { return 0; }, call_out() { return 0; }, status_changed() {}
  });
  statusContext.addControl(controlled, 'offline_busy', 'busy', 1000, 10000);
  result('PASS-zhenyi-busy-flag', 'Runtime busy flag actually set', controlled.is_busy, controlled.is_busy === 1000);
  controlled.ig_control = 1;
  statusContext.addControl(controlled, 'offline_immune', 'busy', 1000, 10000);
  result('PASS-zhenyi-immune-cooldown', 'Immune target does not consume additional-control cooldown', controlled.query_temp('offline_immune_cd', 0), !controlled.query_temp('offline_immune_cd'));

  const requestSource = part('src/utils/util.js', 'export async function Request(', 'export function ToDate(').replace('export ', '');
  const rc = sandbox({ AbortController, setTimeout, clearTimeout,
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ code: 1 }) }) });
  vm.runInNewContext(requestSource, rc);
  let callbacks = 0;
  const response = await rc.Request({ url: '/offline', callBack() { callbacks++; throw Error('offline callback failure'); } });
  result('PASS-request-callback-once', 'Consumer exception does not invoke callback again', { callbacks, code: response.code }, callbacks === 1 && response.code === 1);
  rc.fetch = async () => ({ ok: true, status: 200, json: async () => { throw Error('invalid JSON'); } });
  const nonjson = await rc.Request({ url: '/offline' });
  result('PASS-request-non-json', 'Malformed response returns controlled failure', nonjson, nonjson.code === 0);
  rc.fetch = (url, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(Object.assign(Error('offline abort'), { name: 'AbortError' }))));
  const timedOut = await rc.Request({ url: '/offline', timeout: 1 });
  result('PASS-request-timeout', 'Hanging transport is aborted', timedOut, timedOut.code === 0 && timedOut.result.includes('超时'));

  const front = sandbox({ setTimeout: () => 1, clearTimeout() {}, ReceiveData: x => front.data.push(x), ReceiveMessage: x => front.messages.push(x), data: [], messages: [],
    WSClient: function () { this.Connect = () => {}; this.Destroy = () => {}; } });
  const connectSource = part('src/client.js', 'let IsConnecting', 'export function isConnected()').replaceAll('export ', '');
  const closeSource = part('src/client.js', 'export function closeServer()', 'export function showInputError').replace('export ', '');
  vm.runInNewContext(connectSource + closeSource, front);
  front.connectServer({ ip: 'offline', port: 1 });
  const previous = vm.runInNewContext('GameClient', front); previous.OnError();
  front.connectServer({ ip: 'offline', port: 1 });
  previous.OnData('old'); previous.OnMessage('old');
  const current = vm.runInNewContext('GameClient', front); current.OnData('new'); current.OnMessage('new');
  result('PASS-old-connection-generation', 'Only current socket changes UI state', { data: front.data, messages: front.messages }, front.data.join() === 'new' && front.messages.join() === 'new');

  const wordContext = sandbox({ COMMAND: {}, SKILL: {} }); vm.createContext(wordContext);
  const wordCommand = { inherits() {} };
  vm.compileFunction(read('world/cmd/skill/zc.js'), [], { parsingContext: wordContext }).call(wordCommand);
  function wordFixture() {
    const book = { id: 'book', path: 'zc/blank_book', zc_skill_id: 'custom', zc_words: { '剑法': [500], '刀法': [500] }, zc_word_levels: {} };
    const wplayer = Object.assign(fakePlayer(), { pot: 1000, skills: { custom: { level: 3000 } }, find_obj: () => book, items_changed() {} });
    const skillObject = { is_custom: true, release_prop() {}, attach_prop() {}, item_to_json() {} };
    wordContext.SKILL.get = () => skillObject;
    wordContext.SKILL.ZC_WORDS = [{ name: 'offline', upgrade_cost: n => 10 * n }];
    return { book, wplayer, skillObject };
  }
  const validWord = wordFixture(); wordCommand.cmd_lvl(validWord.wplayer, '2', 'custom book 剑法 500');
  result('PASS-current-linear-upgrade-cost', '0 to 2 costs 10+20, correct position only', { pot: validWord.wplayer.pot, levels: validWord.book.zc_word_levels }, validWord.wplayer.pot === 970 && validWord.book.zc_word_levels['剑法'][500] === 2);
  const invalidWord = wordFixture(); wordCommand.cmd_lvl(invalidWord.wplayer, '1', 'custom book 不存在的部位 500');
  result('R11-explicit-invalid-position', 'Invalid explicit position rejected, not replaced by first matching position', { pot: invalidWord.wplayer.pot, levels: invalidWord.book.zc_word_levels }, invalidWord.wplayer.pot === 1000);
  const failedWord = wordFixture(); failedWord.skillObject.release_prop = () => { throw Error('injected property failure'); };
  try { wordCommand.cmd_lvl(failedWord.wplayer, '1', 'custom book 剑法 500'); } catch (_) {}
  result('R11-word-upgrade-failure-atomicity', 'Failed update leaves pot, book and learned skill consistent', { pot: failedWord.wplayer.pot, bookLevels: failedWord.book.zc_word_levels, skillLevels: failedWord.wplayer.skills.custom.word_levels }, failedWord.wplayer.pot === 1000 && !failedWord.book.zc_word_levels['剑法']);

  const loginWorld = { USERS: [], USERLOGIN: { wait_login() {} }, DB: { getRoleData: async () => ({ pwd: 'offline' }) }, getUser: () => null, log() {} };
  const lc = sandbox({ WORLD: loginWorld, COMMAND: {} }); vm.createContext(lc);
  const loginCommand = { inherits() {} };
  vm.compileFunction(read('world/cmd/comm/login.js'), [], { parsingContext: lc }).call(loginCommand);
  const halfUser = { socket: { destroyed: false }, password: 'offline', userid: 1, loadData() { this.id = 'offline'; throw Error('corrupt save'); }, send() {} };
  await loginCommand.loginIn(halfUser, 'offline');
  result('OS02-login-failure-registration', 'Failed load must not leave a saveable online user', loginWorld.USERS.map(u => u.id), loginWorld.USERS.length === 0);

  const roomContext = sandbox({ ROOM: function () {} });
  vm.runInNewContext(part('os/room/room.js', 'ROOM.prototype.item_changed =', 'ROOM.prototype.item_json ='), roomContext);
  const messages = [], walker = { id: 'walker', hp: 100, query_temp: () => false };
  const room = new roomContext.ROOM();
  room.items = [{ is_player: true, send: m => messages.push(m) }, { on_leave: () => false }, walker];
  walker.environment = room; room.item_json = () => 'itemremove:walker';
  const leaveResult = room.item_changed(walker, false);
  result('OS03-blocked-movement-broadcast', 'Blocked departure sends no removal to observers', { leaveResult, stillPresent: room.items.includes(walker), messages }, leaveResult === false && room.items.includes(walker) && messages.length === 0);

  const copies = [], dataContext = sandbox({ __dirname: path.join(root, 'os'), WORLD: { SERVERID: 200 }, __PATH: { DATA: '/offline/200/' },
    Date: class extends Date { constructor() { super('2026-09-07T01:00:00Z'); } },
    require: n => n === 'fs' ? { existsSync: () => true, copyFileSync: (src, dst) => copies.push({ src, dst }), readdirSync: () => [] } : require(n) });
  vm.runInNewContext(read('os/data.js'), dataContext);
  dataContext.module.exports.backup(); dataContext.__PATH.DATA = '/offline/201/'; dataContext.module.exports.backup();
  result('OS04-backup-server-isolation', 'Different server IDs cannot overwrite the same backup file', copies, copies[0].dst !== copies[1].dst);

  console.log(JSON.stringify({ source: root, results, passed: results.filter(r => r.pass).length, findings: results.filter(r => !r.pass).length }, null, 2));
  if (process.argv.includes('--strict') && results.some(r => !r.pass)) process.exitCode = 1;
}
run().catch(e => { console.error(e); process.exitCode = 2; });
