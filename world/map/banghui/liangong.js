	this.inherits(ROOM);
	this.name = "练功房"
	this.desc = "这是你的帮派的练功房，房间的北面各种武器玲琅满目，刀枪剑棍，十八般兵器在这里都能找到，四周石墙的青砖已经被刻满剑痕刀伤，看来经常有人在这里练功。";
	this.exits = { "south": "banghui/yuanzi" };
	this.no_fight = true;

	this.on_leave = function (me) {
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
	    if (me.is_player) {
	        let pt = me.query_party();
	        if (pt) {
	            var lg_level = pt.query_temp('liangong', 0) * 10 + 10;
	            me.add_status({
	                id: "room",
	                duration: 0,
	                desc: "你在练功房，心无旁骛，修炼效率得到提高",
	                name: "静心",
	                prop: {
	                    study_per: lg_level,
	                    lianxi_per: lg_level,
	                    dazuo_per: lg_level,
	                    dazuo: lg_level
	                }
	            });
	        }
	    }
	};

	// 打通任督二脉 / 三花聚顶
	this.add_action("xiulian", "修炼", function (me, par) {
	    WORLD.COMMANDS["xiulian"].enter(me);
	});

	// 分配未分配属性点
	this.add_action("fenpei", "分配属性", function (me, par) {
	    WORLD.COMMANDS["fenpei"].enter(me);
	});
