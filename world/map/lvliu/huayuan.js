	this.inherits(ROOM);
	this.name = "花园"
	this.desc = "山庄内的花园，绿柳成荫，繁花似锦。一座假山矗立在池塘中央，水声潺潺。看似幽静，实则暗藏杀机。";
	this.exits = { "south": "lvliu/zoulang2", "north": "lvliu/houting" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "huayuan");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
