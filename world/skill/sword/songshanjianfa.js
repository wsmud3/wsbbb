	this.inherits(SKILL);
	this.name = "嵩山剑法";
	this.id = "songshanjianfa";
	this.grade = 3;
	this.attack_actions = [
		"$N嵩山剑法气势雄浑，一剑既出，如山岳压顶",
		"$N剑招大开大阖，嵩山派的威猛尽在其中，直劈$n",
		"$N暴喝一声，$w挟着千钧之势凌空劈下，如嵩山峻极峰崩塌一般压向$n",
		"$N双手握$w，内力贯注剑身，一道雄浑无匹的剑气横扫而出，直取$n腰腹",
		"$N踏步向前，每一步都震得地面微颤，$w随之递出，剑势如群山连绵，一浪高过一浪",
		"$N身形拔起，$w高举过顶，以泰山压顶之势劈下——这一剑力贯千钧，大有开山裂石之威",
		"$N剑招沉稳如山，$w缓缓推出，剑未至而剑气已如嵩岳压身，令$n呼吸为之一滞",
		"$N剑势忽然狂放，$w大开大阖地连劈带砍，每一剑都带着嵩山派的刚猛霸气，$n只有连连后退"
		];
	this.parry_actions = [
		"$n将$w往地上一顿，一股巍然气势顿时升起，如嵩岳屹立，$N的攻势被这股气势震得无以为继",
		"$n横剑当胸，$w稳如嵩山，$N的$w劈来，竟被一股雄浑的反震之力弹了回去",
		"$n不退反进，$w大开大阖地向外一封，以嵩山派的刚猛守势将$N的攻势硬生生砸了回去",
		"$n沉声一喝，$w在身前划出重重剑影，如同嵩山七十二峰层层叠叠，将$N的攻势尽数挡下",
		"$n脚踏中宫，$w稳扎稳打，每一剑守御都如磐石般不可撼动，$N的杀招撞上剑网便四分五裂"
		];
	this.desc = "嵩山派剑法，气势雄浑";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: lv * 2 + 10,
					mz: lv * 1 + 20,
					str: parseInt(lv * 127.0 / 1000),
				},
				parry: {
					zj: parseInt(lv * 2310 / 1000),
					max_hp: lv * 7,
					con: parseInt(lv * 127.0 / 1000),
				},
			}
		}

	this.pfm = {
		pfm1: {
				name: "万岳朝宗",
				distime: 10000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 0,
				use: function (me, target, lv) {
					var mp_cost = parseInt(me.mp * 0.3);
					me.add_mp(-mp_cost);
					me.send_room("<HIY>$N面色陡然一沉，周身真气狂涌而出，手中$w缓缓举起——「万岳朝宗」！这一剑尚未发出，方圆数丈之内已是剑气弥漫，$n只觉仿佛置身于嵩山绝顶，万岳群峰齐齐朝着$N手中的$w俯首称臣！$N猛然挥剑，一道磅礴浩荡的剑气如万钧雷霆般倾泻而出，天地为之色变！</HIY>", target);
					me.do_attack({
						target: target,
						gj: me.gj + mp_cost,
					});
					me.end_attack(target);
				},
				query_desc: function (me, lv) {
					return "威力巨大的一式剑法，消耗你30%的当前内力，对敌人造成等量伤害。";
				}
			}
		};
