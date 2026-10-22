this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版实测（cd/wen/tingzi）：
//   第一次 tiao zhuang → 一次放出温家老二温方义 / 老三温方山 / 老四温方施 / 老五温方南
//   四兄弟全部击杀后再次 tiao zhuang → 传送到【小院】并出现【金蛇郎君 夏雪宜】
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
            me.send_room("$N纵身跳上木桩，湖心小岛后忽然转出几条人影。");
            var names = ["wenfangyi", "wenfangshan", "wenfangshi", "wenfangnan"];
            for (var j = 0; j < names.length; j++) {
                var e = NPC.CREATE("wf/" + names[j], this);
                if (e) e.do_kill(me);
            }
            return true;
        }
        if (me.query_temp("wf_jinshe_done")) {
            me.notify("<hiy>木桩后已经没人了。</hiy>");
            return true;
        }
        // 四兄弟已清 → 传送到小院，金蛇郎君现身
        me.send_room("$N再次纵身跳上木桩，眼前一花——竟已落在府后的小院里。");
        me.moveto("wf/xiaoyuan");
        var xy = ROOM.Get("wf/xiaoyuan");
        if (xy) {
            var x = NPC.CREATE("wf/jinshelangjun", xy);
            if (x) {
                xy.send_room("$N从大树后缓缓转出，一身金蛇软甲。");
                x.do_kill(me);
            }
        }
        return true;
    }]
]);
