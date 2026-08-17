	this.inherits(NPC);
	this.set({
	    name: "王夫人",
	    desc: "曼陀罗山庄庄主，王语嫣的母亲，手段狠辣。",
	    gender: 0,
	    age: 40,
	    per: 16,
	    hp: 460800,
	    max_hp: 460800,
	    mp: 90000,
	    max_mp: 90000,
	    score: 60,
	    gj: 38640,
	    fy: 27067,
	    mz: 40080,
	    ds: 29423,
	    zj: 1360
	});
	this.skill_map(
	    ["dodge", 1983],
	    ["parry", 2158],
	    ["force", 1983],
	    ["unarmed", 1983]);
	this.on_enter = function (me) {
	    me.notify("王夫人怒道：谁让你进来的？来人，拿下！");
	    this.do_kill(me);
	};
