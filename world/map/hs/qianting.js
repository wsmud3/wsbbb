this.inherits(ROOM);
this.name = "前厅";
this.desc = "恒山派前厅，陈设朴素而雅致。厅中供奉着观音菩萨的塑像，慈眉善目，宝相庄严。供桌上摆放着鲜花素果，檀香缭绕。几位身着缁衣的尼姑正在洒扫庭院，动作轻柔而专注。这里的一切都透着一股出尘脱俗的气息。北面是山门，南面通向大厅。";
this.exits = { "north": "hs/shanmen", "south": "hs/dating" };
this.set_npc(["hs/hengshandizi", 2]);
