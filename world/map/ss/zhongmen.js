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
    // 波次存副本存储（随副本销毁）；原先挂在玩家身上 2 小时，下一轮会从上一轮的波次接着算
    if (this.query_temp(me, "ss_wave")) return;
    this.set_temp(me, "ss_wave", 1);
    this.spawn_wave(me, 1);
};
this.spawn_wave = function (me, n) {
    var names = TAIBO.slice(0, n);
    this.send_room("<hir>中门后一声长啸，嵩山太保应声而出！</hir>");
    for (var i = 0; i < names.length; i++) {
        var e = NPC.CREATE(names[i], this);
        if (e) e.do_kill(me);
    }
};
