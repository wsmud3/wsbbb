
this.inherits(COMMAND);
this.command = "unjinglian";

const MONEYS = [10, 100, 1000, 5000, 10000, 20000, 100000];
this.enter = function (me, oid) {
    if (oid) {
        var obj = me.find_obj(oid);
        if (!obj) {
            return me.notify("你身上没有这件装备。");
        }
        var orglevel = obj.level;
        if (!(orglevel > 0)) return me.notify("你的" + obj.color_name + "已经是初始等级了。");
        let money = MONEYS[obj.grade];

        if (!(money > 0) || me.money < money) return me.send('你身上的钱不够。');
        me.add_money(-money);
        obj.level_up(0);
        me.notify("你的" + obj.color_name + "已经是初始等级了。");
        me.items_changed(obj);
        WORLD.STATS.updateWeapon(me, obj);

        if (orglevel > 0) {
            // 与 jinglian 的消耗公式对称：grade<6 用玄晶 2^lv*grade 累计；
            // grade>=6 每级消耗 lv 个（grade 6 为元晶），累计 L(L+1)/2
            let count, path;
            if (obj.grade < 6) {
                count = (Math.pow(2, orglevel + 1) - 2) * obj.grade;
                path = "st/xuanjing";
            } else {
                count = (1 + orglevel) * orglevel / 2;
                path = obj.grade == 6 ? "st/yuanjing" : "st/xuanjing";
            }
            var item = me.add_obj(path, count);
            me.send("你获得" + item.unit_name(count) + "。");
        }

    } else {
        var buttons = [];
        for (var i = 0; i < me.items.length; i++) {
            var item = me.items[i];
            if (!item.level || !item.is_equipment) {
                continue;
            }
            buttons.push(["unjinglian " + item.id, UTIL.moneyToStr(MONEYS[item.grade]) + "清除精炼" + item.color_name]);
        }
        if (!buttons.length) {
            return me.notify("铁匠瞄了你一眼说道：你身上没有精炼过的装备。");
        }
        me.popup({ text: "铁匠说道：取消精炼后装备的等级变为初始等级，退回全部玄晶，不论精炼等级统一收费。", buttons: buttons });
    }
}
