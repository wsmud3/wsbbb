this.inherits(ROOM);
this.name = "上清宫";
this.desc = "上清宫是老君道场。宫前山门，矮树搭就，甚为灵动。宫内殿堂古色清雅，正殿供奉太上老君、吕纯阳和张三丰塑像。山前摩崖石刻【天下第五名山】气势浑厚，很是壮观。";
this.exits = {
    "westdown": "qc/sanwan",
    "northup": "qc/songfengguan",
};
this.set_npc("qc/npc01");   // 青城派外门弟子 青城派弟子
this.set_npc("qc/npc02");   // 青城派外门弟子 青城派弟子
