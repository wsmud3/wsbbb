	this.inherits(NPC);
	this.set({
	    name: "山庄长老",
	    desc: "绿柳山庄的长老，白发苍苍。",
	    gender: 1,
	    age: 35,
	    per: 15,
	    max_mp: 1800000,
	    max_hp: 1800000,
	    level: 1,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 45000, mz: 35000, zj: 24500, ds: 17500 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 1700],
	    ["parry", 1700],
	    ["force", 1700],
	    ["unarmed", 1700],
	    ["sword", 1700],
	    ["lvliu_sword", 1700, ["sword", "parry"]],
	    ["lvliu_force", 1700, "force"],
	    ["lvliu_unarmed", 1700, "unarmed"],
	    ["lvliu_dodge", 1700, "dodge"]);

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
	            var coins = Math.max(1, Math.floor(25 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	};
