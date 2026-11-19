
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "荧惑",
    desc: "长三尺九寸，刀身漆黑如幽冥，刀刃间隐隐有血光流动\n特效：噬血：使用后5秒内，对敌人造成伤害的50%转为自身气血、50%转为自身内力"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        gj: 1980,
        str: 330,
        bj_per: 20,
        diff_fy_per: 17,
        add_bjsh_per: 31,
    },
});

// 噬血：以状态本身为准（旧版 temp 名带换行符，读不到，特效从未生效）。
// 吸收按这一击实际造成的伤害结算：攻击结束后由 CHARACTER.on_attack_over 转给武器。
var ABSORB_PER = 50; // 实际伤害的 50% 转为气血、50% 转为内力
this.on_use = function (me) {
    if (me.query_status("wushen_yinghuo")) {
        me.notify("你已经在荧惑的嗜血状态中了。");
        return false;
    }
    if (me.temp && me.temp["\nwushen_yinghuo"]) me.remove_temp("\nwushen_yinghuo");

    me.add_status({
        id: "wushen_yinghuo",
        name: "嗜血",
        desc: "将造成的伤害吸收为气血内力",
        duration: 5000,
        override: 2,
        no_clear: true,
        start_msg: "<HIZ>$N手中荧惑刀身血光大盛，进入嗜血状态！</HIZ>",
        finish_msg: "$N身上的血光渐渐消散。",
    });
    return true;
};

this.on_attack_over = function (me, target, par, sh) {
    if (!(sh > 0) || !me.query_status("wushen_yinghuo") || !(me.hp > 0)) return;
    var v = Math.floor(sh * ABSORB_PER / 100);
    if (!(v > 0)) return;
    me.add_hp(v);
    me.add_mp(v);
};
