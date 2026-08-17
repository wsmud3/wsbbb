this.inherits(ROOM);
this.name = "软剑台";
this.desc = "软剑台比利剑台更大，地面铺着柔软的青苔。软剑剑灵的身形飘忽不定，时而如蛇蜿蜒，时而如鞭横扫。空气中到处都是它变幻莫测的残影，虚实难辨。";
this.exits = { "south": "jz/ruanjiange", "north": "jz/jianyuanpan" };

this.on_create = function () {
    this.set_npc("jz/ruanjian_ling", 1);
};
