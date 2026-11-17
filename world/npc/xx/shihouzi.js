this.inherits(NPC);
this.set({
    name: "狮吼子",
    desc: "星宿派二师兄，此人功力深厚，是三阴蜈蚣爪的传人。",
    gender: 1,
    age: 31,
    per: 7,
    hp: 613200,
    max_hp: 613200,
    mp: 130400,
    max_mp: 130400,
    score: 160,
    gj: 25237,
    fy: 13141,
    mz: 27097,
    ds: 18028,
    zj: 533
});
this.skill_map(
    ["dodge", 2409],
    ["parry", 2332],
    ["force", 2409],
    ["unarmed", 2409],
    ["sanyinwugongzhao", 2409, "unarmed"],
    ["huagongdafa", 2458, "force"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#sanyinwugongzhao", "book/bc#huagongdafa"],
    odds: 8850
});

// 原版机制（攻略第 21 节）：必须击杀二师兄狮吼子，才能进日月洞打星宿老怪丁春秋。
// 门禁看 xx/xxh1 里狮吼子是否还活着（见 xx/xxh1 on_leave），这里只做提示，
// 不再往玩家身上挂 2 小时的 xx_shihouzi（无人读取、还会跨副本残留）。
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("狮吼子怒吼道：想过此处，先接我一招三阴蜈蚣爪！");
    this.do_kill(me);
};
this.on_died = function (killer, corpse) {
    if (killer && killer.is_player) {
        killer.notify("<hiy>狮吼子一倒，日月洞口再无人阻拦。洞里隐隐飘出一股药香。</hiy>");
    }
};
