	this.inherits(NPC);
	this.set({
	    name: "慕容博",
	    desc: "慕容复之父，诈死多年隐居在还施水阁之中。此人武功已臻化境，参合指威力无匹。",
	    title: "前燕后裔",
	    gender: 1,
	    age: 55,
	    per: 15,
	    hp: 1036800,
	    max_hp: 1036800,
	    mp: 231000,
	    max_mp: 231000,
	    score: 230,
	    gj: 62500,
	    fy: 32500,
	    mz: 87406,
	    ds: 35000,
	    zj: 1610
	});
	this.skill_map(
	    ["dodge", 2880],
	    ["parry", 2616],
	    ["force", 2880],
	    ["unarmed", 2880],
	    ["douzhuanxingyi", 2880, "parry"],
	    ["canhezhi", 2880, "unarmed"]);
	this.set_drop({
	    obj: ["book/bc#douzhuanxingyi"],
	    odds: 5000
	}, {
	    obj: ["book/bc#canhezhi"],
	    odds: 5000
	}, {
	    obj: ["eq/lv4/yirongmianju"],
	    odds: 150
	});
	this.on_enter = function (me) {
	    if (!me || !me.is_player) return;
	    me.notify("慕容博从阴影中走出，沉声道：老夫隐居多年，今日竟有人闯入此地……");
	    this.yz2_mark(me);
	    this.do_kill(me);
	};
	this.on_kill = function (me) {
	    this.yz2_mark(me);
	    return true;
	};

// ────────────────────────────────────────────────────────────
// 攻略：使用唐诗剑法（躺尸）面对慕容博时，不要打坐、也不要疗伤，否则慕容复会杀你。
//   与慕容博交过手的玩家（yz2_foes）躺尸脱战后，慕容博以为人已死，不再出手；
//   若此时在后厅打坐/疗伤（state 为 dazuo / liaoshang），便被识破：
//     慕容复还活着 → 慕容复闻声赶来叫杀；慕容复已死 → 慕容博亲自出手。
//     识破的一击「以彼之道还施彼身」打掉 50% 最大气血，随后叫杀。
//   这里挂在慕容博的 on_heart_beat 上：NPC 只在未战斗时才走这个回调，正好是躺尸之后。
// ────────────────────────────────────────────────────────────
this.yz2_mark = function (me) {
    if (!me || !me.is_player) return;
    if (!this.yz2_foes) this.yz2_foes = {};
    this.yz2_foes[me.id] = 1;
};
this.yz2_find_fu = function (room) {
    var area = room && room.parent;
    if (!area || !area.rooms) return null;
    for (var i = 0; i < area.rooms.length; i++) {
        var cp = area.rooms[i].query_copy(room.owner);
        if (!cp || !cp.items) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (o && !o.is_player && o.path === "yz2/murongfu" && o.hp > 0) return o;
        }
    }
    return null;
};
this.yz2_expose = function (me) {
    var room = this.environment;
    if (!room || !me || me.environment !== room) return;
    var what = me.state && me.state.id === "liaoshang" ? "疗伤" : "打坐";
    if (me.set_state) me.set_state(null);
    var killer = this.yz2_find_fu(room);
    if (killer && killer.environment !== room) killer.moveto(room, killer.name + "冷笑一声，向后厅掠去。", killer.name + "闻声从书房赶来！");
    if (!killer || killer.environment !== room) killer = this;
    room.send_room("<hir>" + killer.name + "喝道：「死人还会" + what + "？装神弄鬼！」</hir>");
    var dmg = Math.floor(me.max_hp * 0.5);
    if (dmg > me.hp - 1) dmg = me.hp - 1;
    if (dmg > 0) me.add_hp(-dmg);
    me.notify("<hir>" + killer.name + "一指点在你胸口，正是「以彼之道，还施彼身」！你受了 " + dmg + " 点重创。</hir>");
    killer.do_kill(me);
    if (killer !== this) this.do_kill(me);
};
this.on_heart_beat = function () {
    var room = this.environment;
    if (!room || !this.yz2_foes || this.hp <= 0) return;
    var list = room.items.slice();
    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.is_player || !this.yz2_foes[p.id] || p.hp <= 0) continue;
        if (p.is_fighting && p.is_fighting()) continue;
        var st = p.state && p.state.id;
        if (st === "dazuo" || st === "liaoshang") this.yz2_expose(p);
    }
};

// 慕容博伏诛 = 100%（score 230 = 区域总分）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.send_room) {
        room.send_room("<hio>慕容博缓缓倒下，燕国复辟的旧梦也随之散尽。</hio>");
        room.send_room("<hig>燕子坞旧事已了。</hig>");
    }
};
