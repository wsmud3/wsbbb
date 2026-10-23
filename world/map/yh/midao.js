this.inherits(ROOM);
this.name = "暗道";
this.desc = "一条幽暗的密道，火折子的微光照亮了前方的路。墙上挂着一只小匣子。";
this.exits = { "up": "yh/woshi" };
this.set_npc([]);

// 原版机制：到暗道使用火折子（没火折子只能退出去重进），点亮后才出现下一个暗道。
this.on_enter = function (me) {
    if (!me.is_player) return;
    var has = null;
    if (me.items) {
        for (var i = 0; i < me.items.length; i++) {
            if (me.items[i] && me.items[i].path === "res/huozhezi") { has = me.items[i]; break; }
        }
    }
    if (!has) {
        me.notify("<red>暗道里一片漆黑，没有火折子什么也看不见。</red>");
        me.notify("<hiy>（出去重进一次吧，记得先去弄个火折子。）</hiy>");
        return;
    }
    me.set_temp("yh_andao_light", 1, 7200000);
    me.send_room("$N擦亮火折子，暗道里顿时亮了起来。");
    me.send_commands("fire", "点火");
};

// [原版实测] 密道里输入 fire（动作栏「点火」）：
//   fire → 「你点燃了火折，发现密道中似乎有一条路可以走过去。」
//   之后密道出口变成 up→卧室 和 west→密室(midao2)
this.add_action("fire", null, function (me) {
    if (!me.is_player) return true;
    var has = null;
    if (me.items) {
        for (var i = 0; i < me.items.length; i++) {
            if (me.items[i] && me.items[i].path === "res/huozhezi") { has = me.items[i]; break; }
        }
    }
    if (!has) {
        me.notify("<red>你身上没有火折，点不着火。</red>");
        return true;
    }
    me.send_room("$N点燃了火折，发现密道中似乎有一条路可以走过去。");
    this.add_exit("west", "yh/midao2");
    me.notify("<hig>西面出现了一条通路。</hig>");
    return true;
});
