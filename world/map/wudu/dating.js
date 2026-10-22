	this.inherits(ROOM);
	this.name = "大厅";
	this.desc = "五毒教大厅，正中石座上铺着一张巨大的蛇皮，靠背上雕刻着五毒——蛇、蝎、蜈蚣、蟾蜍、壁虎。两旁的烛台是用人骨制成，烛火发出幽绿的光芒。地上铺着苗族的蜡染布，上面绣的却是各种毒虫图案。整座大厅阴森恐怖，处处透着苗疆蛊术的神秘与可怕。北面是练毒室，南面通向花园。";
	this.exits = { "north": "wudu/liandushi", "south": "wudu/huayuan" };
	this.set_npc(["wudu/hehongyao", 1], ["wudu/qiyunao", 1]);
this.set_npc("wudu/panxiuda");   // 五毒教护法 笑面阎罗 潘秀达
this.set_npc("wudu/cenqisi");   // 五毒教护法 五毒秀士 岑其斯
this.inherits(ROOM);
this.name = "药室";
this.desc = "这里是个宽广的大厅，高大的盘龙柱一人都合抱不过来。这里是平日教主召集教众们议事的地方，大厅正中供奉着五圣--毒蛇，蜘蛛，蜈蚣，蝎子蟾蜍的画像。几位长老正坐在厅中议事 。";
this.exits = {
    "west": "wudu/lianwuchang",
    "east": "wudu/huayuan",
};
this.set_npc("wudu/panxiuda");   // 五毒教护法 笑面阎罗 潘秀达
this.set_npc("wudu/cenqisi");   // 五毒教护法 五毒秀士 岑其斯
this.set_npc("wudu/qiyunao");   // 五毒教长老 锦衣毒丐 齐云敖
