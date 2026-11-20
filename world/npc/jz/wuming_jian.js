// 剑道传承殿的「无名剑」：以 NPC 形式提供剑冢五关的重温（扫荡），不进入试炼，只扫荡一次 / 十次，消耗精力。
this.inherits(NPC);
this.set({
    name: "无名剑", gender: 0, age: 0,
    desc: "一柄无名之剑斜插在石缝里，剑身古朴，不见锋芒。凝视良久，剑冢五关的种种似又在眼前重现。",
    hp: 1000000, max_hp: 1000000, mp: 1000000, max_mp: 1000000,
    no_fight: true, no_refresh: true
});
this.add_action("jz_sweep", "重温试炼", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.offer_sweep(me) : false;
});
this.on_before_fight = function () { return false; };
this.on_kill = function () { return false; };
