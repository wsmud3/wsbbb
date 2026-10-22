this.inherits(ROOM);
this.name = "峻极禅院";
this.desc = "峻极禅院处嵩山绝顶，院中古柏森森，殿上并无佛像。院宇辽阔，可容千人。往里就是嵩山派的本院了。";
this.exits = {
    "south": "ss/qianting",
    "north": "ss/zhongmen",
};
this.set_npc("ss/lubai");       // 陆柏 score55（禅院）
this.set_npc("ss/yuehou");      // 乐厚 score55（禅院）
