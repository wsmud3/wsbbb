'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), vm = require('vm');
const { EventEmitter } = require('events');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root,f),'utf8');
function section(file, start, end) { const s=read(file), a=s.indexOf(start), b=s.indexOf(end,a); assert(a>=0&&b>a); return s.slice(a,b); }
const paths = require('../os/admin-paths');
assert.equal(paths.allowed(root, path.join(root,'..','release-2026-09-07_backup','test.js')), false);
for (const file of ['.env','config.js','os/world.js','data/database.db','world','../other/file']) assert.equal(paths.allowed(root,path.resolve(root,file)),false,file);
assert(paths.allowed(root,path.join(root,'world/map/fixture/r0.js')));
assert.equal(paths.validateMap({id:'fixture',name:'safe',rooms:[{rid:'../../os/evil',name:'x'}]}),false);
assert.equal(paths.validateMap({id:'fixture',name:'safe',rooms:[{rid:'r0',name:'x',x:'0;code'}]}),false);
const sample='quote " slash \\ newline\n Chinese 中文';
assert.equal(vm.runInNewContext('"'+paths.sourceText(sample)+'"'),sample);
const ipc = { module: { exports: {} }, exports: {}, process: { env: { ADMIN_IPC_SECRET:'fixture-private-ipc-secret' } }, __dirname:path.join(root,'os'), console,
    require: n => n==='./release' ? 'fixture' : n==='./admin-paths' ? paths : n==='../data/db' ? {} : n==='fs' ? new Proxy(fs,{get(t,k){if (/^(write|unlink|rmdir|rmSync|mkdir)/.test(String(k))) return ()=>{throw Error('unexpected filesystem write');}; return t[k];}}) : require(n) };
vm.runInNewContext(read('os/admin-server.js')+'\nmodule.exports.testHandle = handleRequest;',ipc);
for (const [route,body] of [['map_delete',{id:'../../data'}],['map_delete',{id:'../src'}],['create_map',{id:'fixture',name:'x',rooms:[{rid:'../../os/evil',name:'x'}]}],['file_save',{path:'../outside.js',content:'x'}],['file_delete',{path:'data/database.db'}],['file_save',{path:'.env',content:'x'}]]) {
    const req=new EventEmitter(); Object.assign(req,{method:'POST',url:'/api/'+route,headers:{'x-ipc-secret':'fixture-private-ipc-secret'},destroy(){throw Error('unexpected destroy');}});
    const res={setHeader(){},writeHead(s){this.status=s;},end(s){this.body=s;}};
    ipc.module.exports.testHandle(req,res); req.emit('data',JSON.stringify(body)); req.emit('end');
    assert([400,403].includes(res.status),route+': '+res.body);
}
console.log('PASS actual IPC routes reject traversal/core-file writes before filesystem mutations');

const got=[];
const me={id:'fixture',name:'fixture',exp:1000000,level:1,family:{name:'fixture'},query_temp:k=>k==='pt'?'fixture':0,query_setting:()=>false,send:s=>got.push(s),set_temp(){},add_temp(){}};
for (const name of ['chat','es','fam','pty']) {
    const world={USERS:[me],SERVER:{name:'fixture'},DATA:{parties:new Map([['fixture',{roles:[{user:me}]}]])},COMMANDS:{emote:{enter(){}}},sendAllServer(){}};
    const ctx=vm.createContext({COMMAND:{},WORLD:world,UTIL:{htmlEncode:s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;'),replace_word:s=>s,diff_time:()=>1}});
    const cmd={inherits(){}};vm.compileFunction(read('world/cmd/channel/'+name+'.js'),[],{parsingContext:ctx}).call(cmd);
    cmd.enter(me,'*<span data-fixture="inert">test</span>');
    assert(!JSON.parse(got.pop()).content.includes('<span'),name);
}
console.log('PASS all four chat fallback branches preserve escaping');
const context={CHARACTER:function(){},ROOM:function(){},require:()=>({}),console};
vm.runInNewContext(section('os/room/room.js','ROOM.prototype.heart_beat =','ROOM.prototype.is_copy ='),context);
let ticks=0;new context.ROOM().heart_beat.call({items:[{heart_beat(){throw Error('injected');}},{heart_beat(){ticks++;}}]},0);assert.equal(ticks,1);
const xyctx=vm.createContext({TASK:{},WORLD:{USERS:[]}}), xy={inherits(){}};
vm.compileFunction(read('world/task/xy_task.js'),[],{parsingContext:xyctx}).call(xy);
let attempts=0;xy.xy_area={rooms:[{items:[{is_player:true,query_temp:()=>false,moveto(){attempts++;return false;},send(){}}]}]};xy.clear_player();assert.equal(attempts,1);
const npctx={NPC:{GET:()=>null}};vm.runInNewContext(section('os/char/npc.js','NPC.CLONE =','NPC.GET ='),npctx);assert.equal(npctx.NPC.CLONE('disabled'),null);
const copy=require('../os/util/clone-data');const base={skills:{sword:{level:3}},st_prop:[{prop:{gj:1}}]};const a=copy(base),b=copy(base);a.skills.sword.level=4;a.st_prop[0].prop.gj=2;assert.equal(b.skills.sword.level,3);assert.equal(base.st_prop[0].prop.gj,1);
const eqsrc=read('os/item/equipment.js'), eqstart=eqsrc.indexOf('EQUIPMENT.prototype.condition_tostring ='), eqend=eqsrc.indexOf('\n}',eqstart)+2;
const eqctx={EQUIPMENT:function(){}};vm.runInNewContext(eqsrc.slice(eqstart,eqend),eqctx);
const desc=[];eqctx.EQUIPMENT.prototype.condition_tostring.call({condition:{desc:'fixture'}},desc);assert(desc.includes('fixture'));
const groupLine=read('os/char/user.js').split('\n').find(l=>l.startsWith('this.eq_groups ='));
const oldRole={};vm.compileFunction(groupLine,['data']).call(oldRole,{});assert.equal(oldRole.eq_groups.length,0);
const teamctx=vm.createContext({COMMAND:{},WORLD:{getUser:()=>null}}),team={inherits(){}};
vm.compileFunction(read('world/cmd/comm/team.js'),[],{parsingContext:teamctx}).call(team);
let notice=0;team.team_reply({query_temp:()=>true,send(){notice++;}},'no');assert.equal(notice,1);
const equipctx={CHARACTER:function(){},require:()=>({}),EQUIP_TYPE:{WEAPON:0}};vm.runInNewContext(read('os/char/chara_equip.js'),equipctx);
let removals=0;const old={eq_type:1,is_equipment:true,uneq(){removals++;},eq(){return true;}};
const next={eq_type:1,is_equipment:true,check:()=>false,eq:()=>false};
const wearer=new equipctx.CHARACTER();Object.assign(wearer,{equipment:[null,old],items:[next],recount(){},send(){},remove_status(){}});
wearer.items.remove=function(item){this.splice(this.indexOf(item),1);};
wearer.equip(next);assert.equal(removals,0);assert.equal(wearer.equipment[1],old);
next.check=()=>true;wearer.equip(next);assert.equal(wearer.equipment[1],old);assert.equal(wearer.items.includes(old),false);
console.log('PASS NPC/room heartbeat isolation, move failure bound, clone data, missing groups, team and equipment rollback');
const limit=require('../api/rate-limit');let accepted=0,denied=0;for(let i=0;i<35;i++)limit({path:'/api/user/login',ip:'fixture'}, {setHeader(){},status(s){assert.equal(s,429);return this;},json(){denied++;}},()=>accepted++);assert.equal(accepted,30);assert.equal(denied,5);
console.log('PASS bounded authentication throttling');
