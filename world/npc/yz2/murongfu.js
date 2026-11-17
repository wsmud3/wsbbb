	this.inherits(NPC);
	this.set({
	    name: "慕容复",
	    desc: "姑苏慕容家的家主，以彼之道还施彼身。此人心高气傲，图谋复国，武功深不可测。",
	    title: "<hiy>姑苏慕容</hiy>",
	    gender: 1,
	    age: 30,
	    per: 20,
	    hp: 539452,
	    max_hp: 539452,
	    mp: 170000,
	    max_mp: 170000,
	    score: 0,
	    gj: 53266,
	    fy: 26375,
	    mz: 47462,
	    ds: 22564,
	    zj: 1476
	});
	this.skill_map(
	    ["dodge", 2010],
	    ["parry", 2220],
	    ["force", 2010],
	    ["unarmed", 2010],
	    ["sword", 2010],
	    ["douzhuanxingyi", 2010, "parry"],
	    ["canhezhi", 2010, "unarmed"]);
	this.set_drop({
	    obj: ["book/bc#douzhuanxingyi"],
	    odds: 9900
	}, {
	    obj: ["book/bc#canhezhi"],
	    odds: 9900
	});
	this.on_enter = function (me) {
	    me.notify("慕容复冷哼一声：擅闯我慕容家书房，找死！");
	    this.do_kill(me);
	};
