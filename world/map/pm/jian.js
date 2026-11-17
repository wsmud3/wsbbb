this.inherits(ROOM);
this.name = "百丈涧";
this.desc = "山道到此突然消失，在你面前是一条山涧，山涧之中云雾缭绕，你根本无法看清对面。一条<cmd cmd='look tiesuo'>铁索(tiesuo)</cmd>深入云中，旁边有一块<cmd cmd='look bei'>石碑</cmd>。";
this.exits = {
    "southdown": "pm/yan"
};
this.set_npc([]);

// 原版机制（攻略第 26 节）：杀完乌老大/不平道人后，过铁索桥去李秋水那边。
// 目标房间 id 已按原版改为 pm/xianchou。
this.set_item("tiesuo", "铁索桥", "一条横跨深涧的铁索，山风一吹便晃晃悠悠。", [
    ["guoqiao", "过铁索桥", function (me) {
        if (!me.is_player) return true;
        // 背着童姥时状态被躺尸/复活清掉的，先补回背负减益再判定
        if (this.parent && this.parent.pm_ensure_carry_status) this.parent.pm_ensure_carry_status(me);
        // 面板闪避（含身法、ds_per 等加成）；原先读的是装备原始加成 query_prop("ds")
        var ds = Math.floor(me.ds || 0);
        if (ds < 10000) {
            me.notify("<red>铁索在风里晃得厉害，你的闪避（" + ds + "）不足 10000，踏上去就要掉下去。</red>");
            return true;
        }
        me.moveto("pm/xianchou", me.name + "踏索而过。", me.name + "从铁索桥上落了地。");
        me.notify("<hig>你稳稳当当走过了铁索桥。</hig>");
        return true;
    }]
]);

// 描述里有 look bei，原先没有对应物件，点了只会回「你要看什么？」
this.set_item("bei", "石碑", "涧边一块石碑，字迹已被风雨侵蚀得模糊不清，隐约能认出「百丈涧」三字。", []);
