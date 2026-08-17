
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "太阴",
    desc: "一柄通体暗紫的小剑，剑身上处处布满碎痕，弥漫着阵阵寒意，似乎冻结着周围的时间。\n特效：太阴：使用后减缓敌人攻击速度和冷却时间60秒"
    ,
    unit: "枚",
    eq_type: EQUIP_TYPE.THROWING,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        gj: 924,
        dex: 242,
        diff_fy_per: 8,
        add_bjsh_per: 11,
        bj_per: 13,
    },
});

this.on_use = function (me) {
    var target = me.query_enemy();
    if (!target) return me.notify("你当前没有战斗目标。");
    target.add_status({
        id: "wushen_taiyin",
        name: "<HIZ>太阴</HIZ>",
        desc: "你的攻击速度和冷却时间减缓了",
        duration: 60000,
        downside: true,
        no_diff: true,
        override: 2,
        prop: {
            gjsd_per: -20,
            distime_per: 20,
        },
        start_msg: "\n<HIZ>$n被太阴的寒冰之力笼罩，动作变得极为缓慢！</HIZ>",
        finish_msg: "$N身上的太阴之力渐渐消退。",
    }, me);
    return true;
};
