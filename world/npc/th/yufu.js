this.inherits(NPC);
this.name = "老迈的渔夫";
this.desc = "一个上了年纪的老渔夫，皮肤被海风吹得黝黑，正蹲在船边整理渔网。他抬头看了看你，慢声道：「这岛上的路可不好走，桃花林里绕进去容易，绕出来难。」";
this.no_fight = true;
this.hp = 5000;
this.max_hp = 5000;
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("老渔夫叹道：「年轻人，桃花林的阵势是岛主亲手布的，走南边那条路，心里记着棵数才好出来。」");
};
