	this.inherits(NPC);
	this.set({
	    name: "人花",
	    desc: "一朵由精纯内力凝聚而成的人花，花瓣如人形，散发着淡淡的金光。它是修者内力与根骨交融所化，蕴含着突破境界的契机。",
	    gender: 0,
	    hp: 999999999,
	    max_hp: 999999999,
	    mp: 0,
	    max_mp: 0,
	    score: 0,
	    gj: 0,
	    fy: 500,
	    mz: 0,
	    ds: 100,
	    zj: 0
	});
	this.skill_map(["force", 1], ["unarmed", 1], ["parry", 1], ["dodge", 1]);
	this.begin_attack = function (target, type) {
	    if (!target || target === this) return;
	    if (!this.attack_skill) this.init_skill();
	    this.add_enemy(target);
	    this.fight_type = type || 2;
	};
	this._max_hits = 14;
	this._required_dmg = 210000;
	this._hit_count = 0;
	this._total_dmg = 0;
	this._owner = null;
	this._done = false;

	this.on_damage = function (from, sh) {
	    if (sh > 0 && from && from.is_player && from.query_temp("shjd_cultivating") === "ren") {
	        this._hit_count = (this._hit_count || 0) + 1;
	        this._total_dmg = (this._total_dmg || 0) + sh;
	        this._owner = from;
	        this.hp = this.max_hp;

	        if (this._total_dmg >= this._required_dmg && !this._done) {
	            this._done = true;
	            var owner = from, dmg = this._total_dmg, hits = this._hit_count;
	            this.call_out(function () {
	                this.end_fight();
	                owner.add_temp("fenpei", 2);
	                owner.max_mp += 10000;
	                owner.set_temp("shjd_cultivating", null);
	                if (owner.prop) delete owner.prop.no_pfm;
	                owner.set_temp("shjd_ren", 1);
	                owner.set_temp("shjd_ren_rwd", 1);
	                var c = 1 + (owner.query_temp("shjd_di") ? 1 : 0) + (owner.query_temp("shjd_tian") ? 1 : 0);
	                owner.set_temp("shjd", c);
	                owner.notify("<hig>人花绽放！" + dmg + "伤害/" + hits + "击，获得2点先天属性+10000内力上限！</hig>");
	                owner.send_message(owner.name + "成功唤出人花，三花聚顶初成！");
	                this.destroy();
	            }, 100);
	        } else if (this._hit_count >= this._max_hits && !this._done) {
	            this._done = true;
	            var owner = from, dmg = this._total_dmg;
	            this.call_out(function () {
	                this.end_fight();
	                owner.set_temp("shjd_cultivating", null);
	                if (owner.prop) delete owner.prop.no_pfm;
	                owner.notify("<red>人花14击未破……开花失败。（累计" + dmg + "伤害，需" + this._required_dmg + "）</red>");
	                this.destroy();
	            }, 100);
	        }
	    }
	    return sh;
	};
	this.on_escape = function (who) {
	    if (who && who.is_player && who.query_temp("shjd_cultivating") === "ren") {
	        who.notify("<red>人花绽放中，你无法离开！</red>");
	        return false;
	    }
	};
	this.on_die = function () { return false; };
