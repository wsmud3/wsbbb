this.inherits(ROOM);
this.name = "松花江上";
this.desc = "这里是松花江的江面，冰面早已解冻，清澈的江水涛涛北去，两岸是如烟如雾松支，柳条。船夫悠闲地在船尾把着舵。";
this.exits = {
    "west": "kw/chuanchang",
};
this.set_npc([]);

// 江面只是渡船的过场：正常上船由渡船机制把人放上来（带 kw_on_boat 标记）。
// 没有标记就跑进来的（例如用寻路/其它手段绕），船夫直接把船撑回原岸。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("kw_on_boat")) return;
    me.notify("<red>船夫把你拦了下来：不坐我的船，怎么到江心来了？回去再说。</red>");
    me.moveto("kw/damen");
};

// ────────────────────────────────────────────────────────────
// 渡船航程（两岸共用一份实现，别处只负责把人送上船再调这里）
//
//   0 秒  上船 → 每 3 秒一句「渡船正在前进」 → 9 秒最后一句 → 10 秒靠岸
//
// 中途离开江面（被打断、掉线、被传走）就中止，不会隔空把人传走。
// ────────────────────────────────────────────────────────────
this.start_ride = function (me, to) {
    if (!me || !me.is_player) return;
    me.set_temp("kw_on_boat", 1, 60000);
    me.call_interval(function (i) {
        if (!me.is_player) return false;
        if (!me.environment || me.environment.path !== "kw/jiang") return false;
        if (i === 0) return true;
        me.notify("<hiy>渡船正在前进，江水拍打着船舷……</hiy>");
        return true;
    }, 3000, 4, function () {
        me.call_out(function () {
            if (!me.is_player) return;
            if (!me.environment || me.environment.path !== "kw/jiang") return;
            me.remove_temp("kw_on_boat");
            me.notify("<hig>渡船靠岸了。</hig>");
            me.moveto(to, me.name + "上了渡船。", me.name + "从渡船上走了下来。");
        }, 1000);
    });
};
