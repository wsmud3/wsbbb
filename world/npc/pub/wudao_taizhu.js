this.inherits(NPC);
this.set({
    name: "武道塔主",
    desc: "一位白发苍苍的老者，眼神深邃如星空，周身散发着若有若无的气息。他便是武道塔的主人，传说中已经守护此塔数百年。",
    title: "<hir>武道塔主</hir>",
    gender: 1,
    age: 99,
    per: 50,
    mp: 100000,
    max_mp: 100000,
    hp: 100000,
    max_hp: 100000,
    no_refresh: true,
    no_fight: true
});

this.add_action("ctdh", "词条兑换", function (me, arg) {
    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
    if (!duanzao) return me.notify("武道塔主说道：锻造之道尚未贯通，词条兑换暂不可用。");
    var cmd = WORLD.COMMANDS["list"];
    if (cmd) cmd.enter(me, this.id);
});

// 武道塔主出售所有词条石，每块100黄金
// 缓存售卖列表，避免每次调用on_sell生成新ID导致buy/checkobj找不到物品
this._sell_cache = null;
this.on_sell = function (me) {
    if (this._sell_cache) return this._sell_cache;
    var list = [];
    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
    if (!duanzao) return list;

    for (var key in duanzao.PROPS) {
        var stone = OBJ.CREATE("st/p#" + key);
        if (stone) {
            stone.count = -1;
            stone.value = 10000;
            list.push(stone);
        }
    }
    this._sell_cache = list;
    return list;
};
