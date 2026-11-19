this.inherits(EQUIPMENT);
this.set({
    name: "龙纹剑",
    desc: "黑色不明材质打造，通体龙纹鳞甲",
    unit: "把",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 2,
    prop: {
        gj: 80,
        int: 10,
        add_sh_per: 2
    }
});
this.group_name = "lm2";
// 档位表：穿到 3 件得三件档，穿到 5 件再加五件档（两档累计，见 EQUIPMENT.normalize_group）
this.group_prop = function (count) {
    if (count >= 5) {
        return {
            lianxi_per: 15,
            dazuo_per: 15
        };
    }
    if (count >= 3) {
        return {
            int: 10
        };
    }
}
