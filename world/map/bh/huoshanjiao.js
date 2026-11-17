this.inherits(ROOM);
this.name = "火山脚下";
this.desc = "你越走越热，不觉已至火山脚下。此时已可看到大火从火山中怒喷而出，到这里你虽然是只穿单衣也是顶受不住，不觉已是口干舌燥，遍身大汗，但见身旁已无一株树木花草，只余光秃秃、黄焦焦的岩石。";
this.exits = {
    "west": "bh/huoshan1",
    "east": "bh/yslu2",
};
this.set_npc(["bh/yanlongwang", 1]);

// 冰火岛环境：进入/心跳叠加灼热或冰寒（规则见 world/area/fb1/fb22.js）
this.on_enter = function (me) {
    if (this.parent && this.parent.bh_env) this.parent.bh_env(this, me, true);
};
this.on_heart_beat = function () {
    if (this.is_copy_room && this.parent && this.parent.bh_env_tick) this.parent.bh_env_tick(this);
};
