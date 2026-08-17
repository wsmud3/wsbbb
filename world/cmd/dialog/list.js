this.inherits(COMMAND);
this.command = "list";
this.enter = function (me, arg) {
    var target = me;
    if (arg) {
        target = me.find_obj(arg, me.environment);
        if (!target) {
            return me.notify("这里没有这个人。");
        }
    }
    var selllist = target.sell_list;
    if (target.on_sell) {
        selllist = target.on_sell(me);
    }
    if (!selllist) {
        return me.notify(target.name + "不出售任何东西。");
    }
    var str = ['{"type":"dialog","dialog":"list","selllist":['];
    for (var i = 0; i < selllist.length; i++) {
        if (i > 0) str.push(",");
        var item = selllist[i];
        if (!item) continue;

        str.push(item.format_to_sell(target.id));
    }
    str.push(']');
    str.push(",title:\"");
    str.push(target.name);
    str.push("正在贩卖以下物品：\"");

    str.push(",seller:\"");
    str.push(target.id);
    str.push("\"");
    if (target.gongji_sell) {
        str.push(",\"gongji\":");
        str.push(me.query_temp("gongji", 0));
    }
    str.push("}");

    me.send(str.join(""));
}