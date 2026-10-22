this.inherits(ROOM);
this.name = "走廊尽头";
this.desc = "你来到走廊的尽头，往北看去是好大的一个湖泊，前面有个小亭，温氏兄弟还真会享受。";
this.exits = {
    "southwest": "wf/zoulang2",
    "southeast": "wf/zoulang3",
    "north": "wf/tingzi",
};
this.set_npc([]);

// 原版机制：点击木桩跳上去 → 温家五老一起出战（1v5）→ 打完再点 → 金蛇郎君出现。
// 原版机制（攻略第 11 节）：
//   温家五老分散在府中各处（大厅温方达 / 亭子温方义+温方山 / 侧房温方施、温方南），
//   玩家必须先破掉五老，再到走廊尽头点木桩跳上去——此时金蛇郎君才会现身。
//   （采集数据里五老的尸体就分布在这些房间，说明他们是静态放置，不是木桩召唤的）
this.set_item("zhuang", "木桩", "一根练功用的木桩，桩身布满刀痕与掌印。", [
    ["tiao", "跳上去", function (me) {
        var alive = 0;
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
        }
        var ljs = 0;
        for (var j = 0; j < this.items.length; j++) {
            var q = this.items[j];
            if (q && q.path === "wf/jinshelangjun" && q.hp > 0) ljs++;
        }
        if (alive > 0) {
            me.notify("<hiy>温家五老还没破完（府中还有 " + alive + " 位），阵法不成，木桩毫无反应。</hiy>");
            return true;
        }
        if (ljs > 0) {
            me.notify("<hiy>金蛇郎君就在眼前，先打完再说。</hiy>");
            return true;
        }
        if (!me.query_temp("wf_zhen_done")) {
            me.notify("<hiy>你跳上木桩，四周静悄悄的，什么也没有发生。</hiy>");
            return true;
        }
        var x = NPC.CREATE("wf/jinshelangjun", this);
        if (x) {
            me.send_room("$N再次跳上木桩，木桩后石门缓缓打开——金蛇郎君走了出来！");
            x.do_kill(me);
        }
        return true;
    }]
]);
this.on_zhen_done = function (me) { me.set_temp("wf_zhen_done", 1, 7200000); };
