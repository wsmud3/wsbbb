this.inherits(ROOM);
this.name = "潜龙室";
this.desc = "第五间密室——潜龙勿用。室中气息内敛深沉。「潜龙勿用，阳在下也——此掌之要在隐忍。深藏不露，待时而动。」";
this.exits = { "south": "js/hongjianshi", "north": "js/lisheshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
