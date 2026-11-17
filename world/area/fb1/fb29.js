this.inherits(AREA);
this.set({
    id: "xd",
    name: "血刀门",
    desc: "血刀门盘踞西域雪山，门人凶残嗜血，以血刀老祖为尊。血刀大法诡异狠辣，刀下亡魂无数，雪山之中藏有血刀门的至宝。",
    score: 280,
    is_show: true,
    first: "xd/shankou",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 42000,
    pot: 38000,
    room_path: "xd/",
    ss_title: "血刀老祖"
});
		this.map = [
	    { n: "山口", id: "xd/shankou", p: [0, 0], exits: ["s"] },
	    { n: "山谷", id: "xd/shangu", p: [0, 1], exits: ["n","e","s"] },
	    { n: "山洞", id: "xd/shandong", p: [1, 1], exits: ["w"] },
	    { n: "忘忧谷", id: "xd/wangyou", p: [0, 2], exits: ["n","eu"] },
	    { n: "洞口", id: "xd/dongkou", p: [1, 2], exits: ["wd","enter"] },
	    { n: "山洞", id: "xd/xuedao", p: [2, 2], exits: ["out"] },
		];
	this.drops = [
	    "book/bc#shenkongxing2",
	    "book/bc#shenzhaojing",
	    "book/bc#xuehaimogong",
	    "book/bc#xuedao",
	    "eq/lv5/wushen/xuedao_blade",
	    "eq/lv5/wushen/longxue_cape"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#shenkongxing2", odds: 2100 },
	    { obj: ["book/bc#shenzhaojing", "book/bc#xuehaimogong"], odds: 2900 },
	    { obj: "book/bc#xuedao", odds: 2900 },
	    { obj: ["eq/lv5/wushen/xuedao_blade", "eq/lv5/wushen/longxue_cape"], odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 血刀门机制（攻略第 29 节）
//   路线：山口 → 山谷 → 忘忧谷 → (东上)洞口(两名血刀弟子) → (enter)山洞(血刀老祖)。
//   山洞里血刀老祖与「落花流水」四侠（陆天抒、花铁干、刘乘风、水岱，可被玩家叫杀）对峙，
//   玩家进洞后老祖主动叫杀，四侠与老祖混战。开战后副本里每死一个 NPC（不论是玩家还是老祖杀的），老祖就往西
//   （山谷方向）走一步：
//       山洞 →(out) 洞口 →(westdown) 忘忧谷 →(north) 雪山山谷，共 3 步。
//   四侠也会跟着他走，玩家必须跟上：
//     · 有人死时老祖身边没有活着的玩家 → 这一次不算，老祖原地不动；
//     · 杀得太快（距上一步不足 10 秒）→ 血气翻涌，原地不动。
//   四侠只有 4 人、要走 3 步，最多只能浪费 1 次；四侠死光老祖还没到山谷 = 翻车（他永远杀不死）。
//   老祖到山谷前护体血光锁血（hp 最低 1），到了山谷才能杀；一路上被四侠/玩家打掉的血不会回，
//   所以「到山谷时的血量由杀人快慢决定」。
//   血魔：老祖持血刀时每砍死一人，攻击、命中各 +4000（可叠加）；血刀被卸下后血魔之力全部消散，
//   之后再杀人也不再叠加。打死老祖 = 100%。
//   进度全部存在副本存储（入口房间 temp），随副本销毁。
// ────────────────────────────────────────────────────────────
var XD_LAOZU = "xd/xuedaolaozu";
var XD_HEROES = ["xd/auto_1", "xd/auto_2", "xd/auto_3", "xd/auto_4"];
var XD_ROUTE = {
    "xd/xuedao": ["out", "xd/dongkou", "洞口"],
    "xd/dongkou": ["westdown", "xd/wangyou", "忘忧谷"],
    "xd/wangyou": ["north", "xd/shangu", "雪山山谷"]
};
var XD_GOAL = "xd/shangu";
var XD_STEPS = 3;            // 山洞 → 雪山山谷 要走的步数
var XD_MIN_GAP = 10000;      // 两次「走一步」之间至少间隔 10 秒，杀得比这快老祖就站住不动
var XD_XUEMO = 4000;         // 血魔每层攻击/命中加成
this.XD_MIN_GAP = XD_MIN_GAP;
this.XD_XUEMO = XD_XUEMO;
this.XD_HEROES = XD_HEROES;

// 副本存储：放在本副本入口房间的 temp 上（与 room.set_temp(me, …) 同一份）
this.xd_first = function (room) {
    if (!room || !room.owner || !room.query_fb_first) return null;
    return room.query_fb_first(room.owner) || null;
};
this.xd_get = function (room, k, d) {
    var f = this.xd_first(room);
    if (!f || !f.temp || f.temp[k] === undefined || f.temp[k] === null) return d;
    return f.temp[k];
};
this.xd_set = function (room, k, v) {
    var f = this.xd_first(room);
    if (!f) return;
    if (!f.temp) f.temp = {};
    f.temp[k] = v;
};
// 本副本里所有房间实例
this.xd_rooms = function (room) {
    var out = [];
    if (!room || !room.owner || !this.rooms) return out;
    for (var i = 0; i < this.rooms.length; i++) {
        var cp = this.rooms[i].query_copy(room.owner);
        if (cp) out.push(cp);
    }
    return out;
};
this.xd_find_alive = function (room, paths) {
    var out = [], rms = this.xd_rooms(room);
    for (var i = 0; i < rms.length; i++) {
        for (var j = 0; j < rms[i].items.length; j++) {
            var o = rms[i].items[j];
            if (o && !o.is_player && o.hp > 0 && paths.indexOf(o.path) >= 0) out.push(o);
        }
    }
    return out;
};
this.xd_players = function (room) {
    var out = [];
    if (!room) return out;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && o.is_player && o.hp > 0) out.push(o);
    }
    return out;
};
// 通知本副本里所有玩家（玩家可能落在后面的房间）
this.xd_tell = function (room, text) {
    var rms = this.xd_rooms(room);
    for (var i = 0; i < rms.length; i++) {
        var ps = this.xd_players(rms[i]);
        for (var j = 0; j < ps.length; j++) ps[j].notify(text);
    }
};

// 老祖遇敌：第一次时把四侠叫来（先让四侠缠上老祖，老祖的敌人列表里四侠排在前面，他会先砍四侠），再对玩家叫杀
this.xd_engage = function (lz, me) {
    var room = lz && lz.environment;
    if (!room || lz.hp <= 0) return;
    if (!this.xd_get(room, "xd_started", 0)) {
        this.xd_set(room, "xd_started", 1);
        this.xd_set(room, "xd_last_step", Date.now());
        var heroes = this.xd_find_alive(room, XD_HEROES);
        for (var i = 0; i < heroes.length; i++) {
            var h = heroes[i];
            if (h.environment !== room) h.moveto(room, h.name + "听到远处的厮杀声，提剑奔了过去。", h.name + "大喝一声冲了进来：「血刀恶僧，往哪里走！」");
            if (h.environment === room && h.do_kill) h.do_kill(lz);
        }
        if (heroes.length) room.send_room("<hiy>「落花流水」四侠闻声赶到，将血刀老祖团团围住！</hiy>");
    }
    lz.xd_engaged = true;
    // on_enter 触发时玩家的 environment 还没切过来，这里不校验所在房间
    if (me && me.is_player && me.hp > 0) lz.do_kill(me);
};

// 锁血被拒死后（尤其是血祭自损触发的 end_fight）把同房间的四侠和玩家重新接回战斗
this.xd_reengage = function (lz) {
    var room = lz && lz.environment;
    if (!room || lz.hp <= 0 || !lz.xd_engaged) return;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (!o || o === lz || o.hp <= 0) continue;
        if (!o.is_player && XD_HEROES.indexOf(o.path) >= 0 && o.do_kill) o.do_kill(lz);
    }
    for (var j = 0; j < room.items.length; j++) {
        var p = room.items[j];
        if (p && p.is_player && p.hp > 0) lz.do_kill(p);
    }
};

// 血魔：持血刀时每杀一人 +4000 攻命；没有血刀则清空
this.xd_xuemo_add = function (lz) {
    if (!lz.query_weapon || !lz.query_weapon()) return;
    lz.xd_xuemo = (lz.xd_xuemo || 0) + 1;
    lz.gj += XD_XUEMO;
    lz.mz += XD_XUEMO;
    var n = lz.xd_xuemo;
    lz.remove_status && lz.remove_status("xd_xuemo");
    lz.add_status && lz.add_status({
        id: "xd_xuemo", name: "血魔", duration: 0, override: 2, no_diff: true,
        desc: "血刀饮血，攻击、命中各增加" + (n * XD_XUEMO) + "。"
    });
    if (lz.environment) lz.environment.send_room("<hir>血刀饮了人血，刀上血光大盛！血刀老祖身上的血魔之力又涨了一层。</hir>");
};
this.xd_xuemo_check = function (lz) {
    if (!lz.xd_xuemo) return;
    if (lz.query_weapon && lz.query_weapon()) return;
    lz.gj -= lz.xd_xuemo * XD_XUEMO;
    lz.mz -= lz.xd_xuemo * XD_XUEMO;
    lz.xd_xuemo = 0;
    lz.remove_status && lz.remove_status("xd_xuemo");
    if (lz.environment) lz.environment.send_room("<hig>血刀脱手，血刀老祖身上的血魔之力随之消散！</hig>");
};

// 副本里任一 NPC 死亡（四侠、血刀弟子、狄云的 on_died 都接到这里；不论是玩家还是老祖杀的）
this.xd_npc_died = function (npc, killer) {
    var room = npc.environment || npc.die_room;
    if (!room) return;
    var lz = this.xd_find_alive(room, [XD_LAOZU])[0];
    if (lz && killer === lz) this.xd_xuemo_add(lz);          // 血魔：血刀砍人才加
    if (lz && lz.xd_engaged && !this.xd_get(room, "xd_failed", 0)) {
        var here = lz.environment;
        var route = here && XD_ROUTE[here.path];
        if (route) {
            var gap = Date.now() - this.xd_get(room, "xd_last_step", 0);
            if (!this.xd_players(here).length) {
                this.xd_tell(room, "<hir>" + npc.name + "倒下了。血刀老祖四下张望，见没人追来，便在" + here.name + "原地守着。</hir>");
            } else if (gap < (this.XD_MIN_GAP || XD_MIN_GAP)) {
                here.send_room("<hir>血刀老祖杀得太快，血气翻涌，竟站在原地狞笑不动！</hir>");
            } else {
                this.xd_set(room, "xd_last_step", Date.now());
                this.xd_set(room, "xd_steps", this.xd_get(room, "xd_steps", 0) + 1);   // 决定要走时就记步，翻车判定以此为准
                var area = this;
                // 推迟到本次出招结算之后再走，避免在 end_attack 里改动战场
                lz.call_out(function () { area.xd_step(lz); }, 1000);
            }
        }
    }
    // 四侠死光而老祖走不到山谷（已走 + 已排程的步数不足）→ 翻车
    var alive = this.xd_find_alive(room, XD_HEROES);
    if (XD_HEROES.indexOf(npc.path) >= 0 && !alive.length && !this.xd_get(room, "xd_failed", 0)
        && this.xd_get(room, "xd_steps", 0) < XD_STEPS) {
        this.xd_set(room, "xd_failed", 1);
        this.xd_tell(room, "<hir>「落花流水」四侠尽数倒在血刀之下，血刀老祖却还没被引到山谷——他周身血光大盛，竟再也伤不了他分毫。</hir>");
    }
};
this.xd_hero_died = this.xd_npc_died;   // 兼容旧调用
this.xd_is_failed = function (room) { return !!this.xd_get(room, "xd_failed", 0); };

// 老祖往西走一步，活着的四侠跟着走并继续缠斗
this.xd_step = function (lz) {
    var from = lz.environment;
    if (!from || lz.hp <= 0) return;
    var route = XD_ROUTE[from.path];
    if (!route) return;
    var heroes = [];
    for (var i = 0; i < from.items.length; i++) {
        var o = from.items[i];
        if (o && !o.is_player && o.hp > 0 && XD_HEROES.indexOf(o.path) >= 0) heroes.push(o);
    }
    lz.moveto(route[1], "<hir>血刀老祖狂笑一声，提着滴血的血刀往" + route[2] + "退去！</hir>", "<hir>血刀老祖浑身浴血，提刀闯了进来。</hir>");
    var to = lz.environment;
    if (to === from) return;
    for (var j = 0; j < heroes.length; j++) {
        heroes[j].moveto(to, heroes[j].name + "紧追血刀老祖而去。", heroes[j].name + "追了过来。");
        if (heroes[j].environment === to && heroes[j].do_kill) heroes[j].do_kill(lz);
    }
    this.xd_tell(to, "<hiy>血刀老祖退到了" + to.name + "，快跟上！</hiy>");
    if (to.path === XD_GOAL) {
        lz.min_hp = 0;   // 解除锁血
        to.send_room("<hig>血刀老祖被逼进了雪山山谷，护体血光已散——现在可以杀他了！</hig>");
    }
};
