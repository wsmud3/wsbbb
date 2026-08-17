this.inherits(ROOM);
this.name = "达摩武意殿";
this.desc = "禅武秘境的最终战场。殿中没有任何佛像和经文——只有一片空旷的圆形大殿。大殿中央，一道金色的人影盘膝而坐——那是达摩祖师的「武意化身」。他睁开双眼：「九年面壁，所悟为何？」";
this.exits = { "south": "dmd/shelitalin", "north": "dmd/chuanchengdian" };
this.on_create = function() { this.set_npc("dmd/damo_wuyi", 1); };
