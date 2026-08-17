
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "昊天靴",
    desc: "华山至宝，追风踏月\n特效：追风：激活后清除自身异常状态，10秒内免疫所有控制效果"
    ,
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        fy: 1496,
        dex: 440,
        diff_downside_per: 13,
        gjsd_per: 13,
        add_sh_per: 13,
    },
});

this.on_use = function (me) {
    me.clear_downside(true);
    me.add_status({
        id: "wushen_haotian",
        name: "追风",
        desc: "免疫所有控制效果",
        duration: 10000,
        override: 2,
        ig_control: true,
        start_msg: "\n<HIZ>$N脚踏昊天靴，一声清啸，所有异常烟消云散，身形快若闪电！</HIZ>",
        finish_msg: "$N身上的追风之力渐渐消散。",
    });
    return true;
};
