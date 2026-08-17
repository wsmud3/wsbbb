this.inherits(NPC);
this.set({
	name: "护宝僧",
	desc: "净念禅宗的护宝高僧，身披金色袈裟，手持金刚伏魔杖，面容威严。他们专门守护和氏璧，任何觊觎至宝之人都将面临他们的怒火。",
	title: "<hir>护宝僧</hir>",
	gender: 1,
	age: 50,
	per: 15,
	no_refresh: true,
	hp: 5000000,
	max_hp: 5000000,
	mp: 1000000,
	max_mp: 1000000,
	score: 0,
	gj: 150000,
	fy: 140000,
	mz: 170000,
	ds: 120000,
	zj: 140000,
	str: 25000,
	con: 25000,
	dex: 18000,
	int: 18000,
});
this.add_prop("diff_sh_per", 20);
this.set_objects(["eq/lv5/wushen/jingangfumozhang", 1, 1]);
this.skill_map(
	["dodge", 5200],
	["parry", 5200],
	["force", 5200],
	["staff", 5200],
	["unarmed", 5200],
	["wunianchangong", 5200, "force"],
	["fumozhang", 5200, "staff"],
	["zhenyanshouyin", 5200, "unarmed"]
);
this.on_enter = function (me) {
	me.notify("<hir>护宝僧大喝：'站住！交出和氏璧，饶你不死！'</hir>");
	this.do_kill(me);
};
this.on_die = function (killer) {
	if (killer && killer.is_player) {
		var env = killer.environment;
		if (!env) return;
		// Check if all 3 ambush monks are dead
		var allDead = true;
		for (var i = 0; i < env.items.length; i++) {
			var it = env.items[i];
			if (it && !it.is_player && it.path === "jncz/hufaseng_ambush" && it.hp > 0) {
				allDead = false;
				break;
			}
		}
		if (allDead) {
			killer.set_temp("jncz_clear", 1);
			killer.remove_status("heshibi_carry", true);
			killer.add_title("盗帅", "title_ss");
			killer.add_fbscore(310);
			// 中和所有存活NPC分数，确保100%（三条线独立，不触发die）
			var area = killer.environment.parent;
			if (area && area.rooms) {
			    var tid = killer.query_teamid();
			    for (var ri = 0; ri < area.rooms.length; ri++) {
			        var cp = area.rooms[ri].query_copy(tid);
			        if (!cp) continue;
			        for (var ci = 0; ci < cp.items.length; ci++) {
			            var it2 = cp.items[ci];
			            if (it2 && !it2.is_player && it2.hp > 0 && it2.score > 0) {
			                it2.score = 0;
			            }
			        }
			    }
			}
			killer.notify("<hiy>三名护宝僧尽数倒下，山门大开！你带着和氏璧悄然离去……</hiy>");
			killer.notify("<hio>江湖从此多了一个传说——「盗帅」！净念禅宗试炼完成！</hio>");
		}
	}
};
