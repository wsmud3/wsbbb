this.inherits(ROOM);
this.name = "悬崖";
this.desc = "最后一处悬崖。崖顶隐约可见一座门户森严的建筑，门前旗幡上写着「日月神教」四个大字。崖壁上还嵌着最后一个<cmd cmd='look xiazi'>匣子</cmd>，凹槽刻着风雷纹样。";
this.exits = { "south": "hmy/up2" };

// [mech] 最后一处悬崖：插入风雷令后吊篮直达大门（攻略：依次插入风雷堂令牌后来到大门）
this.set_item("xiazi", "匣子", "崖壁上的铜匣，匣面凹槽刻着风雷纹样。", [
    ["charu", "插入风雷令", null]
]);
this.lan_ready = false;
this.lan_target = "hmy/damen";

this.hmy_have = function (me, p) {
    if (!me.items) return null;
    for (var i = 0; i < me.items.length; i++) {
        var it = me.items[i];
        if (it && it.path === p) return it;
    }
    return null;
};

this.add_action("charu", null, function (me, arg) {
    if (!me.is_player) return true;
    if (this.lan_ready) {
        me.notify("吊篮已经放下来了，坐上去便是。");
        return true;
    }
    var it = this.hmy_have(me, "res/fengleilingpai");
    if (!it) {
        me.notify("<hir>你身上没有风雷令。风雷堂长老童百熊身上有一块。</hir>");
        me.notify("<hiy>三位长老并非必爆令牌，缺了哪一块，只能出副本重打。</hiy>");
        return true;
    }
    me.remove_obj(it);
    this.lan_ready = true;
    me.send_room("$N将风雷令嵌入匣中，崖顶吊篮轰然而下。");
    me.notify("<hig>风雷令入匣，吊篮直通崖顶大门。</hig>");
    me.send_commands("hmy_lan 1", "乘坐吊篮上崖");
    return true;
});

this.add_action("hmy_lan", null, function (me, arg) {
    if (!me.is_player) return true;
    if (!this.lan_ready) {
        me.notify("吊篮还没有放下来。");
        return true;
    }
    me.send_room("$N跨进吊篮，绞索飞转，直上崖顶。");
    me.moveto(this.lan_target);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.lan_ready) me.send_commands("hmy_lan 1", "乘坐吊篮上崖");
};
