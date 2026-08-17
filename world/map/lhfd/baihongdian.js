this.inherits(ROOM);
this.name = "白虹殿";
this.desc = "一座以白色为主调的大殿。殿中悬浮着一道白色的虹光——白虹掌力的真气凝聚体。逍遥派的至高掌法，掌力可拐弯转向，令人防不胜防。";
this.exits = { "south": "lhfd/lingboweilang", "north": "lhfd/wuyazijiuju" };
this.on_create = function() { this.set_npc("lhfd/baihong_shouwei", 1); };
