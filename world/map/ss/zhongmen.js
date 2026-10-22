this.inherits(ROOM);
this.name = "中门";
this.desc = "这里是峻极禅院通往后庭的中门，门厚三寸，红松铜箍，门上两幅门神经多年风雨，多有剥落，现下颜色尚新，想来是嵩山派新近油漆了的。外派人士到此就该回头了。";
this.exits = {
    "north": "ss/huimengtang",
    "south": "ss/chanyuan",
};
this.set_npc([]);

// 原版机制（攻略第 17 节）：第一次打 1 个太保，第二次 2 个，第三次 3 个，第四次 4 个，
// 四个太保打完最后打左冷禅（左冷禅在会盟堂）。
var TAIBO = ["ss/dengbagong", "ss/shatianweng", "ss/tangyinge", "ss/bochen"];
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("ss_wave")) return;
    me.set_temp("ss_wave", 1, 7200000);
    this.spawn_wave(me, 1);
};
this.spawn_wave = function (me, n) {
    var names = TAIBO.slice(0, n);
    this.send_room("$N一声长啸，嵩山太保应声而出！");
    for (var i = 0; i < names.length; i++) {
        var e = NPC.CREATE(names[i], this);
        if (e) e.do_kill(me);
    }
    me.notify("<hir>第 " + n + " 波：共 " + n + " 个嵩山太保。</hir>");
};
