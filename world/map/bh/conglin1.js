this.inherits(ROOM);
this.name = "丛林";
this.desc = "向北一直走出二十余里，就是一大片丛林了。原来此岛方圆极广，延伸至北，不知尽头。丛林老树参天，阴森森的遮天蔽日，林内有什么古怪，却是不得而知。遇有好事之人肯定要进入一探的。";
this.exits = {
    "north": "bh/conglin2",
    "south": "bh/haibian",
};
this.set_npc(["bh/baixiong", 1]);

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
