this.inherits(ROOM);
this.name = "松花江上";
this.desc = "这里是松花江的江面，冰面早已解冻，清澈的江水涛涛北去，两岸是如烟如雾松支，柳条。船夫悠闲地在船尾把着舵。";
// 江面是渡船的过场：不与任何房间相连，也不给任何行走出口。
// 交船资后由渡船机制把人放到这里，5 秒后自动靠岸。
this.exits = {
};
this.set_npc([]);

// 江面只是渡船的过场：正常上船由渡船机制把人放上来（带 kw_on_boat 标记）。
// 没有标记就跑进来的（例如用寻路/其它手段绕），船夫直接把船撑回原岸。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!me.query_temp("kw_on_boat")) {
        me.notify("<red>船夫把你拦了下来：不坐我的船，怎么到江心来了？回去再说。</red>");
        me.moveto("kw/damen");
        return;
    }
    // 防卡死：万一掉线/计时被打断，6 秒后还没靠岸就直接送下船
    this.call_out(function () {
        if (!me.is_player) return;
        if (!me.environment || me.environment.path !== "kw/jiang") return;
        me.remove_temp("kw_on_boat");
        me.moveto(me.query_temp("kw_ferry_to") || "kw/chuanchang",
            me.name + "上了渡船。", me.name + "从渡船上走了下来。");
    }, 6000);
};

// ────────────────────────────────────────────────────────────
// 渡船航程（两岸共用一份实现，别处只负责把人送上船再调这里）
//
//   0 秒上船 → 2.5 秒一句「渡船正在前进」→ 5 秒靠岸
//   靠岸时船夫在消息栏说「客官，对岸已经到了」，然后把人放下船
//
// 中途离开江面（被打断、掉线、被传走）就中止，不会隔空把人传走。
// ────────────────────────────────────────────────────────────
this.start_ride = function (me, to) {
    if (!me || !me.is_player) return;
    me.set_temp("kw_on_boat", 1, 60000);
    me.set_temp("kw_ferry_to", to, 60000);
    me.call_interval(function (i) {
        if (!me.is_player) return false;
        if (!me.environment || me.environment.path !== "kw/jiang") return false;
        if (i === 0) return true;
        me.notify("<hiy>渡船正在前进，江水拍打着船舷……</hiy>");
        return true;
    }, 2500, 2, function () {
        me.call_out(function () {
            if (!me.is_player) return;
            if (!me.environment || me.environment.path !== "kw/jiang") return;
            me.remove_temp("kw_on_boat");
            me.notify("<hig>船夫说道：客官，对岸已经到了。</hig>");
            me.moveto(to, me.name + "上了渡船。", me.name + "从渡船上走了下来。");
        }, 2500);
    });
};
