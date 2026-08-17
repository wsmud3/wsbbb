	this.inherits(NPC);
	this.set({
	    name: "守门人",
	    desc: "他是武道塔的守门人，一个神神秘秘的老头",
	    gender: 1,
	    age: 67,
	    per: 55,
	    mp: 5000000,
	    max_mp: 5000000,
	    hp: 80000000,
	    max_hp: 80000000,
	    level: 5,
	    pfm_rate: 1,
	    prop: {
	        gjsd: 20000,
	        add_sh_per: 100,
	        diff_sh_per: 270,
	        diff_sh_per2: 100,
	        diff_downside_per: 170,
	        gj: 100000,
	        gj_per: 100,
	        diff_fy_per: 150,
	        distime_per: 80,
	        ds: 150000,
	        ds_per: 100,
	        zj: 150000,
	        zj_per: 100,
	        mz: 150000,
	        mz_per: 100
	    }

	});

	// 武帝之路询问
	this.add_action("ask_wd", "武帝之路", function (me) {
	    if (me.level < 4) {
	        return me.notify("守门人瞥了你一眼，淡淡地说道：你的修为还不够，等你到了武圣境界再来找我吧。");
	    }

	    if (me.level >= 5) {
	        return me.notify("守门人原本佝偻的身子微微挺直，一双浑浊的老眼中精光一闪而逝。\n他平静地与你对视，缓缓说道：五气朝元，帝君之境……你已与我一般，踏入了武帝的门槛。\n守门人顿了顿，目光投向武道塔深处，语气中带着几分沧桑：帝君之上，据传尚有更高的境界。只是老朽所知有限，仅晓得与「四方试炼」有关，至于如何触发……还需帝君自行探寻了。");
	    }

	    // level == 4 (武圣)
	    if (!me.query_temp("wd")) {
	        return me.notify("守门人看了你一眼，摇了摇头说道：你还没得到金古易老先生的引荐，老朽不便多言。");
	    }

	    if (me.query_temp("wd_quest")) {
	        // 已经接过任务，提醒位置
	        var absorbed = me.query_temp("wd_absorbed", 0);
	        var locations = [
	            "华山绝顶（金行灵气，需任意武器技能）",
	            "泰山玉皇顶（土行灵气，需内功）",
	            "恒山见性峰（木行灵气，需招架）",
	            "衡山祝融殿（火行灵气，需拳脚）",
	            "嵩山封禅台（水行灵气，需轻功）"
	        ];
	        var remaining = [];
	        for (var i = 0; i < 5; i++) {
	            if (!(absorbed & (1 << i))) {
	                remaining.push(locations[i]);
	            }
	        }
	        if (remaining.length === 0) {
	            return me.notify("守门人惊讶地看着你：你已经集齐了五气朝元！快去找个地方完成最后的突破吧！");
	        }
	        return me.notify("守门人对你说道：你已知道五气朝元之法，剩下的灵气位于：\n" + remaining.join("\n") + "\n在对应位置点击修炼即可。");
	    }

	    // 首次对话，告知武帝之路
	    me.set_temp("wd_quest", 1);
	    me.notify("守门人听完你的来意，眼中精光一闪，缓缓说道：\n"
	        + "<hiy>金古老先生果然有眼光。武圣之上，确有帝君之境！</hiy>\n"
	        + "守门人顿了顿，继续说道：\n"
	        + "<hiz>要成就武帝，需完成「五气朝元」。五岳之巅各藏五行灵气，你需前往五处绝顶，\n"
	        + "击败灵气所化的试炼之影，获得聚元珠，再以聚元珠吸收五行灵气。</hiz>\n"
	        + "守门人捋了捋胡须：\n"
	        + "五处灵气所在分别是——\n"
	        + "  <hiw>华山绝顶</hiw>：金行灵气，需任意武器技能达到2500级\n"
	        + "  <hiw>泰山玉皇顶</hiw>：土行灵气，需内功达到2500级\n"
	        + "  <hiw>恒山见性峰</hiw>：木行灵气，需招架达到2500级\n"
	        + "  <hiw>衡山祝融殿</hiw>：火行灵气，需拳脚达到2500级\n"
	        + "  <hiw>嵩山封禅台</hiw>：水行灵气，需轻功达到2500级\n"
	        + "守门人最后叮嘱道：\n"
	        + "记住，每次吸收灵气需消耗一百五十万内力，且对应技能和其装备的橙色特殊技能都需达到2500级。\n"
	        + "吸完五处灵气，武帝之境自然水到渠成！");
	});