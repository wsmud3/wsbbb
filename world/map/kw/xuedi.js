this.inherits(ROOM);
this.name = "雪地";
this.desc = "这里是一片白茫茫的雪地，一眼望不到边际。四周一个人影也没有，厚厚的积雪踩起来发出咯吱的响声，大地上留下一串孤独的脚印。寒冷的北风呼啸而过，吹得脸生痛。暗淡的太阳低悬在天边，显得那么苍白。";
this.exits = {
    "west": "kw/huangdi",
    "east": "kw/chuanchang",
};
this.set_npc([]);

// 原版：雪地里连续西行五次才能走出去（前四次都会绕回原处）。
// 步数存副本存储（随副本销毁）；原先挂在玩家身上 2 小时，中途离开会带到下一轮。
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir !== "west") return true;
    var n = (this.query_temp(me, "kw_snow_west") || 0) + 1;
    if (n < 5) {
        this.set_temp(me, "kw_snow_west", n);
        me.notify("<hib>你在风雪里绕了一圈，又回到了原处。</hib>");
        return false;
    }
    this.set_temp(me, "kw_snow_west", 0);
    return true;
};
