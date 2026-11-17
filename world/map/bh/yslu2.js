this.inherits(ROOM);
this.name = "岩石路";
this.desc = "岩石路皆由火山灰堆成，厉时久，地面十分坚硬。在这里已可以看见那缕黑烟之中竟有红火光不断的喷出，原来黑烟之处是一座活火山，走到这里已感到一丝的热气扑面而来，再走十多里路就到达火山脚下了。";
this.exits = {
    "east": "bh/yslu1",
    "west": "bh/huoshanjiao",
};
this.set_npc(["bh/yanlong", 2]);

// 冰火岛环境：进入/心跳叠加灼热或冰寒（规则见 world/area/fb1/fb22.js）
this.on_enter = function (me) {
    if (this.parent && this.parent.bh_env) this.parent.bh_env(this, me, true);
};
this.on_heart_beat = function () {
    if (this.is_copy_room && this.parent && this.parent.bh_env_tick) this.parent.bh_env_tick(this);
};
