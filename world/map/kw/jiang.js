this.inherits(ROOM);
this.name = "松花江上";
this.desc = "这里是松花江的江面，冰面早已解冻，清澈的江水涛涛北去，两岸是如烟如雾松支，柳条。船夫悠闲地在船尾把着舵。";
this.exits = {
    "west": "kw/chuanchang",
};
this.set_npc([]);

// 防止用小地图点击等方式绕过船资：没有付过钱就不许留在江面
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!me.query_temp("kw_ferry_paid")) {
        me.notify("<red>船夫把你拦了下来：不付船资，不能过江。</red>");
        me.moveto("kw/damen");
        return;
    }
    me.remove_temp("kw_ferry_paid");
};
