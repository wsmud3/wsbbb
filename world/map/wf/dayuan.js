this.inherits(ROOM);
this.name = "大院";
this.desc = "这里就是温宅进门的一个大庭院，地上铺着一块块平整的大理石，光可鉴人。院子的面积很大，看得出来这家主人家资丰厚。南面的大门紧锁着。";
this.exits = {
    "north": "wf/dating",
};
this.set_npc([]);

// 原版机制（攻略第 11 节）：进院就遇到主动叫杀的温老大，且不能杀
// （杀了他温家五老无法成阵，就见不到金蛇郎君，无法 100%）。
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
