this.inherits(ROOM);
this.name = "山道";
this.desc = "你走在见性峰山脊小路上，听着山下庙宇的钟鼓，眼前白云漂荡，感觉幽逸极了。";
this.exits = {
    "northup": "hs/beiyuedian",
    "southeast": "hs/guolaoling",
};
this.set_npc("hs/tianboguang");   // 采花大盗 田伯光
