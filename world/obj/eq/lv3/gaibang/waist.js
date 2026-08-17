this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "混天腰带",
    desc: "一条精铁镶边的腰带，丐帮弟子束腰运气，刚柔并济。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { fy: 142, str: 15, con: 15 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
