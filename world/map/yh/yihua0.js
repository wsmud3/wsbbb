this.inherits(ROOM);
this.name = "花径";
this.desc = "这是一片谷底的小路。四周一望无际，全是盛开的鲜花。微风拂过，蜜蜂到飞舞。香气逼人。往北是一片玫瑰花，往南则是一个大门。";
this.exits = {
    "north": "yh/yihua0",
    "south": "yh/yihua0",
    "east": "yh/yihua0",
    "west": "yh/yihua0",
};
this.set_npc([]);

// [原版实测] 花径是同一间房的迷阵：四个方向都返回「花径」，
// 连续南行 14 次才走出去，提示「你走了半天，终于走出了花径。」→ 宫门(damen)
// 中间插其它方向会重置计数。
const STEP_NEED = 14;

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir === "south") {
        var n = (me.query_temp("yh_huajing_step") || 0) + 1;
        if (n >= STEP_NEED) {
            me.remove_temp("yh_huajing_step");
            me.send_room("你走了半天，终于走出了花径。");
            me.moveto("yh/damen");
            return false;
        }
        me.set_temp("yh_huajing_step", n, 7200000);
        me.notify("<hiy>你沿着花径往南走（" + n + "/" + STEP_NEED + "）。</hiy>");
        return true;
    }
    if (me.query_temp("yh_huajing_step")) {
        me.remove_temp("yh_huajing_step");
        me.notify("<red>你走岔了路，又回到了花径入口。</red>");
    }
    return true;
};

this.on_enter = function (me) {
    if (me.is_player) me.set_temp("yh_huajing_step", 0, 7200000);
};
