this.inherits(ROOM);
this.name = "地下暗河";
this.desc = "原来这正是一条地下暗河，此处水声已是轰轰，声势极为骇人。你脚下一处踏空，便有水流直冲咽喉。此潜流不知来自何处，更不知通往何方。";
this.exits = {};
this.set_npc([]);

// 原版机制：向前面剑指的方向游（这时候必须满血），游出去后回血，跳上去。
this.add_action("you", null, function (me, arg) {
    if (!me.is_player) return true;
    var dir = me.query_temp("gm2_sword_dir");
    if (!dir) {
        me.notify("<red>你不知道该往哪个方向游——先去卧室看看那幅画。</red>");
        return true;
    }
    if (!arg) {
        me.notify("你要往哪个方向游？（当前剑指：" + dir + "）");
        return true;
    }
    if (arg !== dir) {
        me.notify("<red>你朝" + arg + "游去，水流横冲，把你冲了回来。</red>");
        return true;
    }
    if (me.hp < me.max_hp) {
        me.notify("<red>水势太急，你气血未满，游不出去（要满血才能游）。</red>");
        return true;
    }
    var dmg = Math.floor(me.max_hp * 0.5);
    me.hp = Math.max(1, me.hp - dmg);
    me.send_room("$N顺着暗流朝" + dir + "奋力游去，气血被激流冲掉大半！");
    me.moveto("gm2/qiaobi", me.name + "顺流游出了暗河。", me.name + "从暗河里钻出来。");
    return true;
});
