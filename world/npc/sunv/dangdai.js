	this.inherits(NPC);
	this.set({
	    name: "当代玄女",
	    desc: "她是一位容貌绝世的女子，看起来年约三十，实际年龄无人可知。周身仙气缭绕，一举一动皆含天地至理。她是素女道的至高存在，修为深不可测。",
	    title: "素女道当代玄女",
	    gender: 2,
	    age: 120,
	    per: 80,
	    dex: 35,
	    str: 30,
	    max_mp: 800000,
	    max_hp: 800000,
	    family: FAMILIES.SUNV,
	    family_level: 1,
	    level: 3,
	    prop: {
	        gj: 12000,
	        mz: 12000,
	        ds: 12000
	    }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
	this.skill_map(
	    ["dodge", 800],
	    ["parry", 800],
	    ["force", 800],
	    ["unarmed", 800],
	    ["sword", 800],
	    ["blade", 800],
	    ["literate", 800],
	    ["sunvxinfa", 800, "force"],
	    ["sunvshenfa", 800, "dodge"],
	    ["sunvjianfa", 800, "sword"],
	    ["sunvxinjing", 800, ["force", "dodge"]],
	    ["zidianjin", 800, ["blade", "force"]],
	    ["jileliuxing", 800, "unarmed"],
	    ["yingshenbaoxing", 800, "force"]);

	this.on_master = function (me) {
	    if (me.gender != 2) return me.notify_fail("当代玄女淡然道：素女道自古以来便是女子宗门，请回吧。");
	    if (me.query_skill("sunvxinjing", 0) < 500) return me.notify_fail("当代玄女说道：你素女心经尚未大成，回去继续修炼吧。");
	    if (me.query_skill("jileliuxing", 0) < 500) return me.notify_fail("当代玄女说道：你极乐六性尚未大成，回去继续修炼吧。");
	    return true;
	}
