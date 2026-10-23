this.inherits(ROOM);
this.name = "船厂";
this.desc = "这里是古镇船厂。船厂是位于关外大平原中部的一个古老的小镇，此镇西、南、北、三面是以高墙垒筑，利于坚守。东面临松花江天成天险，乃兵家必争的要地。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = {
    "north": "kw/xuedi",
    "east": "kw/jiang",
};
this.set_npc(["kw/chuanfu", 1]);

// ────────────────────────────────────────────────────────────
// 回程：东边就是江岸。走过去（或点地图上的「松花江上」）船夫会问
// 「客官是否要回到对岸」，选「是」再走一遍同样的 10 秒航程回大门坎子，
// 选「否」就只是问一句，人留在船厂。
// ────────────────────────────────────────────────────────────
function kw_ferry_back_ask(me) {
    me.notify("<hiy>船夫放下船桨，抬头问道：客官是否要回到对岸？</hiy>");
    me.send_commands("kw_ferry_back", "是（回大门坎子）", "kw_ferry_stay", "否（先不回去）");
}

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir === "east") {
        kw_ferry_back_ask(me);
        return false;
    }
    return true;
};

this.add_action("kw_ferry_back", null, function (me) {
    if (!me.is_player) return true;
    if (!me.environment || me.environment.path !== "kw/chuanchang") {
        me.notify("船夫不在这一岸。");
        return true;
    }
    me.notify("<hiy>船夫应了一声，撑起竹篙。</hiy>");
    me.set_temp("kw_on_boat", 1, 60000);
    if (me.moveto("kw/jiang", me.name + "登上了渡船。", me.name + "被人扶上了渡船。") === false) {
        me.remove_temp("kw_on_boat");
        return true;
    }
    if (me.environment && me.environment.start_ride)
        me.environment.start_ride(me, "kw/damen");
    return true;
});

this.add_action("kw_ferry_stay", null, function (me) {
    if (!me.is_player) return true;
    me.notify("船夫笑道：客官若想回去，随时招呼我，船一直在这儿。");
    return true;
});
