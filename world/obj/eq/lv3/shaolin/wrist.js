this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉护腕",
    desc: "一对精铁打造的护腕，腕扣上刻有金刚经，护身增力。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { fy: 112, str: 15, max_hp: 1500 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
