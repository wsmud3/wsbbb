	this.inherits(COMMAND);
	this.command = "fenpei";
	this.allow_fight = false;
	this.enter = function (me) {
	    // 先天属性奖励防呆补发检测
	    checkAllRewards(me);

	    var fen = me.query_temp("fenpei");
	    if (!fen) return me.notify("你目前没有可以分配的先天属性。");
	    if (fen <= 0) return me.notify("你目前的可分配属性是"+fen+"，无法分配。");
	    me.notify("请说出你的先天属性，每项15-30，总计" + fen + "，比如:10 0 0 10");
	    me.wait_input = readnumber;
	}

	function checkAllRewards(me) {
	    var total = 0;

	    // 1. 打通任督二脉（+10点）
	    if (me.query_temp("rdem") && !me.query_temp("rdem_rwd")) {
	        me.add_temp("fenpei", 10);
	        me.set_temp("rdem_rwd", 1);
	        me.notify("<hig>【补发】打通任督二脉：10点可分配先天属性。</hig>");
	        total += 10;
	    }

	    // 2. 三花聚顶 — 人花（+2点, +10000内力上限）
	    if (me.query_temp("shjd_ren") && !me.query_temp("shjd_ren_rwd")) {
	        me.add_temp("fenpei", 2);
	        me.max_mp += 10000;
	        me.set_temp("shjd_ren_rwd", 1);
	        me.notify("<hig>【补发】人花奖励：2点可分配先天属性 + 10000内力上限。</hig>");
	        total += 2;
	    }
	    // 三花聚顶 — 地花（+3点, +20000内力上限）
	    if (me.query_temp("shjd_di") && !me.query_temp("shjd_di_rwd")) {
	        me.add_temp("fenpei", 3);
	        me.max_mp += 20000;
	        me.set_temp("shjd_di_rwd", 1);
	        me.notify("<hig>【补发】地花奖励：3点可分配先天属性 + 20000内力上限。</hig>");
	        total += 3;
	    }
	    // 三花聚顶 — 天花（+5点, +30000内力上限）
	    if (me.query_temp("shjd_tian") && !me.query_temp("shjd_tian_rwd")) {
	        me.add_temp("fenpei", 5);
	        me.max_mp += 30000;
	        me.set_temp("shjd_tian_rwd", 1);
	        me.notify("<hig>【补发】天花奖励：5点可分配先天属性 + 30000内力上限。</hig>");
	        total += 5;
	    }

	    // 3. 武道试炼 ×4（各+1点）
	    var beastNames = ["青龙", "白虎", "玄武", "朱雀"];
	    for (var i = 0; i < 4; i++) {
	        if (me.query_temp("ss_trial_done_" + i) && !me.query_temp("ss_trial_rwd_" + i)) {
	            me.add_temp("fenpei", 1);
	            me.set_temp("ss_trial_rwd_" + i, 1);
	            me.notify("<hig>【补发】" + beastNames[i] + "试炼奖励：1点可分配先天属性。</hig>");
	            total += 1;
	        }
	    }

	    // 4. 五气朝元 ×5（各+1点, +300000内力上限）
	    var absorbed = me.query_temp("wd_absorbed", 0);
	    var wdRwd = me.query_temp("wd_rwd", 0);
	    var locNames = ["华山金行", "泰山土行", "恒山木行", "衡山火行", "嵩山水行"];
	    for (var j = 0; j < 5; j++) {
	        if ((absorbed & (1 << j)) && !(wdRwd & (1 << j))) {
	            me.add_temp("fenpei", 1);
	            me.limit_mp += 300000;
	            wdRwd |= (1 << j);
	            me.set_temp("wd_rwd", wdRwd);
	            me.notify("<hig>【补发】" + locNames[j] + "灵气奖励：1点可分配先天属性 + 300000内力上限。</hig>");
	            total += 1;
	        }
	    }

	    // 5. 武神/等级6（+1点, +500000内力上限）
	    if (me.level >= 6 && !me.query_temp("wushen_rwd")) {
	        me.add_temp("fenpei", 1);
	        me.limit_mp += 500000;
	        me.set_temp("wushen_rwd", 1);
	        me.notify("<hig>【补发】武神境界奖励：1点可分配先天属性 + 500000内力上限。</hig>");
	        total += 1;
	    }

	    if (total > 0) {
	        me.notify("<hiy>先天属性防呆检测完成，共补发" + total + "点可分配属性，请在下方分配。</hiy>");
	    }
	}

	function readnumber(me, cmd) {
	    var fen = me.query_temp("fenpei");
	    if (!cmd) return me.notify("请说出你要增加的先天属性，总计" + fen +"，比如:10 0 0 10");
	    var ss = cmd.split(' ');
	    if (ss.length != 5) return me.notify("请说出你要增加的先天属性，总计" + fen +"，比如:10 0 0 10");
	    var str = parseInt(ss[1]);
	    var con = parseInt(ss[2]);
	    var dex = parseInt(ss[3]);
	    var int = parseInt(ss[4]);
	    if (str + con + dex + int != fen) return me.notify("四项总计需要是" + fen+"，请重新调整");
	    if (str < 0 || con < 0 || dex < 0 || int < 0) return me.notify("单项的值需要大于0");
	    me.set_temp("re_str", str);
	    me.set_temp("re_con", con);
	    me.set_temp("re_dex", dex);
	    me.set_temp("re_int", int);

	    me.notify("增加先天属性设置为臂力：" + str + "，根骨：" + con + ",身法：" + dex + ",悟性:" + int + "，是否确认？");
	    me.send_commands("ok", "确认", "cancle", "重新设置");
	    me.wait_input = checkResult;
	}
	function checkResult(me, str) {
	    if (str == "ok") {
	        me.str +=( me.query_temp("re_str") || 0);
	        me.con += (me.query_temp("re_con") || 0);
	        me.int += (me.query_temp("re_int") || 0);
	        me.dex += (me.query_temp("re_dex") || 0);
	        me.recount();
	        me.notify("属性调整完成");
	        me.remove_temp("fenpei");
	        me.wait_input = null;
	        me.remove_temp("re_str");
	        me.remove_temp("re_con");
	        me.remove_temp("re_dex");
	        me.remove_temp("re_int");
	    } else {
	        var fen = me.query_temp("fenpei");
	        if (!fen) return;
	        me.wait_input = readnumber;
	        me.notify("请说出你要增加的先天属性(臂力 根骨 身法 悟性)，总计" + fen +"，比如:10 0 0 10");
	    }
	}