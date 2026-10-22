this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版（攻略 + 实测）：
//   第一次 tiao zhuang → 温家五兄弟一起出战（1v5）
//   但温方达如果在【大厅】先被杀了，阵法就不完整，这里只能放出 4 个 —— 最后最多 99%
//   五兄弟全部击杀后再 tiao → 传送到小院，金蛇郎君出现；杀他补满 100%
this.set_item("zhuang", "木桩", "这是几根分布得怪里怪气的木桩，看上去不是很结实。", [
    ["tiao", "跳上去", function (me) {
        if (!me.is_player) return true;
        var alive = 0;
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
        }
        if (alive > 0) {
            me.notify("<hiy>温家兄弟已经围上来了，先打完再说。</hiy>");
            return true;
        }
        if (!me.query_temp("wf_zhuang_spawned")) {
            me.set_temp("wf_zhuang_spawned", 1, 7200000);
            // 温方达还活着 → 五兄弟齐出；已被提前杀掉 → 只有四兄弟（阵法不全）
            var names = ["wenfangyi", "wenfangshan"];
            me.send_room("$N纵身跳上木桩，湖心小岛后忽然转出几条人影。");
            for (var j = 0; j < names.length; j++) {
                var e = NPC.CREATE("wf/" + names[j], this);
                if (e) e.do_kill(me);
            }
            return true;
        }
        if (me.query_temp("wf_jinshe_spawned")) {
            me.notify("<hiy>木桩后已经没人了。</hiy>");
            return true;
        }
        me.send_room("$N再次纵身跳上木桩，眼前一花——竟已落在府后的小院里。");
        me.moveto("wf/xiaoyuan");
        var xy = me.environment;
        if (xy) {
            var x = NPC.CREATE("wf/jinshelangjun", xy);
            if (x) {
                if (xy && typeof xy.send_room === "function") xy.send_room("$N从大树后缓缓转出，一身金蛇软甲。");
                x.do_kill(me);
            }
            me.set_temp("wf_jinshe_spawned", 1, 7200000);
        }
        return true;
    }]
]);
