this.inherits(ROOM);
this.name = "草谷垛";
this.desc = "经过一番艰苦的跋涉，你的眼前出现了一片低矮的丘陵。远远看去象秋收后堆成的谷草垛，密密麻麻，数不清有多少个。翻过这片丘陵再向东行，就可进入长白大山了。东面的天边有一缕炊烟，看来似乎有人。";
this.exits = {
    "east": "kw/baihe",
    "northwest": "kw/mantianxing",
};
this.set_npc(["kw/jindiao", 1]);
