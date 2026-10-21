this.inherits(ROOM);
this.name = "还施水阁";
this.desc = "水阁不大，四壁皆是书架，架上经史子集与武学秘笈杂陈。窗外水光潋滟，室内墨香浮动。据说慕容氏收罗天下武功尽藏于此，燕国旧物亦在其中。";
this.exits = { "south": "yz2/houting" };

this.set_item("shujia", "书架", "一架连着一架的书架，卷帙浩繁，其中似乎夹着几页武功残页。", [
    ["sousuo", "搜索书架", null]
]);

this.add_action("sousuo", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("yz2_huanshi_searched")) {
        me.notify("书架已被你翻遍，再无所得。");
        return true;
    }
    var books = ["book/bc#canhezhi", "book/bc#douzhuanxingyi", "book/bc#tiannanbu", "book/bc#chanchubufa"];
    me.set_temp("yz2_huanshi_searched", 1);
    me.send_room("$N在书架间翻检良久，终于抽出几页残页。");
    me.notify("<hiw>你在书架深处摸到一叠残页，墨迹犹新。</hiw>");
    me.add_obj(books[Math.floor(Math.random() * books.length)]);
    me.notify("<hig>搜查完毕。若再去后厅，恐有变故——慕容家的人不会放任外人拿走这些东西。</hig>");
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!me.query_temp("yz2_huanshi_searched")) {
        me.notify("<hiy>水阁中寂静无声，只闻水响。四壁书架密密排开，或有武功残页藏于其中。</hiy>");
    }
};
