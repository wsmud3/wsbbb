	this.inherits(ROOM);
	this.name = "后厅"
	this.desc = "山庄的后厅，比前厅更为宽敞。地上铺着波斯地毯，四壁挂着名家真迹。厅中肃杀之气弥漫，护法高手严阵以待。";
	this.exits = { "south": "lvliu/huayuan", "north": "lvliu/mishi" };

	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    var pt = me.query_party();
	    if (pt) {
	        var task = null;
	        for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	            if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	        }
	        if (task && task.on_enter_room) task.on_enter_room(me, "houting");
	    }
	    for (var i = 0; i < this.items.length; i++) {
	        var npc = this.items[i];
	        if (npc.lvliu_pt && !npc.is_player && npc.hp > 0 && !npc.is_fighting(me)) npc.do_kill(me);
	    }
	};
