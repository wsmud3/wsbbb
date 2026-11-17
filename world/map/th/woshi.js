this.inherits(ROOM);
this.name = "卧室";
this.desc = "一间清雅的卧房，布置精致而不失素雅。窗外便是碧海蓝天，涛声阵阵。房中挂着一幅字画，笔法飘逸，似乎出自高人之手。";
this.exits = {
    "south": "th/dating",
};
this.set_npc(["th/huangrong", 1], ["th/huangyaoshi", 1]);

// 攻略第 19 节：普通模式卧室里是黄蓉（询问石匣 → 周伯通 → 交石匣），没有黄药师；
// 困难模式「此关没有黄蓉只有黄药师」，黄药师主动叫杀，杀了就 100%。
this.on_set_difficulty = function (type) {
    var drop = this.find_obj_bypath(type === 1 ? "th/huangrong" : "th/huangyaoshi");
    if (drop) drop.destroy();
};
