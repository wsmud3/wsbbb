	this.inherits(ROOM);
	this.name = "长廊"
	this.desc = "长廊继续延伸，墙上挂着几幅名家字画，却被剑气划得支离破碎。前方似有更强的气息在等待。";
	this.exits = { "south": "lvliu/zoulang1", "north": "lvliu/huayuan" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "zoulang2");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
