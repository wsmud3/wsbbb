this.inherits(ROOM);
this.name = "松风观";
this.desc = `松风观依山而建，观前一片松林，山风吹过，松涛阵阵，故此得名。观门上方高悬一块木匾，上书"松风观"三字，颇有仙风道骨之气。石阶上落满了松针，踩上去软绵绵的。观中道士正在早课，诵经声伴着松风声，别有一番意境。北面是山路，南面是练武场。`;
this.exits = { "north": "qc/shanlu", "south": "qc/lianwuchang" };
this.set_npc(["qc/neimen", 2]);
