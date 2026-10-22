	this.inherits(NPC);
	this.set({
	    name: "慕容博",
	    desc: "慕容复之父，诈死多年隐居在还施水阁之中。此人武功已臻化境，参合指威力无匹。",
	    title: "<hiy>前燕后裔</hiy>",
	    gender: 1,
	    age: 55,
	    per: 15,
	    hp: 1036800,
	    max_hp: 1036800,
	    mp: 231000,
	    max_mp: 231000,
	    score: 230,
	    gj: 63840,
	    fy: 41184,
	    mz: 89280,
	    ds: 47421,
	    zj: 2040
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
	    odds: 9900
	}, {
	    obj: ["book/bc#canhezhi"],
	    odds: 9900
	}, {
	    obj: ["eq/lv3/yirongmianju"],
	    odds: 3960
	});
	this.on_enter = function (me) {
	    me.notify("慕容博从阴影中走出，沉声道：老夫隐居多年，今日竟有人闯入此地……");
	    this.do_kill(me);
	};

// [mech] 慕容博伏诛（燕子坞完成度）
this.on_die = function (killer) {
    if (killer && killer.is_player) {
        killer.set_temp("yz2_murongbo_dead", 1);
        killer.notify("<hio>慕容博缓缓倒下，燕国复辟的旧梦也随之散尽。</hio>");
        killer.notify("<hig>燕子坞旧事已了，可回动作栏点「完成副本」结算。</hig>");
    }
};
