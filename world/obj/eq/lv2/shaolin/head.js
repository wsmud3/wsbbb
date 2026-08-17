this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "罗汉帽",
    desc: "一顶厚布僧帽，帽顶嵌有一枚佛门舍利，隐隐有佛光流转。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "sl_set_lv2",
    prop: { fy: 76, str: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 3, diff_sh_per: 3 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
