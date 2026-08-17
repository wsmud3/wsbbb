this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "罗汉帽",
    desc: "一顶镶有宝石的罗汉帽，佛光流转，护佑心神。",
    grade: 4,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, max_hp: 3500, con: 20, str: 25 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
