this.inherits(SKILL);
this.name = "一阳指";
this.id = "yiyangzhi";
this.grade = 4;
this.is_public = true;
this.attack_actions = [
		"$N食指微曲，使出「一阳指」，一道指风破空而出，直点$n的$l",
		"$N中指轻弹，一阳指力透指而出，袭向$n的胸前要穴",
		"$N拇指一捺，一阳指力无声无息地点向$n的$l",
		"$N运起一阳指绝学，指力纵横交错，封住$n的所有退路",
		"$N手指轻点，看似漫不经心，实则一阳指力已笼罩$n全身大穴",
		"$N食指连点，数道一阳指力如同疾风骤雨般射向$n",
		"$N食指虚点，一阳指力如丝如缕，无声无息地缠向$n的$l，宛如春日暖阳穿透云层",
		"$N运指如飞，一阳指力化作道道金色光芒，疾射$n周身大穴，攻势密不透风"
	];
this.parry_actions = [
		"$n食指轻弹，以指代剑，一阳指力如一道金色闪电将$N的攻击点破于半途",
		"$n运起一阳指心法，指尖射出凌厉指风破空有声，将$N的招式击偏数寸",
		"$n拇指一捺，一道无形的一阳指力正中$N来招的破绽之处，攻势应声而止",
		"$n手指连弹，数道一阳指力交织成金色光网，$N的攻击被尽数拦截于身外",
		"$n以指为剑，一阳指力如长虹贯日般射出，将$N的攻势从中截断"
	];
this.desc = "大理段氏不传之秘，以指力伤人于无形，亦可运功疗伤，乃天下第一指法";
this.can_enables = ["unarmed"];
this.learn_condition = {
		max_mp: 4000,
		skill: { unarmed: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 1.8) + 20,
				str: parseInt(lv * 201.0 / 1000),
				mz: lv * 1,
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "一指乾坤",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<hiy>$N深吸一口气，食指尖端凝聚一点金光，一阳指之「一指乾坤」倏然点出——指风所过之处空气微微扭曲，仿佛乾坤倒转！</hiy>", target);
				me.do_attack({
					target: target,
					gj: me.gj * 1.5,
					diff_fy: 10000,
					attack_msg: "<HIY>$N的一阳指力洞穿金石，无视防御直取$n！</HIY>",
				});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "对敌人造成150%攻击力的伤害，无视对方防御。一指乾坤，洞穿金石。";
			}
		},
		pfm2: {
			name: "点穴",
			distime: 30000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N一阳指力凝聚指尖——「点穴」！一道纯阳指风破空而出，直取$n要穴！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被一阳指点穴，穴道被封",
						is_busy: true,
						duration: Math.min(5000 + parseInt(lv * 5), 10000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "一阳指之点穴大法，命中后造成伤害，并使敌人忙乱" + (Math.min(5000 + parseInt(lv * 5), 10000) / 1000) + "秒。封经闭穴，无往不利。";
			}
		}
	};
