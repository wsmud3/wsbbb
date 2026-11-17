this.inherits(ROOM);
this.name = "丛林";
this.desc = "这是一座山石，山石周围到处是奇花异树，异树丛中传来阵阵的奇香，皆由不知名之花朵传出。山脚下露出一个石洞，西面是通住火山之路，东边半里处有一小石山，北边是一片片深不见底的大丛林。";
this.exits = {
    "north": "bh/shishan",
    "south": "bh/conglin1",
};
this.set_npc(["bh/baixiong", 2]);

// 冰火岛环境：进入/心跳叠加灼热或冰寒（规则见 world/area/fb1/fb22.js）
this.on_enter = function (me) {
    if (this.parent && this.parent.bh_env) this.parent.bh_env(this, me, true);
};
this.on_heart_beat = function () {
    if (this.is_copy_room && this.parent && this.parent.bh_env_tick) this.parent.bh_env_tick(this);
};
this.add_action("bh_warm", "点火取暖", function (me) {
    if (this.parent && this.parent.bh_warm) return this.parent.bh_warm(this, me);
    return true;
});
