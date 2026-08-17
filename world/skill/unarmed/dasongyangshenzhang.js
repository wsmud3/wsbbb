this.inherits(SKILL);
this.name = "大嵩阳神掌";
this.id = "dasongyangshenzhang";
this.grade = 3;
this.attack_actions = [
		"$N大嵩阳神掌施展开来，掌风炙热如烈火，轰然拍向$n的$l",
		"$N双掌赤红如烙铁，嵩阳掌的热浪扑面而来，$n不由连连后退",
		"$N暴喝一声，一招「嵩阳贯日」使出，掌心赤焰吞吐直击$n胸口",
		"$N身形疾转，大嵩阳神掌「烈焰焚天」施出，掌影如火山喷发笼罩$n",
		"$N内力催动，双掌之间热浪翻滚，一式「赤日炎炎」劈头盖脸打向$n",
		"$N踏中宫直进，嵩阳掌「火云盖顶」凌空击下，$n只觉热风扑面呼吸艰难",
		"$N掌势大开大合，一招「嵩岳擎天」带着灼灼热风横扫$n的$l",
		"$N须发皆张，大嵩阳神掌至高绝学「阳神降世」全力施为，热浪化为实质轰向$n"
	];
this.parry_actions = [
		"$n双掌交错，以大嵩阳神掌的阳刚劲力将$N的攻击硬生生格开",
		"$n沉腰坐马，一招「嵩岳不动」施出，双掌如铁壁般挡住$N的猛攻",
		"$n掌影翻飞，一式「烈火护身」展开，炽热掌风将$N的攻势尽数逼退",
		"$n运气于臂，大嵩阳神掌守招「阳关三叠」连消带打，$N的攻击被层层化解",
		"$n不退反进，嵩阳掌「以火御火」使将出来，$N的力道被刚猛掌劲反撞而回"
	];
this.desc = "嵩山派绝学掌法，威力刚猛无匹";
this.can_enables = ["unarmed"];
this.learn_condition = {
		max_mp: 3000,
		skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 1.3) + 0,
				gjsd: -200,
				mz: parseInt(lv * 1.2) + 20,
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "无影掌",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 3000,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N掌出无影——「无影掌」！大嵩阳神掌的掌力如烈火般轰向$n！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: Math.floor(me.gj * 300 / 100),
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被无影掌击中，忙乱不堪",
						is_busy: true,
						duration: Math.min(3000 + parseInt(lv * 5), 8000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "对敌人造成300%的伤害，命中后使敌人忙乱" + (Math.min(3000 + parseInt(lv * 5), 8000) / 1000) + "秒。";
			}
		}
	};
