this.inherits(NPC);
this.set({
    name: "天山童姥",
    desc: "一个看似八九岁女童的人物，实则是天山缥缈峰灵鹫宫主人，武功深不可测。她瞥了你一眼：『小子，背我过去，李秋水那贱人就在前面！』",
    gender: 2,
    age: 96,
    per: 8,
    hp: 104000,
    max_hp: 104000,
    mp: 15000,
    max_mp: 15000,
    score: 70,
    gj: 5200,
    fy: 2968,
    mz: 4160,
    ds: 2120,
    zj: 1620,
    no_fight: true
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 560],
    ["parry", 540],
    ["force", 560],
    ["unarmed", 560],
    ["lingboweibu", 2616, "dodge"],
    ["liuyangzhang", 2616, "unarmed"],
    ["bulaochangchungong", 560, "force"],);

// NPC自身动作：背负童姥
this.actions = {};
this.actions["carry_tonglao"] = { name: "背负童姥" };

this.on_create = function() {
    this.actions = {};
    this.actions["carry_tonglao"] = { name: "背负童姥" };
};

// 在李秋水战斗中死亡 = 任务失败
this.on_die = function(killer) {
    var room = this.environment;
    if (room) {
        for (var i = 0; i < room.items.length; i++) {
            var p = room.items[i];
            if (p && p.is_player) {
                p.notify('<red>天山童姥被李秋水杀死了！保护任务失败……</red>');
                // 将童姥的分数结算给玩家，防止NPC击杀NPC时分数丢失
                p.add_fbscore(this.score || 70);
            }
        }
    }
    // 清空自身分数，防止NPC.die通用逻辑向NPC killer重复加分（NPC.query_teamid()返回null会导致加分静默失败）
    this.score = 0;
};
