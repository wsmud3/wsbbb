this.inherits(ROOM);
this.name = "花径";
this.desc = "这是一片谷底的小路。四周一望无际，全是盛开的鲜花。微风拂过，蜜蜂到飞舞。香气逼人。往北是一片玫瑰花，往南则是一个大门。";
this.exits = {
    "south": "yh/huajing1",
};
this.set_npc([]);

// 原版机制（攻略第 23 节）：进入移花宫会进入一个十字花径，每走一步掉血，12 步走出去。
this.on_leave = function (me) {
    if (!me.is_player) return;
    var n = (me.query_temp("yh_bu") || 0) + 1;
    me.set_temp("yh_bu", n, 7200000);
    var hurt = Math.floor(me.max_hp * 0.03);
    me.hp = Math.max(1, me.hp - hurt);
    me.notify("<red>花径中的毒雾割得你生疼，气血 -" + hurt + "（第 " + n + " 步）。</red>");
};
