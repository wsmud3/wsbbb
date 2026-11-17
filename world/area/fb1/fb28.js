this.inherits(AREA);
this.set({
    id: "tl",
    name: "天龙寺",
    desc: "大理天龙寺，段氏皇家寺院，佛门武学圣地。寺中高僧云集，六脉神剑威震武林，枯荣禅功深不可测。",
    score: 270,
    is_show: true,
    first: "tl/damen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    is_diffi: true,
    exp: 40000,
    pot: 36000,
    room_path: "tl/",
    ss_title: "天龙尊者"
});
		this.map = [
	    { n: "大门", id: "tl/damen", p: [0, 0], exits: ["s"] },
	    { n: "塔林", id: "tl/talin", p: [0, 1], exits: ["s","n"] },
	    { n: "舍利塔", id: "tl/ta", p: [0, 2], exits: ["s","n","sw","se"] },
	    { n: "崇圣宝殿", id: "tl/baodian", p: [0, 3], exits: ["n"] },
	    { n: "无乐阁", id: "tl/wule", p: [1, 3], exits: ["s","nw"] },
	    { n: "无我阁", id: "tl/wuwo", p: [-1, 3], exits: ["s","ne"] },
	    { n: "无常阁", id: "tl/wuchang", p: [-1, 4], exits: ["e","n"] },
	    { n: "无净阁", id: "tl/wujing", p: [1, 4], exits: ["w","n"] },
	    { n: "般若台", id: "tl/banruo", p: [0, 4], exits: ["e","w","s"] },
	    { n: "牟尼堂", id: "tl/munitang", p: [0, 5], exits: ["n"] },
		];
	this.drops = [
	    "book/bc#tiannanbu",
	    "book/bc#duanjiajian",
	    "book/bc#kumushengong",
	    "book/bc#liumaishenjian",
	    "eq/lv5/wushen/longgu_jewels"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#tiannanbu", odds: 2100 },
	    { obj: "book/bc#duanjiajian", odds: 2400 },
	    { obj: "book/bc#kumushengong", odds: 2900 },
	    { obj: "book/bc#liumaishenjian", odds: 2900 },
	    { obj: "eq/lv5/wushen/longgu_jewels", odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 天龙寺机制（全寺共用一份，四僧/枯荣/段誉/大门都调用这里）
//   舍利塔分两路：西南 无我阁(本观)→无常阁(本参)；东南 无乐阁(本尘)→无净阁(本相)，汇于般若台→牟尼堂。
//   寺中共五僧：两路四阁各一人 + 崇圣宝殿住持本因（不在路上，平时不出手）。
//   普通：阁中和尚拦路，须杀掉其中一路的两人；背段誉前最多杀 2 人。背起后其余
//         三僧 + 枯荣一起追杀（1v4）。打法：先与枯荣比试压低血量，退出比试前打一记
//         大伤害，再背段誉速杀枯荣，剩下 1v3。
//   困难：戴阿朱面具伪装成寺中之人方可混过（和尚不拦）；背段誉前一个都不能杀，
//         背起后五僧 + 枯荣一起追杀（1v6）。背起时面具脱落。
//   追兵全灭后背着段誉回到大门 = 100%。背负期间玩家死亡，段誉也死，本轮作废。
//   进度全部存在副本存储（room.set_temp(me, …)），随副本销毁。
// ────────────────────────────────────────────────────────────
var TL_MONKS = ["tl/benguan", "tl/bencan", "tl/benchen", "tl/benxiang"];
var TL_KILL_COUNTED = TL_MONKS.concat(["tl/benyin"]);   // 背段誉前击杀即计数
var TL_PURSUERS = TL_KILL_COUNTED.concat(["tl/kurongdashi"]);
// 和尚所在阁 → 往回走（不拦）的方向
var TL_BACK = { "tl/wuwo": "northeast", "tl/wuchang": "north", "tl/wule": "northwest", "tl/wujing": "north" };

this.tl_room = function (me) {
    var r = me && me.environment;
    return r && r.parent === this ? r : null;
};
this.tl_get = function (me, k, d) { var r = this.tl_room(me); return r ? r.query_temp(me, k, d) : d; };
this.tl_set = function (me, k, v) { var r = this.tl_room(me); if (r) r.set_temp(me, k, v); };
this.tl_hard = function (me) { return this.tl_get(me, "diff", 0) === 1; };
this.tl_kill_limit = function (me) { return this.tl_hard(me) ? 0 : 2; };
this.tl_is_carrying = function (me) { return !!(me && me.is_player && this.tl_get(me, "tl_carry", 0)); };
// 伪装成天龙寺的人（阿朱面具，模仿对象须是 tl/ 下的 NPC）
this.tl_disguised = function (me) {
    return !!me.query_temp("disguise_target") && String(me.query_temp("disguise_path") || "").indexOf("tl/") === 0;
};
this.tl_undisguise = function (me) {
    var real = me.query_temp("disguise_name");
    if (!real) return;
    me.name = real;
    me.remove_temp("disguise_target");
    me.remove_temp("disguise_name");
    me.remove_temp("disguise_title");
    me.remove_temp("disguise_path");
    me.notify("<hiy>你一运劲，脸上的易容面具便脱落了，露出了本来面目。</hiy>");
};
// 本副本内某路径 NPC 的所有活着的实例
this.tl_find_alive = function (me, paths) {
    var out = [], tid = me.query_teamid();
    for (var i = 0; i < this.rooms.length; i++) {
        var cp = this.rooms[i].query_copy(tid);
        if (!cp) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (o && !o.is_player && o.hp > 0 && paths.indexOf(o.path) >= 0) out.push(o);
        }
    }
    return out;
};

// 和尚拦路：挂在和尚 NPC 的 on_leave 上（房间离开校验会询问同房间每个 NPC）
this.tl_block = function (monk, me, dir) {
    if (!me || !me.is_player || !dir || monk.hp <= 0) return true;
    if (this.tl_is_carrying(me)) return true;
    var here = monk.environment;
    if (here && TL_BACK[here.path] === dir) return true;
    if (this.tl_hard(me) && this.tl_disguised(me)) return true;
    if (this.tl_hard(me))
        me.notify("<hir>" + monk.name + "横身拦住：「寺中禁地，外人止步。」</hir>");
    else
        me.notify("<hir>" + monk.name + "横身拦住：「施主请回。」不打倒他是过不去的。</hir>");
    return false;
};

// 和尚 / 枯荣死亡
this.tl_on_died = function (npc, killer) {
    var room = npc.environment;
    var me = killer && killer.is_player ? killer : null;
    if (!me && room) for (var i = 0; i < room.items.length; i++) if (room.items[i] && room.items[i].is_player) { me = room.items[i]; break; }
    if (!me) return;
    if (this.tl_is_carrying(me)) {
        var left = this.tl_find_alive(me, TL_PURSUERS).length;
        if (left === 0) me.notify("<hig>追兵尽数倒下！段誉在你背上长长舒了一口气。</hig>");
        return;
    }
    if (TL_KILL_COUNTED.indexOf(npc.path) < 0) return;
    var n = this.tl_get(me, "tl_kills", 0) + 1;
    this.tl_set(me, "tl_kills", n);
    var lim = this.tl_kill_limit(me);
    if (n > lim) {
        me.notify("<hir>寺中钟声骤响，远远传来一片诵经之声——这一路上你伤的人，已经太多了。</hir>");
    }
};

// 背负段誉（命令 carry_duanyu 与牟尼堂「抓住段誉」共用）
this.tl_carry = function (me) {
    var room = this.tl_room(me);
    if (!room) return me.notify("这里没有段誉。");
    if (this.tl_get(me, "tl_failed", 0)) return me.notify("段誉已经死了。");
    if (this.tl_is_carrying(me)) return me.notify("你已经背着段誉了。");
    var dy = room.find_obj_bypath("tl/duanyu");
    if (!dy) return me.notify("段誉不在这里。");
    var kills = this.tl_get(me, "tl_kills", 0), lim = this.tl_kill_limit(me);
    if (kills > lim) return me.notify('段誉摇了摇头：「你杀孽太重，我不能跟你走。」');
    if (this.tl_disguised(me)) this.tl_undisguise(me);
    dy.destroy("段誉跳上了" + me.name + "的背。");
    this.tl_set(me, "tl_carry", 1);
    // 背负减益（与缥缈峰背负童姥一致）：攻击、防御、躲闪、命中、招架各 -50%
    me.add_status({
        id: "carry_duanyu", name: "背负段誉", duration: 0, no_clear: true,
        desc: "背着段誉，全身内力都用来保护他：攻击、防御、躲闪、命中、招架各减少50%。",
        prop: { total_per: -50 }   // 总减（最终值整体乘 0.5，见 USER.recount），不是 buff 那种加算百分比
    });
    var foes = this.tl_find_alive(me, TL_PURSUERS);
    me.notify("<hig>段誉爬上了你的背。</hig><hir>寺中还剩的 " + foes.length + " 位高僧一齐朝你扑了过来！</hir>");
    for (var i = 0; i < foes.length; i++) {
        var f = foes[i];
        if (f.environment !== room) f.moveto(room, "", f.name + "冲了过来！");
        if (f.do_kill) f.do_kill(me);
    }
    return true;
};

// 大门：背着段誉回来且追兵全灭 → 100%
this.tl_deliver = function (me) {
    if (!this.tl_is_carrying(me)) return;
    var left = this.tl_find_alive(me, TL_PURSUERS).length;
    if (left > 0) return me.notify("<hiy>段誉在你背上急道：「后面还有人追着呢，他们会追到大理的！」</hiy>");
    this.tl_set(me, "tl_carry", 0);
    this.tl_set(me, "tl_done", 1);
    me.remove_status("carry_duanyu");
    me.add_fbscore(this.score || 270);
    me.notify("<hig>你背着段誉走出天龙寺大门。段誉跳下地来，长揖到地：「多谢兄台救命之恩！」</hig>");
};

// 背负期间死亡：段誉也死
this.on_user_die = function (me) {
    if (!this.tl_is_carrying(me)) return;
    this.tl_set(me, "tl_carry", 0);
    this.tl_set(me, "tl_failed", 1);
    me.notify("<hir>你倒下的同时，背上的段誉也被乱剑击中，再无声息……</hir>");
};

// 离开副本时清理背负状态
this.on_leaved = function (me) {
    me.remove_status && me.remove_status("carry_duanyu");
    me.remove_temp("tl_carry_duanyu");
    me.remove_temp("tl_killed_any");
};
