this.inherits(AREA);
this.set({
    id: "hslj",
    name: "华山论剑",
    desc: "五绝论剑，华山之巅。东邪西毒南帝北丐中神通，天下五绝齐聚华山，争夺天下第一之名号。此乃武林至高荣耀之战。",
    score: 300,
    is_show: true,
    first: "hslj/leitaixia",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 46000,
    pot: 40000,
    room_path: "hslj/",
    ss_title: "中神通"
});
				this.map = [
	    // 论剑台下是原版真实入口（不在原版 map 应答里）：up→论剑台
	    { n: "论剑台下", id: "hslj/leitaixia", p: [0, 1], exits: [] },
	    { n: "论剑台", id: "hslj/tai", p: [0, 0], exits: ["w","e","s","n"] },
	    { n: "东峰", id: "hslj/east", p: [1, 0], exits: [] },
	    { n: "西峰", id: "hslj/west", p: [-1, 0], exits: [] },
	    { n: "北峰", id: "hslj/north", p: [0, -1], exits: [] },
	    { n: "南峰", id: "hslj/south", p: [0, 2], exits: [] },
	    // 论剑台上方的绝壁顶（原版地图 7 个节点里缺的那间）：五绝打完后在论剑台「攀上绝壁」到达，有宝箱
	    { n: "华山绝顶", id: "hslj/jueding", p: [1, -1], exits: [] },
		];
		this.drops = [
	    "book/bc#duanjiajian",
	    "book/bc#kumushengong",
	    "book/bc#tiannanbu",
	    "book/bc#jinyangong",
	    "book/bc#quanzhenjianfa",
	    "book/bc#chanchubufa",
	    "book/bc#anyingfuxiang",
	    "book/bc#biboshengong",
	    "book/bc#luoyingshenjian",
	    "book/bc#hamagong",
	    "book/bc#lingshezhangfa",
	    "book/bc#tanzhishengong",
	    "book/bc#yiyangzhi",
	    "book/bc#jiuyinshengong",
	    "eq/lv4/lingshezhang",
	    "eq/lv4/yuxiao",
	    "eq/lv4/yuzhuzhang",
	    "eq/lv5/wushen/tianlong_waist"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#tiannanbu", "book/bc#chanchubufa", "book/bc#biboshengong"], odds: 2100 },
	    { obj: "book/bc#jinyangong", odds: 2900 },
	    { obj: ["book/bc#duanjiajian", "book/bc#quanzhenjianfa", "book/bc#anyingfuxiang", "book/bc#luoyingshenjian"], odds: 2400 },
	    { obj: ["book/bc#kumushengong", "book/bc#hamagong", "book/bc#lingshezhangfa", "book/bc#tanzhishengong", "book/bc#yiyangzhi"], odds: 2900 },
	    { obj: ["eq/lv4/lingshezhang", "eq/lv4/yuxiao", "eq/lv4/yuzhuzhang"], odds: 90 },
	    { obj: "book/bc#jiuyinshengong", odds: 2900 },
	    { obj: "eq/lv5/wushen/tianlong_waist", odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 华山论剑机制（攻略第 31 节）
//   登上论剑台后五绝依次出场：黄药师 → 一灯大师 → 欧阳锋 → 洪七公 → 王重阳，
//   打死一个立刻出下一个（无缝控要续上控制）。
//   论剑途中离开论剑台（凌波溜走 / 逃跑 / 任何方式走开）= 论剑中断：
//   当前对手离场、不再出人、完成度清零（0%），本轮作废。
//   五绝打完后点论剑台的「绝壁」攀上华山绝顶，有一个宝箱（九阴神功残页 / 天龙鞶）。
//   分值：前四位各 50，王重阳 100，共 300 = 100%。
//   进度存在副本存储（入口房间 temp）。
// ────────────────────────────────────────────────────────────
var HSLJ_ORDER = ["hslj/dongxie", "hslj/nandi", "hslj/xidu", "hslj/beigai", "hslj/zhongshentong"];
this.HSLJ_ORDER = HSLJ_ORDER;
// 五绝不在任何房间常驻（按顺序生成）；扫荡时仍要算他们的掉落
this.drop_npcs0 = HSLJ_ORDER.slice();
this.drop_npcs1 = HSLJ_ORDER.slice();
// 绝顶宝箱（王重阳和宝箱都有几率出九阴；天龙鞶是刷九阴的赠品）
var HSLJ_BOX = [
    { obj: "money/gold", min: 1, max: 3 },
    { obj: "book/bc#jiuyinshengong", odds: 2900 },
    { obj: "eq/lv5/wushen/tianlong_waist", odds: 880 }
];
this.HSLJ_BOX = HSLJ_BOX;
// 扫荡掉落里补上宝箱
this.query_drops = function (isdiff) {
    var list = isdiff ? AREA.prototype.query_diff_drops.call(this) : AREA.prototype.query_drops.call(this, false);
    if (list && !list._hslj_box) { list.push(HSLJ_BOX); list._hslj_box = true; }
    return list;
};

this.hslj_first = function (room) {
    if (!room || !room.owner || !room.query_fb_first) return null;
    return room.query_fb_first(room.owner) || null;
};
this.hslj_get = function (room, k, d) {
    var f = this.hslj_first(room);
    if (!f || !f.temp || f.temp[k] === undefined || f.temp[k] === null) return d;
    return f.temp[k];
};
this.hslj_set = function (room, k, v) {
    var f = this.hslj_first(room);
    if (!f) return;
    if (!f.temp) f.temp = {};
    f.temp[k] = v;
};
// 当前在台上的五绝（活着的）
this.hslj_current = function (tai) {
    if (!tai) return null;
    for (var i = 0; i < tai.items.length; i++) {
        var o = tai.items[i];
        if (o && !o.is_player && o.hp > 0 && HSLJ_ORDER.indexOf(o.path) >= 0) return o;
    }
    return null;
};
this.hslj_done = function (room) { return this.hslj_get(room, "hslj_idx", 0) >= HSLJ_ORDER.length; };
this.hslj_broken = function (room) { return !!this.hslj_get(room, "hslj_broken", 0); };

// 让第 idx 位出场，并对台上所有玩家叫杀
this.hslj_spawn = function (tai) {
    if (!tai || this.hslj_broken(tai)) return null;
    var idx = this.hslj_get(tai, "hslj_idx", 0);
    if (idx >= HSLJ_ORDER.length) return null;
    var cur = this.hslj_current(tai);
    if (cur) return cur;
    var npc = NPC.CREATE(HSLJ_ORDER[idx], tai);
    if (!npc) return null;
    tai.send_room("<hiy>" + (npc.title ? npc.title + " " : "") + npc.name + "飘然落在论剑台上。（第 " + (idx + 1) + "/" + HSLJ_ORDER.length + " 位）</hiy>");
    for (var i = 0; i < tai.items.length; i++) {
        var p = tai.items[i];
        if (p && p.is_player && p.hp > 0) npc.do_kill(p);
    }
    return npc;
};
// 玩家登台：第一次开始论剑；中途回来（如原地复活）让台上的人接着打
this.hslj_on_enter = function (tai, me) {
    if (this.hslj_broken(tai) || this.hslj_done(tai)) return;
    if (!this.hslj_get(tai, "hslj_started", 0)) {
        this.hslj_set(tai, "hslj_started", 1);
        me.notify("<hic>五绝齐聚华山之巅，将依次与你过招。论剑途中不可离开论剑台，否则论剑中断、前功尽弃！</hic>");
    }
    var cur = this.hslj_current(tai);
    if (!cur) this.hslj_spawn(tai);
    else if (me.hp > 0) cur.do_kill(me);
};
// 五绝之一被打死：立刻请下一位
this.hslj_on_died = function (npc, killer) {
    var tai = npc.environment;
    if (!tai || this.hslj_broken(tai)) return;
    var idx = HSLJ_ORDER.indexOf(npc.path);
    if (idx < 0) return;
    this.hslj_set(tai, "hslj_idx", idx + 1);
    if (idx + 1 >= HSLJ_ORDER.length) {
        tai.send_room("<hig>五绝尽数败在你手下，华山论剑天下第一！论剑台上方的绝壁似乎可以攀上去。</hig>");
        return;
    }
    var self = this;
    setTimeout(function () { self.hslj_spawn(tai); }, 300);
};
// 论剑途中离开论剑台 = 中断，完成度清零
this.hslj_on_leave = function (tai, me, dir) {
    if (!me || !me.is_player || me.hp <= 0) return;
    if (!this.hslj_get(tai, "hslj_started", 0) || this.hslj_broken(tai) || this.hslj_done(tai)) return;
    var cur = this.hslj_current(tai);
    if (!cur) return;
    this.hslj_set(tai, "hslj_broken", 1);
    var f = this.hslj_first(tai);
    if (f) f.score = 0;
    if (cur.end_fight) cur.end_fight();
    cur.destroy("<hiy>" + cur.name + "冷笑一声：「临阵脱逃，也配论剑？」拂袖而去。</hiy>");
    me.notify("<hir>你在论剑途中离开了论剑台——论剑中断，本次完成度清零（0%）。出副本重来吧。</hir>");
};
