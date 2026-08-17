this.inherits(ROOM);
this.name = "素心问道台";
this.desc = "九天玄女化身台旁的一方清静石台，四周云雾缭绕。台中央立着一块古玉碑，上刻「素心问道」四字。传闻此台能映照修者内心最深处的心魔——唯有心境澄明者方能通过考验。碑文隐约浮现：『五行易御，心魔难降。问心无愧，方证大道。』";
this.exits = { "east": "yc/xuannvhuashentai" };
this.on_create = function() { this.set_npc("yc/xinmo_huaying", 1); };
