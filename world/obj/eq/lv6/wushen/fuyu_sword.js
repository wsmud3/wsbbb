this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "覆雨剑",
    desc: "浪翻云的随身配剑，长达四尺九寸。剑身如水般流转不定，挥动时带起漫天水雾，仿佛洞庭湖的烟雨都被凝于此剑之中。\n特效：覆雨：攻击时召唤剑雨，对敌人造成额外水属性伤害。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 5,
    is_shortcut: true,
    prop: {
        gj: 1980,
        mz: 440,
        mz_per: 17,
        add_sh_per: 17,
        gjsd_per: 20,
    },
});

// 覆雨：30% 几率追加剑雨伤害。返回值并入本次攻击的伤害，走正常的部位、增伤、暴击与伤害显示流程。
this.do_attack = function (me, target, par) {
    if (target && target.hp > 0 && Math.random() < 0.3) {
        var extraDmg = Math.floor(me.gj * 0.3);
        if (extraDmg > 500000) extraDmg = 500000;
        if (extraDmg > 0) {
            me.send_combat("<HIB>覆雨剑上水汽弥漫，剑雨如注！</HIB>\n", target);
            return extraDmg;
        }
    }
    return 0;
};
