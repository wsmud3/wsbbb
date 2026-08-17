		this.inherits(SKILL);
		this.name = "飞星术";
		this.id = "feixingshu";
		this.grade = 2;
		this.desc = "飞星术";
		this.can_enables = ["throwing", "parry"];
		this.attack_actions = [
			"$N手指轻弹，数道寒星破空而出，直取$n",
			"$N手腕一翻，暗器如流星般射向$n的$l",
			"$N十指连弹，暗器如飞星逐月般接连射出，笼罩$n全身",
			"$N身形一转，手中寒星以诡异弧线绕过障碍直取$n的$l",
			"$N指尖微动，数点寒芒无声无息地射向$n，正是飞星术精要",
			"$N双手齐发，暗器如流星雨般倾泻而出，$n无处可避",
			"$N冷笑一声，一道寒光脱手而出，飞星术快如闪电袭向$n",
			"$N身形忽退，手中暗器却骤然射出，如天外流星直取$n要害"
		];
		this.parry_actions = [
			"$n指尖连弹，以暗器击落$N的暗器，飞星术对攻不落下风",
			"$n身形急闪，同时手中暗器射出，以飞星之势打断$N的攻击节奏",
			"$n双手翻飞，暗器如雨点般迎向$N的攻势，以攻代守",
			"$n凝神以待，手中暗器蓄势待发，$N稍露破绽便遭反击",
			"$n步法灵动，以暗器封住周身要害，$N的攻势尽被截在半途"
		];
		this.learn_condition = {
			max_mp: 2000,
			skill: { throwing: 200 }
		};
		this.query_enable_prop = function (lv) {
			return {
				throwing: {
					gj: parseInt(lv * 1.4) + 4,
					ds: parseInt(lv * 1.4) + 4,
				},
				parry: {
					zj: parseInt(lv * 1.2) + 0,
					fy: parseInt(lv * 1.2) + 0,
				},
			};
		}
		this.pfm = {
			pfm1: {
				name: "星雨",
				distime: 10000,
				enable_skill: "throwing",
				release_time: 3096,
				mp: 20,
				use: function (me, target, lv) {
					var ds_diff = Math.max(0, me.ds - target.ds);
					var extra = Math.min(Math.floor(ds_diff / 3000), 4);
					var hits = 1 + extra;
					me.send_room("<HIW>$N十指连弹——「星雨」！" + hits + "道寒星如流星雨般射向$n！</HIW>", target);
					for (var i = 0; i < hits; i++) {
						me.do_attack({target: target});
					}
					me.end_attack(target);
				},
				query_desc: function (me, lv) {
					return "使用暗器对敌人发动攻击，你的躲闪每比敌人高3000则多发射一枚暗器，最多5枚";
				}
			}
		};
