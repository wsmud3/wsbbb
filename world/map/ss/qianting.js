this.inherits(ROOM);
this.name = "前庭";
this.desc = "这里是峻极禅院山门内前庭。庭院中青石铺地、古柏森森，可容纳数百人集会。内里是禅院大殿，两厢是一些低矮小房。";
this.exits = {
    "southdown": "ss/junjishanmen",
    "north": "ss/junjichanyuan",
};
this.set_npc("ss/zhongzhen");    // 钟镇 score55（前庭）
this.set_npc("ss/shatianweng");  // 沙天翁 score55（中门之前）
