// 山外山·当前层（与 sws/ceng2 交替充当「当前/下一层」）
// 名称由 area 的 sws_setup_room 按当前层数动态改写，类似武道塔的「第X层」。
this.inherits(ROOM);
this.name = "第一层";
this.desc = "山外之山，云外之天。此处是一座悬于云海的孤峰石台，四野茫茫，唯见脚下云涛翻涌，天风猎猎。石台中央立着一名身负山岚之气的守护者，击败他，便有一道「山外之意」任你择取。";
this.exits = { "up": "sws/ceng2", "out": "yz/guangchang" };
this.max_item_count = 5;

this.on_before_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (area && area.sws_setup_room) area.sws_setup_room(this, me);
};

this.on_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (area && area.sws_enter_fight) area.sws_enter_fight(this, me);
};

this.on_leave = function (me, dir) {
    if (!me.is_player) return;
    var area = this.parent;
    if (area && area.sws_room_leave) return area.sws_room_leave(this, me, dir);
};

this.add_action("sws_status", "山外之意", function (me) {
    var area = this.parent;
    area && area.sws_status && area.sws_status(me);
});

// 出口按钮用固定文案，避免各玩家层数不同造成串显
this.exitsto_roomjson = function () {
    return JSON.stringify({ type: "exits", items: { "up": "下一层", "out": "离开秘境" } });
};
