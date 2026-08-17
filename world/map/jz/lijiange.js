this.inherits(ROOM);
this.name = "利剑阁";
this.desc = "第一座剑冢。一柄青光闪闪的利剑斜插于石台之上，剑身薄如蝉翼，刃口隐现寒芒。四壁满是深浅不一的剑痕——仔细看去，每面墙上的剑痕似乎排列成不同的走向。利剑的锋锐之气充盈整个石室，令人汗毛倒竖。";
this.exits = { "south": "jz/changlang", "north": "jz/lijiantai" };

this.on_create = function () {
    // 随机刷新利剑剑灵（击败后才解锁北门）
    this.set_npc("jz/lijian_ling", 1);
};
