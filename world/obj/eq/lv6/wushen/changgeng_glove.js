
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "长庚",
    desc: "一副古朴的拳套，毫无光泽，只是望着便有肃杀之感\n特效：战意：每次攻击触发战意，增加5%破防和终伤，最多叠加5层"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.NONE,
    hole_count: 5,
    prop: {
        gj: 1936,
        str: 330,
        mz_per: 17,
        gjsd_per: 17,
        distime_per: 20,
    },
});

this.do_attack = function (me, target, par) {
    if (target.hp > 0) {
        me.add_status({
            id: "wushen_changgeng",
            name: "战意",
            desc: "增加破防终伤",
            duration: 10000,
            downside: false,
            override: 1,
            count: 1,
            max_count: 5,
            prop: {
                diff_fy_per: 5,
                add_sh_per: 5,
            },
            start_msg: "\n<HIZ>$N的战意越发高昂！</HIZ>",
            finish_msg: "$N的战意渐渐消退。",
        });
    }
    return 0;
};
