this.inherits(ROOM);
this.name = "承德殿";
this.desc = "这里是日月神教的承德殿，殿宇高阔，梁上悬着「文成武德，泽被苍生」的金字大匾。殿中阴沉沉的，两旁的<cmd cmd='look zhutai'>烛台</cmd>上积了厚厚一层蜡泪，再往东便是教主平日议事的后殿。";
this.exits = {
    "west": "hmy/damen",
    "east": "hmy/houdian",
};
this.set_npc([]);

// [mech] 密道要火折子点亮（攻略），副本里原本没有任何来源，没带的人只能出本。
// 这里的烛台下放着教众点灯用的火折子，每轮副本可取一个。
this.set_item("zhutai", "烛台", "一对铜铸的烛台，烛台底座的抽屉里塞着教众点灯用的火折子。", [
    ["qu_huozhezi", "取火折子", null]
]);
this.add_action("qu_huozhezi", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.find_obj_bypath && me.find_obj_bypath("res/huozhezi")) {
        me.notify("你身上已经有火折子了。");
        return true;
    }
    if (this.query_temp(me, "hmy_huozhezi_taken", 0)) {
        me.notify("烛台抽屉里已经空了。");
        return true;
    }
    this.set_temp(me, "hmy_huozhezi_taken", 1);
    me.add_obj("res/huozhezi", 1);
    me.notify("<hig>你从烛台底座的抽屉里摸出一个火折子。</hig>");
    return true;
});
