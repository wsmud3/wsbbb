this.inherits(ROOM);
this.name = "密道";
this.desc = "一条黑暗的密道，伸手不见五指。石壁上湿漉漉的，脚下是粗糙的石阶，不知通向何处。";
this.exits = { "north": "hmy/houting" };

// [mech] 密道：火折子点亮 → 找到铁环 → 拉动打开小花园（攻略原文）
this.midao_lit = false;
this.ring_found = false;
this.gate_open = false;

this.hmy_have = function (me, p, name) {
    if (!me.items) return null;
    for (var i = 0; i < me.items.length; i++) {
        var it = me.items[i];
        if (!it) continue;
        if (it.path === p) return it;
        if (name && it.name === name) return it;
    }
    return null;
};

this.set_item("tiexuan", "铁环", "石壁上一枚锈迹斑斑的铁环，藏在凹处，暗里看不真切。", [
    ["la", "拉动铁环", null]
]);

this.add_action("dianliang", null, function (me, arg) {
    if (!me.is_player) return true;
    if (this.midao_lit) {
        me.notify("火折子已经点亮了。");
        return true;
    }
    if (!this.hmy_have(me, "res/huozhezi", "火折子")) {
        me.notify("<hir>密道中一片漆黑，你需要火折子才能照亮。</hir>");
        me.notify("<hiy>（火折子可在副本掉落或杂货铺寻得）</hiy>");
        return true;
    }
    this.midao_lit = true;
    this.ring_found = true;
    me.send_room("$N吹亮火折子，密道里亮起一团昏黄的光。");
    me.notify("<hig>火光亮起，你看见石壁凹处嵌着一枚锈铁环——看那铁环，可拉动。</hig>");
    return true;
});

this.add_action("la", null, function (me, arg) {
    if (!me.is_player) return true;
    if (!this.midao_lit) {
        me.notify("<hir>太黑了，你摸不到什么铁环。先点亮火折子。</hir>");
        return true;
    }
    if (this.gate_open) {
        me.notify("石门已经开了，往东便是小花园。");
        return true;
    }
    this.gate_open = true;
    this.add_exit("east", "hmy/xiaohuayuan");
    me.send_room("$N用力一拉铁环，石壁深处传来沉闷的轧轧声，一道石门缓缓移开。");
    me.notify("<hig>铁环拉动，石门开启——东边便是小花园，东方不败的闺房就在花园之东。</hig>");
    this.exits_changed();
    this.refresh(me);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!this.midao_lit) {
        me.notify("<hiy>密道里黑得伸手不见五指，石壁上似有东西，却看不分明。</hiy>");
        me.send_commands("dianliang 1", "点亮火折子");
        return;
    }
    if (this.gate_open && !this.query_exits("east")) {
        this.add_exit("east", "hmy/xiaohuayuan");
    }
    if (!this.gate_open) me.send_commands("la 1", "拉动铁环");
};
