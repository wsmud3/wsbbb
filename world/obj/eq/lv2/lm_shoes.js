this.inherits(EQUIPMENT);
this.set({
    name: "龙纹靴",
    desc: "鞋面用黑龙筋编织出防滑纹路",
    unit: "件",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    prop: {
        fy: 21,
        int: 10
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
