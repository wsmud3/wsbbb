this.inherits(SKILL);
this.name = "蛤蟆功";
this.id = "hamagong";
this.grade = 4;
this.force_rad = 0.7;
this.desc = "白驼山欧阳锋所创的独门内功，蓄力如蛤蟆伏地，爆发时威力惊人";
this.can_enables = ["force", "unarmed"];
this.learn_condition = {
	max_mp: 4000,
	skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
	return {
			force: {
				fy: lv * 2 + 100,
				gj: parseInt(lv * 1.6) + 35,
				limit_mp: lv * 150,
				desc: "唯一：将你内力的70%转化为气血",
			},
			unarmed: {
				gj: parseInt(lv * 1.4) + 12,
				mz: parseInt(lv * 1.4) + 12,
				str: parseInt(lv * 200.0 / 1000),
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "蛤蟆吸气",
			distime: 20000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				var dura = lv * 5 + 4000;
				me.add_status({
					id: "busy",
					name: "吸气",
					desc: "趴在地上蓄力运功，增加" + (15 + parseInt(lv / 100)) + "%伤害减免，无法躲闪和招架",
					duration: dura,
					downside: false,
					override: 2,
					is_busy: true,
					no_diff: true,
					prop: { diff_sh_per: 15 + parseInt(lv / 100), ds: -999999, zj: -999999 },
					on_attach: function (who) {
						who.set_temp("hamagong_xixi", 1);
						who.set_temp("hamagong_xixi_total", dura);
						who.set_temp("hamagong_xixi_start", Date.now());
					},
					on_expire: function (who) {
						who.remove_temp("hamagong_xixi");
						who.remove_temp("hamagong_xixi_total");
						who.remove_temp("hamagong_xixi_start");
					},
					start_msg: "<hig>$N趴在地上，如蛤蟆般鼓动腹部，开始蓄力！</hig>",
					finish_msg: "$N的蛤蟆吸气蓄力完成。",
				});
			},
			query_desc: function (me, lv) {
				var dura = ((lv * 5 + 4000) / 1000).toFixed(1);
				return "趴在地上蓄力运功，蓄力" + dura + "秒，期间增加" + (15 + parseInt(lv / 100)) + "%伤害减免，无法躲闪，招架。";
			}
		},
	pfm2: {
			name: "蛤蟆冲击",
			distime: 5000,
			enable_skill: "force",
			release_time: 4000,
			allow_busy: true,
			mp: 30,
			use: function (me, target, lv) {
				if (!me.query_temp("hamagong_xixi"))
				return me.notify("你需要先使用蛤蟆吸气进行蓄力。");
				var start = me.query_temp("hamagong_xixi_start");
				var total = me.query_temp("hamagong_xixi_total");
				var elapsed = 0;
				if (start && total) {
					elapsed = Math.floor((Date.now() - start) / 1000);
					if (elapsed < 0) elapsed = 0;
				}
				me.send_room("<hig>$N蓄力" + elapsed + "秒，如炮弹般弹射而出——「蛤蟆冲击」！</hig>", target);
				var count = 1 + elapsed;
				for (var i = 0; i < count; i++) {
					var bonus_gj = parseInt(me.gj * (1 + elapsed * 0.15));
					var bonus_mz = parseInt(me.mz * (1 + elapsed * 0.15));
					me.do_attack({
						target: target,
						gj: bonus_gj,
						mz: bonus_mz,
						attack_msg: "<hig>第" + (i + 1) + "次蛤蟆冲击带着" + elapsed + "秒蓄力之势撞向$n！</hig>"
					});
				}
				me.end_attack(target);
				me.remove_status("busy");
				me.remove_temp("hamagong_xixi");
				me.remove_temp("hamagong_xixi_total");
				me.remove_temp("hamagong_xixi_start");
			},
			query_desc: function (me, lv) {
				return "只能在吸气蓄力过程中使用，每蓄力多１秒，增加你15％的伤害，15%命中，增加一次攻击";
			}
		}
	};
;
this.attack_actions = [
	"$N蹲身如蛤蟆伏地，猛然双掌齐推，一股排山倒海的掌力压向$n",
	"$N咕咕一声低吼，双掌连环拍出，蛤蟆功掌力层层叠叠涌向$n的$l",
	"$N四肢据地，忽地弹射而出，蛤蟆功全力一击直取$n的胸口",
	"$N运起蛤蟆功，全身真气鼓荡，一掌拍出挟着万钧之势击向$n",
	"$N伏低身躯，蛤蟆功蓄力已满，猛地双掌齐发轰向$n的$l",
	"$N模仿蛤蟆吐息，内力运至双掌，呼的一声推出一股刚猛掌风击向$n"
	];
