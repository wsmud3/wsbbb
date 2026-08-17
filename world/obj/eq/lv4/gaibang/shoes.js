this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天麻鞋",
    desc: "一双疾风般的混天麻鞋，踏雪无痕，追风逐电。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 231, max_hp: 3500, dex: 20, con: 25 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
