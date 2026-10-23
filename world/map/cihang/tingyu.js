this.inherits(ROOM);
this.name = "听雨亭";
this.desc = "山崖尽处，一个小亭在一方突出的危岩处，险峻非常，此刻只见亭顶，看不到亭内的情况。亭子下临无极深渊，对面峰岭磋，险崖斧削而立，际此仲夏时节，翠色苍浪，山花绽放，宛若人间仙境。";
this.exits = {
    "west": "cihang/xiaolu1",
    "south": "cihang/diancangta",
};

// [mech] 靳冰云在听雨亭闭关（攻略：向右走，遇见祁冰云，选「我来寻浪翻云」，再选「可以代劳」，拿到遗书）
this.jin_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!this.find_obj_bypath("cihang/jinbingyun")) {
        NPC.CREATE("cihang/jinbingyun", this);
        this.refresh(me);
    }
    if (!me.query_temp("cihang_route")) {
        me.notify("<hiy>亭中一位白衣女子轻抚琴弦，正是慈航静斋上代传人靳冰云。</hiy>");
        return;
    }
    if (me.query_temp("cihang_yishu_got")) return;
    me.notify("<hiw>靳冰云抬眼看你：「你也是为那封信来的？」</hiw>");
    me.send_commands("cihang_bing 1", "我来寻浪翻云", "cihang_bing 2", "我来寻庞斑");
};

this.set_npc(["cihang/jinbingyun", 1]);
this.add_action("cihang_bing", null, function (me, arg) {
    if (!me.is_player) return true;
    var opt = String(arg || "").trim();
    if (opt === "1" || opt === "2") {
        var who = (opt === "1") ? "浪翻云" : "庞斑";
        me.notify("<hiw>靳冰云轻声道：「" + who + "……我已不能再去了。」</hiw>");
        me.send_commands("cihang_bing 3", "可以代劳");
        return true;
    }
    if (opt === "3") {
        if (me.query_temp("cihang_yishu_got")) {
            me.notify("遗书已经在你手中。");
            return true;
        }
        me.set_temp("cihang_yishu", 1);
        me.set_temp("cihang_yishu_got", 1);
        me.notify("<hig>靳冰云从琴案下取出一封泛黄的信笺，递到你手中。</hig>");
        me.notify("<hiy>「把它交给赏雨亭等你的人。他看了，自然会明白。」</hiy>");
        return true;
    }
    return true;
});
