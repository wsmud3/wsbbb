AREA.prototype.notify_update = function () {
    this.json = null;
}
AREA.prototype.query_owner = function (me) {
    // 门派禁地是同门共享的公共实例；真意试炼则用玩家独立 owner 隔离。
    if (WORLD.ZHENYI && WORLD.ZHENYI.find_by_key(this.id)) {
        return me.query_temp("zy_trial_owner", "") || WORLD.ZHENYI.public_owner(this.id);
    }
    return me.query_teamid();
}
AREA.prototype.clear_copy = function (me) {
    var room = ROOM.Get(this.first)?.query_copy2(me);
    if (room)
        room.clear_copy(me);
}
AREA.prototype.is_unlock = function (me) {
    if (this.jd_index >= 0)
        return me.isenable_area(this);
    return (this.unlock_index ?? this.fb_index) <= me.query_temp("fb", 0);
}


