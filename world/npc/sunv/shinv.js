	this.inherits(NPC);
	this.set({
	    name: "侍女",
	    desc: "她是一位身着素白衣衫的年轻女子，容貌清丽，举止优雅，是素女道的入门接引人。",
	    title: "素女道接引使",
	    gender: 2,
	    age: 22,
	    per: 45,
	    dex: 25,
	    str: 20,
	    max_mp: 50000,
	    max_hp: 50000,
	    family: FAMILIES.SUNV,
	    family_level: 5,
	    level: 1,
	    prop: {
	        gj: 500,
	        mz: 500,
	        ds: 500
	    }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
	this.skill_map(
	    ["dodge", 100],
	    ["parry", 100],
	    ["force", 100],
	    ["unarmed", 100],
	    ["sword", 100],
	    ["blade", 100],
	    ["literate", 100],
	    ["sunvxinfa", 100, "force"],
	    ["sunvshenfa", 100, "dodge"],
	    ["sunvjianfa", 100, "sword"]);

	this.on_master = function (me) {
	    if (me.gender != 2) return me.notify_fail("侍女微微一笑，说道：素女道自古只收女弟子，还请见谅。");
	    return true;
	}
