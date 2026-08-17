	this.inherits(NPC);
	this.set({
	    name: "帮会管理员",
	    desc: "他是帮会方面的管理员",
	    gender: 1,
	    age: 44,
	    per: this.random(20) + 10,
	    mp: 400,
	    max_mp: 400,
	    hp: 400,
	    max_hp: 400,
	    no_fight: true

	});
	this.on_kill = function (me) {
	    return false;
	}
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.add_action("askhyd", "活跃度查询", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    var str = ["<hic>帮会管理员说道：我们帮派本周的活跃度是：" + pt.query_score() + "，成员完成每日任务获得活跃度，每周一清空</hic>"];
	    var lv = ["", "武士", "武师", "宗师", "武圣", "武帝", "武神"];
	    var lv_sc = [];
	    for (var i = 1; i < 7; i++) {
	        str.push("\n");
	        str.push(lv[i]);
	        str.push("活跃度：");
	        str.push(pt.query_temp('sc' + i, 0));
	        str.push("/");
	        str.push((pt.level + 3) * 200);
	    }
	    me.send(str.join(""));
	    if (me.query_temp('pt_lv', 0) < 5) {
	        me.send_commands("party fam", "开启帮派战",
	            "party boss", "发送英雄帖",
	            "systask xyparty start", "守卫襄阳",
	            "systask lvliu_party start", "绿柳山庄");
	    }
	});
	this.add_action("ptset1", "帮会设置", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    if (me.query_temp('pt_lv', 0) > pt.query_temp("power", 2)) {
	        return me.notify("你没有权限更改设置。");
	    }
	    me.notify("帮会管理员：你要更改哪些设置？");
	    return me.send_commands("party setting power", "更改权限", "party setting join", "加入方式",
	        "party setting open_sc", "开启门派活动",
	        "party setting alloc", "战利品分配", "party setting notice", "发布公告");

	});

	this.add_action("sendntc", "发布公告", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    if (me.query_temp('pt_lv', 0) > 2) return me.notify("只有帮主和副帮主才能发布公告。");
	    if (pt.notice) {
	        me.notify("当前公告：" + pt.notice + "\n输入新内容替换，输入0清空公告：");
	    } else {
	        me.notify("请输入帮派公告内容（输入0取消）：");
	    }
	    me.wait_input = function (me, text) {
	        me.wait_input = null;
	        if (!text || text === "0") {
	            pt.notice = "";
	            me.notify("已清除帮派公告。");
	        } else {
	            pt.notice = text;
	            me.notify("帮派公告已更新：" + text);
	            WORLD.COMMANDS['party'].send_party_data(me);
	        }
	    };
	});

	this.add_action("levelup2", "设施升级", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    if (me.query_temp('pt_lv', 0) > 1) {
	        return me.notify("你没有权限升级设施。");
	    }
	    var exp = pt.query_exp();
	    var lvup_exp = pt.level_exp[pt.level];
	    if (lvup_exp) exp = exp + "/" + lvup_exp;

	    me.notify("帮会管理员：你要升级哪些设施？当前可用积分" + exp);
	    return me.send_commands("party levelup liangong", "升级练功房", "party levelup lianyao", "升级炼药房");

	});
	this.add_action("jrfb", "进入副本区域", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    // 检查当前开启的帮派活动（同一时间只允许一个）
	    var xyStatus = pt.query_temp("xy_pt_status", 0);
	    var lvliuStatus = pt.query_temp("lvliu_pt_status", 0);
	    if (xyStatus === 1 && lvliuStatus !== 1) {
	        WORLD.COMMANDS["goto"].enter(me, "xy_party");
	        return;
	    }
	    if (xyStatus >= 10) {
	        WORLD.COMMANDS["goto"].enter(me, "xy_party");
	        me.notify("守城已结束，可进入副本领取奖励。");
	        return;
	    }
	    if (lvliuStatus === 1) {
	        WORLD.COMMANDS["goto"].enter(me, "lvliu_party");
	        return;
	    }
	    if (lvliuStatus >= 10) {
	        WORLD.COMMANDS["goto"].enter(me, "lvliu_party");
	        me.notify("绿柳山庄已通关，可进入副本兑换奖励。");
	        return;
	    }
	    me.notify("帮会管理员：当前没有进行中的帮派活动。请先通过活跃度查询开启活动。");
	});
