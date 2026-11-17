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

// 花数在宫主死时已定下（world/area/fb1/fb23.js yh_master_died），这里按同一规则取用
this.yh_want = function (me) {
    return [this.parent.yh_flowers(this, me, "yh_hua_yue"), this.parent.yh_flowers(this, me, "yh_hua_xing")];
};
this.yh_matched = function (me) {
    var l = this.query_temp(me, "yh_push_left") || 0;
    var r = this.query_temp(me, "yh_push_right") || 0;
    var w = this.yh_want(me);
    return l === w[0] && r === w[1];
};
this.yh_check = function (me) {
    if (this.yh_matched(me) && !(this.exits && this.exits.down)) {
        me.send_room("床板忽然发出轧轧的声音，缓缓向两边移动著，露出一个洞口。");
        me.notify("<hig>床下露出一条向下的密道。</hig>");
        this.add_exit("down", "yh/midao");
    }
    return true;
};

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.yh_both_dead(me) && this.yh_matched(me) && !(this.exits && this.exits.down)) this.add_exit("down", "yh/midao");
};

// 两位宫主是否都已伏诛（没杀完谁都别想推床）
this.yh_both_dead = function (me) {
    var area = this.parent;
    if (!area || !area.yh_find_npc) return false;
    return !area.yh_find_npc(this.owner, "yh/yaoyue") && !area.yh_find_npc(this.owner, "yh/lianxing");
};

this.yh_can_push = function (me) {
    if (this.yh_both_dead(me)) return true;
    me.notify("<red>床板纹丝不动，像是被宫中另一处机关牵制着。</red>");
    return false;
};
