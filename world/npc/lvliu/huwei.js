	this.inherits(NPC);
	this.set({
	    name: "山庄护卫",
	    desc: "绿柳山庄的护卫，手持长剑。",
	    gender: 1,
	    age: 35,
	    per: 15,
	    max_mp: 50000,
	    max_hp: 50000,
	    level: 1,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 5000, mz: 4000, zj: 2800, ds: 2000 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 300],
	    ["parry", 300],
	    ["force", 300],
	    ["unarmed", 300],
	    ["sword", 300],
	    ["lvliu_sword", 300, ["sword", "parry"]],
	    ["lvliu_force", 300, "force"],
	    ["lvliu_unarmed", 300, "unarmed"],
	    ["lvliu_dodge", 300, "dodge"]);

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
	            var coins = Math.max(1, Math.floor(5 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	};
