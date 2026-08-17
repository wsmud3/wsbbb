this.inherits(ROOM);
this.name = "后山崖";
this.desc = "禅院后方是一处陡峭的悬崖，云雾缭绕，深不见底。崖边立着一块石碑，刻着：「生门——跳下去者，不死即证菩提」。据说只有身怀大毅力、大免伤之人，才能活着到达崖底。北面便是天僧祖师闭关的禅房。东侧岩壁上隐约有一条幽暗石径向下延伸，不知通向何处。";
this.exits = { "south": "jncz/guanyindian", "north": "jncz/tiansengchanfang", "east": "jncz/wangshengjing" };
this.set_npc([]);
this.add_action("jump_cliff", "跳下去", function (me) {
    me.notify("<hir>你纵身跃下悬崖，耳边风声呼啸！</hir>");
    var rawDmg = 5000000;
    var fy = me.fy || 0;
    var diff_sh_per = me.diff_sh_per || 0;
    var actualDmg = rawDmg;
    if (diff_sh_per > 0) actualDmg = actualDmg - actualDmg * Math.min(diff_sh_per, 95) / 100;
    if (fy > 0 && actualDmg > 0) actualDmg = Math.floor((actualDmg / (actualDmg + fy)) * actualDmg);
    actualDmg = actualDmg - (me.query_prop("diff_sh") || 0);
    if (actualDmg < 1) actualDmg = 1;
    me.damage2(actualDmg, null);
    me.notify("<hiy>你受到了" + actualDmg + "点坠落伤害！</hiy>");
    if (me.hp > 0) {
        me.notify("<hio>你以强大的免伤之力扛住了坠落冲击，安然落地！</hio>");
        me.moveto("jncz/yadi");
    } else {
        me.notify("<hir>坠落的力量太过恐怖，你被摔得粉身碎骨……</hir>");
    }
    return true;
});
