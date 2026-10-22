this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版（实测）：亭子的木桩，描述与按钮都照原版；
// 跳上去会一次性放出温家其余四兄弟（老二温方义/老三温方山/老四温方施/老五温方南）并开战。
this.set_item("zhuang", "木桩", "这是几根分布得怪里怪气的木桩，看上去不是很结实。", [
    ["tiao", "跳上去", function (me) {
        if (!me.is_player) return true;
        var alive = 0;
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
        }
        if (alive > 0) {
            me.notify("<hiy>温家兄弟已经围上来了，先打完再说！</hiy>");
            return true;
        }
        if (me.query_temp("wf_zhuang_done")) {
            // 四兄弟已灭：再跳一次放出金蛇郎君（攻略：战斗结束后再次点击木桩）
            var x = NPC.CREATE("wf/jinshelangjun", this);
            if (x) {
                me.send_room("$N再次跳上木桩，桩后石门缓缓打开——金蛇郎君走了出来！");
                x.do_kill(me);
            }
            return true;
        }
        me.send_room("$N纵身跳上木桩，湖心小岛后忽然转出几条人影。");
        var names = ["wenfangyi", "wenfangshan", "wenfangshi", "wenfangnan"];
        for (var j = 0; j < names.length; j++) {
            var e = NPC.CREATE("wf/" + names[j], this);
            if (e) e.do_kill(me);
        }
        return true;
    }]
]);
