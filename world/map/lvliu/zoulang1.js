	this.inherits(ROOM);
	this.name = "长廊"
	this.desc = "一条蜿蜒的长廊，两侧是精致的雕花木栏。长廊深处隐隐传来兵刃破空之声，似有高手在此把守。";
	this.exits = { "south": "lvliu/qianting", "north": "lvliu/zoulang2" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "zoulang1");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
