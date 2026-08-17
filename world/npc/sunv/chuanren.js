	this.inherits(NPC);
	this.set({
	    name: "玄女传人",
	    desc: "她是一位风姿绰约的中年女子，眉宇间透着一股成熟的风韵，是当代玄女的亲传弟子，负责传授素女道进阶武功。",
	    title: "素女道传人",
	    gender: 2,
	    age: 35,
	    per: 55,
	    dex: 30,
	    str: 25,
	    max_mp: 300000,
	    max_hp: 300000,
	    family: FAMILIES.SUNV,
	    family_level: 3,
	    level: 2,
	    prop: {
	        gj: 4000,
	        mz: 4000,
	        ds: 4000
	    }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
	this.skill_map(
	    ["dodge", 500],
	    ["parry", 500],
	    ["force", 500],
	    ["unarmed", 500],
	    ["sword", 500],
	    ["blade", 500],
	    ["literate", 500],
	    ["sunvxinfa", 500, "force"],
	    ["sunvshenfa", 500, "dodge"],
	    ["sunvjianfa", 500, "sword"],
	    ["sunvxinjing", 500, ["force", "dodge"]],
	    ["zidianjin", 500, ["blade", "force"]],
	    ["jileliuxing", 500, "unarmed"]);

	this.on_master = function (me) {
	    if (me.gender != 2) return me.notify_fail("玄女传人摇头道：你非女子之身，不宜修习我派武功。");
	    if (me.query_skill("sunvxinfa", 0) < 100) return me.notify_fail("玄女传人说道：你的素女心法还未满百级，根基未稳。");
	    if (me.query_skill("sunvshenfa", 0) < 100) return me.notify_fail("玄女传人说道：你的素女身法还未满百级，根基未稳。");
	    if (me.query_skill("sunvjianfa", 0) < 100) return me.notify_fail("玄女传人说道：你的素女剑法还未满百级，根基未稳。");
	    return true;
	}
