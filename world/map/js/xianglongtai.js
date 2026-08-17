this.inherits(ROOM);
this.name = "降龙幻影台";
this.desc = "君山密录的最终战场。十八道龙形真气在台上盘旋汇聚，化为一尊巨大的金色人影——洪七公的「降龙幻影」。他微笑看着你：「降龙十八掌，老叫花一生所创。来——试试你学到了几成。」";
this.exits = { "south": "js/sunzeshi", "north": "js/chuanchengdian" };
this.on_create = function() { this.set_npc("js/hongqigong_huanying", 1); };
