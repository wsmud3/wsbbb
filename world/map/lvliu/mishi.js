	this.inherits(ROOM);
	this.name = "密室"
	this.desc = "一间隐秘的密室，四周石壁上刻满了奇门遁甲的图录。空气冰冷刺骨，仿佛来自九幽之下的寒气在此汇聚。长老级的高手在此修炼玄冥神掌。";
	this.exits = { "south": "lvliu/houting", "north": "lvliu/dilao" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "mishi");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
