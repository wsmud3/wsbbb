this.inherits(ROOM);
this.name = "赏雨亭";
this.desc = "慈航静斋后山的一个亭子，左侧远方俨如犬牙陡立的峰峦处，一道飞瀑破岩而出，倾泻数百丈，奔流震耳，群峰环伺脚底，峰峦间雾气氤氮，在淡蓝的天幕下，那还知人间何世。";
this.exits = {
    "east": "cihang/xiaolu2",
};

// [mech] 浪翻云在此等候（攻略：往左走遇见浪翻云，跳出提示三条，选第三条「我来挑战你」）
this.show_lang_prompt = function (me) {
    if (me.query_temp("cihang_spar_win")) return;
    var route = me.query_temp("cihang_route");
    var isGuoshi = (route === "guoshi");
    var who = isGuoshi ? "庞斑" : "浪翻云";
    if (!route) {
        me.notify("<hiw>浪翻云负手立在亭中，头也不回：「你来得正好。我与庞斑之约，还差一个见证人。」</hiw>");
        me.notify("<hiy>他转过身来，目光如剑：「你要如何？」</hiy>");
        me.send_commands("cihang_opt 1", "助你一臂之力", "cihang_opt 2", "我来问个明白", "cihang_opt 3", "我来挑战你", "cihang_opt 4", "我来观战，寻求突破的机缘");
        return;
    }
    if (!me.query_temp("cihang_yishu")) {
        me.notify("<hiw>" + who + "道：「空手而来？冰云那里有一封遗书，你去听雨亭取了来。」</hiw>");
        return;
    }
    if (!me.query_temp("cihang_yishu_given")) {
        me.notify("<hiw>" + who + "看着你手中的信笺，伸手道：「拿来。」</hiw>");
        me.send_commands("cihang_opt 5", "交出遗书");
        return;
    }
    me.notify("<hiw>" + who + "读罢遗书，长叹一声，兵器已在手：「好。你我印证一场——赐教。」</hiw>");
    me.send_commands("cihang_opt 6", "赐教（比试）");
};

this.on_enter = function (me) {
    if (!me.is_player) return;
    var route = me.query_temp("cihang_route");
    var need = (route === "guoshi") ? "cihang/pangban" : "cihang/langfanyun";
    if (!this.find_obj_bypath("cihang/langfanyun") && !this.find_obj_bypath("cihang/pangban")) {
        NPC.CREATE(need, this);
        this.refresh(me);
    }
    this.show_lang_prompt(me);
};

// 选择分支（攻略：第三条=我来挑战你→浪子线；观战→国师线）
this.add_action("cihang_opt", null, function (me, arg) {
    if (!me.is_player) return true;
    var opt = String(arg || "").trim();
    var room = this;

    if (opt === "1") {
        me.notify("<hiy>浪翻云摇头：「不必。这一战只关乎我与庞斑，你插不上手。」</hiy>");
        return true;
    }
    if (opt === "2") {
        me.notify("<hiw>浪翻云：「庞斑以力证魔，我以情入剑。二十年来，我们已不知胜负为何物。」</hiw>");
        me.notify("<hiy>「可这一次不同——冰云的遗书，总要有人送到。」</hiy>");
        return true;
    }
    if (opt === "3") {
        me.set_temp("cihang_route", "lang");
        me.notify("<hir>浪翻云眼中精光一闪：「好胆色！那你先去听雨亭取冰云的遗书来。」</hir>");
        me.notify("<hiw>（浪子线：助浪翻云，拦江岛斩杀庞斑）</hiw>");
        return true;
    }
    if (opt === "4") {
        me.set_temp("cihang_route", "guoshi");
        me.notify("<hir>浪翻云侧身让开：「观战者亦可入局。去听雨亭取了遗书，再回来。」</hir>");
        me.notify("<hiw>（国师线：助庞斑，拦江岛斩杀浪翻云）</hiw>");
        return true;
    }
    if (opt === "5") {
        if (!me.query_temp("cihang_yishu")) {
            me.notify("你手中并无遗书。");
            return true;
        }
        me.set_temp("cihang_yishu_given", 1);
        me.notify("<hiw>你把遗书递上。对方拆信的手指微微一颤。</hiw>");
        if (me.query_temp("cihang_route") === "guoshi") {
            var lang = room.find_obj_bypath("cihang/langfanyun");
            if (lang) lang.destroy();
            NPC.CREATE("cihang/pangban", room);
            room.notify("<hir>亭外忽起狂风，庞斑踏步而来，声如雷鸣：「信我收了。你既选了观战，便由我一试你的斤两！」</hir>");
            room.refresh(me);
        }
        me.send_commands("cihang_opt 6", "赐教（比试）");
        return true;
    }
    if (opt === "6") {
        if (!me.query_temp("cihang_yishu_given")) {
            me.notify("你还没有把遗书交出去。");
            return true;
        }
        if (me.query_temp("cihang_spar_win")) {
            me.notify("赐教已经通过了。");
            return true;
        }
        var path = (me.query_temp("cihang_route") === "guoshi") ? "cihang/pangban" : "cihang/langfanyun";
        var foe = room.find_obj_bypath(path);
        if (!foe) {
            NPC.CREATE(path, room);
            foe = room.find_obj_bypath(path);
            room.refresh(me);
        }
        if (!foe || foe.hp <= 0) {
            me.notify("此刻无人可与你印证。");
            return true;
        }
        foe._sparring = true;
        me.notify("<hir>对方抱拳：「请赐教。」</hir>");
        foe.do_kill(me);
        return true;
    }
    return true;
});
