this.inherits(ROOM);
this.name = "南天门";
this.desc = "走完了十八盘，这里便是泰山顶的入口处。从这里附视山下，群山如龟伏地，河流如蚓缠绕，天地空阔，无可名状。从这里往东北走可到一个市集，往西走便是月观峰，往北走则是到玉皇顶之路。";
this.exits = {
    "southdown": "ts/shiba3",
    "northup": "ts/yuhuang",
};
this.set_npc(["ts/nantian_1", 1]);

// 每往上走一步都要验轻功（规则见 ts/daizong.js 的 WORLD.ts_climb）
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir || dir.indexOf("up") < 0) return true;
    return WORLD.ts_climb(me);
};
