	this.inherits(NPC);
	this.set({
	    name: "山庄高手",
	    desc: "绿柳山庄的高手，内力深厚。",
	    gender: 1,
	    age: 35,
	    per: 15,
	    max_mp: 400000,
	    max_hp: 400000,
	    level: 1,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 15000, mz: 13000, zj: 9100, ds: 6500 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 800],
	    ["parry", 800],
	    ["force", 800],
	    ["unarmed", 800],
	    ["sword", 800],
	    ["lvliu_sword", 800, ["sword", "parry"]],
	    ["lvliu_force", 800, "force"],
	    ["lvliu_unarmed", 800, "unarmed"],
	    ["lvliu_dodge", 800, "dodge"]);

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
	            var coins = Math.max(1, Math.floor(12 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	};
