this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "罗汉僧鞋",
    desc: "传说中的佛门神行靴，踏云而行，如履平地。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 320, str: 45, dex: 40, hp_per: 3 },
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 10, diff_sh_per: 10 };
    if (count >= 3) return { max_hp: 100 };
    return null;
};
