this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "火猊斗篷",
    desc: "火红的火猊皮毛所制的斗篷，防风御寒",
    unit: "件",
    eq_type: EQUIP_TYPE.CAPE,
    hole_count: 4,
    group_name: "wushen_molong_set",
    prop: { fy: 504, zj_per: 5, con: 44, add_sh_per: 2, diff_sh: 1100 },
});
this.group_prop = function (count) {
    if (count >= 4) return { gj_per: 10, mz_per: 10, zj_per: 10, ds_per: 10, fy_per: 10 };
    return null;
};
