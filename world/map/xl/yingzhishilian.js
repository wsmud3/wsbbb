this.inherits(ROOM);
this.name = "影之试炼场";
this.desc = "修罗真身台侧翼的暗影训练场，四周是无尽的黑暗虚空，只有脚尖所立方寸之地散发着微弱的血色光芒。历代杀手之王在此磨炼「影杀术」——传说若能在此地击败自己的影子，便可触摸到暗杀之道的终极奥义。黑暗中，你的影子正缓缓站立起来……";
this.exits = { "east": "xl/xiuluozhenshentai" };
this.on_create = function() { this.set_npc("xl/yingzi_shashou", 1); };
