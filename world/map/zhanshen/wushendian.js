this.inherits(ROOM);
this.name = "武神殿";
this.desc = "一座无比宏大的殿堂，穹顶高不可及，漫天星斗在殿顶流转，仿佛整个宇宙都收纳于此。大殿正中，一尊高达百丈的战神雕像巍然矗立，那雕像的面容模糊不清，似乎随着观者的心境而变化——传说每一个登临武神之境的人，看到的都是自己的面容。雕像脚下，九条巨龙石雕环绕而伏，龙头朝向殿门，似乎在向每一位踏入此殿的武神俯首称臣。\n\n殿中弥漫着一股苍茫古老的威压，那是历代武神残留在天地间的意志。四壁之上，一幅幅壁画描绘着远古神魔大战的壮丽场景——而这其中最显眼的，是一幅崭新的空白画卷，仿佛在等待着下一位武神的传说被铭刻其上。";
this.exits = { "south": "zhanshen/jiuchongtian" };
this.set_npc([]);
this.no_relive = true;

this.on_enter = function (me) {
    if (me.query_temp("zhanshen_wushen")) {
        me.notify("武神殿中一片宁静，你感受到历代武神残留的意志与你产生共鸣。");
        return;
    }

    if (!me.query_temp("zhanshen_tapotian")) {
        me.notify("<hir>武神殿的大门紧闭，一股无形的力量将你推回。</hir>");
        me.notify("你需要先踏破九重天，方能进入武神殿。");
        me.moveto("zhanshen/jiuchongtian");
        return;
    }

    me.remove_temp("zhanshen_tapotian");
    me.set_temp("zhanshen_wushen", 1);

    // 登临武神
    if (me.level < 6) {
        me.notify("\n<hir>你踏上武神殿中央的战神台，九条巨龙石雕同时发出震天动地的龙吟！</hir>");
        me.notify("<hiy>一道金光自穹顶的星空中直贯而下，将你笼罩其中——</hiy>");
        me.notify("<hiz>历代武神的意志如潮水般涌入你的体内，你感受到前所未有的力量在经脉中奔涌！</hiz>\n");

        var sk = me.skill_limit();
        me.level = 6;
        // 自动完成战神殿副本
        if (me.environment && me.environment.parent && me.environment.parent.id === "zhanshen") {
            me.add_fbscore(me.environment.parent.score);
        }
        me.notify("<hiy>恭喜你提升到了" + me.get_level_desc() + "境界！</hiy>");
        me.add_exp(2000000, 2000000);
        var now_sk = me.skill_limit();
        me.limit_mp += 500000;
        me.add_temp("fenpei", 1);
        me.set_temp("wushen_rwd", 1);
        me.notify("<hiw>你的最大内力限制增加了500000。</hiw>");
        me.notify("<hiw>你的技能等级限制增加了" + (now_sk - sk) + "。</hiw>");
        me.notify("<hiw>你的先天属性增加了1点。</hiw>");
        me.color_name = null;
        me.environment.item_changed(me, true);
        me.send('{type:"levelup",level:6}');

        // 全服谣言
        var rumorMsg = '{"type":"msg","ch":"rumor","content":"听说某人踏入神道"}';
        WORLD.sendAll(rumorMsg);

        // 各方NPC祝贺
        me.notify("\n<hiy>天地间回荡起一道苍老而威严的声音——</hiy>");
        me.notify("<hiz>神秘人传音道：万古以来，你是第二位登临武神之人。古宗门中藏有上古传承，望你前往一探，莫负了这身修为。</hiz>\n");

        me.notify("<hiy>一道熟悉的声音从遥远的扬州城传来——</hiy>");
        me.notify("<hiz>金古易仰天大笑道：哈哈哈！老朽果然没看错人！恭喜阁下登临武神之境！自此天下武林，唯阁下独尊！</hiz>\n");

        me.notify("<hiy>武道塔的方向传来一声轻叹——</hiy>");
        me.notify("<hiz>守门人喃喃自语道：武神……真有人走到了这一步。老朽守塔百年，终见第二人……此生无憾矣。</hiz>\n");

        me.notify("<hiy>武神殿四壁的空白画卷上，缓缓浮现出你的身影——</hiy>");
        me.notify("<hig>从此，你的传说被铭刻在武神殿中，与万古神魔并列！</hig>\n");
    } else {
        me.notify("武神殿中一片宁静，你已是武神之身，殿中的威压对你毫无影响。");
    }
};

this.add_action("forge", "锻造神器", function (me, par) {
    if (me.level < 6) {
        return me.notify("你尚未登临武神之境，无法锻造神器。");
    }

    var artifacts = {
        "xuanyuan_sword": "轩辕剑",
        "pangu_axe": "盘古斧",
        "nvwa_jewels": "女娲石",
        "yishan_pick": "移山镐",
        "shennong_jewels": "神农百草经",
        "ying_blade": "鹰刀"
    };

    if (par) {
        var name = artifacts[par];
        if (!name) {
            me.notify("没有这件神器。可选神器：轩辕剑、盘古斧、女娲石、移山稿、神农百草经、鹰刀");
            return true;
        }

        var soulFrag = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
        var artFrag = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
        var soulCount = soulFrag ? soulFrag.count : 0;
        var artCount = artFrag ? artFrag.count : 0;

        if (soulCount < 30 || artCount < 30) {
            me.notify("\n<hir>碎片不足。需要神魂碎片×30（当前：" + soulCount + "）、神器碎片×30（当前：" + artCount + "）。</hir>");
            return true;
        }

        me.remove_obj(soulFrag, 30);
        me.remove_obj(artFrag, 30);
        var obj = me.add_obj("eq/lv6/wushen/" + par, 1);
        if (obj) {
            me.notify("\n<hig>神器锻造成功！你获得了" + obj.color_name + "！</hig>");
        }
        return true;
    }

    // 无参数：显示锻造面板
    var soulFrag = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
    var artFrag = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
    var soulCount = soulFrag ? soulFrag.count : 0;
    var artCount = artFrag ? artFrag.count : 0;

    me.notify("\n<hiz>══ 神器锻造 ══</hiz>");
    me.notify("<hiy>将破碎的神魂与神器碎片重铸，可锻造出上古神器。</hiy>");
    me.notify("\n<hiw>锻造条件：神魂碎片×30 + 神器碎片×30</hiw>");
    me.notify("<hiw>当前碎片：神魂碎片×" + soulCount + "  神器碎片×" + artCount + "</hiw>");

    if (soulCount >= 30 && artCount >= 30) {
        me.notify("\n<hiy>请选择你要锻造的神器：</hiy>");
        var cmds = [];
        for (var key in artifacts) {
            cmds.push({ cmd: "forge " + key, name: artifacts[key] });
        }
        me.send('{type:"cmds",items:' + JSON.stringify(cmds) + '}');
    } else {
        me.notify("\n<hir>碎片不足，无法锻造任何神器。</hir>");
    }

    return true;
});
