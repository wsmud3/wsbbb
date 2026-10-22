this.inherits(ROOM);
this.name = "药房";
this.desc = "这里是间药房，靠墙放着一只大药柜。屋子里有张桌子，上边摆满了炼药用的瓶瓶罐罐。其中一个药瓶里只装了清水。炼药师是位小姑娘，正在那里发呆，不知在想什么。北面是气派的长廊。";
this.exits = {
    "north": "bt/changlang",
};

// [mech] 药房：小青（攻略：药房是小青，可以给你配置蛇血，10 份蛇血一份药剂，杀不杀不影响进度）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.find_obj_bypath("bt/xiaoqing")) return;
    NPC.CREATE("bt/xiaoqing", this);
    this.refresh(me);
};

this.add_action("peiyao", "配制蛇血药剂", function (me, arg) {
    if (!me.is_player) return true;
    var blood = 0, list = [], i;
    if (me.items) {
        for (i = 0; i < me.items.length; i++) {
            var it = me.items[i];
            if (it && it.path === "res/shexue") {
                blood += (it.count || 1);
                list.push(it);
            }
        }
    }
    if (blood < 10) {
        me.notify("<hir>小青瞥了你一眼：「怪蟒蛇血不够，十份才配得成一份药剂。你只有 " + blood + " 份。」</hir>");
        return true;
    }
    var left = 10;
    for (i = 0; i < list.length && left > 0; i++) {
        var n = list[i].count || 1;
        var take = Math.min(n, left);
        left -= take;
        if (take >= n) me.remove_obj(list[i]);
        else me.remove_obj(list[i], take);
    }
    me.add_status({
        id: "bt_shexue_yaoji",
        name: "<hig>蛇血药剂</hig>",
        desc: "气血与力道大涨",
        duration: 120000,
        downside: false,
        override: 2,
        prop: { gj_per: 15, fy_per: 10 }
    });
    me.notify("<hig>小青取过十份怪蟒蛇血，配成一份蛇血药剂递给你。你服下，只觉周身血气翻涌。</hig>");
    me.send_room("$N服下了小青配的蛇血药剂。");
    return true;
});
