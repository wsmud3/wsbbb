this.inherits(ROOM);
this.name = "断魂崖";
this.desc = "这是通向[灵鹫宫]的必经之路，一条小道蜿蜒曲折地通向缥缈峰顶。路的右侧是一条陡峭的山崖，一阵山风吹过，你似乎听见从下面传来几声惨号，你心中一凛，不禁加快脚步赶紧离开这里。";
this.exits = {
    "northup": "pm/shizuyan",
    "southdown": "pm/shanjiao"
};
this.set_npc(["pm/auto_1", 1], ["pm/bupingdaoren", 1], ["pm/auto_3", 1]);

// 原版机制（攻略第 26 节）：杀完乌老大/不平道人后，过铁索桥去李秋水那边。
// 过桥硬性需求 10000 闪避（背负女童后四维 -100%，所以要提前满足）。
this.set_item("tiesuo", "铁索桥", "一条横跨深涧的铁索，山风一吹便晃晃悠悠。", [
    ["guo qiao", "过铁索桥", function (me) {
        var ds = me.query_prop ? me.query_prop("ds") : 0;
        if (ds < 10000) {
            me.notify("<red>铁索在风里晃得厉害，你的闪避（" + ds + "）不足 10000，踏上去就要掉下去。</red>");
            return true;
        }
        me.set_temp("pm_tiesuo", 1, 7200000);
        me.moveto("pm/xianchoumen", me.name + "踏索而过。", me.name + "从铁索桥上落了地。");
        me.notify("<hig>你稳稳当当走过了铁索桥。</hig>");
        return true;
    }]
]);
