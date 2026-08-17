	this.inherits(NPC);
	this.set({
	    name: "包不同",
	    desc: "金凤庄庄主，慕容家的家臣，平生最爱与人抬杠，口头禅'非也非也'。",
	    gender: 1,
	    age: 45,
	    per: 8,
	    hp: 600000,
	    max_hp: 600000,
	    mp: 112000,
	    max_mp: 112000,
	    score: 55,
	    gj: 47280,
	    fy: 27621,
	    mz: 45360,
	    ds: 29423,
	    zj: 1190
	});
	this.skill_map(
	    ["dodge", 2109],
	    ["parry", 2032],
	    ["force", 2109],
	    ["unarmed", 2109]);
	this.on_enter = function (me) {
	    me.notify("包不同喝道：非也非也！来者何人，报上名来！");
	    this.do_kill(me);
	};
