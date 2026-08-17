this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "君子鞶带",
    desc: "一条精铁镶边的鞶带，华山弟子佩戴，君子佩玉，气度不凡。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { fy: 142, dex: 15, dazuo_per: 5 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
