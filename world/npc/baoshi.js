this.inherits(NPC);
this.set({
    name: "锻造石商人",
    desc: "一位贩卖各种属性词条石的商人，据说他的石头可以镶嵌到自制装备上。",
    title: "宝石商",
    gender: 1,
    age: 40,
    per: 25,
    mp: 10000, max_mp: 10000,
    hp: 10000, max_hp: 10000,
});

this.add_action("list", "购买词条石", function (me) {
    me.do_command("list", this.id);
});

this.on_kill = function (me) {
    return me.notify_fail("竖子尔敢？光天化日朗朗乾坤，竟敢如此！");
};

this.on_die = function () {
    return false;
};

this._goodsCache = null;

this.on_sell = function (me) {
    if (this._goodsCache) return this._goodsCache;

    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
    if (!duanzao || !duanzao.PROPS) {
        me.notify("锻造系统未加载，无法出售词条石。");
        return [];
    }

    this._goodsCache = [];
    for (var propKey in duanzao.PROPS) {
        var propInfo = duanzao.PROPS[propKey];
        if (!propInfo || !propInfo.name) continue;

        var stone = OBJ.CREATE("st/p#" + propKey);
        if (!stone) continue;

        stone.count = -1;   // 充足库存
        stone.value = 50000; // 单价 5 两黄金（5万铜板），可根据稀有度调整
        // 可选：根据属性类别调整价格
        // if (propInfo.category >= 3) stone.value = 100000;

        this._goodsCache.push(stone);
    }
    return this._goodsCache;
};