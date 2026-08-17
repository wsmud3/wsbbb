	this.inherits(NPC);
	this.set({
	    name: "天花",
	    desc: "一朵由天穹星炁凝聚而成的天花，花瓣晶莹剔透如琉璃，散发着璀璨的银白色光芒。它蕴含着天道的威严，将亲自考验修者的根基。",
	    gender: 0,
	    hp: 99999999,
	    max_hp: 99999999,
	    mp: 999999,
	    max_mp: 999999,
	    score: 0,
	    gj: 32000,
	    fy: 9999,
	    mz: 99999,
	    ds: 0,
	    zj: 9999
	});
	// 天花攻击玩家14次，玩家存活即成功
	this._required_hits = 14;
	this._hit_count = 0;
	this._done = false;

	this.on_enter = function (me) {
	    if (me && me.is_player && me.query_temp("shjd_cultivating") === "tian") {
	        me.notify("<hiy>天花降世！天道之力向你袭来，撑过" + this._required_hits + "次天罚即可功成！</hiy>");
	        this.do_kill(me);
	    }
	};

	this.on_attack_over = function (me, target, par, sh) {
	    if (target && target.is_player && target.query_temp("shjd_cultivating") === "tian") {
	        this._hit_count = (this._hit_count || 0) + 1;
	        if (this._hit_count >= this._required_hits && !this._done) {
	            this._done = true;
	            this.call_out(function () {
	                this.end_fight();
	                target.set_temp("shjd_tian", 1);
	                target.set_temp("shjd_tian_rwd", 1);
	                target.set_temp("shjd_cultivating", null);
	                target.remove_temp("no_pfm_key");
	                target.remove_prop("no_pfm");
	                target.add_temp("fenpei", 5);
	                target.max_mp += 30000;
	                target.set_temp("shjd", 3);
	                target.notify("<hig>天花绽放！天道之力认可了你，获得了5点可分配先天属性和30000内力上限！</hig>");
	                target.notify("<hig>三花聚顶，五气朝元！你已臻至全新境界！</hig>");
	                target.send_message(target.name + "成功唤出天花，完成三花聚顶！");
	                this.destroy();
	            }, 100);
	        }
	    }
	    return sh;
	};

	this.on_damage = function (from, sh) {
	    // 保持血量，不被玩家反击打死
	    this.hp = this.max_hp;
	    return sh;
	};

	this.on_escape = function (who) {
	    if (who && who.is_player && who.query_temp("shjd_cultivating") === "tian") {
	        who.notify("<red>天花试炼中，你无法离开！</red>");
	        return false;
	    }
	};
	this.on_die = function (killer) {
	    return false; // 天花不可击杀
	};
