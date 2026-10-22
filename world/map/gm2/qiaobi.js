this.inherits(ROOM);
this.name = "峭壁";
this.desc = "暗河尽头是一面湿滑的峭壁，头顶隐约有光。上面像是有一处平台。";
this.exits = { "north": "gm2/anhe", "south": "gm2/pingtai" };
this.set_npc([]);

// 原版机制：从暗河出来要往上跳，才能到平台。
this.add_action("climb_up", "纵身跃上", function (me) {
    me.notify("<hig>你提一口气，足尖在峭壁上连点数下，翻身跃上了平台。</hig>");
    me.moveto("gm2/pingtai", me.name + "跃上峭壁走了。", me.name + "从峭壁下跃了上来。");
    return true;
});
