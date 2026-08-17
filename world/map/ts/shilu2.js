this.inherits(ROOM);
this.name = "石路";
this.desc = "山势渐陡，石阶两旁出现了历代文人墨客的摩崖石刻，字迹或苍劲或飘逸，记录着千年来登临者的感慨。云雾从山谷中升腾而起，如轻纱般拂过面颊。山路向北通向更高处，向南则可下山。";
this.exits = { "north": "ts/shilu3", "south": "ts/shilu1" };
this.set_npc(["ts/tiansong", 1]);
