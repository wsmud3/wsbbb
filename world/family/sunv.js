	this.inherits(FAMILY);

	this.id = "SUNV";
	this.name = "素女道";
	this.top_name = "素女道首席弟子";
	this.top_family = "道门";
	this.gender = 2;
	this.can_battle = false;

	this.def_npcs = [["sunv/dangdai", "sunv/xiujie"],
	["sunv/chuanren", "sunv/chuancheng"],
	["pub/dadizi#SUNV", "sunv/guangchang"],
	["sunv/shinv", "sunv/guangchang"],
	["sunv/bawang", "sunv/wuming"],
	["pub/mpguanli#SUNV", "sunv/guangchang"]];

	this.boss_path = "sunv/dangdai";

	this.call = function (player, isbad) {
	    var age = player.query_age();
	    if (player.gender == 2) {
	        if (age < 20) return isbad ? "小丫头" : "小姑娘";
	        else if (age < 40) return isbad ? "贱婢" : "姑娘";
	        else return isbad ? "老女人" : "夫人";
	    } else {
	        if (age < 20) return isbad ? "臭小子" : "小兄弟";
	        else if (age < 40) return isbad ? "莽汉" : "壮士";
	        else return isbad ? "老匹夫" : "老先生";
	    }
	}

	this.call_me = function (player, isbad) {
	    var age = player.query_age();
	    if (player.gender == 2) {
	        if (age < 30) return isbad ? "本姑娘" : "小女子";
	        else return isbad ? "老娘" : "妾身";
	    } else {
	        if (age < 50) return isbad ? "大爷我" : "在下";
	        else return isbad ? "老子" : "老夫";
	    }
	}

	this.set_titles("素女道", "玄女传人", "霸王后人", "玄女后补", "素女道弟子", "素女道侍从", "素女道入门弟子");

	this.on_kill = function (npc, me) {
	    if (this.boss) {
	        this.boss.do_command("chat", me.family.name + "欺人太甚，门下弟子" + me.name + "击杀我派弟子" + npc.name + "，素女道众弟子听令，对" + me.family.name + "弟子格杀勿论！");
	    }
	}

	this.on_battle = function (fam) {
	    if (this.boss) {
	        this.boss.do_command("chat", "哼，我素女道岂容" + fam.name + "放肆？");
	    }
	}

	this.boss_guard = ["sunv/xiujie", "sunv/guangchang", "sunv/chuancheng", "sunv/qianting"];

	this.guard_rooms = ['sunv/xiujie', 'sunv/chuancheng', 'sunv/guangchang', 'sunv/wuming', 'sunv/qianting', 'sunv/huayuan', 'sunv/liangong', 'sunv/jingxiu'];

	this.npc_skills = [
	    ["dodge", 500],
	    ["parry", 500],
	    ["force", 500],
	    ["unarmed", 500],
	    ["sword", 500],
	    ["blade", 500],
	    ["sunvxinfa", 500, "force"],
	    ["sunvshenfa", 500, "dodge"],
	    ["sunvjianfa", 500, "sword"],
	    ["sunvxinjing", 500, ["force", "dodge"]],
	    ["zidianjin", 500, ["blade", "force"]],
	    ["jileliuxing", 500, "unarmed"]];

	this.boss_skills = [
	    ["dodge", 800],
	    ["parry", 800],
	    ["force", 800],
	    ["unarmed", 800],
	    ["sword", 800],
	    ["blade", 800],
	    ["staff", 800],
	    ["sunvxinfa", 800, "force"],
	    ["sunvshenfa", 800, "dodge"],
	    ["sunvjianfa", 800, "sword"],
	    ["sunvxinjing2", 800, ["force", "dodge"]],
	    ["zidianjin", 800, ["blade", "force"]],
	    ["jileliuxing2", 800, "unarmed"],
	    ["yingshenbaoxing", 800, "force"],
	    ["zidianjin2", 800, ["unarmed", "force"]],
	    ["shenxiaojiumie", 800, "staff"],
	    ["shenxiaojiumie2", 800, "staff"]];

	this.boss_skills2 = [
	    ["dodge", 5000],
	    ["parry", 5000],
	    ["force", 5000],
	    ["unarmed", 5000],
	    ["sword", 5000],
	    ["blade", 5000],
	    ["staff", 5000],
	    ["sunvxinjing2", 5000, ["force", "dodge"]],
	    ["jileliuxing2", 5000, "unarmed"],
	    ["yingshenbaoxing", 5000, "force"],
	    ["zidianjin2", 5000, ["unarmed", "force"]],
	    ["shenxiaojiumie", 5000, "staff"],
	    ["shenxiaojiumie2", 5000, "staff"]];

	this.eqs = [];
