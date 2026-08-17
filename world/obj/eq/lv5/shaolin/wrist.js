this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "罗汉护腕",
    desc: "传说中的佛门金刚护腕，紫金铸就，护体增力，坚不可摧。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 305, str: 35, con: 30, hp_per: 3 },
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 10, diff_sh_per: 10 };
    if (count >= 3) return { max_hp: 100 };
    return null;
};
