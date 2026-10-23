this.inherits(ROOM);
this.name = "雪地";
this.desc = "这里是一片白茫茫的雪地，一眼望不到边际。四周一个人影也没有，厚厚的积雪踩起来发出咯吱的响声，大地上留下一串孤独的脚印。寒冷的北风呼啸而过，吹得脸生痛。暗淡的太阳低悬在天边，显得那么苍白。";
// 原版：雪地的四个方向都回到雪地本身，只有连续西行五次才能走出（计数式迷宫）。
this.exits = {
    "west": "kw/xuedi",
    "south": "kw/xuedi",
    "north": "kw/xuedi",
    "east": "kw/xuedi",
};
this.set_npc([]);

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir !== "west") {
        var c = me.query_temp("kw_snow_west") || 0;
        me.set_temp("kw_snow_west", c, 7200000);
        return true;
    }
    var n = (me.query_temp("kw_snow_west") || 0) + 1;
    me.set_temp("kw_snow_west", n, 7200000);
    if (n < 5) return true;
    me.remove_temp("kw_snow_west");
    me.moveto("kw/huangdi");
    return false;
};
