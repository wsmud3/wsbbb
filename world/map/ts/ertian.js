this.inherits(ROOM);
this.name = "二天门";
this.desc = "这里又叫「中天门」。一般的登山者来到这里都已累极，但是这里才是泰山的一半啊！面对前面险峻的十八盘，很多人都不禁犹豫起来。";
this.exits = {
    "southdown": "ts/yitian",
    "northup": "ts/shiba1",
};
this.set_npc(["ts/ertian_1", 1]);

// 每往上走一步都要验轻功（规则见 ts/daizong.js 的 WORLD.ts_climb）
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir || dir.indexOf("up") < 0) return true;
    return WORLD.ts_climb(me);
};
