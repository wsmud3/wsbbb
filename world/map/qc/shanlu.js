this.inherits(ROOM);
this.name = "山路";
this.desc = "一条蜿蜒的山路通往青城山深处。山路两旁竹林茂密，翠色欲滴，风吹竹叶发出沙沙的声响。石阶虽陡但修整得十分整齐，每隔一段便有供人歇脚的石凳。远处传来道观中的钟磬之声，悠扬而空灵，仿佛能涤荡人心中的尘埃。南面通向松风观。";
this.exits = { "south": "qc/songfengguan" };
this.set_npc(["qc/waimendizi", 2]);
