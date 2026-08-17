this.inherits(ROOM);
this.name = "山门";
this.desc = `恒山派的山门由青石砌成，庄严肃穆。门上匾额写着"恒山派"三个大字，字体秀丽端庄。门前两株古柏参天而立，树下放着一只巨大的石香炉，炉中香烟袅袅，经久不散。门内传来木鱼声和诵经声，令人心静如水。北面是见性峰，南面是前厅。`;
this.exits = { "north": "hs/jianxingfeng", "south": "hs/qianting" };
this.set_npc(["hs/hengshandizi", 2]);
