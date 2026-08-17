	this.inherits(COMMAND);
	this.command = "look3";
	this.allow_busy = true;
	this.allow_state = true;
	this.regex = /^(?:(\w+)\sof\s)?(\w+)$/;
	//查看不在同一房间的
	this.enter = function (me, index, userid) {
	    if (userid.startsWith("fb_")) {
	        var area;
	        var fbId = userid.substr(3);
	        // 先用数字索引尝试（兼容旧格式）
	        var area_index = parseInt(fbId);
	        if (!isNaN(area_index)) {
	            area = WORLD.AREAS[area_index];
	        }
	        // 如果数字索引没找到，尝试用id查找
	        if (!area) {
	            area = AREA.Get_FB(fbId);
	        }
	        if (!area) return me.notify("没有这个副本。");
	        var drop_items = area.query_drop_items();
	        if (!drop_items || !drop_items.length) {
	            // 如果drop_items未初始化，尝试重建
	            var drops = area.drops || [];
	            area.drop_items = [];
	            for (var d = 0; d < drops.length; d++) {
	                var oitem = OBJ.CREATE(drops[d]);
	                if (oitem) area.drop_items.push(oitem);
	            }
	            drop_items = area.drop_items;
	        }
	        if (!drop_items || !drop_items.length) return me.notify("没有这件装备。");
	        var item = drop_items[index];
	        if (!item) return me.notify("没有这件装备。");
	        if (item.skill) {
	            var skill_base = SKILL.get(item.skill);
	            if (!skill_base) {
	                return me.send("没有这个技能。");
	            }
	            if (!me.skills) me.skills = {};
	            return me.send(skill_base.query_desc(me, 1000));
	        }
	        me.notify(item.get_desc(me));
	        return;
	    }
	    if (userid === me.id) return me.send(me.query_desc(me, "look3"));
	    var user = WORLD.getUser(userid);
	    if (!user) return me.notify("没有这个玩家。");
	    if (index != undefined) {
	        if (index === 'body') {
	            return me.send(user.query_desc(me, "look3"));
	        }
	        index = parseInt(index);
	        if (!(index >= 0 && index < 11)) return me.notify("你要看什么？");
	        if (user.query_setting("hide_equip")) {
	            return me.send("看样子" + user.call3() + "不想让别人看自己的装备。");
	        }

	        let item = user.equipment[index];
	        if (!item) return me.notify(user.name + "没有装备你要看的东西。");
	        me.notify(item.get_desc(user));

	    } else {
	        //  me.notify(user.query_desc(me, "look3"));
	        me.send(user.long_name() + "<div class='item-commands'><span cmd='look3 body of " + user.id + "'>查看</span><span cmd='team add " + user.id + "'>邀请组队</span></div>");
	        if (me.user_level >= 2) {
	            if (user.query_temp("no_chat")) {
	                me.send_commands("setuser " + user.id + " chat3", "解除禁言", "setuser " + user.id + " quit", "踢出游戏");
	            } else {
	                me.send_commands("setuser " + user.id + " chat1", "永久禁言", "setuser " + user.id + " chat2", "禁言1小时", "setuser " + user.id + " quit", "踢出游戏");
	            }
	        }
	    }
	}