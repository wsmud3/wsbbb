	this.inherits(ROOM);
	this.name = "地牢"
	this.desc = "山庄地下深处的牢房，阴冷潮湿，寒气刺骨。两道苍老的身影盘坐在牢房中央，正是传说中的玄冥二老——鹤笔翁与鹿杖客。他们缓缓睁开双眼，目光如刀锋般锐利。";
	this.exits = { "south": "lvliu/mishi" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "dilao");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
