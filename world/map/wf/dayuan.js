this.inherits(ROOM);
this.name = "大院";
this.desc = "一座宽阔的大院，青石铺地，四角种着几株老槐树。院中摆放着假山流水，颇有江南园林的韵味。但四下静得出奇，连鸟鸣声都没有，让人隐隐感到一丝不安。";
this.exits = { "north": "wf/dating" };
this.set_npc([]);

// 原版机制：进来就会遇到主动叫杀的【温老大】。
// 但温老大不能杀——杀了他温家五老就无法结阵，达不到 100%！
// 正确做法是脱离战斗（移动有几率脱战，给敌人上忙乱/眩晕/定身能提高几率）。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("wf_wenlaoda")) return;
    me.set_temp("wf_wenlaoda", 1, 7200000);
    var n = NPC.CREATE("wf/wenlaoda", this);
    if (n) {
        n.score = 0;
        me.notify("<hiy>温老大喝道：「什么人敢闯温府！」拔刀向你砍来！</hiy>");
        me.notify("<hir>（温老大不能杀！杀了他温家五老就无法结阵，绕开他往前走。）</hir>");
    }
};
