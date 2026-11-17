this.inherits(ROOM);
this.name = "草丛";
this.desc = "再往北走，蒿草更深，几乎没到胸口。草叶上凝着露水，脚下一阵阵发凉，草丛深处有鳞片擦过枯枝的细响。";
this.exits = {
    "south": "bt/cao1",
    "north": "bt/zhulin"
};

// [mech] 北面草丛又有一条毒蛇，再往北走到底便是岩洞（攻略原文）
this.on_enter = function (me) {
    if (!me.is_player) return;
    // 每个副本实例只刷一次：原来判断的 bt_she2_dead 无人设置，蛇死后（尸体替换本体）
    // 再进草丛又刷一条，回程经过就多出活蛇 → 结算卡 99%，还能反复刷分刷掉落。
    if (this._she_spawned) return;
    if (this.find_obj_bypath("bt/she")) return;
    this._she_spawned = true;
    NPC.CREATE("bt/she", this);
    this.refresh(me);
    // 刷在玩家进门之后，蛇自身的 on_enter（叫杀）不会触发，这里补上
    var snake = this.find_obj_bypath("bt/she");
    if (snake && snake.do_kill) snake.do_kill(me);
    me.notify("<hiy>草丛里窸窸窣窣，又一条毒蛇昂首拦住了去路。北面隐约可见一处岩洞。</hiy>");
};
