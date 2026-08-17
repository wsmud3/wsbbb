this.inherits(ROOM);
this.name = "剑渊崖畔";
this.desc = "一道不知深浅的裂缝横亘在地面，从上往下看只有无尽的黑暗。独孤求败当年在此掷下了误伤义士的紫薇软剑——剑虽已弃，剑意却千年未散。深渊中隐约能看见一点紫光，明灭不定。裂缝旁边有一条隐蔽的索道，若有勇气，或可垂索而下。东侧另有一条小路，通往弃剑坡。";
this.exits = { "south": "jz/ruanjiantai", "north": "jz/qijianpo", "east": "jz/jianyuandi" };
this.no_fight = true;

this.add_action("descend", "垂索而下", function (me) {
    var dodge = me.query_skill("dodge", 0);
    if (dodge < 500) {
        me.notify("你的轻功不够纯熟，绳索在手中滑脱！你重重地摔了下去。");
        me.damage2(me.max_hp * 0.3);
    } else {
        me.notify("你施展轻功，沿着索道缓缓降入剑渊深处。");
    }
    me.moveto("jz/jianyuandi", me.name + "沿着索道攀了下去。", me.name + "从上方沿着索道攀了下来。");
});
