this.inherits(ROOM);
this.name = "卧室";
this.desc = "这里是移花宫两位宫主的卧室。这里到处都充满了花香，使你陶醉其中。床铺也是装饰的像花床一样。你仔细的看了一下<cmd cmd='look bed'>床(bed)</cmd>，似乎有点不对劲，你凑上前去看了一下。";
this.exits = {
    "northwest": "yh/yaoyuegong",
    "northeast": "yh/lianxinggong",
};
this.set_npc([]);

// [原版实测] look bed →
// {"desc":"一张华丽的花床，但是你仔细的看了一下，似乎能移动。",
//  "commands":[pushleft bed/向左移动, pushright bed/向右移动, pushstart bed/还原]}
// 左移次数 = 邀月宫花朵数，右移次数 = 涟星宫花朵数，两数都对上 → 床板裂开出现 down → 密道
this.set_item("bed", "床(bed)", "一张华丽的花床，但是你仔细的看了一下，似乎能移动。", [
    ["pushleft", "向左移动", function (me) {
        if (!me.is_player) return true;
        if (!this.yh_can_push(me)) return true;
        var n = (this.query_temp(me, "yh_push_left") || 0) + 1;
        this.set_temp(me, "yh_push_left", n);
        me.send_room("$N将床板往左移...，忽然轧轧几声，床板又移回原位。");
        return this.yh_check(me);
    }],
    ["pushright", "向右移动", function (me) {
        if (!me.is_player) return true;
        if (!this.yh_can_push(me)) return true;
        var n = (this.query_temp(me, "yh_push_right") || 0) + 1;
        this.set_temp(me, "yh_push_right", n);
        me.send_room("$N将床板往右移...，忽然轧轧几声，床板又移回原位。");
        return this.yh_check(me);
    }],
    ["pushstart", "还原", function (me) {
        if (!me.is_player) return true;
        this.set_temp(me, "yh_push_left", 0);
        this.set_temp(me, "yh_push_right", 0);
        me.notify("你把床板推回了原位。");
        return true;
    }]
]);

this.yh_check = function (me) {
    var l = this.query_temp(me, "yh_push_left") || 0;
    var r = this.query_temp(me, "yh_push_right") || 0;
    var wantL = this.query_temp(me, "yh_hua_yue");
    var wantR = this.query_temp(me, "yh_hua_xing");
    if (l === wantL && r === wantR) {
        me.send_room("床板忽然发出轧轧的声音，缓缓向两边移动著，露出一个洞口。");
        me.notify("<hig>床下露出一条向下的密道。</hig>");
        this.add_exit("down", "yh/midao");
    }
    return true;
};

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.query_temp(me, "yh_push_left") !== undefined && this.query_temp(me, "yh_hua_yue") !== undefined) {
        var l = this.query_temp(me, "yh_push_left") || 0;
        var r = this.query_temp(me, "yh_push_right") || 0;
        if (l === this.query_temp(me, "yh_hua_yue") && r === this.query_temp(me, "yh_hua_xing")) this.add_exit("down", "yh/midao");
    }
};

// 两位宫主是否都已伏诛（没杀完谁都别想进卧室、也别想推床）
this.yh_both_dead = function (me) {
    var area = this.parent;   // 房间的区域在 parent 上（房间没有 environment，原写法恒为 false → 进宫出不来）
    if (!area || !area.rooms) return false;
    var team = me && me.query_teamid ? me.query_teamid() : null;
    var yue = false, xing = false;
    for (var i = 0; i < area.rooms.length; i++) {
        var cp = area.rooms[i].query_copy(team);
        if (!cp || !cp.items) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (!o || o.is_player) continue;
            if (o.path === "yh/yaoyue" && o.hp > 0) yue = true;
            if (o.path === "yh/lianxing" && o.hp > 0) xing = true;
        }
    }
    return !yue && !xing;
};

this.yh_can_push = function (me) {
    if (this.yh_both_dead(me)) return true;
    me.notify("<red>床板纹丝不动——两位宫主都还在，这床不会开。</red>");
    return false;
};
