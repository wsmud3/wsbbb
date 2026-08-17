
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "地候",
    desc: "一人多高的大斧，似如破铜烂铁，但阵阵杀意却直冲脑海\n特效：地候：暴击时附加目标2%最大气血的伤害"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    prop: {
        gj: 2178,
        str: 484,
        gj_per: 17,
        add_sh_per: 17,
        diff_fy_per: 20,
    },
});

this.do_attack = function (me, target, par) {
    if (target.hp > 0 && par && par.is_cirt) {
        var dmg = Math.floor(target.max_hp * 2 / 100);
        if (dmg > 0) {
            target.from_attack(dmg, 999999, null,
                "<HIZ>$N的地候巨斧碎骨一击，$n骨骼尽碎！</HIZ>");
        }
    }
    return 0;
};
