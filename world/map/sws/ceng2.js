// 山外山·下一层（与 sws/ceng 交替充当「当前/下一层」）
// 从当前层「up」进入本房间时，area 会把这里布置成下一层的战斗房间。
this.inherits(ROOM);
this.name = "云梯";
this.desc = "一道白玉云梯自石台边缘垂落，通向更高处云雾中的另一重天地。云梯两侧刻满剑痕掌印，深浅不一，皆是力竭而返者所留。踏上去，便是新的一层。";
this.exits = { "up": "sws/ceng", "out": "yz/guangchang" };
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

this.exitsto_roomjson = function () {
    return JSON.stringify({ type: "exits", items: { "up": "下一层", "out": "离开秘境" } });
};
