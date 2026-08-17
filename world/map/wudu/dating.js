	this.inherits(ROOM);
	this.name = "大厅";
	this.desc = "五毒教大厅，正中石座上铺着一张巨大的蛇皮，靠背上雕刻着五毒——蛇、蝎、蜈蚣、蟾蜍、壁虎。两旁的烛台是用人骨制成，烛火发出幽绿的光芒。地上铺着苗族的蜡染布，上面绣的却是各种毒虫图案。整座大厅阴森恐怖，处处透着苗疆蛊术的神秘与可怕。北面是练毒室，南面通向花园。";
	this.exits = { "north": "wudu/liandushi", "south": "wudu/huayuan" };
	this.set_npc(["wudu/hehongyao", 1], ["wudu/qiyunao", 1]);
