this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "魔龙战甲",
    desc: "魔龙皮所制的甲胄，防御力惊人",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "wushen_molong_set",
    prop: { fy: 605, str: 55, fy_per: 5, diff_sh_per: 5, diff_bj: 5 },
});
this.group_prop = function (count) {
    if (count >= 4) return { gj_per: 10, mz_per: 10, zj_per: 10, ds_per: 10, fy_per: 10 };
    return null;
};
