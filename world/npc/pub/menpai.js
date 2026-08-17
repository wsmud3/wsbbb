this.inherits(NPC);
this.set({
    name: "门派弟子",
    desc: "门派弟子",
    title: "",
    gender: 1,
    age: 25,
    per: 18,
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    no_refresh: true,
    is_drop: false
});

const LEVEL_COLORS = ["hig", "hic", "hiy", "HIM", "HIZ"];
const LEVEL_STATS = [
    { hp: 80000, mp: 30000, str: 300, con: 300, dex: 250, int: 200 },
    { hp: 200000, mp: 80000, str: 600, con: 600, dex: 500, int: 400 },
    { hp: 800000, mp: 300000, str: 1200, con: 1200, dex: 1000, int: 800 },
    { hp: 3000000, mp: 1000000, str: 2500, con: 2500, dex: 2200, int: 1800 },
    { hp: 40000000, mp: 10000000, str: 6000, con: 6000, dex: 5000, int: 4000 },
];
const SKILL_MULT = [1, 1.5, 2, 3, 4];

const BOSS_TITLE_KEYS = ["帮主", "掌门", "楼主", "前掌门"];

function isBossTitle(t) {
    if (t === "素女道") return true;
    for (var j = 0; j < BOSS_TITLE_KEYS.length; j++) {
        if (t.indexOf(BOSS_TITLE_KEYS[j]) >= 0) return true;
    }
    return false;
}

function getNonBossTitles(fam, elderTitle) {
    var titles = fam.titles;
    if (!titles || !titles.length) return [fam.name + "弟子"];
    var result = [];
    for (var i = 0; i < titles.length; i++) {
        var t = titles[i];
        if (isBossTitle(t)) continue;
        if (t === elderTitle || t === fam.name + elderTitle) continue;
        result.push(t);
    }
    if (!result.length) return [fam.name + "弟子"];
    return result;
}

function getElderTitle(fam) {
    // Gaibang: 掌门=帮主, 长老=副帮主
    if (fam.id === "GAIBANG") return "丐帮副帮主";
    return fam.name + "长老";
}

function getTitleByLevel(fam, level) {
    if (level >= 4) return getElderTitle(fam);

    var elderTitle = getElderTitle(fam);
    var titles = getNonBossTitles(fam, elderTitle);
    var ratio = 1 - (level / 3);
    var index = Math.floor(ratio * (titles.length - 1));
    return titles[index];
}

function getFamilyWeapon(fam) {
    switch (fam.id) {
        case "GAIBANG": return "staff";
        case "SHAOLIN": return "weapon";
        case "XIAOYAO": return "glove";
        default: return "sword";
    }
}

function stripColor(text) {
    return (text || "").replace(/<[^>]*>/g, '');
}

this.init_from = function (fam, level) {
    if (!fam) return;
    level = Math.min(4, Math.max(0, level || 0));

    var color = LEVEL_COLORS[level];
    var stats = LEVEL_STATS[level];
    var skillMult = SKILL_MULT[level];

    var title = getTitleByLevel(fam, level);
    this.title = "<" + color + ">" + title + "</" + color + ">";

    this.family = fam;
    this.name = UTIL.random_name(this.gender);

    this.desc = (this.gender == 2 ? "她" : "他") + "是" + fam.name + "的一名" + title + "，正在参与门派之战。";

    this.on_died = fam.on_npc_die;

    this.max_hp = this.hp = stats.hp;
    this.max_mp = this.mp = stats.mp;
    this.str = stats.str;
    this.con = stats.con;
    this.dex = stats.dex;
    this.int = stats.int;
    this.per = 18 + level * 5;

    this.record_damage = true;
    this.sum_damages = 0;
    this.damages = {};

    this.grade = level + 1;

    var skills = fam.npc_skills;
    if (level >= 3 && fam.boss_skills) skills = fam.boss_skills;

    if (skills) {
        var scaledSkills = [];
        for (var i = 0; i < skills.length; i++) {
            var s = skills[i];
            var scaledLevel = Math.floor(s[1] * skillMult);
            if (s[2]) {
                scaledSkills.push([s[0], scaledLevel, s[2]]);
            } else {
                scaledSkills.push([s[0], scaledLevel]);
            }
        }
        this.skill_map.apply(this, scaledSkills);
    } else {
        this.no_refresh = true;
        return;
    }

    this.init_skill();
    this.recount();
    this.hp = this.max_hp;
    this.mp = this.max_mp;

    var dropGrade = level + 1;
    var weaponType = getFamilyWeapon(fam);
    var eqTypes = ["cloth", "head", "shoes", "waist", "wrist"];
    if (weaponType) eqTypes.push(weaponType);

    this.drop_list = [];
    for (var i = 0; i < eqTypes.length; i++) {
        this.drop_list.push({
            obj: "eq/lv" + dropGrade + "/" + fam.id.toLowerCase() + "/" + eqTypes[i],
            odds: 1500,
            min: 1,
            max: 1,
        });
    }
    this.is_drop = true;
    this.no_refresh = true;

    var self = this;
    this.on_enter = function (me) {
        if (!me || !me.is_player) return;
        if (self.query_enemy() === me) return;
        if (!me.family || !self.family) return;
        if (me.family.id === self.family.id) return;
        if (self.family.battle_family !== me.family.id) return;
        if (self.grade < me.level) return;
        self.do_kill(me);
    };

    this.on_die = function (killer) {
        if (!killer || !killer.is_player) return;
        if (!killer.family || !self.family) return;
        if (killer.family.id === self.family.id) return;
        if (killer.family.battle_family !== self.family.id) return;
        if (self.grade < killer.level) {
            killer.notify("<cyn>" + self.name + "实力太弱，你不屑于下杀手。</cyn>");
            return false;
        }
    };
};

// Export stripColor for boss title use
this._stripColor = stripColor;
