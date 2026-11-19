
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "盘古斧",
    desc: "传说中盘古开天辟地时候使用的一把斧头，可以作为大剑使用\n特效：残缺：每次攻击降低敌人战斗属性30%，持续10秒"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    is_shortcut: true,
    prop: {
        gj: 1958,
        str: 440,
        add_sh_per: 20,
        diff_fy_per: 17,
        add_bjsh_per: 53,
    },
});

// 残缺：降低目标 30% 攻击、攻速，延长其绝招冷却 30%，降低其破防与免伤。
// distime_per 正值是缩短冷却，所以延长要写负值（旧版写反了）。NPC 的攻击现在也会吃 gj_per 减益（见 CHARACTER.recount）。
this.do_attack = function (me, target, par) {
    if (target.hp > 0) {
        var prop = {
            gj_per: -30,
            gjsd_per: -30,
            distime_per: -30,
            diff_fy_per: -30,
            diff_sh_per: -30,
        };
        target.add_status({
            id: "wushen_pangu",
            name: "<HIZ>残缺</HIZ>",
            desc: "降低你战斗属性",
            duration: 10000,
            downside: true,
            override: 2,
            prop: prop,
            start_msg: "\n<HIZ>$N被盘古斧的威势压制，战力大幅下降！</HIZ>",
            finish_msg: "$N从盘古斧的压制中恢复。",
        }, me);
    }
    return 0;
};
