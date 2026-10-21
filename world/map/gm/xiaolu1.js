this.inherits(ROOM);
this.name = "林间小路";
this.desc = "你走进一片松林，阳光照在松林中，一缕一缕的阳光，好象有了弹性似的，反照下来，洒在人的身上，如细雨一般舒畅。你仰着脸好象在饮着无私的和煦的阳光。阳光好金好亮，当山风走过，全山的松林都摇首摆脑，发出“呵呵”的声音。";
this.exits = {
    "north": "gm/guangmingding",
    "south": "gm/banshanyao",
};
this.set_npc("gm/zhoudian");   // 五散人 周颠
