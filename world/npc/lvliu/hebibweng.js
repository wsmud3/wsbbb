	this.inherits(NPC);
	this.set({
	    name: "鹤笔翁",
	    desc: "玄冥二老之一，身形高瘦如鹤。",
	    gender: 1,
	    age: 68,
	    per: 10,
	    max_mp: 5000000,
	    max_hp: 5000000,
	    level: 6,
	    no_refresh: true,
	    pfm_rate: 1,
	    prop: { gj: 80000, mz: 65000, zj: 45500, ds: 32500 }
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
	    ["dodge", 2500],
	    ["parry", 2500],
	    ["force", 2500],
	    ["unarmed", 2500],
	    ["xuanmingshenzhang_m", 2500, ["unarmed", "parry"]],
	    ["lvliu_force", 2500, "force"],
	    ["lvliu_unarmed", 2500, "unarmed"],
	    ["lvliu_dodge", 2500, "dodge"]);

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
	            var coins = Math.max(1, Math.floor(50 * pct));
	            player.add_temp("lvliu_coin", coins);
            player.notify("<hig>【绿柳令+" + coins + "】造成伤害" + Math.floor(pct * 100) + "%</hig>");
	        }
	    }
	    if (this.lvliu_pt) {
	        var pt = WORLD.DATA.parties.get(this.lvliu_pt);
	        if (pt) {
	            for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	                if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") {
	                    WORLD.SYSTEMTASKS[i].check_bosses(pt);
	                    break;
	                }
	            }
	        }
	    }
	};
