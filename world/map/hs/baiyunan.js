this.inherits(ROOM);
this.name = "白云庵";
this.desc = "这里是恒山派白云庵。庵内供奉这白衣观世音，除地上一个蒲团，四壁萧然。恒山派威震江湖，没想到主庵居然简朴一至如斯。";
this.exits = {
    "north": "hs/houdian",
    "south": "hs/jianxingfeng",
    "east": "hs/donglang",
    "west": "hs/xilang",
};
this.set_npc("hs/npc01");   // 恒山派弟子 仪文
this.set_npc("hs/npc02");   // 恒山派弟子 仪质
