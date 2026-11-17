this.inherits(AREA);
this.set({
    id: "hmy",
    name: "黑木崖",
    desc: "黑木崖高耸入云，易守难攻，日月神教总舵所在。教众遍布四处关卡，教主东方不败武功盖世，葵花宝典威震江湖。",
    score: 240,
    is_show: true,
    first: "hmy/shangu",
    is_copy: true,
    record_0: true,    // 记录单人通关/扫荡次数（副本次数兑换、橙装次数门槛要用）
    record_1: true,
    expend: 10,
    is_multi: true,
    is_diffi: true,
    exp: 34000,
    pot: 30000,
    room_path: "hmy/",
    ss_title: "日月教主"
});
		this.map = [
	    { n: "山谷", id: "hmy/shangu", p: [0, 0], exits: ["e"] },
	    { n: "白虎堂", id: "hmy/bh_tang", p: [0, -1], exits: ["s","n"] },
	    { n: "走廊", id: "hmy/bh_lang", p: [0, -2], exits: ["n"] },
	    { n: "大厅", id: "hmy/bh_ting", p: [0, -3], exits: ["s"] },
	    { n: "青龙堂", id: "hmy/ql_tang", p: [0, 1], exits: ["s","n"] },
	    { n: "走廊", id: "hmy/ql_lang", p: [0, 2], exits: ["s"] },
	    { n: "大厅", id: "hmy/ql_ting", p: [0, 3], exits: ["n"] },
	    { n: "密林", id: "hmy/shulin", p: [1, 0], exits: ["e","w","s"] },
	    { n: "风雷堂", id: "hmy/fl_tang", p: [1, -1], exits: ["n","s"] },
	    { n: "走廊", id: "hmy/fl_lang", p: [1, -2], exits: ["n"] },
	    { n: "大厅", id: "hmy/fl_ting", p: [1, -3], exits: ["s"] },
	    { n: "天香堂", id: "hmy/tx_tang", p: [1, 1], exits: ["n"] },
	    { n: "悬崖", id: "hmy/up1", p: [2, 0], exits: ["w"] },
	    { n: "悬崖", id: "hmy/up2", p: [2, -1], exits: ["w"] },
	    { n: "悬崖", id: "hmy/up3", p: [2, -2], exits: ["s"] },
	    { n: "大门", id: "hmy/damen", p: [3, -2], exits: ["w","e"] },
	    { n: "承德殿", id: "hmy/chengdedian", p: [4, -2], exits: ["w","e"] },
	    { n: "后殿", id: "hmy/houdian", p: [5, -2], exits: ["w","n"] },
	    { n: "密道", id: "hmy/midao1", p: [5, -1], exits: ["s"] },
	    { n: "小花园", id: "hmy/huayuan", p: [5, 0], exits: ["w","e"] },
	    { n: "闺房", id: "hmy/guifang", p: [6, 0], exits: ["w"] },
		];

// ────────────────────────────────────────────────────────────
// 黑木崖机制（闺房 / 杨莲亭 / 东方不败共用；进度存副本存储 room.set_temp，随副本销毁）
//   普通：山谷北白虎堂(上官云)、南青龙堂(贾布)、树林北风雷堂(童百熊)各取一令，悬崖三处匣子
//         依次插令乘吊篮到大门 → 杨莲亭拦路 → 后厅转碗开密道 → 火折子点亮找铁环 → 小花园 → 闺房。
//   闺房：杨莲亭与东方不败一起叫杀。杨莲亭活着时替东方不败挡刀；杨莲亭死后东方不败狂暴 + 鬼魅约 30 秒。
//         跑路后再进闺房、或天师符原地复活，杨莲亭都会复活。
//         杨莲亭只有在与你交战时才挡刀。唐诗剑法「躺尸」会消除二人的仇恨（引擎通用规则，见
//         CHARACTER.do_kill），之后他们不再主动攻击你，可以单独叫杀东方不败来避开挡刀。
//   困难：三堂大厅没有堂主；要带着三块令牌（在普通模式刷）在第一处悬崖一并插入，直上崖顶，
//         三位堂主在大门一起出战（1v3），之后与普通相同。
// ────────────────────────────────────────────────────────────
this.hmy_alive = function (room, path) {
    if (!room || !room.items) return null;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && !o.is_player && o.path === path && o.hp > 0) return o;
    }
    return null;
};
// 副本存储的钥匙：NPC 回调里未必有玩家在场，用房间 owner（即队伍 id）充当
this.hmy_key = function (room) {
    return { query_teamid: function () { return room.owner; } };
};
this.hmy_get = function (room, k, d) { return room.query_temp(this.hmy_key(room), k, d); };
this.hmy_set = function (room, k, v) { room.set_temp(this.hmy_key(room), k, v); };

// 东方不败狂暴 + 鬼魅。NPC 的 gj/ds/mz 在模板里写死，recount 不会按 *_per 重算，
// 所以直接改数值、30 秒后还原（状态只用于显示和攻速，gjsd 每次 recount 都会重算）。
this.hmy_kuangbao = function (df) {
    if (!df || df.hp <= 0) return;
    if (!df._hmy_base) df._hmy_base = { gj: df.gj, ds: df.ds, mz: df.mz };
    var b = df._hmy_base;
    df.gj = Math.floor(b.gj * 1.6);
    df.ds = Math.floor(b.ds * 1.5);
    df.mz = Math.floor(b.mz * 1.2);
    if (df._hmy_kb_timer) clearTimeout(df._hmy_kb_timer);
    df._hmy_kb_timer = df.call_out(function () {
        this._hmy_kb_timer = null;
        if (!this._hmy_base) return;
        this.gj = this._hmy_base.gj;
        this.ds = this._hmy_base.ds;
        this.mz = this._hmy_base.mz;
        if (this.hp > 0 && this.environment && this.environment.send_room)
            this.environment.send_room("<hiy>东方不败眼中血色渐退，狂暴与鬼魅身法都消散了。</hiy>");
    }, 30000);
    df.add_status({ id: "hmy_kuangbao", name: "<hir>狂暴</hir>", desc: "攻击暴涨，悍不畏死", duration: 30000, override: 2, prop: { gjsd: 1200 } });
    df.add_status({ id: "hmy_guimei", name: "<hiw>鬼魅</hiw>", desc: "身法快如鬼魅，难以捉摸", duration: 30000, override: 2 });
    if (df.environment && df.environment.send_room)
        df.environment.send_room("<hir>杨莲亭倒在血泊之中，东方不败厉啸一声，双目尽赤——狂暴！鬼魅身法随之展开！</hir>");
};

// 闺房里的杨莲亭复活（跑路回来 / 天师符原地复活都会重新进入闺房）
this.hmy_revive_ylt = function (room, me) {
    if (!this.hmy_get(room, "hmy_ylt_killed", 0)) return;
    if (!this.hmy_alive(room, "hmy/dongfangbubai")) return;
    if (this.hmy_alive(room, "hmy/yanglianting")) return;
    NPC.CREATE("hmy/yanglianting", room);
    var ylt = this.hmy_alive(room, "hmy/yanglianting");
    this.hmy_set(room, "hmy_ylt_killed", 0);
    room.refresh(me);
    if (me) me.notify("<hir>帐后人影一闪，杨莲亭竟又站到了东方不败身前：「有我在，谁也伤不了教主！」</hir>");
    if (ylt && me) ylt.do_kill(me);
};

// 杨莲亭挡刀：他正在与该玩家交战时，玩家打在东方不败身上的伤害七成转到杨莲亭身上
// （他不会因此而死，须先杀他；躺尸消除仇恨后单独叫杀东方不败，杨莲亭不在战斗中便不挡）
this.hmy_shield = function (df, from, sh) {
    var room = df.environment;
    if (!room || !from || !from.is_player || !(sh > 0)) return;
    var ylt = this.hmy_alive(room, "hmy/yanglianting");
    if (!ylt || ylt.hp <= 1) return;
    if (!ylt.is_fighting(from)) return;
    var take = Math.min(Math.floor(sh * 0.7), ylt.hp - 1);
    if (take <= 0) return;
    df.add_hp(take);
    ylt.add_hp(-take);
    var now = Date.now();
    if (!df._hmy_shield_msg || now - df._hmy_shield_msg > 8000) {
        df._hmy_shield_msg = now;
        room.send_room("<hiy>杨莲亭合身扑上，替东方不败挡下了大半力道！</hiy>");
    }
};

this.drops = [
    "book/bc#kuihuashengong",
    "book/bc#pixiejianfa",
    "eq/lv3/shangguanyun_pifeng",
    "eq/lv3/tongbaixiong_jiezhi",
    "eq/lv3/yanglianting_xiangquan",
    "eq/lv3/jiabu_huyaosuo",
    "eq/lv4/xiuhuazhen"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["eq/lv3/shangguanyun_pifeng", "eq/lv3/tongbaixiong_jiezhi", "eq/lv3/yanglianting_xiangquan", "eq/lv3/jiabu_huyaosuo"], odds: 250 },
	    { obj: "eq/lv4/xiuhuazhen", odds: 90 },
	    { obj: ["book/bc#kuihuashengong", "book/bc#pixiejianfa"], odds: 2900 },
	];
