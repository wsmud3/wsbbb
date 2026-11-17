this.inherits(ROOM);
this.name = "岩石路";
this.desc = "这是一岩石路，由此去火山尚须四十多里路。但在此已可以看到四面山上一缕黑烟冲天而起。岩石路皆由火山灰堆成，厉时久，地面十分坚硬。";
this.exits = {
    "east": "bh/haibian",
    "west": "bh/yslu2",
};
this.set_npc(["bh/yanlong", 1]);

// 冰火岛环境：进入/心跳叠加灼热或冰寒（规则见 world/area/fb1/fb22.js）
this.on_enter = function (me) {
    if (this.parent && this.parent.bh_env) this.parent.bh_env(this, me, true);
};
this.on_heart_beat = function () {
    if (this.is_copy_room && this.parent && this.parent.bh_env_tick) this.parent.bh_env_tick(this);
};
