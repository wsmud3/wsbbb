this.inherits(ROOM);
this.name = "金行秘境";
this.desc = "金行殿东侧的秘境。室中充满了锐利的金属性真气，四壁镶嵌着各种金属矿物——黄金、白银、玄铁、陨石。在这里，金属性的攻击力会得到极大的增幅。";
this.exits = { "west": "yc/jinxingdian" };
this.on_create = function() { this.set_npc("yc/jinxing_miwei", 1); };
