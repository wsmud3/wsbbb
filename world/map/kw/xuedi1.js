this.inherits(ROOM);
this.name = "雪地";
this.desc = "一片茫茫雪原，积雪没膝，行走艰难。四下望去都是白茫茫的一片，完全分不清方向，远处隐约可见一座山神庙。";

// 原版机制：雪地里任何方向都会迷路，被随机送到 雪地 或 荒路。
// 玩家必须反复走，直到随机到「荒路」，才有一条北向的路通往山神庙。
this.on_leave = function (me, dir) {
    // 只有北向的"真路"（由荒路过来时）才放行；其余方向一律随机传送
    var targets = ["kw/xuedi1", "kw/huangdi"];
    var to = targets[Math.floor(Math.random() * targets.length)];
    me.send("到处都是白茫茫的一片，你已经分不清方向了，就走这边吧.....");
    me.moveto(to);
    return false;          // 拦截原本的移动
};
