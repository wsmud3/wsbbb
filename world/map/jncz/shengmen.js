this.inherits(ROOM);
this.name = "生门";
this.desc = "一方不过丈许的小小石室，四壁空空，唯有地面中央嵌着一块浑圆的翡翠，翠绿欲滴，仿佛凝聚了无尽的生机。翡翠旁立着一块古朴石碑，上书两行篆字：「生者死之始，死者生之始。知生死之道者，方为不死。」石室顶部有一线天光洒落，照在翡翠之上，泛起柔和的金绿色光晕。";
this.exits = { "west": "jncz/wenxintai" };
this.set_npc([]);

this.add_action("drink_spring", "饮下生机泉", function (me) {
    if (me.query_temp("jncz_shengmen")) {
        me.notify("你已通过生门试炼，翡翠的光芒柔和地映照着你。");
        return true;
    }
    me.notify("<hio>你俯身以手掬起翡翠上凝聚的晶莹液体，一饮而尽。</hio>");
    me.notify("<hig>一股温热的暖流自丹田升起，瞬间走遍全身经脉！你感觉体内每一个角落都被生命之力洗涤，所有伤势以肉眼可见的速度愈合。</hig>");
    me.notify("<hiy>你闭上双眼，在生死之间的大恐怖中，领悟了「生」的真谛——生门试炼通过！</hiy>");

    me.set_temp("jncz_shengmen", 1);
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.remove_temp("jncz_wangsheng_passed");

    return true;
});

// 跃下深谷快捷出口 - 通往崖底（继续邪王路线）
this.add_action("leap_down", "跃下深谷", function (me) {
    me.notify("<hiy>你从生门另一侧的裂缝一跃而下，轻飘飘地落在了崖底。</hiy>");
    me.moveto("jncz/yadi");
    return true;
});

// 攀回后山崖
this.add_action("climb_up", "攀回后山崖", function (me) {
    me.notify("<hiy>你沿着石壁上的裂缝攀爬而上，回到了后山崖。</hiy>");
    me.moveto("jncz/houshanya");
    return true;
});
