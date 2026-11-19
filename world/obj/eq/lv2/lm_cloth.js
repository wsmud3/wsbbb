this.inherits(EQUIPMENT);
this.set({
    name: "龙纹服",
    desc: "以黑龙皮鞣制而成的紧身劲装，表面覆盖着细密的黑色鳞片，阳光下泛着暗紫色光泽。",
    unit: "件",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    prop: {
        fy: 30,
        int: 10,
        lianxi_per: 8
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
