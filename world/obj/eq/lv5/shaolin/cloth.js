this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "罗汉僧袍",
    desc: "传说中的佛门宝甲，金丝天蚕编织，水火不侵，佛光普照。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 420, hp_per: 2, str: 35, con: 30, diff_sh_per: 3 },
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 10, diff_sh_per: 10 };
    if (count >= 3) return { max_hp: 100 };
    return null;
};
