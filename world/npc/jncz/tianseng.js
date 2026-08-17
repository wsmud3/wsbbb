this.inherits(NPC);
this.name = "天僧";
this.desc = "一位须发皆白的老僧，面容安详，周身散发着柔和的佛光。他已在净念禅宗参禅三百年，传闻已证菩提。";
this.str = 2000; this.con = 2000; this.dex = 1500; this.int = 3000;
this.hp = 40000000; this.max_hp = 40000000;
this.mp = 50000000000; this.max_mp = 50000000000;
this.gj = 300000; this.fy = 100000; this.mz = 300000; this.ds = 340000; this.zj = 30000;
this.prop = {
	    gjsd: 4000,
	    add_sh_per: 90,
	    diff_sh_per: 135,
	    diff_downside_per: 80
};
this.score = 500;
this.skill_map(
	    ["dodge", 4000],
	    ["parry", 4000],
	    ["force", 4000],
	    ["unarmed", 4000],
	    ["sword", 4000],
	    ["changshengjue", 4000, "force"],
	    ["rulaishenzhang", 4000, "unarmed"]);
this.on_die = function(killer) {
    if (killer && killer.is_player) {
        killer.notify('<hig>天僧祖师圆寂了！你击败了净念禅宗的最强者，获得称号「僧王」！</hig>');
        if (!killer.titles) killer.titles = [];
        // Check if already has title
        var hasTitle = false;
        for (var i = 0; i < killer.titles.length; i++) {
            if (killer.titles[i].title === '僧王') { hasTitle = true; break; }
        }
        if (!hasTitle) {
            killer.add_title('僧王', 'fb');
            killer.notify('<hig>你获得了新称号：「僧王」！可在称号界面中查看和佩戴。</hig>');
        }
    }
};
