this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉僧袍",
    desc: "天蚕丝编织而成的罗汉僧袍，刀枪不入，佛光护体。",
    grade: 4,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 320, max_hp: 4500, con: 20, str: 25 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
