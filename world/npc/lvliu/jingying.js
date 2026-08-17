	this.inherits(NPC);
	this.set({
	    name: "山庄精英",
	    desc: "绿柳山庄的精英护卫，身形矫健。",
	    gender: 1,
	    age: 35,
	    per: 15,
	    max_mp: 150000,
	    max_hp: 150000,
	    level: 1,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 8000, mz: 7000, zj: 4900, ds: 3500 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 500],
	    ["parry", 500],
	    ["force", 500],
	    ["unarmed", 500],
	    ["sword", 500],
	    ["lvliu_sword", 500, ["sword", "parry"]],
	    ["lvliu_force", 500, "force"],
	    ["lvliu_unarmed", 500, "unarmed"],
	    ["lvliu_dodge", 500, "dodge"]);

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
	            var coins = Math.max(1, Math.floor(8 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	};
