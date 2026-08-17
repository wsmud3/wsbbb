this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "金狴骨冠",
    desc: "似乎是金狴的头骨所制，看上去有些吓人",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "wushen_molong_set",
    prop: { fy: 462, int: 55, distime_per: 5, expend_mp_per: 5, bj_per: 3 },
});
this.group_prop = function (count) {
    if (count >= 4) return { gj_per: 10, mz_per: 10, zj_per: 10, ds_per: 10, fy_per: 10 };
    return null;
};
