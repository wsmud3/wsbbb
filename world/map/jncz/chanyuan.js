this.inherits(ROOM);
this.name = "禅院";
this.desc = "禅院清幽雅致，青砖铺地，竹影摇曳。五位护法僧常年在此修行，结成伏魔大阵守护禅宗。北面可至戒律院，东面可返回前院。";
this.exits = { "east": "jncz/qianyuan", "north": "jncz/jielvyuan" };
this.set_npc(["jncz/chanseng", 1], ["jncz/chanseng", 1], ["jncz/chanseng", 1], ["jncz/chanseng", 1], ["jncz/chanseng", 1]);
this.on_leave = function (me, dir) {
	if (dir === "east") return true;
	var hasAlive = false;
	for (var i = 0; i < this.items.length; i++) {
		if (this.items[i] && !this.items[i].is_player && this.items[i].hp > 0) {
			hasAlive = true;
			break;
		}
	}
	if (hasAlive) return me.notify_fail("五位护法僧拦住了去路：'施主请留步！'");
	return true;
};
