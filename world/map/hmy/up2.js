this.inherits(ROOM);
this.name = "悬崖";
this.desc = "吊篮升到崖腰，脚下云雾翻涌，一条更窄的石径贴着岩壁向上。岩壁另一侧又嵌着一个<cmd cmd='look xiazi'>匣子</cmd>，凹槽里刻的是一条盘旋的青龙。";
this.exits = { "west": "hmy/up1" };

// [mech] 第二处悬崖：插入青龙令续上吊篮（攻略：依次插入青龙堂令牌、风雷堂令牌后来到大门）
this.set_item("xiazi", "匣子", "岩壁上的铜匣，匣面凹槽刻着青龙纹样。", [
    ["charu", "插入青龙令", null]
]);
this.lan_ready = false;
this.lan_target = "hmy/up3";

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
    var it = this.hmy_have(me, "res/qinglonglingpai");
    if (!it) {
        me.notify("<hir>你身上没有青龙令。青龙堂长老贾布身上有一块。</hir>");
        return true;
    }
    me.remove_obj(it);
    this.lan_ready = true;
    me.send_room("$N将青龙令嵌入匣中，绞索再响，吊篮向更高处升去。");
    me.notify("<hig>青龙令入匣，吊篮垂下。坐上去便能到最后一处悬崖。</hig>");
    me.send_commands("hmy_lan 1", "乘坐吊篮");
    return true;
});

this.add_action("hmy_lan", null, function (me, arg) {
    if (!me.is_player) return true;
    if (!this.lan_ready) {
        me.notify("吊篮还没有放下来。");
        return true;
    }
    me.send_room("$N跨进吊篮，绞索吱呀作响，缓缓升上崖去。");
    me.moveto(this.lan_target);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.lan_ready) me.send_commands("hmy_lan 1", "乘坐吊篮");
};
