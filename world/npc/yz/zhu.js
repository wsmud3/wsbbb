this.inherits(NPC);
this.set({
    name: "朱熹",
    desc: "他是当朝有名的大儒。",
    gender: 1,
    age: 35,
    per: 22,
    mp: 1500,
    max_mp: 1500,
    hp: 1500,
    max_hp: 1500,
});
this.set_chat_msg([
    "朱熹说道：万物之生，负阴而抱阳，莫不有太极，莫不有两仪",
    "朱熹说道：为学之道，莫先于穷理；穷理之要，必先于读书。",
    "朱熹说道：读书之法，在循序而渐进，熟读而精思。",
    "朱熹说道：立身以立学为先，立学以读书为本。"
]);
this.on_enter = function (me) {
    me.notify("朱熹手抚长须：这位" + me.call() + "，老夫除了教书，还有<hic>空白秘籍</hic>出售，可助你开创独门武学。");
};

this.add_action("list", "购买物品", function (me) {
    me.do_command("list", this.id);
});

this.on_sell = function (me) {
    // 防止玩家同时拥有多本自创秘籍
    var items = me.items;
    if (items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] && items[i].path && items[i].path.indexOf("zc/blank_book") >= 0) {
                me.notify("朱熹说道：你身上已经有一本秘籍了，先把它用好吧。");
                return [];
            }
        }
    }
    var book = OBJ.CREATE("zc/blank_book");
    if (!book) return [];
    book.id = "blank_book";
    book.count = -1;
    book.value = 100000;
    return [book];
};

// 购买后实际给予玩家的物品，在此恢复玩家的自创秘籍数据
this.on_sell_item = function (me, sell_obj) {
    if (sell_obj && sell_obj.restore_from_skill) {
        var restored = sell_obj.restore_from_skill(me);
        if (restored) {
            // 恢复成功后刷新客户端物品显示，避免显示为空白秘籍
            me.items_changed(sell_obj);
        }
    }
};

this.skill_map(
    ["literate", 10000]);
this.add_action('tui', '退款', function (me) {
    var count = me.query_temp('learn/zhu', 0);
    if (!count) return me.notify('朱熹说道：我不记得收过你这个学生啊....');
    me.notify('朱熹说道：这是你的学费。');
    me.remove_temp('learn/zhu');
    me.add_exp(0, 0, count);
});

this.on_checkskill = function (me) {
    if (!me.query_temp("learn/zhu")) {
        me.notify_fail("朱熹说道： 咦？" + me.name + "，我不记得收过你这个学生啊....");
        var lv = me.query_skill("literate", 0);
        let grade = SKILL.get('literate').query_grade(me);
        var money1 = (lv + lv + 10) * 1000 * (grade + 1) / 2;
        var money2 = (lv + lv + 100) * 10000 * (grade + 1) / 2;
        var money3 = (lv + lv + 1000) * 100000 * (grade + 1) / 2;
        let diff = me.query_prop('haoranqi');
        if (diff > 0) {
            money1 = parseInt(money1 - diff * money1 / 100);
            money2 = parseInt(money2 - diff * money2 / 100);
            money3 = parseInt(money3 - diff * money3 / 100);
        }

        me.send_commands("give " + this.id + " " + money1 + " money", UTIL.moneyToStr(money1) + "学习10级",
            "give " + this.id + " " + money2 + " money", UTIL.moneyToStr(money2) + "学习100级",
            "give " + this.id + " " + money3 + " money", UTIL.moneyToStr(money3) + "学习1000级");
        return false;
    }
    return true;
}
this.on_accept = function (me, obj, count) {
    if (obj != "money") return false;

    me.add_temp("learn/zhu", count);
    me.notify("朱熹点了点头，说道：哦，向你这麽有心的学生还真是不多见，好好努力。");

    return true;
}
this.on_teach = function (me) {

    return this.on_checkskill(me);
}
this.do_teach = function (me, skill, lv) {
    var money = me.query_temp("learn/zhu", 0);
    if (!money) {
        me.remove_temp("learn/zhu");
        me.notify("朱熹点了点头，说道：嗯，这次就先教到这里。");
        return false;
    }

    let exp = parseInt((me.int + me.query_prop("int")) *
        (100 + me.query_prop("study_per") + me.family.query_temp('study_per', 0)
            + WORLD.DATA.query_temp("study_per", 0) + me.int) / 100) * 3000;

    let grade = skill.query_grade(me);
    let diff = me.query_prop('haoranqi');


    while (exp >= 0) {
        lv = me.query_skill("literate", 0);
        var need_money = lv * 100 * (grade + 1);
        if (diff > 0) {
            need_money = parseInt(need_money * (1 - diff / 100));
        }
        if (money >= need_money) {
            money -= need_money;
            var needexp = skill.level_exp(lv, me);
            skill.add_exp(me, needexp);
            exp -= needexp;
            me.add_temp("learn/zhu", -need_money);
        } else {
            me.notify("朱熹点了点头，说道：嗯，这次就先教到这里。");
            me.remove_temp("learn/zhu");
            me.remove_temp("learn/literate");
            return false;
        }
    }
    return true;
}
