this.inherits(ROOM);
this.name = "火山";
this.desc = "到这里一什么也看不见了，满眼都是飞扬的火山灰和火红的岩浆，你感觉自己快被烤熟了。翻滚的<cmd cmd='look huokou'>火山口</cmd>边缘，隐约有几点异样的红光。";
this.exits = {
    "east": "bh/huoshanjiao",
};
this.set_npc([]);

// 冰火岛环境：进入/心跳叠加灼热（规则见 world/area/fb1/fb22.js）
this.on_enter = function (me) {
    if (this.parent && this.parent.bh_env) this.parent.bh_env(this, me, true);
};
this.on_heart_beat = function () {
    if (this.is_copy_room && this.parent && this.parent.bh_env_tick) this.parent.bh_env_tick(this);
};

// 攻略：最西边是火山，玲珑火芝和离火珠就在这里，不过搜索至少要50万气血以上。
//   气血不足 50 万：一靠近就被热浪逼回，并被灼伤。
//   搜索时被岩浆灼伤 30 万气血（所以要 50 万以上才撑得住），每个副本只能搜一次（副本存储）。
//   必得玲珑火芝；离火珠普通 30%、困难 60%。
var BH_SEARCH_HP = 500000;
var BH_SEARCH_COST = 300000;
this.bh_search = function (me) {
    if (!me || !me.is_player) return true;
    if (me.is_fighting && me.is_fighting()) { me.notify("你正在战斗，哪有空去翻火山口？"); return true; }
    if (this.query_temp(me, "bh_huoshan_searched")) {
        me.notify("火山口边缘已被你翻了个遍，再也找不到什么了。");
        return true;
    }
    if (me.hp < BH_SEARCH_HP) {
        var burn = Math.floor(me.hp * 0.2);
        if (burn > 0) me.add_hp(-burn);
        me.notify("<hir>你刚靠近火山口，一股岩浆热浪迎面扑来，将你逼了回来！以你此刻的气血，根本近不得火山口。</hir>");
        return true;
    }
    this.set_temp(me, "bh_huoshan_searched", 1);
    me.add_hp(-BH_SEARCH_COST);
    me.send_room("$N冒着灼人的热浪，在火山口边缘的岩缝中仔细翻找。");
    me.notify("<hir>岩浆溅上身来，你被灼伤了 " + BH_SEARCH_COST + " 点气血！</hir>");
    me.add_obj("eq/lv3/longhuozhi");
    me.notify("<hig>你在岩缝里找到了一株通体透红的玲珑火芝！</hig>");
    var odds = this.query_temp(me, "diff", 0) === 1 ? 0.6 : 0.3;
    if (Math.random() < odds) {
        me.add_obj("eq/lv4/lihuozhu");
        me.notify("<hio>熔岩深处滚出一颗赤红的珠子——离火珠！</hio>");
    } else {
        me.notify("<hiy>熔岩深处似乎还有红光闪动，可再往里实在太烫了。</hiy>");
    }
    return true;
};
this.set_item("huokou", "火山口", "火山口里岩浆翻滚，热气灼人。岩缝之间偶有红光闪烁，似乎藏着什么宝物。", [
    ["bh_search", "搜索", function (me) { return this.bh_search(me); }]
]);
