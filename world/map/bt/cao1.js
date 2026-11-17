this.inherits(ROOM);
this.name = "草丛";
this.desc = "这里是乱草丛。东边是扇拱月形小敞门。其余三面都是齐腰高的蒿草，常有蛇出没。";
// 原版这里西/南/北三面都叫「草丛」——重建时多间草丛塌缩成 caocong + caocong2 两间，
// 西、南两个出口就被写成指向自己（走一步原地不动，按钮点了像没反应）。
// 保留东（西门）与北（更深的草丛→岩洞）两个真实出口，去掉自环。
this.exits = {
    "east": "bt/ximen",
    "north": "bt/cao2",
};

// [mech] 草丛里的毒蛇（攻略：继续向西走到草丛有一只毒蛇，杀）
this.on_enter = function (me) {
    if (!me.is_player) return;
    // 每个副本实例只刷一次：原来判断的 bt_she1_dead 无人设置，蛇死后（尸体替换本体）
    // 再进草丛又刷一条，回程经过就多出活蛇 → 结算卡 99%，还能反复刷分刷掉落。
    if (this._she_spawned) return;
    if (this.find_obj_bypath("bt/she")) return;
    this._she_spawned = true;
    NPC.CREATE("bt/she", this);
    this.refresh(me);
    // 刷在玩家进门之后，蛇自身的 on_enter（叫杀）不会触发，这里补上
    var snake = this.find_obj_bypath("bt/she");
    if (snake && snake.do_kill) snake.do_kill(me);
};
