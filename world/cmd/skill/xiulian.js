	this.inherits(COMMAND);
	this.command = "xiulian";
	this.allow_fight = false;
	this.allow_state = true;
	this.allow_busy = true;

	const REN_MAI = ["会阴","曲骨","中极","关元","石门","气海","阴交","神阙","水分","下脘","建里","中脘","上脘","巨阙","鸠尾","中庭","膻中","玉堂","紫宫","华盖","璇玑","天突","廉泉","承浆"];
	const DU_MAI = ["长强","腰俞","腰阳关","命门","悬枢","脊中","中枢","筋缩","至阳","灵台","神道","身柱","陶道","大椎","哑门","风府","脑户","强间","后顶","百会","前顶","囟会","上星","神庭","素髎","水沟","兑端","龈交"];
	const TOTAL_MP = 100000;
	const STEP_MP = Math.floor(TOTAL_MP / (REN_MAI.length + DU_MAI.length));

	// 三花聚顶所需内力消耗
	const FLOWER_MP = { ren: 100000, di: 300000, tian: 400000 };
	const FLOWER_NAME = { ren: "人花", di: "地花", tian: "天花" };
	const FLOWER_THRESHOLD = { ren: 5000, di: 6500, tian: 8000 };

	function calcSanhuaValue(me) {
	    var conBonus = me.query_prop("con") || 0;
	    return Math.floor(me.max_mp / 100) + Math.floor(me.con / 10) * conBonus;
	}

	this.enter = function (me) {
	    if (me.query_temp("rendu_cultivating")) {
	        // 防呆：temp还在但state已停止（如断线重连/异常中断），清除残留标记
	        if (!me.state || me.state.id !== "xiulian") {
	            me.remove_temp("rendu_cultivating");
	            me.remove_temp("rendu_meridian");
	            me.remove_temp("rendu_step");
	            me.remove_temp("rendu_mp_used");
	        } else {
	            return me.notify("<hiy>你已经在打通任督二脉了。</hiy>");
	        }
	    }
	    if (me.query_temp("shjd_cultivating")) {
	        // 点击修炼=停止开花
	        var flowerType = me.query_temp("shjd_cultivating");
	        // 清除修炼状态
	        if (me.state && me.state.id === "shjd_flower") {
	            me.set_state(null, false);
	        }
	        // 结束战斗
	        me.end_fight();
	        // 清除房间内的花NPC
	        if (me.environment) {
	            for (var fi = me.environment.items.length - 1; fi >= 0; fi--) {
	                var item = me.environment.items[fi];
	                if (item.path && (item.path.indexOf("renhua") >= 0 || item.path.indexOf("dihua") >= 0 || item.path.indexOf("tianhua") >= 0)) {
	                    item.end_fight();
	                    item.destroy();
	                }
	            }
	        }
	        // 清除所有开花标志
	        me.remove_temp("shjd_cultivating");
	        me.remove_temp("shjd_flower_mp_used");
	        me.remove_temp("no_pfm_key");
	        if (me.prop) delete me.prop.no_pfm;
	        me.notify("<hiy>你停止了召唤" + (FLOWER_NAME[flowerType] || "花") + "，下次需要重新开始。</hiy>");
	        return;
	    }
	    if (!me.query_temp("rdem")) {
	        // 任督二脉未通
	        if (!me.is_player) return;
	        if (me.state) {
	            return me.notify("你正在" + me.state.title + "，没有时间打通任督二脉。");
	        }
	        if (me.mp < STEP_MP) {
	            return me.notify("<red>你的内力不足，无法开始打通任督二脉。</red>");
	        }
	        me.set_temp("rendu_cultivating", 1);
	        me.set_temp("rendu_meridian", "ren");
	        me.set_temp("rendu_step", 0);
	        me.set_temp("rendu_mp_used", 0);
	        me.notify("<hiy>你开始运功打通任督二脉……</hiy>");
	        me.send_message(me.name + "盘膝坐下，开始打通任督二脉。");
	        me.set_state({
	            id: "xiulian",
	            cmd: "xiulian",
	            title: "打通任督二脉",
	            rate: 1,
	            on_enter: doStep,
	            no_move: "打通任督二脉时要专心，不可移动。",
	            on_stop: function (player, isauto) {
	                if (!player.query_temp("rendu_cultivating")) return;
	                player.remove_temp("rendu_cultivating");
	                player.remove_temp("rendu_meridian");
	                player.remove_temp("rendu_step");
	                player.remove_temp("rendu_mp_used");
	                if (isauto) {
	                    player.notify("<hiy>你因故中断了打通任督二脉。</hiy>");
	                } else {
	                    player.notify("<hiy>你停止了打通任督二脉。</hiy>");
	                    player.send_message(player.name + "停止了打通任督二脉。");
	                }
	            }
	        });
	        return true;
	    }

	    // 任督二脉已通，尝试三花聚顶
	    var value = calcSanhuaValue(me);
	    var conBonus = me.query_prop("con") || 0;
	    me.notify("<hiy>三花聚顶修为：内力" + Math.floor(me.max_mp / 100) + " + 先天根骨" + Math.floor(me.con / 10) + " × 后天根骨" + conBonus + " = " + value + "</hiy>");

	    var renDone = me.query_temp("shjd_ren");
	    var diDone = me.query_temp("shjd_di");
	    var tianDone = me.query_temp("shjd_tian");

	    if (renDone && diDone && tianDone) {
	        return me.notify("<hig>你已完成三花聚顶，五气朝元！</hig>");
	    }

	    // 确定当前要开的花
	    var flowerType = null;
	    if (!renDone && value >= FLOWER_THRESHOLD.ren) {
	        flowerType = "ren";
	    } else if (renDone && !diDone && value >= FLOWER_THRESHOLD.di) {
	        flowerType = "di";
	    } else if (renDone && diDone && !tianDone && value >= FLOWER_THRESHOLD.tian) {
	        flowerType = "tian";
	    }

	    if (!flowerType) {
	        var nextFlower = !renDone ? "人花" : (!diDone ? "地花" : "天花");
	        var nextThreshold = !renDone ? FLOWER_THRESHOLD.ren : (!diDone ? FLOWER_THRESHOLD.di : FLOWER_THRESHOLD.tian);
	        me.notify("<red>你憋了半天，始终无法唤出" + nextFlower + "。当前修为" + value + "，需要达到" + nextThreshold + "。</red>");
	        return;
	    }

	    if (me.is_fighting()) {
	        return me.notify("你正在战斗中，无法进行三花聚顶。");
	    }
	    if (me.state) {
	        return me.notify("你正在" + me.state.title + "，没有时间进行三花聚顶。");
	    }

	    var mpNeeded = FLOWER_MP[flowerType];
	    var mpPerTick = 25000;
	    var flowerMsgs = {
	        ren: ["你感觉体内一股热气自丹田升起……", "热气缓缓上行，在头顶凝聚……", "一朵金色的花瓣虚影在眼前浮现……"],
	        di: ["大地之力从脚底涌入你的经脉……", "土黄色的光芒在你周身流转……", "厚重的大地精炁正在凝结成形……"],
	        tian: ["天穹之上星光闪烁，与你体内的真气共鸣……", "银白色的星炁从头顶灌入……", "天道之力正在考验你的根基……"]
	    };
	    var msgIndex = 0;

	    me.set_temp("shjd_cultivating", flowerType);
	    me.set_temp("shjd_flower_mp_used", 0);
	    me.notify("<hiy>你盘膝而坐，开始沟通天地，召唤" + FLOWER_NAME[flowerType] + "……</hiy>");
	    me.send_message(me.name + "盘膝坐下，周身真气涌动，正在召唤" + FLOWER_NAME[flowerType] + "！");

	    me.set_state({
	        id: "shjd_flower",
	        cmd: "xiulian",
	        title: "召唤" + FLOWER_NAME[flowerType],
	        rate: 1,
	        on_enter: function (player) {
	            if (!player.query_temp("shjd_cultivating")) return false;

	            var used = player.query_temp("shjd_flower_mp_used", 0);
	            if (used >= mpNeeded) {
	                // MP消耗完毕 — 用set_state通知客户端
	                player.remove_temp("shjd_flower_mp_used");
	                player.set_state(null, false);
	                spawnFlower(player, flowerType);
	                return false;
	            }

	            if (player.mp < mpPerTick) {
	                player.notify("<red>你的内力不足，召唤" + FLOWER_NAME[flowerType] + "失败。</red>");
	                player.remove_temp("shjd_cultivating");
	                player.remove_temp("shjd_flower_mp_used");
	                return false;
	            }

	            player.add_mp(-mpPerTick);
	            player.add_temp("shjd_flower_mp_used", mpPerTick);

	            var msgs = flowerMsgs[flowerType];
	            if (msgIndex < msgs.length) {
	                player.notify("<hiy>" + msgs[msgIndex] + "</hiy>");
	                msgIndex++;
	            } else {
	                var remaining = mpNeeded - used - mpPerTick;
	                player.notify("<hiy>天地之气继续涌入……还需消耗" + Math.max(0, Math.floor(remaining / 10000)) + "万内力。</hiy>");
	            }
	        },
	        no_move: "召唤" + FLOWER_NAME[flowerType] + "时要专心，不可移动。",
	        on_stop: function (player, isauto) {
	            if (!player.query_temp("shjd_cultivating")) return;
	            player.remove_temp("shjd_cultivating");
	            player.remove_temp("shjd_flower_mp_used");
	            if (isauto) {
	                player.notify("<hiy>你因故中断了召唤" + FLOWER_NAME[flowerType] + "。</hiy>");
	            }
	        }
	    });
	    return true;
	};

	function hasFlowerInRoom(me, flowerType) {
	    var env = me.environment;
	    if (!env || !env.items) return false;
	    var npcPath = "pub/" + flowerType + "hua";
	    for (var i = 0; i < env.items.length; i++) {
	        var item = env.items[i];
	        if (item && item.path === npcPath && item.hp > 0) {
	            return true;
	        }
	    }
	    return false;
	}

	function spawnFlower(me, flowerType) {
	    // 检查房间内是否已有同类型的花
	    if (hasFlowerInRoom(me, flowerType)) {
	        me.notify("<red>" + FLOWER_NAME[flowerType] + "已经存在于房间中，先完成当前试炼吧！</red>");
	        return;
	    }

	    me.notify("<hiy>" + FLOWER_NAME[flowerType] + "已凝聚成形！用你的力量将其击破吧！</hiy>");
	    me.send_message(me.name + "成功唤出了" + FLOWER_NAME[flowerType] + "！");

	    var npcPath = "pub/" + flowerType + "hua";
	    NPC.CREATE(npcPath, me.environment, function (n) {
	        // 禁止使用技能，只能平A
	        me.add_prop("no_pfm", 1);
	        me.set_temp("no_pfm_key", 1);
	        me.set_temp("shjd_cultivating", flowerType);
	        me.notify("<hiy>" + FLOWER_NAME[flowerType] + "在你面前绽放，准备迎接试炼！</hiy>");

	        if (flowerType === "tian") {
	            // 天花攻击玩家
	            n.do_kill(me);
	        } else {
	            // 人花/地花：玩家攻击花
	            me.do_kill(n);
	        }
	    });
	}

	function doStep(me) {
	    if (!me.query_temp("rendu_cultivating")) return false;
	    var meridian = me.query_temp("rendu_meridian");
	    var step = me.query_temp("rendu_step", 0);
	    var mpUsed = me.query_temp("rendu_mp_used", 0);
	    var acupoints = meridian === "ren" ? REN_MAI : DU_MAI;
	    var mpCost = STEP_MP;

	    if (mpUsed + mpCost > TOTAL_MP) {
	        mpCost = TOTAL_MP - mpUsed;
	    }
	    if (mpCost <= 0) {
	        finishRendu(me);
	        return false;
	    }
	    if (me.mp < mpCost) {
	        var failMsg = meridian === "ren" ? "任脉" : "督脉";
	        me.notify("<red>你的内力不足，打通" + failMsg + "失败。</red>");
	        me.remove_temp("rendu_cultivating");
	        me.remove_temp("rendu_meridian");
	        me.remove_temp("rendu_step");
	        me.remove_temp("rendu_mp_used");
	        return false;
	    }
	    me.add_mp(-mpCost);
	    me.add_temp("rendu_mp_used", mpCost);
	    me.set_temp("rendu_step", step + 1);
	    var pointName = acupoints[step];
	    me.notify("<hiy>你打通了任督二脉的" + pointName + "穴位。</hiy>");
	    if (step + 1 >= acupoints.length) {
	        if (meridian === "ren") {
	            me.notify("<hiy>你已打通任脉！继续冲击督脉……</hiy>");
	            me.set_temp("rendu_meridian", "du");
	            me.set_temp("rendu_step", 0);
	        } else {
	            finishRendu(me);
	            return false;
	        }
	    }
	}

	function finishRendu(me) {
	    me.remove_temp("rendu_cultivating");
	    me.remove_temp("rendu_meridian");
	    me.remove_temp("rendu_step");
	    me.remove_temp("rendu_mp_used");
	    me.set_temp("rdem", 1);
	    me.add_temp("fenpei", 10);
	    me.set_temp("rdem_rwd", 1);
	    me.set_state(null, true);
	    me.notify("<hig>你已打通任督二脉！先天真气贯通全身，获得5点可分配先天属性。</hig>");
	    me.send_message(me.name + "成功打通了任督二脉！");
	}
