this.inherits(ROOM);
this.name = "练武场";
this.desc = "青城派的练武场坐落在一片平整的山台上。青石板铺就的地面被弟子们的脚步磨得光滑发亮。场边兵器架上陈列着松纹古剑、拂尘、长棍等道家兵器。几个年轻道士正在练习青城剑法，剑光霍霍，招式灵动飘逸，颇有道家以柔克刚的意境。北面是松风观，南面是上清殿。";
this.exits = { "north": "qc/songfengguan", "south": "qc/shangqingdian" };
this.set_npc(["qc/neimen", 2]);
