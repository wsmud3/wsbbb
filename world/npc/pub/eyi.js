
this.inherits(NPC);
this.set({
    name: "",
    desc: "他是妖族巢穴的守护者，妖气冲天，目露凶光。",
    title: "妖族",
    gender: 1,
    age: 30,
    per: this.random(50),
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    no_refresh: true,
    no_fight: true
});

this.init_from = function (player, level, npcCount) {
    var isHighFloor = level >= 300;
    var isVeryHighFloor = level >= 500;
    npcCount = npcCount || 1;

    if (isHighFloor) {
        // 300层+：基础属性 = 层数 × 20
        this.con = this.dex = this.int = this.str = level * 20;
    } else {
        var base = parseInt(100 * Math.pow(level, 1.65));
        this.con = this.dex = this.int = this.str = base;
    }

    var names = ["腾蛇", "穷奇", "混沌", "金狴", "饕餮", "梼杌", "朱厌", "蛊雕", "九婴", "封豨", "凿齿", "大风", "修蛇", "猰貐"];
    // Avoid duplicate names on same floor
    var usedNames = player._eyi_used_names;
    if (!usedNames) player._eyi_used_names = usedNames = [];
    var available = [];
    for (var i = 0; i < names.length; i++) {
        if (!usedNames.contain(names[i])) available.push(names[i]);
    }
    if (!available.length) {
        // All names used, fall back to pool with suffix
        available = names;
    }
    var chosen = available[this.random(available.length)];
    usedNames.push(chosen);
    this.name = chosen;

    // Pick a random weapon type or unarmed
    var weaponTypes = ["unarmed", "sword", "blade", "club", "staff", "whip"];
    var weaponType = weaponTypes.random();

    // Helper: pick high-grade skills when available; grade6 skills are unique per floor
    var usedGrade6 = player._eyi_used_grade6;
    if (!usedGrade6) player._eyi_used_grade6 = usedGrade6 = [];

    var pickSkill = function (skillList) {
        if (!skillList.length) return null;
        if (isVeryHighFloor) {
            var highGrade = [];
            for (var i = 0; i < skillList.length; i++) {
                var si = WORLD.SKILLS[skillList[i]];
                if (!si || !si.grade || si.grade < 4) continue;
                // grade6技能本层唯一，已出现的排除
                if (si.grade >= 6 && usedGrade6.contain(skillList[i])) continue;
                highGrade.push(skillList[i]);
            }
            if (highGrade.length) {
                var picked = highGrade[Math.floor(Math.random() * highGrade.length)];
                var pk = WORLD.SKILLS[picked];
                if (pk && pk.grade && pk.grade >= 6) usedGrade6.push(picked);
                return picked;
            }
        }
        return skillList[Math.floor(Math.random() * skillList.length)];
    };

    // Collect all available skills from WORLD.SKILLS
    var forceSkills = [], dodgeSkills = [], parrySkills = [], weaponSkills = [], unarmedSkills = [];

    for (var id in WORLD.SKILLS) {
        var sk = WORLD.SKILLS[id];
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (sk.is_hidden) continue;
        if (!sk.can_enables || sk.can_enables.length === 0) continue;

        if (sk.can_enables.contain("force")) forceSkills.push(id);
        if (sk.can_enables.contain("dodge")) dodgeSkills.push(id);
        if (sk.can_enables.contain("parry")) parrySkills.push(id);
        if (sk.can_enables.contain(weaponType)) weaponSkills.push(id);
        if (sk.can_enables.contain("unarmed")) unarmedSkills.push(id);
    }

    var forceSkill = pickSkill(forceSkills);
    var dodgeSkill = pickSkill(dodgeSkills);
    var parrySkill = pickSkill(parrySkills);
    var weaponSkill = pickSkill(weaponSkills);
    var unarmedSkill = pickSkill(unarmedSkills);

    // Skill level scales with floor: 300+ uses slower scaling
    var skillLv = isHighFloor ? (500 + level * 10) : (500 + level * 100);
    var baseSkillLv = skillLv;

    // Build skill array
    var skillArgs = [
        ["force", baseSkillLv], ["dodge", baseSkillLv], ["parry", baseSkillLv]
    ];

    if (weaponType !== "unarmed") {
        skillArgs.push([weaponType, baseSkillLv]);
    }
    skillArgs.push(["unarmed", baseSkillLv]);

    if (forceSkill) skillArgs.push([forceSkill, skillLv, "force"]);
    if (dodgeSkill) skillArgs.push([dodgeSkill, skillLv, "dodge"]);
    if (parrySkill) skillArgs.push([parrySkill, skillLv, "parry"]);
    if (weaponSkill) skillArgs.push([weaponSkill, skillLv, weaponType]);
    if (unarmedSkill) skillArgs.push([unarmedSkill, skillLv, "unarmed"]);

    this.skill_map.apply(this, skillArgs);

    var rankName = npcCount >= 3 ? "妖神" : "妖族";
    var color = "hio";
    if (level >= 100) color = "ord";
    else if (level >= 50) color = "hiz";
    else if (level >= 20) color = "hiy";
    else if (level >= 10) color = "hic";
    else if (level >= 5) color = "hig";
    this.title = "<" + color + ">" + rankName + "</" + color + ">";

    this.set_objects(['eq/lv0/cloth', 1, 1]);

    if (weaponType === "sword") this.set_objects(["eq/lv0/jian", 1, 1]);
    else if (weaponType === "blade") this.set_objects(["eq/lv0/dao", 1, 1]);
    else if (weaponType === "club") this.set_objects(["eq/lv0/qiang", 1, 1]);
    else if (weaponType === "staff") this.set_objects(["eq/lv0/gun", 1, 1]);
    else if (weaponType === "whip") this.set_objects(["eq/lv0/bian", 1, 1]);

    this.hp = this.max_hp = 5000 + level * level * 500;
    this.mp = this.max_mp = parseInt(this.hp / 2);

    if (isHighFloor) {
        // 300层+：战斗属性直接 = 100 × 层数^1.65
        var combatBase = parseInt(100 * Math.pow(level, 1.65));
        this.gj = this.fy = this.mz = this.ds = this.zj = combatBase;
        this.bj = parseInt(combatBase / 10);
    } else {
        this.add_prop("gj", base);
        this.add_prop("mz", base);
        this.add_prop("zj", base);
        this.add_prop("ds", base);
        this.add_prop("fy", base);
    }

    if (level >= 100) {
        this.add_prop("diff_sh", 150);
        this.add_prop("add_sh", 150);
        this.add_prop("diff_downside_per", 99);
    }

    // 500层后：免控 + 出招速度固定500ms
    if (level >= 500) {
        this.ig_control = 1;
    }

    // 1000层后：常驻混沌限伤（单次受伤不超过气血13%）
    if (level >= 1000) {
        this.eyi_hundun = 1;
    }

    this.init();
    this.recount();

    // 500层后出招速度强制为0.5秒（gjsd最低值500ms）
    if (level >= 500) {
        this.gjsd = 500;
    }
}
