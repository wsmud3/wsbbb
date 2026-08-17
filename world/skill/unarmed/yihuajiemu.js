this.inherits(SKILL);
this.name = "移花接木";
this.id = "yihuajiemu";
this.grade = 4;
this.is_public = true;
this.parry_actions = [
				"$n使出「移花接木」，双手一圈，将$N的攻势尽数引向一旁",
				"$n运起移花接木神功，$N的力道竟被悉数转移，如泥牛入海",
				"$n双手轻拂，移花接木之下，$N的攻击被尽数化解",
				"$n不闪不避，移花接木一施，$N的攻势竟折返回去",
				"$n身形微转，以移花接木之法将$N的劲力挪移卸去",
				"$n微微一笑如春风拂面，移花接木随心而发，$N的攻击如飞蛾扑火般消弭于无形",
				"$n掌势轻柔如春风拂柳，移花接木之妙已将$N的力道尽数据为己用，反手推出"
	];
this.desc = "移花宫绝世武学，以柔克刚，借力打力，可将对方的攻势转移甚至反弹";
this.can_enables = ["parry"];

this.learn_condition = {
				max_mp: 4000,
				skill: { parry: 400 }
	};

this.query_enable_prop = function (lv) {
				return {
			parry: {
				zj: parseInt(lv * 1.7) + 20,
				fy: parseInt(lv * 1.5) + 20,
				dex: parseInt(lv * 255 / 1000),
				con: parseInt(lv * 255 / 1000),
			},
		}
	}

// 移花接木：招架时可化解敌人的绝招
this.on_parry_pfm = function (me, from, pfm, lv, sk) {
				if (me.query_temp("yihua_block")) {
			me.remove_temp("yihua_block");
			me.remove_status("yihua_self", true);
			me.send_room("<HIM>$N的「移花接木」气劲流转，将$n的" + pfm.name + "尽数化解于无形！</HIM>", from);
			from.notify("<HIM>你的" + pfm.name + "被移花接木化解了！</HIM>");
			return true;
		}
	};

this.pfm = {
				pfm1: {
			name: "移花",
			distime: 15000,
			enable_skill: "parry",
			release_time: 4000,
			mp: 30,
			use: function (me, target, lv) {
				var dur = 30000;
				me.send_room("<HIM>$N双掌虚引——「移花接木」！$N周身气劲流转如花开绽放，一股无形之力笼罩全身，可化解敌人下一次绝招！</HIM>", me);
				// 自身获得"移花"增益buff：抵挡下一次敌人释放的绝招
				me.set_temp("yihua_block", 1);
				me.add_status({
					id: "yihua_self",
					name: "移花",
					desc: "可化解敌人下一次绝招",
					duration: dur,
					downside: false,
					override: 2,
					start_msg: "<HIM>$N获得移花接木护体，周身气劲如花绽放！</HIM>",
					finish_msg: "$N的移花接木效果消散了。",
					on_expire: function (p) {
						p.remove_temp("yihua_block");
					},
				});
				// 附近敌人获得"移花"减益buff：降低躲闪和招架
				var env = me.environment;
				if (env) {
					var enemies = env.query_all_enemy(me);
					for (var j = 0; j < enemies.length; j++) {
						var c = enemies[j];
						if (c && c !== me) {
							c.add_status({
								id: "yihua_debuff",
								name: "移花",
								desc: "躲闪和招架降低" + (3 + parseInt(lv / 100)) + "%",
								duration: 10000 + parseInt(lv * 5),
								downside: true,
								prop: { ds_per: -(3 + parseInt(lv / 100)), zj_per: -(3 + parseInt(lv / 100)) },
								start_msg: "<HIM>$N被移花接木的气劲所困，身法迟滞！</HIM>",
								finish_msg: "$N身上的移花接木效果消散了。",
							});
						}
					}
				}
			},
			query_desc: function (me, lv) {
				return "出招时间4秒，自身获得移花护体buff（绿buff）：可抵挡正在战斗的敌人释放的下一个绝招，持续30秒。同时附近敌人获得移花减益（红buff）：躲闪和招架降低" + (3 + parseInt(lv / 100)) + "%，持续" + (10 + parseInt(lv * 5 / 1000)) + "秒。";
			}
		}
	};
