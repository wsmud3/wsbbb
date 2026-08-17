this.inherits(NPC);
this.set({
    name: "装备商人",
    desc: "一位装备商人，专门贩卖各种装备。",
    title: "<hiy>装备商人</hiy>",
    gender: 1, age: 40, per: 15,
    no_refresh: true,
    no_fight: true,
    is_merchant: true,
    hp: 100000, max_hp: 100000,
    mp: 50000, max_mp: 50000,
    score: 50,
    gj: 10000, fy: 10000, mz: 12000, ds: 10000, zj: 10000,
    str: 5000, con: 5000, dex: 4000, int: 4000,
});
this.on_enter = function (me) {
    me.notify("装备商人看了你一眼。");
};

this.add_action("list", "浏览商品", function (me) {
    me.do_command("list", this.id);
});

this.on_kill = function (me) {
    return me.notify_fail("装备商人微微一笑：\"我只是个做生意的，何必打打杀杀呢？\"");
};

this.on_die = function () {
    return false;
};

this._goodsCache = null;

this.on_sell = function (me) {
    if (this._goodsCache) return this._goodsCache;

    this._goodsCache = [];
    var item0 = OBJ.CREATE("eq/lv6/wushen/jinding_head");
    if (item0) {
        item0.count = -1;
        item0.value = 10000;
        this._goodsCache.push(item0);
    }
    var item1 = OBJ.CREATE("eq/lv6/wushen/qibao_ring");
    if (item1) {
        item1.count = -1;
        item1.value = 10000;
        this._goodsCache.push(item1);
    }
    var item2 = OBJ.CREATE("eq/lv6/wushen/taiyin_throw");
    if (item2) {
        item2.count = -1;
        item2.value = 10000;
        this._goodsCache.push(item2);
    }
    var item3 = OBJ.CREATE("eq/lv6/wushen/zhuque_wrist");
    if (item3) {
        item3.count = -1;
        item3.value = 10000;
        this._goodsCache.push(item3);
    }
    var item4 = OBJ.CREATE("eq/lv6/wushen/taiji_cloth");
    if (item4) {
        item4.count = -1;
        item4.value = 10000;
        this._goodsCache.push(item4);
    }
    var item5 = OBJ.CREATE("eq/lv6/wushen/xuanyuan_sword");
    if (item5) {
        item5.count = -1;
        item5.value = 10000;
        this._goodsCache.push(item5);
    }
    return this._goodsCache;
};
// placed_in: yz/guangchang