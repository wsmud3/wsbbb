
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "轩辕剑",
    desc: "传说中的神器，由众神采首山之铜为黄帝所铸，以此击杀蚩尤，剑身一面刻日月星辰，一面刻山川草木。"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 5,
    is_shortcut: true,
    prop: {
        gj: 1936,
        int: 440,
        mz_per: 17,
        add_sh_per: 17,
        distime_per: 20,
        desc: "圣道：每次攻击触发圣道，提升全部属性10%，最多叠加10层"
    },
});

this.do_attack = function (me, target, par) {
    if (target.hp > 0) {
        me.add_status({
            id: "wushen_xuanyuan",
            name: "圣道",
            desc: "提升你全部属性",
            duration: 6000,
            downside: false,
            override: 1,
            count: 1,
            max_count: 10,
            prop: {
                gj_per: 10,
                fy_per: 10,
                ds_per: 10,
                zj_per: 10,
                mz_per: 10,
            },
            start_msg: "\n<HIZ>$N的轩辕剑泛起金色圣光，战力节节攀升！</HIZ>",
            finish_msg: "$N身上的圣道光芒渐渐消散。",
        });
    }
    return 0;
};
