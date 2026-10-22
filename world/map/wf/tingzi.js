this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版（实测）：亭子木桩「跳上去」放出温家老二温方义 + 老三温方山。
// 关键：必须幂等——重复跳不能重复生成（之前漏了这层，导致越跳越多）。
this.set_item("zhuang", "木桩", "这是几根分布得怪里怪气的木桩，看上去不是很结实。", [
    ["tiao", "跳上去", function (me) {
        if (!me.is_player) return true;
        // 场上已有存活的温家兄弟 → 不重复生成
        var alive = [];
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive.push(o);
        }
        if (alive.length) {
            me.notify("<hiy>温家兄弟已经围上来了，先打完再说。</hiy>");
            return true;
        }
        // 这一趟副本里只放一次（幂等的唯一依据，与死活无关）
        if (me.query_temp("wf_tingzi_spawned")) {
            me.notify("<hiy>木桩后已经没人了。</hiy>");
            return true;
        }
        me.set_temp("wf_tingzi_spawned", 1, 7200000);
        me.send_room("$N纵身跳上木桩，四周忽然转出几条人影。");
        var n1 = NPC.CREATE("wf/wenfangyi", this);
        var n2 = NPC.CREATE("wf/wenfangshan", this);
        if (n1) n1.do_kill(me);
        if (n2) n2.do_kill(me);
        return true;
    }]
]);
