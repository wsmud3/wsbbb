this.inherits(COMMAND);
this.command = "qu";
this.regex = /^(?:(\d+\s+))?(\w+)$/;
this.enter = function (me, count, arg) {
    // 钱庄、家里等有仓库的房间可直接取；别处须先从动作栏「仓库」打开随身仓库（cangku 打的标记）
    if (!me.environment.allow_store && !me.query_temp("cangku_open")) return me.notify("这里没有仓库。");

    if (!arg) return me.notify("你要取什么东西？");

    me.items = me.items || [];
    var obj = {};
    obj.remove_item_byid = me.remove_item_byid;
    obj.items = me.stores || [];
    var move_count = 1;
    if (count) move_count = parseInt(count);
    if (!(move_count > 0)) return me.notify("数量错误。");
    // 背包上限：可与身上同类物品合并的堆叠物品放行，其余在背包满时拒绝
    var src = null;
    for (var i = 0; i < obj.items.length; i++) {
        if (obj.items[i] && obj.items[i].id === arg) { src = obj.items[i]; break; }
    }
    if (!src) return me.notify("你的仓库里没有这样东西。");
    if (me.is_full() && !(src.combined && me.find_obj_bypath(src.path))) {
        return me.notify("你身上东西太多了。");
    }
    var moved_obj = obj.remove_item_byid(arg, move_count);
    if (!moved_obj) return me.notify("你的仓库里没有这样东西。");

    moved_obj = me.push_item(moved_obj);
    me.stores = obj.items;
    me.send_room("$N从仓库里取出" + UTIL.to_c(move_count) + moved_obj.unit + moved_obj.color_name + "。");

    me.notify('{type:"dialog",dialog:"list",id:"' + moved_obj.id + '",storeid:"' + arg + '",store:' + (-move_count) + '}');

}