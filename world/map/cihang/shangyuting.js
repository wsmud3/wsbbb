this.inherits(ROOM);
this.name = "赏雨亭";
this.desc = "一座临崖而建的八角凉亭，亭前悬着一方古匾——「赏雨亭」。亭外云海翻涌，远山如黛。亭中石桌石凳古朴雅致，桌上还搁着一壶尚温的茶。此处视野开阔，最适合等候来人。";
this.exits = { "east": "cihang/qichongmen", "west": "cihang/tingyuting" };
this.set_npc([]);
this.npc_spawned = false;

// 玩家进入赏雨亭时生成对应NPC
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.npc_spawned) return;

    var route = me.query_temp("cihang_route");
    if (!route) return;

    this.npc_spawned = true;
    if (route === "lang") {
        var lfy = NPC.CREATE("cihang/langfanyun", this);
        lfy._is_spar_target = true; // 标记为赐教模式（锁血）
        this.refresh(me);
        me.notify("<hiy>浪翻云端坐于赏雨亭中，面前的茶水尚温。他抬眼看向你：'你来了。'</hiy>");
    } else {
        var pb = NPC.CREATE("cihang/pangban", this);
        pb._is_spar_target = true;
        this.refresh(me);
        me.notify("<hiy>庞斑负手立于赏雨亭中，周身魔气隐隐翻涌。他转身看向你：'你来了。'</hiy>");
    }
};

// 拿到遗书后交还NPC触发赐教
this.add_action("give_yishu", "交出遗书", function (me) {
    if (!me.query_temp("cihang_yishu")) {
        return me.notify("你手中并无遗书。");
    }
    if (me.query_temp("cihang_spar_win")) {
        return me.notify("你已通过了赐教。");
    }

    var npc = null;
    for (var i = 0; i < this.items.length; i++) {
        if (!this.items[i].is_player && (this.items[i].path === "cihang/langfanyun" || this.items[i].path === "cihang/pangban")) {
            npc = this.items[i]; break;
        }
    }
    if (!npc) return me.notify("这里没有可以交付遗书的人。");

    var npcName = npc.name;
    me.notify("<hio>你将靳冰云的遗书交给了" + npcName + "。</hio>");
    me.notify("<hiy>" + npcName + "看完遗书，沉默良久，缓缓说道：'冰云……你终究还是走到了这一步。'</hiy>");
    me.notify("<hig>" + npcName + "收起遗书，目光如电：'既然冰云信你，那便让我看看你的实力——赐教吧！'</hig>");

    // 清除遗书状态
    me.remove_temp("cihang_yishu");

    // 将赏雨亭NPC设为可战斗状态，锁血50%（赐教：打到半血即胜利）
    npc._sparring = true;
    npc.hp = npc.max_hp; // 满血开始
    npc.no_fight = false;
    npc.do_kill(me);
    me.notify("<hiw>赐教开始！将" + npcName + "打到半血以下即可取胜。注意：若你落败，请从头再来。</hiw>");
    return true;
});

// NPC的on_damage钩子将在NPC文件中处理赐教逻辑
// 赐教胜利后：展示拦江岛选项
