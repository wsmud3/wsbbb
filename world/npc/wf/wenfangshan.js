this.inherits(NPC);
this.set({
    name: "温方山",
    desc: "温家五兄弟个个身材魁梧，面目凶恶。五人自幼一起习武，彼此心意相通，组成五行八卦阵后更是威力倍增，令人闻风丧胆。",

    gender: 1,
    age: 38,
    hp: 66500,
    max_hp: 66500,
    mp: 38500,
    max_mp: 38500,
    score: 21,
    gj: 7770,
    fy: 5069,
    mz: 8316,
    ds: 4787,
    zj: 600
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv0/shoes", 1, 1,
    "eq/lv3/qimeigun", 1, 1
]);
this.skill_map(
    ["dodge", 992],
    ["parry", 992],
    ["force", 992],
    ["unarmed", 992],
    ["club", 992],
    ["wuduyanluobu", 992, "dodge"],
    ["wudushengong", 992, "force"],
    ["baguaquan", 992, "unarmed"],
    ["staff", 992],
    ["baguagunfa", 992, "staff"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#baguaquan", "book/bc#baguagunfa"],
    odds: 47872
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/shoes"],
    odds: 3840
}, {
    obj: ["eq/lv3/qimeigun"],
    odds: 9600
});
this.on_enter = function (me) {
    me.notify("温方达喝道：来者何人！留下命来！");
    this.do_kill(me);
};

this.on_died = function (killer, corpse) {
    if (!killer || !killer.is_player) return;
    var room = this.environment;
    if (!room) return;
    var alive = 0;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
    }
    if (alive === 0) {
        killer.set_temp("wf_zhen_done", 1, 7200000);
        killer.notify("<hiy>温家五老尽数伏诛，阵法已破。再去点一次木桩。</hiy>");
    }
};
