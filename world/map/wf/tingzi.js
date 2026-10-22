this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);
this.set_item("zhuang", "zhuang", "这是几根分布得怪里怪气的木桩，看上去不是很结实。", [
    ["tiao", "跳上去", function (me) {
        if (!me.is_player) return true;
        me.send_room("$N纵身跳上木桩，四周忽然转出几条人影。");
        var n1 = NPC.CREATE("wf/wenfangyi", this);
        var n2 = NPC.CREATE("wf/wenfangshan", this);
        if (n1) n1.do_kill(me);
        if (n2) n2.do_kill(me);
        return true;
    }]
]);
