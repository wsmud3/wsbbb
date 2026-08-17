this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光鞋",
    desc: "一双疾风般的曙光鞋，步履轻盈，如踏朝霞。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 290, dex: 21, con: 18, int: 20 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
