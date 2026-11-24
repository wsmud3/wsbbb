
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "长庚",
    desc: "一副古朴的拳套，毫无光泽，只是望着便有肃杀之感"
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
        desc: "战意：每次攻击触发战意，增加5%破防和终伤，最多叠加5层",
    },
});

// 战意：拳套的 do_attack 引擎只在带 no_weapon 的绝招里调用，普攻不调用，
// 所以改用攻击结束后的 on_attack_over（普攻、绝招都会调用，见 CHARACTER.on_attack_over）。
// 每次命中（未被闪开、招架）叠一层；叠满后继续命中刷新持续时间。
var ZY_ID = "wushen_changgeng";
this.on_attack_over = function (me, target, par, sh) {
    if (!target || !(target.hp > 0) || par.is_dodge || par.is_parry) return;
    if (EQUIPMENT.refresh_full_stack(me, ZY_ID)) return;
    me.add_status({
        id: ZY_ID,
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
};
