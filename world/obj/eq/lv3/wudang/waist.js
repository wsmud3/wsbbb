this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "真武腰带",
    desc: "一条精铁镶边的腰带，武当弟子佩戴，束腰运气，内力流转自如。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { fy: 142, con: 15, str: 10 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
