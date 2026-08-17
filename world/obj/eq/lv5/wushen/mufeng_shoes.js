this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "木凤羽靴",
    desc: "木凤的羽毛做的靴子，轻便耐用",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "wushen_molong_set",
    prop: { fy: 528, ds: 440, dex: 55, ds_per: 5, diff_downside_per: 5 },
});
this.group_prop = function (count) {
    if (count >= 4) return { gj_per: 10, mz_per: 10, zj_per: 10, ds_per: 10, fy_per: 10 };
    return null;
};
