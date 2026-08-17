	this.inherits(NPC);
	this.set({
	    name: "山庄护法",
	    desc: "绿柳山庄的护法，气势凌人。",
	    gender: 1,
	    age: 35,
	    per: 15,
	    max_mp: 800000,
	    max_hp: 800000,
	    level: 1,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 25000, mz: 20000, zj: 14000, ds: 10000 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 1200],
	    ["parry", 1200],
	    ["force", 1200],
	    ["unarmed", 1200],
	    ["sword", 1200],
	    ["lvliu_sword", 1200, ["sword", "parry"]],
	    ["lvliu_force", 1200, "force"],
	    ["lvliu_unarmed", 1200, "unarmed"],
	    ["lvliu_dodge", 1200, "dodge"]);

	this.on_die = function (killer) {
	    if (!this.damages) return;
	    var totalDamage = 0;
	    for (var key in this.damages) { totalDamage += this.damages[key]; }
	    if (totalDamage <= 0) return;
	    for (var key in this.damages) {
	        var pct = this.damages[key] / totalDamage;
	        if (pct < 0.03) continue;
	        var player = WORLD.getUser(key);
	        if (player && player.is_player) {
	            var coins = Math.max(1, Math.floor(18 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	};
