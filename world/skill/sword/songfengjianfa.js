	this.inherits(SKILL);
	this.name = "松风剑法";
	this.id = "songfengjianfa";
	this.grade = 3;
	this.attack_actions = [
		"$N剑啸如松涛，松风剑法学自青城，剑法连绵不绝",
		"$N松风剑法展开，剑光闪烁，如松间清风，无处不在",
		"$N身形如松挺立，$w却似风般轻盈灵动，一剑飘忽之间已至$n的$l",
		"$N剑势忽然转急，$w化作一片剑影，犹如狂风掠过松林，发出阵阵啸声",
		"$N踏前一步，$w自下而上斜挑，剑势如松枝摇曳，看似随意却精准无比",
		"$N手中$w连颤，剑尖如松针般密集刺出，点点寒芒笼罩$n周身",
		"$N长吸一口气，$w发出呜呜松涛之音，剑光如月下松影，忽明忽暗地缠向$n",
		"$N纵身而起，$w凌空下击，这一剑如青松倒挂、风卷残云，势不可挡"
		];
	this.parry_actions = [
		"$n手腕轻转，$w如松枝迎风般轻轻一摆，便将$N的凌厉攻势卸到一旁",
		"$n剑势如松涛阵阵，$w在身前布下一层又一层的剑幕，$N的$w刺来只觉阻力重重",
		"$n以松风剑意护体，$w化作一片剑光，如万松林立般将周身守得密不透风",
		"$n身形微侧，$w顺势一带，如清风拂松，$N的攻势被这柔中带刚的守招轻松化解",
		"$n剑尖疾点数下，如松针飞射，以攻代守，逼得$N不得不撤招自保"
		];
	this.desc = "青城派剑法，剑如松风，凌厉迅猛";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: parseInt(lv * 1.5) + 20,
					mz: parseInt(lv * 1.4) + 20,
					dex: parseInt(lv * 127.0 / 1000),
				},
				parry: {
					zj: parseInt(lv * 1.4) + 10,
					max_hp: parseInt(lv * 5010.0 / 1000),
					dex: parseInt(lv * 127.0 / 1000),
				},
			}
		}

	// 松风层数上限：0 级 3 层，每 300 级 +1 层，最多 6 层
	function songfeng_max(lv) { return Math.min(3 + Math.floor((lv || 0) / 300), 6); }
	// 剑法普攻命中叠一层「松风」：状态叠层（不存档），10 秒内未再叠加则逐层消退，战斗结束清空。
	// 原先读的 temp sk_songfeng 从没有任何地方写入，层数恒为 0。
	this.on_attack_over = function (me, target, par, sh) {
		if (!(sh > 0) || par.is_dodge || par.is_parry || par.is_counter || me._zy_casting) return; // 只算普攻
		var lv = me.query_skill("songfengjianfa", 0);
		var max = songfeng_max(lv);
		if (me.query_status("songfeng") >= max) {
			// 已满：刷新持续时间
			for (var i = 0; me.status && i < me.status.length; i++) {
				var st = me.status[i];
				if (st.id === "songfeng") { clearTimeout(st.handler); st.handler = me.call_out(me.remove_status, st.duration, "songfeng"); st.start_time = Date.now(); break; }
			}
			return;
		}
		me.add_status({
			id: "songfeng",
			name: "松风",
			desc: "松风剑意，松月无影每层多攻击一次",
			duration: 10000,
			override: 1,
			max_count: max,
			only_combat: true,
		});
	};

	this.pfm = {
		pfm1: {
				name: "松月无影",
				distime: 20000,
				enable_skill: "sword",
				mp: 25,
				use: function (me, target, lv) {
					var stacks = me.query_status("songfeng");
					me.send_room("<HIG>$N剑势陡然加快——「松月无影」！$N将积累的松风剑意尽数释放，$w化作" + (stacks + 1) + "道剑影朝$n疾刺而去！</HIG>", target);
					me.remove_status("songfeng", true); // 消耗全部松风层数
					for (var i = 0; i <= stacks; i++) {
						me.do_attack({
							target: target,
							gj: me.gj,
							mz: me.mz,
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					var cur = me && me.query_status ? me.query_status("songfeng") : 0;
					return "消耗你积累的松风，瞬间出剑，每层松风增加你一次攻击次数（当前" + cur + "层，最多" + songfeng_max(lv) + "层）。剑法普攻命中时积累一层松风。";
				}
			}
		};
