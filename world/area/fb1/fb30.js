this.inherits(AREA);
this.set({
    id: "gm2",
    name: "古墓派",
    desc: "终南山活死人墓，古墓派世代隐居于此。林朝英所创武功精妙绝伦，玉女心经冠绝天下，墓中机关重重，暗藏玄机。",
    score: 290,
    is_show: true,
    first: "gm2/gumukou",
    is_copy: true,
    expend: 10,
    is_multi: false,
    is_diffi: true,      // 困难：剑灵变剑魔（主动叫杀、控不住、绝对命中），掉龙骨环不掉盘龙簪
    exp: 44000,
    pot: 40000,
    room_path: "gm2/",
    ss_title: "神雕大侠"
});
		this.map = [
	    { n: "古墓入口", id: "gm2/gumukou", p: [0, 0], exits: ["enter"] },
	    { n: "前厅", id: "gm2/qianting", p: [1, 0], exits: ["out","e"] },
	    { n: "后堂", id: "gm2/houtang", p: [2, 0], exits: ["w","n","e"] },
	    { n: "卧室", id: "gm2/woshi", p: [2, -1], exits: ["s"] },
	    { n: "琴室", id: "gm2/qinshi", p: [3, 0], exits: ["w","d"] },
	    { n: "暗河", id: "gm2/anhe", p: [4, 0], exits: [] },
	    { n: "峭壁", id: "gm2/qiaobi", p: [4, -1], exits: ["s"] },          // 上平台靠「纵身跃上」
	    { n: "平台", id: "gm2/pingtai", p: [4, -2], exits: ["s"] },          // 东去剑冢要先硬抗海潮
	    { n: "剑冢", id: "gm2/jianzhong", p: [5, -2], exits: ["w"] },
		];
	this.drops = [
	    "book/bc#yunvxinjing",
	    "book/bc#yinsuojinling",
	    "book/bc#anranxiaohunzhang",
	    "book/bc#xuantiejianfa",
	    "eq/lv5/wushen/longgu_ring",
	    "eq/lv5/wushen/panlong_head",
	    "eq/lv4/bingpoyinzhen",
	    "eq/lv4/jinlingsuo"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#yunvxinjing", "book/bc#yinsuojinling"], odds: 2400 },
	    { obj: ["eq/lv4/bingpoyinzhen", "eq/lv4/jinlingsuo"], odds: 90 },
	    { obj: ["book/bc#anranxiaohunzhang", "book/bc#xuantiejianfa"], odds: 2900 },
	    { obj: ["eq/lv5/wushen/longgu_ring", "eq/lv5/wushen/panlong_head"], odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 古墓派机制（攻略第 30 节）
//   卧室看画记剑指方向 → 琴室弹古琴：出现下暗河的出口，杨过、小龙女现身（不主动出手）。
//   小龙女可以比试（她受伤后不会自行回血，攻略的「比试到一滴血→叫杀→凌波溜→死了复活→干掉」可行）；
//   对任一人叫杀，另一人都会来帮手；小龙女死后杨过拼命。
//   杨过杀不死，只能打昏（夺魄/六脉/催心/穿心掌/参合指等昏迷技能）；他醒着就拦在暗道口不让下。
//   暗河：满血朝剑指方向游 → 峭壁：回满血「纵身跃上」→ 平台：推石块，杨过赶来；
//   「我准备好了」硬抗杨过一记海潮汹涌（伤害由杨过攻击算，可被闪避/招架/免伤减免），扛住才开东面剑冢。
//   剑冢：普通是剑灵（不主动出手）；困难是剑魔：主动叫杀、免控、绝对命中（凌波也躲不开）。
//   掉落：盘龙簪仅普通，龙骨环仅困难（剑冢房间 on_set_difficulty 过滤；扫荡走下面的 query_drops）。
// ────────────────────────────────────────────────────────────
// 杨过、小龙女要弹琴后才出现，不在任何房间常驻；扫荡时仍要算他们的掉落
this.drop_npcs0 = ["gm2/xiaolongnv", "gm2/yangguo"];
this.drop_npcs1 = ["gm2/xiaolongnv", "gm2/yangguo"];

this.gm2_rooms = function (room) {
    var out = [];
    if (!room || !room.owner || !this.rooms) return out;
    for (var i = 0; i < this.rooms.length; i++) {
        var cp = this.rooms[i].query_copy(room.owner);
        if (cp) out.push(cp);
    }
    return out;
};
// 本副本里某路径的活着的 NPC（第一个）
this.gm2_find = function (room, path) {
    var rms = this.gm2_rooms(room);
    for (var i = 0; i < rms.length; i++) {
        for (var j = 0; j < rms[i].items.length; j++) {
            var o = rms[i].items[j];
            if (o && !o.is_player && o.hp > 0 && o.path === path) return o;
        }
    }
    return null;
};

// 按难度过滤掉落：普通去掉龙骨环，困难去掉盘龙簪
var GM2_ONLY = { 0: "longgu_ring", 1: "panlong_head" };
this.gm2_filter_drops = function (list, diff) {
    var ban = GM2_ONLY[diff ? 1 : 0];
    var out = [];
    for (var i = 0; i < list.length; i++) {
        var d = list[i];
        if (!d) continue;
        var objs = d.obj instanceof Array ? d.obj : [d.obj];
        var keep = [];
        for (var k = 0; k < objs.length; k++) if (String(objs[k]).indexOf(ban) < 0) keep.push(objs[k]);
        if (!keep.length) continue;
        if (keep.length === objs.length) { out.push(d); continue; }
        var nd = {};
        for (var key in d) nd[key] = d[key];
        nd.obj = keep.length === 1 && !(d.obj instanceof Array) ? keep[0] : keep;
        out.push(nd);
    }
    return out;
};
// 扫荡（cr 快速完成）用的掉落表：按模式过滤
this.query_drops = function (isdiff) {
    var key = isdiff ? "_gm2_drops1" : "_gm2_drops0";
    if (this[key]) return this[key];
    var raw = isdiff ? AREA.prototype.query_diff_drops.call(this) : AREA.prototype.query_drops.call(this, false);
    var out = [];
    for (var i = 0; i < raw.length; i++) {
        var f = this.gm2_filter_drops(raw[i] || [], isdiff);
        if (f.length) out.push(f);
    }
    this[key] = out;
    return out;
};
var GM2_CLEAR = AREA.prototype.clear;
this.clear = function () {
    this._gm2_drops0 = null;
    this._gm2_drops1 = null;
    return GM2_CLEAR.call(this);
};
