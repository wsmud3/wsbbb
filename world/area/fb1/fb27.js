this.inherits(AREA);
this.set({
    id: "gm",
    name: "光明顶",
    desc: "明教总舵光明顶，西域大漠之中的武林圣地。明教教众高手如云，五行旗各怀绝技，圣火令上刻有无上武功秘法。",
    score: 260,
    is_show: true,
    first: "gm/shanmen",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 38000,
    pot: 34000,
    room_path: "gm/",
    ss_title: "光明右使"
});
		this.map = [
	    { n: "山门", id: "gm/shanmen", p: [2, 5], exits: ["n"] },
	    { n: "栈道", id: "gm/zhandao", p: [2, 4], exits: ["w","s"] },
	    { n: "山路", id: "gm/shanlu", p: [1, 4], exits: ["nw","e"] },
	    { n: "半山亭", id: "gm/banshanting", p: [0, 3], exits: ["se","n"] },
	    { n: "半山腰", id: "gm/banshanyao", p: [0, 2], exits: ["e","n"] },
	    { n: "山坡", id: "gm/shanpo1", p: [1, 2], exits: ["e","w"] },
	    { n: "山坡", id: "gm/shanpo2", p: [2, 2], exits: ["e","w"] },
	    { n: "悬天石", id: "gm/xuantianshi", p: [3, 2], exits: ["w"] },
	    { n: "林间小路", id: "gm/xiaolu1", p: [0, 1], exits: ["n"] },
	    { n: "光明顶", id: "gm/guangmingding", p: [0, 0], exits: ["n"] },
	    { n: "厚土旗", id: "gm/qi_houtu", p: [0, -1], exits: ["n"] },
	    { n: "洪水旗", id: "gm/qi_hongshui", p: [1, -1], exits: ["n","e","w"] },
	    { n: "烈火期", id: "gm/qi_liehuo", p: [1, -2], exits: ["s","e"] },
	    { n: "锐金旗", id: "gm/qi_ruijin", p: [-1, -2], exits: [] },
	    { n: "巨木旗", id: "gm/qi_jumu", p: [-1, -1], exits: [] },
	    { n: "练武场", id: "gm/lianwu", p: [0, -2], exits: ["s","e","n"] },
	    { n: "山崖", id: "gm/shanya", p: [2, -1], exits: ["w"] },
	    { n: "断崖", id: "gm/duanya", p: [2, -2], exits: ["e"] },
	    { n: "聚议厅", id: "gm/juyiting", p: [0, -3], exits: ["s","n"] },
	    { n: "圣火堂", id: "gm/shenghuotang", p: [0, -4], exits: ["s"] },
	    { n: "小厅", id: "gm/xiaoting", p: [-1, -4], exits: ["e","n"] },
	    { n: "后院", id: "gm/houyuan", p: [-1, -5], exits: ["n","w","s"] },
	    { n: "西厢", id: "gm/xixiang", p: [-2, -5], exits: ["e"] },
	    { n: "北厢", id: "gm/beixiang", p: [-1, -6], exits: ["s"] },
		];
	this.drops = [
	    "book/bc#shenghuoshengong",
	    "book/bc#qingfushenfa",
	    "book/bc#yingzhuagong",
	    "book/bc#shenghuolingfa",
	    "book/bc#qiankundanuoyi",
	    "book/bc#jiuyangshengong",
	    "eq/lv4/shenghuoling",
	    "eq/lv5/wushen/yitian_sword",
	    "eq/lv4/zhouzhiruo_shouzhuo",
	    "eq/lv4/yangbuhui_xianglian",
	    "eq/lv4/zhaomin_jiezhi",
	    "eq/lv4/weiyixiao_taomingshoe"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#qingfushenfa", "book/bc#yingzhuagong", "book/bc#shenghuolingfa"], odds: 2100 },
	    { obj: "book/bc#shenghuoshengong", odds: 2400 },
	    { obj: ["eq/lv4/shenghuoling", "eq/lv4/zhouzhiruo_shouzhuo", "eq/lv4/yangbuhui_xianglian", "eq/lv4/zhaomin_jiezhi", "eq/lv4/weiyixiao_taomingshoe"], odds: 90 },
	    { obj: ["book/bc#qiankundanuoyi", "book/bc#jiuyangshengong"], odds: 2900 },
	    { obj: "eq/lv5/wushen/yitian_sword", odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 光明顶机制（进度存副本存储 room.set_temp，随副本销毁）
//   名字颜色：明教众人<hib>蓝名</hib>（速杀），韦一笑、殷天正<hig>绿名</hig>，张无忌<hiy>黄名</hiy>；
//             六大门派弟子、灭绝师太是自己人（0 分，不计完成度）。
//   五散人 / 五行旗使所在的房间各有三名六大门派弟子：你一进门，明教的人就先向弟子们下杀手。
//   每死一名六派弟子（谁杀的都算），张无忌便多一层「号令」（最多 24 层，每层攻击 +30%）。
//   杀掉房间里的明教高手即救下弟子，弟子们道谢后自行下山。
//   光明顶上说不得、彭莹玉围攻灭绝师太（灭绝抗揍，不会死），二人都死后灭绝脱困。
//   圣火堂：张无忌不主动叫杀，先杀光明左右使，再单挑张无忌。
// ────────────────────────────────────────────────────────────
var GM_DIZI = "gm/liumendizi";
var GM_MAX_HAOLING = 24;
var GM_HAOLING_PER = 0.3;

this.gm_key = function (room) { return { query_teamid: function () { return room.owner; } }; };
this.gm_get = function (room, k, d) { return room.query_temp(this.gm_key(room), k, d); };
this.gm_set = function (room, k, v) { room.set_temp(this.gm_key(room), k, v); };
this.gm_alive_list = function (room, path) {
    var out = [];
    if (!room || !room.items) return out;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && !o.is_player && o.path === path && o.hp > 0) out.push(o);
    }
    return out;
};
this.gm_copy = function (room, path) {
    if (!this.rooms) return null;
    for (var i = 0; i < this.rooms.length; i++) {
        if (this.rooms[i].path !== path) continue;
        return this.rooms[i].query_copy(room.owner) || null;
    }
    return null;
};

// 击杀者是 NPC（童姥/灭绝/六派弟子补了最后一刀）时，NPC.die 的通用加分会因 NPC 没有队伍 id 而丢失，
// 这里把分数补记到本副本（与 add_fbscore 记在同一处）
this.gm_credit = function (npc, killer) {
    if (!npc || !(npc.score > 0)) return;
    if (killer && killer.query_teamid && killer.query_teamid()) return;
    var room = npc.environment || npc.die_room;
    var fb = room && room.query_fb_first && room.query_fb_first(room.owner);
    if (fb) fb.score = (fb.score || 0) + npc.score;
};

// 明教高手进门迎敌：先向同房间的六派弟子下杀手，再对付玩家（挂在 NPC 的 on_enter 上）
this.gm_engage = function (npc, me) {
    var room = npc.environment;
    if (!room || !me || !me.is_player || npc.hp <= 0) return;
    var dz = this.gm_alive_list(room, GM_DIZI);
    if (dz.length) {
        if (!npc._gm_engaged) me.notify("<hir>" + npc.name + "正与" + dz.length + "名六大门派弟子激斗，见你闯入，下手更狠了！（六派弟子每死一人，张无忌便多一层号令——速杀" + npc.name + "！）</hir>");
        for (var i = 0; i < dz.length; i++) npc.do_kill(dz[i]);
    }
    npc._gm_engaged = true;
    npc.do_kill(me);
};

// 明教高手倒下：救下同房间的六派弟子
this.gm_rescue = function (npc, killer) {
    var room = npc.environment;
    if (!room) return;
    this.gm_credit(npc, killer);
    var dz = this.gm_alive_list(room, GM_DIZI);
    if (!dz.length) return;
    for (var i = 0; i < dz.length; i++) {
        dz[i].end_fight();
        dz[i].destroy();
    }
    room.send_room("<hig>" + dz.length + "名六大门派弟子向你抱拳道谢，相互搀扶着下山去了。</hig>");
    room.refresh(room.find_me ? room.find_me() : null);
};

// 六派弟子之死：张无忌号令 +1
this.gm_on_dizi_died = function (dz) {
    var room = dz.environment;
    if (!room) return;
    var n = this.gm_get(room, "gm_haoling", 0);
    if (n < GM_MAX_HAOLING) n++;
    this.gm_set(room, "gm_haoling", n);
    room.send_room("<hiy>一名六大门派弟子倒下了……远处圣火堂传来号角声，张无忌的号令已有 " + n + " 层。</hiy>");
    var sht = this.gm_copy(room, "gm/shenghuotang");
    var zwj = sht && this.gm_alive_list(sht, "gm/zhangwuji")[0];
    if (zwj) this.gm_apply_haoling(zwj);
};

// 号令层数 → 张无忌攻击（NPC 的 gj 在模板里写死，recount 不重算，直接按基准改）
this.gm_apply_haoling = function (zwj) {
    var room = zwj.environment;
    if (!room) return;
    var n = this.gm_get(room, "gm_haoling", 0);
    if (!zwj._gm_base_gj) zwj._gm_base_gj = zwj.gj;
    zwj.gj = Math.floor(zwj._gm_base_gj * (1 + GM_HAOLING_PER * n));
    if (n > 0) {
        zwj.add_status({ id: "gm_haoling", name: "<hiy>号令</hiy>", desc: "六大派每死一人，教众士气便盛一分（" + n + " 层，攻击 +" + Math.round(GM_HAOLING_PER * n * 100) + "%）", duration: 0, override: 2 });
    }
};

// 光明顶：说不得、彭莹玉围攻灭绝师太（不理会玩家，攻略：先忽略她，最后回来杀二人救灭绝）
this.gm_siege = function (room) {
    var mj = this.gm_alive_list(room, "gm/miejueshitai")[0];
    if (!mj || this.gm_get(room, "gm_mj_free", 0)) return false;
    var foes = this.gm_alive_list(room, "gm/shuobude").concat(this.gm_alive_list(room, "gm/pengyingyu"));
    for (var i = 0; i < foes.length; i++) foes[i].do_kill(mj);
    return foes.length > 0;
};
// 说不得 / 彭莹玉倒下：二人都死则灭绝脱困
this.gm_on_siege_died = function (npc, killer) {
    var room = npc.environment;
    if (!room) return;
    this.gm_credit(npc, killer);
    var left = this.gm_alive_list(room, "gm/shuobude").length + this.gm_alive_list(room, "gm/pengyingyu").length;
    if (left > 0) return;
    var mj = this.gm_alive_list(room, "gm/miejueshitai")[0];
    if (!mj || this.gm_get(room, "gm_mj_free", 0)) return;
    this.gm_set(room, "gm_mj_free", 1);
    mj.end_fight();
    mj.hp = mj.max_hp;
    room.send_room("<hig>灭绝师太脱出重围，倚天剑一振，冷冷道：「峨嵋派不欠人情。」</hig>");
    var me = killer && killer.is_player ? killer : (room.find_me ? room.find_me() : null);
    if (me && mj.drop_list && typeof OBJ !== "undefined" && OBJ.create_by_odds) {
        var items = OBJ.create_by_odds(mj.drop_list);
        for (var i = 0; i < items.length; i++) {
            if (!items[i]) continue;
            me.add_obj(items[i]);
            me.notify("<hig>灭绝师太丢给你" + (items[i].name || "一件东西") + "。</hig>");
        }
    }
};
