this.inherits(NPC);
this.set({
	name: "禅宗护法僧",
	desc: "净念禅宗的护法高僧，身披袈裟，手持金刚伏魔杖，面容严肃。五位护法僧共修无念禅功，结成伏魔大阵，寻常高手难以近身。",
	title: "<hiy>护法僧</hiy>",
	gender: 1,
	age: 60,
	per: 15,
	no_refresh: true,
	hp: 3500000,
	max_hp: 3500000,
	mp: 800000,
	max_mp: 800000,
	score: 62,
	gj: 120000,
	fy: 120000,
	mz: 140000,
	ds: 100000,
	zj: 120000,
	str: 20000,
	con: 20000,
	dex: 15000,
	int: 15000,
});
this.add_prop("diff_sh_per", 15);
this.set_objects(["eq/lv5/wushen/jingangfumozhang", 1, 1]);
this.set_drop({
	obj: "money/silver",
	min: 5,
	max: 20
}, {
	obj: ["book/bc#fumozhang", "book/bc#wunianchangong", "book/bc#zhenyanshouyin"],
	odds: 5000
}, {
	obj: ["eq/lv5/wushen/jingangfumozhang", "eq/lv5/wushen/xiedisheli",
		"book/bc#rulaishenzhang", "book/bc#changshengjue"],
	odds: 2000
});
this.skill_map(
	["dodge", 5000],
	["parry", 5000],
	["force", 5000],
	["staff", 5000],
	["unarmed", 5000],
	["wunianchangong", 5000, "force"],
	["fumozhang", 5000, "staff"],
	["zhenyanshouyin", 5000, "unarmed"]
);
this.on_enter = function (me) {
	me.notify("<hiy>护法僧睁开双眼：'阿弥陀佛！施主若要见祖师，先过我等伏魔大阵！'</hiy>");
	this.do_kill(me);
};
this.on_die = function (killer) {
	if (killer && killer.is_player) {
		var env = killer.environment;
		if (!env) return;
		var allDead = true;
		for (var i = 0; i < env.items.length; i++) {
			var item = env.items[i];
			if (item && !item.is_player && item.path === "jncz/chanseng" && item.hp > 0) {
				allDead = false;
				break;
			}
		}
		if (allDead) {
			killer.set_temp("jncz_clear", 3);
			killer.notify("<hiy>五位护法僧齐齐盘膝而坐，双手合十：'施主武功盖世，我等心服口服。请！'</hiy>");
			var team = killer.query_teamid();
			var rm = killer.environment;
			if (rm && rm.parent && rm.parent.rooms) {
				for (var ri = 0; ri < rm.parent.rooms.length; ri++) {
					var cp = rm.parent.rooms[ri].query_copy(team);
					if (!cp || !cp.items) continue;
					for (var ci = cp.items.length - 1; ci >= 0; ci--) {
						var ch = cp.items[ci];
						if (!ch.is_player && ch.path !== "jncz/chanseng" && ch.hp > 0) {
							ch.hp = 0;
							cp.item_changed(ch, false, ch.name + "见五位护法落败，长叹一声飘然离去。");
						}
					}
				}
			}
		}
	}
};
