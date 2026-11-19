this.inherits(EQUIPMENT);
this.set({
    name: "龙纹玉佩",
    desc: "墨玉质地，表面刻着盘旋的五爪金龙，龙鳞纹路清晰可辨。",
    unit: "块",
    grade: 2,
    eq_type: EQUIP_TYPE.JEWELS,
    hole_count: 1,
    prop: {
        study_per: 10,
        int: 12
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
