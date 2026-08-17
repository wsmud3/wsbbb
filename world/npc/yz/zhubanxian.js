	this.inherits(NPC);
	this.name = "金古易";

	this.desc = "当代武林泰斗金古易，有时候猛的一看，你还以为是三个人。";
	this.title = "<hic>武林泰斗</hic>";
	this.max_hp = 8000000;
	this.hp = 8000000;
	this.max_mp = 1000000;
	this.str = 22;
	this.con = 22;
	this.age = 71;
	this.dex = 22;
	this.int = 22;
	this.per = 55;
	this.gender = 1;
	this.level = 4;
	this.pfm_rate = 1;
	this.no_refresh = true;
	this.prop = {
	    gjsd: 1500,
	    add_sh_per: 90,
	    diff_sh_per: 135,
	    diff_downside_per: 50,
	    mz: 20000,
	    ds: 20000
	};
	this.skill_map(
	    ["dodge", 3000],
	    ["parry", 3000],
	    ["force", 3000],
	    ["unarmed", 3000],
	    ["sword", 3000],
	    ["literate", 3000],
	    ["yijinjing", 3000, "force"],
	    ["yitianjianfa", 3000, "sword"],
	    ["lingboweibu", 3000, "dodge"],
	    ["taijiquan", 3000, "parry"],
	    ["jiuyinbaiguzhao", 3000, "unarmed"]);

	this.on_kill = function (me) {
	    return me.notify_fail('金古易拍了拍你的脑袋。');
	}
	this.add_action("levelup", "提升境界", testLevel);
	function testLevel(me) {

	    me.send_room("$N向$n恭敬的问道：敢问老先生，" + me.callme() + "武功境界如何？\n", this);

	    if (me.level == 4) {
	        return checkWS(me);
	    } else if (me.level == 5) {
	        return me.notify("金古易对你恭敬一揖：老朽金古易，拜见" + me.name + "帝君！");
	    }
	    this.tellResult(me);
	}


	this.tellResult = function (me) {
	    if (me.query_status("force")) {
	        return me.notify("金古易摇了摇头对你说道：你目前有内功附加的状态，老头子我实在看不出来" + me.call() + "的境界几何。");
	    }
	    if (me.level == 0) {
	        var check = {};
	        for (var sk in me.skills) {
	            var item = me.skills[sk];
	            if (item.level >= 100) {
	                check[sk] = true;
	            }
	            if (item.enable_skill) {
	                check["hassp"] = true;
	            }
	        }
	        if (check["force"] && check["unarmed"] && check["parry"] && check["dodge"] && check["hassp"]
	            && me.max_mp >= 1000) {

	            me.notify("金古易对你说道：恭喜" + me.call() + "，你已经踏入武士境界，习武之路你才刚起步，努力修炼吧！");
	            me.level_up();
	            this.send_master(me);
	        } else {

	            me.notify("金古易对你说道：这位" + me.call() + "，等你把基本内功，基本拳脚，基本招架，基本轻功练到100级，至少装备一种特殊技能，内力到1000就可以提升到武士境界了。");

	        }
	    } else if (me.level == 1) {
	        var check = {};
	        for (var sk in me.skills) {
	            var item = me.skills[sk];
	            if (item.enable_skill && item.level >= 300 && me.skills[item.enable_skill].level >= 300) {
	                check[sk] = true;
	            }
	        }
	        var skillsOk1 = check["force"] && check["unarmed"] && (check["sword"] || check["blade"] || check["club"] || check["whip"] || check["staff"]) && check["parry"] && check["dodge"];
	        var mpOk1 = me.max_mp >= 10000;

	        if (skillsOk1 && mpOk1) {
	            me.notify("金古易对你说道：恭喜" + me.call() + "，你已经踏入武师境界，习武之路荆棘满地，唯有坚持努力方能使你踏上成功之路！");
	            me.level_up();
	            this.send_master(me);
	        } else {
	            var lacks1 = [];
	            if (!skillsOk1) lacks1.push("技能达到300级");
	            if (!mpOk1) lacks1.push("内力达到10000");
	            me.notify("金古易对你说道：这位" + me.call() + "，你还需" + lacks1.join("、") + "方可提升到武师境界。");
	        }
	    } else if (me.level == 2) {
	        var check = {};
	        for (var sk in me.skills) {
	            var item = me.skills[sk];
	            if (item.enable_skill && item.level >= 800 && me.skills[item.enable_skill].level >= 800) {
	                check[sk] = true;
	            }
	        }
	        var skillsOk = check["force"] && check["unarmed"] && (check["sword"] || check["blade"] || check["club"] || check["whip"] || check["staff"]) && check["parry"] && check["dodge"];
	        var mpOk = me.max_mp >= 100000;
	        var rdemOk = me.query_temp("rdem");

	        if (skillsOk && mpOk) {
	            if (rdemOk) {
	                me.notify("金古易对你说道：恭喜" + me.call() + "成为一代宗师，但要切记，习武之路荆棘满地，唯有戒骄戒躁继续努力方能更进一步！");
	                this.do_command("chat", "哈哈，不错，不错，恭喜" + me.name + "成为一代宗师！");

	                USERTASK.GET('yamen').on_finish(me);
	                USERTASK.GET('sm').on_finish(me);

	                me.level_up();
	                me.commands_json = null;
	                this.send_master(me);
	                if (me.query_temp('sr', 0) === 1 && !WORLD.DATA.query_temp('first_sr')) {
	                    me.notify("<hig>你获得称号【武馆馆主】。</hig>");
	                    me.add_title('武馆馆主', 'sr');
	                    WORLD.DATA.set_temp('first_sr', 1);
	                }
	            } else {
	                me.notify("金古易对你说道：这位" + me.call() + "，你只需打通任督二脉就可以提升到宗师境界了。");
	            }
	        } else {
	            var lacks = [];
	            if (!skillsOk) lacks.push("技能达到800级");
	            if (!mpOk) lacks.push("内力达到100000");
	            if (!rdemOk) lacks.push("打通任督二脉");
	            me.notify("金古易对你说道：这位" + me.call() + "，你还需" + lacks.join("、") + "方可提升到宗师境界。");

	        }
	    } else if (me.level == 3) {
	        var check = {};
	        for (var sk in me.skills) {
	            var item = me.skills[sk];
	            if (item.enable_skill && item.level >= 1500 && me.skills[item.enable_skill].level >= 1500) {
	                check[sk] = true;
	            }
	        }
	        var skillsOk3 = check["force"] && check["unarmed"] && (check["sword"] || check["blade"] || check["club"] || check["whip"] || check["staff"]) && check["parry"] && check["dodge"];
	        var mpOk3 = me.max_mp >= 500000;
	        var shjdOk = me.query_temp("shjd") == 3;

	        if (skillsOk3 && mpOk3) {
	            if (shjdOk) {
	                me.notify("金古易对你抱拳道：恭喜" + me.call() + "更进一步踏入武圣境界，望" + me.call() + "能百尺杆头更进一步！");
	                this.do_command("chat", "哈哈哈，圣君出世，武林之福，恭贺新晋武圣" + me.name + "！");
	                me.level_up();
	            } else {
	                me.notify("金古易对你说道：这位" + me.call() + "，你只需练成三花聚顶就可以提升到武圣境界了。");
	            }
	        } else {
	            var lacks3 = [];
	            if (!skillsOk3) lacks3.push("技能达到1500级");
	            if (!mpOk3) lacks3.push("内力达到500000");
	            if (!shjdOk) lacks3.push("完成三花聚顶");
	            me.notify("金古易对你说道：这位" + me.call() + "，你还需" + lacks3.join("、") + "方可提升到武圣境界。");
	        }
	    } else {
	        me.notify("金古易对你说道：这位圣君，老头子才疏学浅，没办法再继续指点你了。");
	    }

	}
	function checkWS(me) {
	    if (me.query_temp("wd")) {
	        return me.notify("金古易对你说道：武道塔的守门人，连我都看不出他的境界，他肯定知道些什么。");
	    }

	    var check = {};
	    for (var sk in me.skills) {
	        var item = me.skills[sk];
	        if (item.enable_skill && item.level >= 2200) {
	            check[sk] = true;
	        }
	    }

	    if (check["force"] && check["unarmed"] && (check["sword"] || check["blade"] || check["club"] || check["whip"] || check["staff"]) && check["parry"] && check["dodge"]
	        && me.max_mp >= 1200000) {
	        me.set_temp("wd", 1);

	        me.notify("金古易对你哈哈一笑道：这位" + me.call() + "，你我同为圣君，指点可不敢当！\n顿了顿，金古易又对你说道：你可以去试着寻找武道塔的守门人，或许他可以指点你。");
	    } else {
	        me.notify("金古易对你哈哈一笑道：这位" + me.call() + "，你我同为圣君，指点可不敢当！\n顿了顿，金古易又对你说道：传说中武圣之上还有帝君，只是中原武林传承断裂，日渐式微，如何成就帝君就恕老朽孤陋寡闻了。");
	    }

	}
	this.send_master = function (me) {
	    if (me.level <= 1) return;
	    var shifu = me.query_temp("shifu");
	    if (!shifu) return;
	    if (me.level > 3) return;

	    var name = ["武士", "武师", "宗师"][me.level - 1];
	    var str = "你的弟子成功进阶到" + name + "，这是给予你的奖励。";
	    var atts = [
	        {
	            obj: "cash/box#" + (me.level - 1),
	            count: 1
	        }
	    ];

	    if (me.level == 3) {
	        str = "你的弟子成功进阶到" + name + "，师徒关系自动解除，这是给予你的奖励。";
	        me.remove_temp("shifu");
	        me.remove_temp("shifu_n");
	        me.set_temp("st_leave", 1, UTIL.diff_week_time());
	        atts.push(
	            {
	                obj: "sp/tool/shitu#" + me.id,
	                count: 1
	            });
	        var user = WORLD.getUser(shifu);
	        if (user) {
	            user.remove_temp("tudi");
	            user.remove_temp("tudi_n");
	            user.set_temp("st_leave", 1, 3600000 * 24 * 7);
	        }
	    }
	    COMMAND.DO("send", shifu, {
	        content: str,
	        attach: atts
	    });

	}
	this.add_action("fuli", "领取福利", claimFuli);
	function claimFuli(me) {
		if (me.query_temp("jinyiyi_fuli_claimed")) {
			return me.notify("金古易对你微微一笑：你已经领取过福利了，贪心可不好哦。");
		}
		if (me.items && me.items.length >= 80) {
			return me.notify("金古易对你说道：你的背包太满了，先清理一下吧。");
		}

		// 一整套 lv6/wushen 装备
		var eqList = [
			"changgeng_glove", "chiyouzhixue", "dihou_axe", "fushen_waist",
			"fuyu_sword", "haotian_shoes", "jinding_head", "jinlan_cape",
			"nvwa_jewels", "pangu_axe", "qibao_ring", "shenhunsuipian",
			"shennong_jewels", "shenqisuipian", "taiji_cloth", "taisui_sword",
			"taiyin_throw", "weizhang_jewels", "xuanji_necklace", "xuanyuan_sword",
			"ying_blade", "yinghuo_blade", "yishan_pick", "zaohua",
			"zhanshenjia", "zhuque_wrist"
		];
		for (var i = 0; i < eqList.length; i++) {
			me.add_obj("eq/lv6/wushen/" + eqList[i], 1);
		}

		// 十本秘籍
		var skillBooks = [
			"xiuluodao", "tiandiqipan", "nixianmojue", "tianditongshou",
			"dapintianxianjue", "yixinghunyuan", "shandianwulianbian",
			"fuyujianfa", "changshengjue", "cihangjiandian"
		];
		for (var i = 0; i < skillBooks.length; i++) {
			me.add_obj("book/book#" + skillBooks[i], 1);
		}

		// 货币
		me.add_money(1000000 * 10000);  // 100w黄金
		me.add_obj("book/wudao", 1000000);  // 100w武道

		// 50个九转金丹（朱果#5）
		me.add_obj("drug/exp#5", 50);

		me.set_temp("jinyiyi_fuli_claimed", 1);
		me.notify("<hio>金古易对你笑道：这些福利你收好，望你勤加修炼，早日成为一代宗师！</hio>");
		me.notify("<hio>你获得了全套武神装备、十本秘籍、100万黄金、100万武道、50个九转金丹！</hio>");
	}
	this.on_die = function () {
	    this.call_out(this.relive, 10000);
	}