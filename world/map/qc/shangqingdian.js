this.inherits(ROOM);
this.name = "上清殿";
this.desc = "上清殿是青城派的正殿，飞檐斗拱，气势恢宏。殿中供奉着三清道祖——元始天尊、灵宝天尊、道德天尊的塑像，神态庄严。殿内香烟缭绕，铜炉中焚烧的上好檀香散发出沁人心脾的香气。道士们手持拂尘，正在做午间的法事，口中念念有词，神圣肃穆。北面是练武场，南面通向花园。";
this.exits = { "north": "qc/lianwuchang", "south": "qc/huayuan" };
this.set_npc(["qc/yurenyan", 1]);
