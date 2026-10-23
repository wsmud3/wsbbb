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
    if (!dir) return true;                                  // cr over 等非方向移动，放行
    if (me.query_temp("yh_huajing_leave")) return true;     // 我们自己放行的那一次
    if (dir === "south") {
        var n = (me.query_temp("yh_huajing_step") || 0) + 1;
        if (n >= STEP_NEED) {
            me.remove_temp("yh_huajing_step");
            me.send_room("你走了半天，终于走出了花径。");
            me.set_temp("yh_huajing_leave", 1, 10000);
            me.moveto("yh/yihua1");
            me.remove_temp("yh_huajing_leave");
            return false;
        }
        me.set_temp("yh_huajing_step", n, 7200000);
        // 原版：每走一步一阵奇香袭来，掉 5% 最大气血；
        // 这一步的伤害走「命中/闪避/招架」判定——奇香按 10 万命中算，
        // 闪避或招架过了 10 万就能闪掉/架开。
        me.notify("<hir>突然一阵奇香向你袭来,你不由得开始奇想！</hir>");
        var ds = me.ds || 0, zj = me.zj || 0;
        if (!ds || !zj) {
            if (me.recount) me.recount();
            ds = me.ds || 0; zj = me.zj || 0;
        }
        var MZ = 100000;
        var dodged = Math.random() * (ds / 2) + ds / 2 > MZ;
        var parried = false;
        if (!dodged && !me.is_busy) parried = Math.random() * (zj / 2) + zj / 2 > MZ;
        if (dodged) me.notify("<hiy>你身随意动，堪堪避开了那股奇香。</hiy>");
        else if (parried) me.notify("<hiy>你抬手一格，把那股奇香架了开去。</hiy>");
        else if (me.damage2) me.damage2(Math.floor(me.max_hp * 0.05));
        return false;                                       // 关键：不真的移动出去
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
