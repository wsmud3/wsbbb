		this.inherits(SKILL);
		this.name = "金蛇锥法";
		this.id = "jinshezhuifa";
		// 公共高级技能（level_desc[2] = 高级技能；不属于门派即显示「公共」）
		this.grade = 2;
		this.is_public = true;
		this.desc = "金蛇郎君创造的一门暗器功法";
		this.can_enables = ["throwing"];
		this.attack_actions = [
			"$N手腕一抖，一枚金蛇锥破空而出，蜿蜒如蛇直取$n的$l",
			"$N身形一侧，袖中金光一闪，金蛇锥已射向$n的$l",
			"$N双指一弹，金蛇锥去势如灵蛇吐信，忽左忽右袭向$n",
			"$N冷笑一声，反手掷出金蛇锥，锥尖嘶嘶作响，直钉$n的$l",
			"$N足下一错，借势连掷两枚金蛇锥，一上一下封住$n的退路"
		];
		this.parry_actions = [
			"$n手中金蛇锥一点，正撞在$N的招式上，将来势轻轻带偏",
			"$n以金蛇锥护住要害，$N的攻势被锥尖逼得半途收回"
		];
		this.learn_condition = {
			max_mp: 3000,
			skill: { throwing: 300 }
		};
		// 面板（968级）：装备为基本暗器时 攻击 +978  →  攻击 = 等级 + 10
		this.query_enable_prop = function (lv) {
			return {
				throwing: {
					gj: parseInt(lv) + 10,
				},
			};
		};
		this.pfm = {
			pfm1: {
				name: "千蛇出洞",
				// 初始冷却 10 秒、出招 4 秒（面板上的 3 秒/0 秒是角色减冷却、减出招后的结果）
				distime: 10000,
				enable_skill: "throwing",
				release_time: 4000,
				// 面板：968 级内力消耗 622。显示值 = mp × (1 + 等级/20)，12.6 × 49.4 ≈ 622
				mp: 12.6,
				use: function (me, target, lv) {
					var t = target || (me.query_enemy && me.query_enemy());
					if (!t || t === me) return me.notify("你要对谁使用？");
					me.send_room("<HIY>$N一声长啸——「千蛇出洞」！袖中金蛇锥倾泻而出，宛如万千金蛇钻出洞穴，齐齐扑向$n！</HIY>", t);
					me.do_attack({ target: t });
					me.end_attack(t);
				},
				query_desc: function (me, lv) {
					return "使用暗器对敌人发动攻击";
				}
			}
		};
