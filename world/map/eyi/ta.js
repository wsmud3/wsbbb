
	this.inherits(ROOM);
	this.name = "第一层"
	this.desc = "这里是妖族巢穴的内部，四周岩壁上布满了妖族符文，散发着诡异的光芒。越往深处，空气中的妖气愈发浓烈，让人不寒而栗。";
	this.exits = { "up": "eyi/ta", "out": "eyi/men" };
	this.max_item_count = 20;

	this._count_npc = function () {
		var cnt = 0;
		for (var i = 0; i < this.items.length; i++) {
			if (!this.items[i].is_player && this.items[i].hp > 0) cnt++;
		}
		return cnt;
	};

	this.on_before_enter = function (me) {
		var level = (me.query_temp("eyi_level") || 0) + 1;
		this.name = "第" + UTIL.to_c(level) + "层";

		// 增加机制：每100层多一个NPC，上限6个
		var npcCount = Math.min(Math.floor((level - 1) / 100) + 1, 6);

		// 确保本层NPC名称和grade6技能不重复
		me._eyi_used_names = [];
		me._eyi_used_grade6 = [];

		this.items.length = 0;
		for (var i = 0; i < npcCount; i++) {
			var npc = NPC.CLONE("pub/eyi");
			try {
				npc.init_from(me, level, npcCount);
			} catch (e) {
				console.error("妖族巢穴第" + level + "层NPC初始化失败:", e.message || e);
				npc.destroy && npc.destroy();
				npc = NPC.CLONE("pub/eyi");
				npc.init_from(me, 1, 1);
			}
			npc._eyi_index = i;
			npc._eyi_total = npcCount;
			npc.die = this.on_die2;
			npc.environment = this;
			this.items.push(npc);
		}
		this.refresh();
	}

	this.on_enter = function (me) {
		me.die = this.on_die1;
		for (var i = 0; i < this.items.length; i++) {
			var npc = this.items[i];
			if (!npc.is_player) {
				me.send('<ord>' + npc.name + '：哈哈哈，不知死活的人类，受死吧！</ord>');
				npc.do_kill(me);
			}
		}
	}

	this.on_die1 = function (me) {
		this.hp = 1;
		this.notify("<hir>你的挑战失败了。</hir>");
		// 清理所有NPC
		var npcs = [];
		for (var i = 0; i < this.environment.items.length; i++) {
			var item = this.environment.items[i];
			if (!item.is_player) npcs.push(item);
		}
		for (var i = 0; i < npcs.length; i++) {
			npcs[i].end_fight();
			npcs[i].destroy();
		}
		this.moveto('eyi/men');
	}

	this.on_die2 = function (me) {
		if (!this.environment) return;
		me.notify("<hig>恭喜你战胜了" + this.name + "。</hig>");

		// 检查是否还有存活的NPC
		var remaining = 0;
		for (var i = 0; i < this.environment.items.length; i++) {
			var item = this.environment.items[i];
			if (!item.is_player && item.hp > 0 && item !== this) {
				remaining++;
			}
		}

		if (remaining > 0) {
			me.notify("<hiy>还有" + UTIL.to_c(remaining) + "个妖族守护者需要击败。</hiy>");
			this.environment.item_changed(this, false, this.name + "倒下了。");
			return;
		}

		// 所有NPC都被击败，进入下一层
		var count = me.add_temp("eyi_level", 1);
		me.notify("<hic>你的妖族巢穴纪录更新到" + count + "层。</hic>");

		var max = WORLD.DATA.query_temp("eyi_max", 0);
		if (count > max) {
			WORLD.DATA.set_temp("eyi_max", count);
			WORLD.DATA.set_temp("eyi_max_user", me.name);
			COMMAND.DO("rumor", "听说" + me.name + "在妖族巢穴中突破了" + UTIL.to_c(count) + "层！");
			// Clear area json cache so the jianghu interface shows updated record
			var eyiArea = AREA.Get("eyi");
			if (eyiArea) eyiArea.json = null;
		}

		me.environment.item_changed(this, false, this.name + "离开了。");
	}

	this.on_leave = function (me, dir) {
		// 收集所有存活NPC
		var npcs = [];
		for (var i = 0; i < this.items.length; i++) {
			if (!this.items[i].is_player) npcs.push(this.items[i]);
		}

		if (dir === "up") {
			if (npcs.length > 0) {
				me.notify_fail(npcs[0].name + "对你说道：打败我们，你才能继续深入。");
				return false;
			}
			me.moveto('eyi/ta');
			return false;
		} else {
			for (var i = 0; i < npcs.length; i++) {
				npcs[i].end_fight();
				npcs[i].destroy();
			}
			me.die = USER.prototype.die;
			this.name = "妖族巢穴";
		}
	}
