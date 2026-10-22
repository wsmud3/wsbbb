this.inherits(ROOM);
this.name = "中岳大殿";
this.desc = "大殿面阔九间，进深五间，重檐庑殿式屋顶，座落在七尺高的台基上，气势雄伟。大殿中供奉岳神天中王。";
this.exits = {
    "northup": "ss/shandao",
    "south": "ss/tianzhongge",
};
this.set_npc(["ss/zhongzhen", 1]);
