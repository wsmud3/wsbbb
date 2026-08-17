	this.inherits(ROOM);
	this.name = "峻极山门";
	this.desc = `一道高大的山门横亘在前，门额上"峻极"二字银钩铁画，霸气外露。门前分立两队嵩山弟子，个个面色冷峻，目光如电，一看便知是精挑细选的精锐。门内隐约可见层层殿宇，深不可测。西边是中岳大殿，东边通往峻极禅院。`;
	this.exits = { "east": "ss/junjichanyuan", "west": "ss/zhongyuedadian" };
	this.set_npc(["ss/zuoting", 1], ["ss/wandaping", 1]);
