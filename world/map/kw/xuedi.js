this.inherits(ROOM);
this.name = "雪地";
this.desc = "这里是一片白茫茫的雪地，一眼望不到边际。四周一个人影也没有，厚厚的积雪踩起来发出咯吱的响声，大地上留下一串孤独的脚印。寒冷的北风呼啸而过，吹得脸生痛。暗淡的太阳低悬在天边，显得那么苍白。";
this.exits = {
    "west": "kw/huangdi",
    "east": "kw/chuanchang",
};
this.set_npc([]);

// 原版：雪地里连续西行五次才能走出去（前四次都会绕回原处）。
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir !== "west") return true;
    var n = (me.query_temp("kw_snow_west") || 0) + 1;
    if (n < 5) {
        me.set_temp("kw_snow_west", n, 7200000);
        me.notify("<hib>你在风雪里绕了一圈，又回到了原处。</hib>");
        return false;
    }
    me.remove_temp("kw_snow_west");
    return true;
};
