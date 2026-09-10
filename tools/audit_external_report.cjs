'use strict';
// Read-only source probes for BUG_REPORT.md. Findings are NOT passing regressions.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const results = [];
function check(id, evidence) { results.push({ id, evidence }); }
function command(file, context) {
    const obj = { inherits() {} };
    vm.compileFunction(read(file), [], { parsingContext: vm.createContext({ COMMAND: {}, ...context }) }).call(obj);
    return obj;
}
const messages = [];
const player = { id: 'synthetic', name: 'fixture', exp: 1000000, level: 1, query_temp: () => 0, query_setting: () => false, send: s => messages.push(s), set_temp() {} };
command('world/cmd/channel/chat.js', { WORLD: { USERS: [player], COMMANDS: { emote: { enter() {} } } }, UTIL: { htmlEncode: s => s.replaceAll('<','&lt;').replaceAll('>','&gt;'), replace_word: s => s } }).enter(player, '*<span data-fixture="inert">test</span>');
check('D9-chat-escape', { rawMarkupBroadcast: JSON.parse(messages[0]).content.includes('<span') });
try {
    command('world/cmd/comm/team.js', { WORLD: { getUser: () => null } }).team_reply({ query_temp: () => 'offline', send() {} }, 'no');
    check('13-team', 'no error');
} catch (e) { check('13-team', e.name); }
const xy = command('world/task/xy_task.js', { TASK: {}, WORLD: { USERS: [] } });
let moves = 0;
xy.xy_area = { rooms: [{ items: [{ is_player: true, query_temp: () => false, send() {}, moveto() { if (++moves > 5) throw Error('test iteration budget reached'); return false; } }] }] };
try { xy.clear_player(); } catch (e) { check('14-xy', { moves, error: e.message }); }
const c = { CHARACTER: function () {}, require: () => ({}) };
vm.runInNewContext(read('os/char/chara_prop.js'), c);
const p = new c.CHARACTER(); p.max_hp = 100; p.add_combat_prop('max_hp', 10);
check('low-max-hp', { afterAdding10To100: p.max_hp });
const source = read('os/char/npc.js');
const npcContext = { NPC: { GET: () => null } };
vm.runInNewContext(source.slice(source.indexOf('NPC.CLONE ='), source.indexOf('NPC.GET =')), npcContext);
try { npcContext.NPC.CLONE('disabled'); } catch (e) { check('18-disabled-npc', e.name); }
const eq = { EQUIPMENT: function () {} };
const eqSrc = read('os/item/equipment.js');
vm.runInNewContext(eqSrc.slice(eqSrc.indexOf('EQUIPMENT.prototype.condition_tostring ='), eqSrc.indexOf('EQUIPMENT.prototype.condition_tostring =') + eqSrc.slice(eqSrc.indexOf('EQUIPMENT.prototype.condition_tostring =')).indexOf('\n}')) + '\n}', eq);
try { new eq.EQUIPMENT().condition_tostring.call({ condition: { desc: 'fixture' } }, []); } catch (e) { check('low-equip-desc', e.name); }
const idstr = /idstr:\s*"([^"]+)"/.exec(read('os/util/util.js'))[1];
check('low-idstr', { hasY: idstr.includes('y'), hasZ: idstr.includes('z'), wCount: [...idstr].filter(c => c === 'w').length });
check('20-auction', { serverExplicitlyClosed: /return me\.send\('未开放'\)/.test(read('world/cmd/extend/paimai.js')) });
check('19-search-role', { callerExists: read('api/game.js').includes('DB.query_role('), implementationExists: /query_role\s*[:=(]/.test(read('data/sql.js')) });
console.log(JSON.stringify(results, null, 2));
