this.inherits(ROOM);
this.name = "天山折梅台";
this.desc = "一座石台，台上刻着「天山折梅手」的招式图谱。折梅手以轻巧灵动着称——「寒梅傲雪，折而不弯。举手之间，梅花满把。」";
this.exits = { "south": "lhfd/qiushuige", "north": "lhfd/liuyangzhangbei" };
this.on_create = function() { this.set_npc("lhfd/zhemei_shouwei", 1); };
