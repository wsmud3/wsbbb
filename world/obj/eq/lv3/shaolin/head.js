this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "罗汉帽",
    desc: "一顶厚布僧帽，帽额镶有铜制佛徽，护佑心神。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { fy: 142, str: 15, max_hp: 1500 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
