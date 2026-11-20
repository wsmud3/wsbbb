this.inherits(SKILL);
this.name = "天魔策";
this.id = "tianmoce";
this.grade = 6;
this.force_rad = 1.35;
this.is_public = true;
this.desc = "魔门一系最高深的功法，源自上古魔帝，集天地魔气于一身。可同时贯通内功、轻功、招架、拳脚四大武学根基，变化无穷。修炼至大成者，魔威滔天，神佛辟易。";
this.can_enables = ["force", "dodge", "parry", "unarmed"];
this.attack_actions = [
		"$N魔气翻涌，天魔策拳劲如墨龙出海，带着毁天灭地之势轰向$n的$l",
		"$N眼中魔光一闪，天魔策催至巅峰，一记「万魔朝宗」狂猛掌力破空而至",
		"$N身形如渊渟岳峙，掌中魔劲含而不吐，却在触及$n的瞬间如火山爆发",
		"$N双手结天魔印，一股漆黑如墨的真气在掌心凝聚，猛然推向$n",
		"$N周身魔气如潮，一拳轰出，拳罡未至，$n已被那股滔天魔威压得喘不过气",
		"$N腰身微沉，天魔策运转之下，一记「裂天撕地」双爪齐出罩住$n全身要害",
		"$N魔功催动之下须发皆张，一掌拍出如天魔降世，$n只觉天地色变",
		"$N踏前一步似魔影移形，天魔策「吞天噬地」杀招出手，拳掌之间魔气纵横",
];
this.dodge_actions = [
		"$n身形化作一缕黑烟，天魔策步法诡异莫测，$N的攻击只击中残影",
		"$n如鬼魅般飘忽不定，脚下一错已退至三丈之外，$N一击落空",
		"$n身法展开如天魔凌空，身影忽左忽右，$N眼前只见道道黑气缭绕",
		"$n体内魔气自动护体，整个人如黑雾般散开又在数步之外重新凝聚",
		"$n足不点地般飘然退开，天魔策的魔影步法令$N完全无法锁定其身形",
];
this.parry_actions = [
		"$n双臂一振，天魔策护体魔罡透体而出，$N的$w如撞铁壁被震开",
		"$n魔功运转之下身形如铁，一记「天魔不破」硬接了$N的全力一击",
		"$n掌中魔气凝成一面漆黑气盾，$N的攻击撞上气盾如泥牛入海",
		"$n冷哼一声，天魔策「万劫不坏」守势展开，$N只觉拳劲被尽数吞噬",
		"$n不退反进，魔气护体之下$N的攻势如撞山岳，震得手臂发麻",
];
this.learn_condition = {
		max_mp: 50000,
		skill: { force: 1500, dodge: 1500, parry: 1500, unarmed: 1500 }
};

this.query_enable_prop = function (lv) {
		return {
		force: {
			gj: lv * 3,
			mz: lv * 3,
			add_sh_per: 17,
			diff_sh_per: 17,
			desc: "唯一：将你内力的135%转化为气血",
		},
		dodge: {
			ds: lv * 3,
			dex: parseInt(lv * 0.52),
			ds_per: 17,
			mz_per: 17,
		},
		parry: {
			zj: lv * 3,
			hp_per: 26,
			con: parseInt(lv * 0.52),
			str: parseInt(lv * 0.52),
		},
		unarmed: {
			gj: lv * 3,
			mz: lv * 3,
			con: parseInt(lv * 0.52),
			str: parseInt(lv * 0.52),
		},
	};
};

// 拳罡：最多 5+等级/1000 层；持续 1 秒起、每 300 级 +1 秒，最长 10 秒。
var quangang_max = function (lv) { return 5 + parseInt((lv || 0) / 1000); };
var quangang_duration = function (lv) { return Math.min(10, 1 + Math.floor((lv || 0) / 300)) * 1000; };
this.pfm = {
		zhongmo: {
		name: "种魔",
		distime: 60000,
		enable_skill: "force",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			if (!target) { me.notify("你需要指定一个目标。"); return; }
			me.send_room("<hio>$N" + "催动天魔策——「种魔」！一股魔气直灌$n体内，压制其功力！</hio>", target);
			// 消除对方的内功buff
			if (target.status && target.status.length) {
				for (var i = target.status.length - 1; i >= 0; i--) {
					var st = target.status[i];
					if (!st.downside && !st.no_clear) {
						target.remove_status(st.id, true);
					}
				}
			}
			// 压制：降低60%伤害和免伤
			var dr = 60 + parseInt(lv / 500);
			if (dr > 80) dr = 80;
			target.add_status({
				id: "force",
				name: "种魔",
				desc: "被天魔策种魔压制，伤害和免伤降低" + dr + "%，且无法使用内功技能",
				duration: Math.min(6660 + parseInt(lv / 100), 10000),
				downside: true,
				override: 2,
				prop: { gj_per: -dr, diff_sh_per: -dr, no_force: 1 },
				start_msg: "<hir>$n被天魔策的种魔之力压制，功力大减！</hir>",
				finish_msg: "$n体内的种魔之力消散了。",
			}, me);
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			var dr = 60 + parseInt(lv / 500);
			if (dr > 80) dr = 80;
			return "消除对方内功buff，并压制敌方使其降低" + dr + "%的伤害和免伤。";
		}
	},
		daoxin: {
		name: "道心",
		distime: 60000,
		enable_skill: "force",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hio>$N" + "催动天魔策——「道心」！魔气内敛，道心通明，战力飙升！</hio>");
			var boost = 30 + parseInt(lv / 200);
			if (boost > 60) boost = 60;
			me.add_status({
				id: "tianmoce_daoxin",
				name: "道心",
				desc: "攻击+" + boost + "%，免伤+" + boost + "%，命中+" + boost + "%，躲闪+" + boost + "%",
				duration: 10000 + parseInt(lv / 100),
				downside: false,
				override: 2,
				prop: { gj_per: boost, diff_sh_per2: boost, mz_per: boost, ds_per: boost },
				start_msg: "<hio>$N道心通明，战斗力大幅提升！</hio>",
				finish_msg: "$N的道心状态消失了。",
			});
		},
		query_desc: function (me, lv) {
			var boost = 30 + parseInt(lv / 200);
			if (boost > 60) boost = 60;
			return "攻击、免伤、命中、躲闪各提升" + boost + "%。";
		}
	},
		guiying: {
		name: "鬼影",
		distime: 60000,
		enable_skill: "dodge",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hio>$N" + "催动天魔策——「鬼影」！身形化作鬼魅残影，出手必中！</hio>");
			me.add_status({
				id: "tianmoce_guiying",
				name: "鬼影",
				desc: "攻击必中",
				duration: parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: { mz: 99999999 },
				start_msg: "<hio>$N的身影化作一道鬼魅残影，令人无法捉摸！</hio>",
				finish_msg: "$N的鬼影状态消失了。",
			});
		},
		query_desc: function (me, lv) {
			return "" + (parseInt(lv * 10 / 1000)) + "秒内鬼影相随，攻击必中。";
		}
	},
		quangang: {
		name: "拳罡",
		distime: 20000,
		enable_skill: "unarmed",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			if (!target) { me.notify("你需要指定一个目标。"); return; }
			me.send_room("<hiy>$N" + "催动天魔策——「拳罡」！一拳轰出，罡风凛冽！</hiy>", target);
			var sh = me.do_attack({
				target: target,
				gj: me.gj * (1.5 + lv / 5000),
				mz: me.mz * (1.2 + lv / 5000),
				no_weapon: true,
				attack_msg: "<hiy>$N" + "催动天魔策拳罡，刚猛威烈的一拳轰向$n的$l！</hiy>",
			});
			// 命中后叠加一层拳罡（每层 +8% 伤害、+5% 破防，最多 maxStack 层），每次施展都重新计时；
			// 时间到掉一层并重新计时，直到掉光。（原先每层持续 等级×10 毫秒，3000 级 30 秒一层，满层后再施展也不续时，看起来像永续。）
			if (sh > 0 && target.hp > 0 && me.hp > 0) {
				var maxStack = quangang_max(lv), dur = quangang_duration(lv), sid = "tianmoce_quangang";
				var item = me.status && me.status.find(function (x) { return x.id === sid; });
				if (item && item.override !== 1) { me.remove_status(sid, true); item = null; }   // 旧版残留的整体状态
				if (item) { item.duration = dur; item.max_count = maxStack; }
				if (!item || item.count < maxStack) {
					me.add_status({
						id: sid, name: "拳罡", desc: "每层伤害提高8%，破防提高5%",
						duration: dur, downside: false, override: 1, max_count: maxStack,
						prop: { add_sh_per: 8, diff_fy_per: 5 },
					});
				} else {
					// 满层：不再加层，只重新计时
					clearTimeout(item.handler);
					item.handler = me.call_out(me.remove_status, dur, sid);
					item.start_time = Date.now();
					me.status_changed(item, "refresh");
				}
				me.notify(me.query_status(sid) >= maxStack ? "<hio>你拳上罡气已臻极盛，罡风呼啸不绝。</hio>" : "<hio>你拳上的罡气又凝实了几分。</hio>");
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "刚猛威烈的一拳，命中后叠加一层拳罡（最多" + quangang_max(lv) + "层），每层增加8%伤害和5%破防；拳罡持续" + (quangang_duration(lv) / 1000) + "秒，每次施展重新计时，时间到掉一层。";
		}
	},
		butiandao: {
		name: "补天道",
		distime: 60000,
		enable_skill: "parry",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hio>$N" + "催动天魔策——「补天道」！魔气护体，以彼之道还施彼身！</hio>");
			var zjBoost = 30 + parseInt(lv / 300);
			if (zjBoost > 60) zjBoost = 60;
			me.add_status({
				id: "tianmoce_butiandao",
				name: "补天道",
				desc: "招架几率+" + zjBoost + "%，招架成功恢复气血",
				duration: 10000 + parseInt(lv / 100),
				downside: false,
				override: 2,
				prop: { zj_per: zjBoost },
				// 招架成功恢复气血：写在状态上（原在天魔策的招架后钩子里），融入自创武学后照常生效
				on_parry_success: function (owner) {
					var heal = parseInt(owner.max_hp * (0.05 + lv / 200000));
					if (heal > 0) {
						owner.do_recover(heal);
						owner.send_room("<hio>$N的补天道借力打力，伤势随之平复！</hio>");
					}
				},
				start_msg: "<hio>$N的补天道魔气护体，招架之力大增！</hio>",
				finish_msg: "$N的补天道状态消散了。",
			});
		},
		query_desc: function (me, lv) {
			var zjBoost = 30 + parseInt(lv / 300);
			if (zjBoost > 60) zjBoost = 60;
			return "招架几率提升" + zjBoost + "%，招架成功后恢复气血。";
		}
	}
};

// 当装备为内功时，首次进战驱散敌方增益
this.on_beginfight = function (me, target) {
		if (me.is_enable_skill("force", "tianmoce") && target && target.status && target.status.length) {
		for (var i = target.status.length - 1; i >= 0; i--) {
			var st = target.status[i];
			if (!st.downside && !st.no_clear) {
				target.remove_status(st.id, true);
			}
		}
	}
};
