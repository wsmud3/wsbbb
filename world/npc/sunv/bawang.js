	this.inherits(NPC);
	this.set({
	    name: "霸王残魂",
	    desc: "这是一缕不灭的霸王残魂，身披残破战甲，周身环绕着紫色电光。虽只是一缕残魂，但那睥睨天下的霸气依旧令人心悸。他生前纵横天下，杖扫八荒，死后执念不散，藏于此间。",
	    title: "霸王残魂",
	    gender: 1,
	    age: 2500,
	    per: 30,
	    dex: 40,
	    str: 50,
	    max_mp: 900000,
	    max_hp: 1000000,
	    family: FAMILIES.SUNV,
	    family_level: 2,
	    level: 3,
	    prop: {
	        gj: 15000,
	        mz: 8000,
	        ds: 8000
	    }
	});
	this.set_objects(["eq/lv0/tiegun", 1, 1], ["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 800],
	    ["parry", 800],
	    ["force", 800],
	    ["unarmed", 800],
	    ["blade", 800],
	    ["staff", 800],
	    ["literate", 500],
	    ["zidianjin", 800, ["blade", "force"]],
	    ["shenxiaojiumie", 800, "staff"]);

	this.on_master = function (me) {
	    // 霸王残魂不需要性别限制，是隐藏师父
	    if (me.query_skill("zidianjin", 0) < 500 && me.query_skill("zidianjin2", 0) < 500) return me.notify_fail("霸王残魂沉声道：你的紫电劲还不够火候，感受不到我的雷劲。");
	    if (me.query_skill("sunvxinjing", 0) > 0 || me.query_skill("jileliuxing", 0) > 0) return me.notify_fail("霸王残魂冷哼一声：你已学了素女道那些软绵绵的功夫，不配继承我的武学！");
	    return true;
	}
