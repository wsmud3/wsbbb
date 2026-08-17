	this.inherits(ROOM);
	this.name = "练功房";
	this.desc = "这是一间布置的很别致的练功房，房间的北面各种武器玲琅满目，刀枪剑棍，十八般兵器在这里都能找到，四周石壁看上去很坚固，南半部散放着几个蒲团，供诸你打坐吐纳，调气养息，修练内功之用。";
	this.exits = { "east": "home/yuanzi" };
	this.on_leave = function (me) {
	    if (me.master) {
	        me.actions = null;
	        me.master_json = null;
	    }
	    me.remove_status("room");
	    // 离开练功房时清除三花聚顶残留状态
	    if (me.query_temp("shjd_cultivating")) {
	        me.remove_temp("shjd_cultivating");
	        me.remove_temp("shjd_flower_mp_used");
	        me.remove_temp("no_pfm_key");
	        me.remove_prop("no_pfm");
	    }
	};
	this.on_enter = function (me) {
	    if (me.master) {
	        me.actions = [
	            { cmd: "dc " + me.id + " dazuo", name: "让" + me.name + "打坐" },
	            { cmd: "makelove " + me.id, name: "和" + me.name + "双修" }
	        ];
	        me.master_json = null;
	    }
	    me.add_status({
	        id: "room",
	        duration: 0,
	        desc: "你在练功房，心无旁骛，修炼效率得到提高",
	        name: "静心",
	        prop: {
	            study_per: 500,
	            lianxi_per: 500,
	            dazuo_per: 500,
	            dazuo: 500
	        }
	    });
	};

	// 打通任督二脉 / 三花聚顶
	this.add_action("xiulian", "修炼", function (me, par) {
	    WORLD.COMMANDS["xiulian"].enter(me);
	});

	// 分配未分配属性点
	this.add_action("fenpei", "分配属性", function (me, par) {
	    WORLD.COMMANDS["fenpei"].enter(me);
	});
