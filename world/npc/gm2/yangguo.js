this.inherits(NPC);
this.set({
    name: "杨过",
    desc: "独臂大侠杨过，虽然身有残疾，但武功盖世。黯然销魂掌和玄铁剑法威震天下。",
    title: "<hiy>神雕大侠</hiy>",
    gender: 1,
    age: 30,
    per: 26,
    hp: 5572000,
    max_hp: 5572000,
    mp: 946000,
    max_mp: 946000,
    score: 0,
    gj: 273000,
    fy: 157300,
    mz: 269500,
    ds: 154550,
    zj: 2925
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 5725],
    ["parry", 4375],
    ["force", 5725],
    ["sword", 5575],
    ["unarmed", 4900],
    ["xuantiejianfa", 5575, "sword"],
    ["anranxiaohunzhang", 4900, "unarmed"]
);
this.set_drop(
    {obj: "money/silver", min: 40, max: 400},
    {obj: ["book/bc#xuantiejianfa"], odds: 13750},
    {obj: ["book/bc#anranxiaohunzhang"], odds: 13750},
    {obj: ["eq/lv4/bingpoyinzhen"], odds: 8250}
);
// 攻略第 30 节：杨过「只能昏迷!!!」——杀不死；醒着时拦在琴室暗道口，要先把他打昏才能下暗河。
// 之后在平台推石块时他会赶来，用「海潮汹涌」考校玩家（见 world/map/gm2/pingtai.js）。
// 锁血用 min_hp：扣血到 1 为止、不进死亡判定，昏迷才能打得上
// （原先只靠 on_die 拒死，致命一击先把气血打到 0 以下，同招的昏迷被 add_status 拒掉）
this.min_hp = 1;
this.on_enter = function (me) { };
this.on_kill = function (me) {
    if (!me || !me.is_player) return true;
    var room = this.environment;
    var xln = room && room.find_obj_bypath && room.find_obj_bypath("gm2/xiaolongnv");
    if (xln && xln.hp > 0 && !xln.is_fighting(me)) {
        xln.gm2_hurt = true;
        xln.call_out(function () {
            if (xln.hp <= 0 || !me.environment || xln.environment !== me.environment || me.hp <= 0) return;
            if (xln.environment.send_room) xln.environment.send_room("<hiy>小龙女玉手轻扬，银索金铃如灵蛇般向你卷来！</hiy>");
            xln.do_kill(me);
        }, 1500);
    }
    return true;
};
this.on_die = function (killer) {
    if (this.environment && this.environment.send_room)
        this.environment.send_room("<hiy>杨过身形一晃，独臂撑地又站了起来。</hiy>");
    return false;
};
this.on_leave = function (me, dir) {
    if (!me || !me.is_player || dir !== "down" || this.hp <= 0) return true;
    var room = this.environment;
    if (!room || room.path !== "gm2/qinshi") return true;
    if (this.is_faint) return true;
    me.notify("<hir>杨过横剑拦在暗道口：「古墓重地，岂容你下去！」</hir>");
    return false;
};
