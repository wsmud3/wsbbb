this.inherits(ROOM);
this.name = "九天玄女化身台";
this.desc = "九天瑶池的最终战场。一座悬浮于五彩祥云之上的白玉平台。台上站着九天玄女的「化身」——她全身笼罩在五彩光芒之中，手中的玉圭散发出令天地变色的力量。「金木水火土，五行尽在我手。汝，能御几行？」";
this.exits = { "south": "yc/zhenqichongsu", "north": "yc/chuanchengdian", "west": "yc/suxinwendao" };
this.on_create = function() { this.set_npc("yc/xuannv_huashen", 1); };
