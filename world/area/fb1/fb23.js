this.inherits(AREA);
this.set({
    id: "yh",
    name: "移花宫",
    desc: "移花宫深藏山谷之中，繁花似锦，美不胜收。邀月怜星二位宫主武功高绝，明玉功震慑武林，宫中暗藏通往外界的地道。",
    score: 220,
    is_show: true,
    first: "yh/shandao",
    is_copy: true,
    expend: 10,
    is_multi: true,
    is_diffi: true,
    hard_scale: 1.63,   // 困难模式 NPC 属性倍率（攻略：普通攻击 1.5 万，困难 2.45 万）
    exp: 30000,
    pot: 26000,
    room_path: "yh/",
    ss_title: "移花宫主",
    // 困难扫荡额外掉落（碧血照丹青仅困难）：yh/hard_drops 只是掉落表载体，不会刷出
    drop_npcs1: ["yh/hard_drops"]
});
				this.map = [
	    // 15 个节点与原版 fb23 map 应答一一对应；每条连线只从一侧写一次（north = -y）
	    { n: "山道", id: "yh/shandao", p: [0, 0], exits: ["s"] },
	    { n: "花径", id: "yh/yihua0", p: [0, 1], exits: ["s"] },
	    { n: "花径", id: "yh/yihua1", p: [0, 2], exits: ["s"] },
	    { n: "大门", id: "yh/damen", p: [0, 3], exits: ["s"] },
	    { n: "移花阁", id: "yh/yihuage", p: [0, 4], exits: ["s"] },
	    { n: "桂花廊", id: "yh/changlang", p: [0, 5], exits: ["s"] },
	    { n: "玫瑰廊", id: "yh/changlang1", p: [0, 6], exits: ["sw","se"] },
	    { n: "邀月宫", id: "yh/yaoyuegong", p: [-1, 7], exits: [] },
	    { n: "涟星宫", id: "yh/lianxinggong", p: [1, 7], exits: [] },
	    { n: "卧室", id: "yh/woshi", p: [0, 8], exits: ["nw","ne"] },
	    { n: "暗道", id: "yh/midao", p: [0, 9], exits: [] },
	    { n: "密室", id: "yh/midao2", p: [-1, 9], exits: ["e"] },
	    { n: "小径", id: "yh/xiaojing", p: [-2, 9], exits: ["e","w"] },
	    { n: "莲花池", id: "yh/lianhuachi", p: [-3, 9], exits: [] },
		];
this.drops = [
    "book/bc#mingyugong", "book/bc#yihuajiemu", "book/bc#yifengjianfa",
    "book/bc#jueqingzhang",
    "eq/lv5/wushen/bixue_sword", "eq/lv4/yihuagongzhuang", "eq/lv4/yihuagonglv",
	    "eq/lv3/yaoyue_shouzhuo", "eq/lv3/lianxing_bingyuzan", "eq/lv3/huawuque_yupei",
    "res/huozhezi", "res/yh_biyuxuelian"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#jueqingzhang", "res/huozhezi"], odds: 2100 },
	    { obj: "book/bc#yifengjianfa", odds: 2400 },
	    { obj: ["book/bc#mingyugong", "book/bc#yihuajiemu"], odds: 2900 },
	    { obj: ["eq/lv3/yaoyue_shouzhuo", "eq/lv3/lianxing_bingyuzan", "eq/lv3/huawuque_yupei"], odds: 250 },
	    { obj: ["eq/lv4/yihuagongzhuang", "eq/lv4/yihuagonglv"], odds: 90 },
	    { obj: "eq/lv5/wushen/bixue_sword", odds: 17 },
	];


// ────────────────────────────────────────────────────────────
// 移花宫机制（各房间 / 宫主共用）
//   花丛：宫主死后，她自己宫里的描述才出现「花丛」，花朵数（3~7）在宫主死时定下，
//         存在副本存储；卧室床板左移次数 = 邀月宫花数，右移次数 = 涟星宫花数。
//   困难：不论打邀月还是涟星，另一位都会来帮忙——另一位宫主在自己宫中（未战斗时）
//         每次心跳有一定几率赶到，什么时候来看脸。
//   困难掉落约为普通两倍；碧血照丹青仅困难（花无缺）。
//   进度全部存在副本存储（room.set_temp(me, …)），随副本销毁。
// ────────────────────────────────────────────────────────────
var YH_MASTERS = {
    "yh/yaoyue": { home: "yh/yaoyuegong", key: "yh_hua_yue", dead: "yh_dead_yue", sister: "yh/lianxing", name: "邀月宫" },
    "yh/lianxing": { home: "yh/lianxinggong", key: "yh_hua_xing", dead: "yh_dead_xing", sister: "yh/yaoyue", name: "涟星宫" }
};
this.YH_MASTERS = YH_MASTERS;
var YH_ASSIST_CHANCE = 0.35;   // 每次心跳（约 5 秒）赶来帮忙的几率

// 某个副本实例（owner）里，指定路径活着的 NPC
this.yh_find_npc = function (owner, path) {
    for (var i = 0; i < this.rooms.length; i++) {
        var cp = this.rooms[i].query_copy(owner);
        if (!cp || !cp.items) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (o && !o.is_player && o.path === path && o.hp > 0) return o;
        }
    }
    return null;
};
// 花朵数：首次取用时随机 3~7，存副本存储
this.yh_flowers = function (room, me, key) {
    var n = room.query_temp(me, key, 0);
    if (!n) { n = 3 + Math.floor(Math.random() * 5); room.set_temp(me, key, n); }
    return n;
};
// 困难掉落约为普通两倍（只改本实例的掉落表，银两不变）
this.yh_hard_drops = function (npc) {
    if (!npc || !npc.drop_list) return;
    npc.drop_list = npc.drop_list.map(function (d) {
        if (!d || !d.odds) return d;
        var c = {};
        for (var k in d) c[k] = d[k];
        c.odds = Math.min(10000, d.odds * 2);
        return c;
    });
};
// 宫主房间开副本时：记下难度，困难加倍掉落
this.yh_setup_master = function (room, path, type) {
    var npc = room.find_obj_bypath(path);
    if (!npc) return;
    npc.yh_hard = type === 1;
    if (type === 1) this.yh_hard_drops(npc);
};
// 宫主之死：花丛显现，花数定下
this.yh_master_died = function (npc, killer) {
    var info = YH_MASTERS[npc.path];
    var room = npc.environment;
    if (!info || !room) return;
    var me = killer && killer.is_player ? killer : null;
    if (!me) for (var i = 0; i < room.items.length; i++) if (room.items[i] && room.items[i].is_player) { me = room.items[i]; break; }
    var home = room.query ? room.query(info.home) : null;
    if (!home) return;
    if (me) {
        home.set_temp(me, info.dead, 1);
        this.yh_flowers(home, me, info.key);
    }
    if (home.yh_show_flowers) home.yh_show_flowers();
    if (me) me.notify("<hiy>" + npc.name + "一死，" + info.name + "里那片被她挡住的花丛露了出来。</hiy>");
};
// 困难：另一位宫主赶来帮忙（宫主 NPC 的 on_heart_beat 调用，只在她没战斗时触发）
this.yh_assist_tick = function (npc) {
    if (!npc || !npc.yh_hard || npc.yh_helped || npc.hp <= 0) return;
    if (npc.is_fighting && npc.is_fighting()) return;
    var room = npc.environment;
    if (!room || !room.is_copy_room) return;
    var info = YH_MASTERS[npc.path];
    if (!info) return;
    var sis = this.yh_find_npc(room.owner, info.sister);
    if (!sis || !sis.is_fighting || !sis.is_fighting()) return;
    var dest = sis.environment;
    var foes = [];
    var en = sis.enemy || [];
    for (var i = 0; i < en.length; i++) {
        var f = en[i];
        if (f && f.hp > 0 && (f.is_player || f.master) && f.environment === dest) foes.push(f);
    }
    if (!foes.length) return;
    if (Math.random() >= YH_ASSIST_CHANCE) return;
    npc.yh_helped = 1;
    if (npc.environment !== dest) npc.moveto(dest, npc.name + "听到动静，身形一晃便不见了。", npc.name + "衣袂飘飘，飞身而至！");
    if (npc.environment !== dest) return;
    dest.send_room("<hir>" + npc.name + "冷冷道：「敢在移花宫撒野，先过我这一关！」</hir>");
    for (var j = 0; j < foes.length; j++) npc.do_kill(foes[j]);
};
