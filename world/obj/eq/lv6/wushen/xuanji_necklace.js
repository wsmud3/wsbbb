
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "璇玑",
    desc: "滉漾明光，仙之至宝"
    ,
    unit: "条",
    eq_type: EQUIP_TYPE.NECKLACE,
    hole_count: 5,
    prop: {
        str: 440,
        con: 440,
        dex: 440,
        int: 440,
        per: 8,
        desc: "不灭：当你受到致命一击时不会立即死亡，冷却10分钟",
    },
});

// 不灭：受到致命一击时不会立即死亡——保留 1 点气血，并获得 3 秒璇玑护体（几乎免疫伤害）。冷却 10 分钟。
// 由 CHARACTER.add_hp 在致命扣血前调用。
const XUANJI_CD = 600000;
this.on_fatal = function (me) {
    if (me.query_temp("wushen_xuanji_cd")) return false;
    me.set_temp("wushen_xuanji_cd", 1, XUANJI_CD);
    me.add_status({
        id: "wushen_xuanji",
        name: "璇玑护体",
        desc: "璇玑仙光护体，几乎免疫一切伤害",
        duration: 3000,
        override: 2,
        no_clear: true,
        ig_control: true,
        prop: {
            diff_sh_per2: 1080,
            diff_sh: 99999999,
        },
        start_msg: "<HIZ>致命一击袭来，$N周身浮现出璇玑仙光，北斗七星环绕护体！</HIZ>",
        finish_msg: "$N身上的璇玑仙光渐渐隐去。",
    });
    return true;
};
