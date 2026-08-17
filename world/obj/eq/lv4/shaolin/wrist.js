this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉护腕",
    desc: "一对精铁铸就的护腕，内刻金刚伏魔咒，护身增力。",
    grade: 4,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 208, max_hp: 3500, con: 20, str: 25 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
