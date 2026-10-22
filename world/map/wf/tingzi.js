this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/lang_end",
};

// 原版机制：亭子里的木桩，跳上去即进入温家五老阵法
this.set_item("zhuang", "木桩", "一根练功用的木桩，桩身布满刀痕与掌印。", [
    "tiao", "跳上去", function (me) {
        me.send_room("$N纵身跳上木桩，四周忽然响起衣袂破风之声。");
        // 阵法：温家五老（原版需要按阵位先后击破，此处先接回 NPC）
        if (!this.find_obj("wf/wenjia") && NPC.CREATE) {
            try { NPC.CREATE("wf/wenjia", this); } catch (e) { }
        }
        me.notify("温家五老结阵向你围来！");
    }
]);
