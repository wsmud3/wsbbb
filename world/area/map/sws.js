// 山外山：宗师境界自动解锁的无限爬层秘境。
// 结构：sws/ceng（当前层）与 sws/ceng2（下一层）两个战斗房间交替攀登；
// 每击败一层守护者，从「山外之意」池随机三选一，择定后方可登临下一层。
// 守护者按玩家进本时的基准属性乘层数系数缩放，层数没有上限。
// 山外之意只在本次挑战内生效，离开/失败/下线时卸下并 recount。
this.inherits(AREA);
this.set({
    id: "sws",
    name: "山外山",
    desc: "山外青山楼外楼。传说山外之山上接天穹，下临云海，每一重天上都有一位守护者镇守。境界达至宗师者可入内攀登：击败守护者可择一道「山外之意」加持己身，层层累加，直至力竭。秘境层数无尽，登临越高，名传越远。",
    first: "sws/ceng",
    room_path: "sws/",
    is_copy: true,
    not_fb: true,
    expend: 0,
    exp: 0,
    pot: 0,
    jd_index: 10,
    is_multi: false,
});

this.map = [
    { n: "秘境层", id: "sws/ceng", p: [0, 0], exits: ["up"] },
    { n: "云梯", id: "sws/ceng2", p: [0, -1], exits: ["up"] },
];

this.drops = [];

var SWS_JD_INDEX = 10;
var SWS_HUB = "yz/guangchang";

// 「山外之意」词条池：tag 为三选一按钮上的单字，prop 为 recount 消费的百分比属性。
var BUFFS = [
    { key: "gjsd", tag: "速", prop: "gjsd_per", val: 5, desc: "攻速+5%" },
    { key: "bao", tag: "暴", prop: "bj_per", val: 3, desc: "暴击+3%" },
    { key: "po", tag: "破", prop: "diff_fy_per", val: 5, desc: "破防+5%" },
    { key: "zhong", tag: "终", prop: "add_sh_per", val: 5, desc: "终伤+5%" },
    { key: "xue", tag: "血", prop: "hp_per", val: 5, desc: "气血+5%" },
    { key: "gong", tag: "攻", prop: "gj_per", val: 5, desc: "攻击+5%" },
    { key: "ming", tag: "命", prop: "mz_per", val: 5, desc: "命中+5%" },
    { key: "zhao", tag: "招", prop: "zj_per", val: 5, desc: "招架+5%" },
    { key: "shan", tag: "闪", prop: "ds_per", val: 5, desc: "躲闪+5%" },
    { key: "fang", tag: "防", prop: "fy_per", val: 5, desc: "防御+5%" },
];

// ============ 江湖入口（jh ar 10） ============
this.on_enter = function (me) {
    // 宗师自动解锁：进入时自愈一次解锁位（正常路径由 check_unlock_sect_jds 解锁）
    if (me.level >= 3 && !me.isenable_area(SWS_JD_INDEX)) {
        me.set_bool("fb2", SWS_JD_INDEX, true);
        me.send("<hio>天外之山隐隐向你呼唤，秘境【山外山】已解锁。</hio>");
    }
    if (!me.isenable_area(SWS_JD_INDEX)) {
        me.notify("山外山尚未向你开启，需达到<hic>宗师</hic>境界。");
        return false;
    }
    if (me.team) {
        me.notify("山外山乃一人之山，无法组队进入。");
        return false;
    }
    if (!me.environment) return me.notify("你不知道在哪。");
    var next_room = ROOM.Get("sws/ceng");
    if (!next_room) return me.notify("山外山尚未开辟。");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) {
        copy_room = next_room.create_copy2(me);
    }
    if (!copy_room) return me.notify("秘境开辟失败，请稍后再试。");
};

// 传送离开（江湖跳转、can_trans 路径）
this.on_leave = function (me) {
    this.sws_end_run(me, "leave");
};

// 实际离开区域后（走出出口、下线退出），幂等兜底
this.on_leaved = function (me) {
    this.sws_end_run(me, "leave");
};

// ============ 房间回调实现（由 sws/ceng、sws/ceng2 委托） ============

// 进入房间：布置当前层的房间名、守护者或三选一按钮
this.sws_setup_room = function (room, me) {
    if (!me.query_temp("sws_active", 0)) {
        this.sws_start_run(me);
    }
    // 幂等重挂山外之意（断线重连、重启后恢复）
    this.sws_reapply_buffs(me);
    var layer = me.query_temp("sws_layer", 1);
    room.name = "第" + UTIL.to_c(layer) + "层";
    var items = room.items || [];
    for (var i = items.length - 1; i >= 0; i--) {
        if (!items[i].is_player) {
            try {
                items[i].end_fight && items[i].end_fight();
                items[i].destroy && items[i].destroy();
            } catch (e) {}
        }
    }
    if (!me.query_temp("sws_cleared", 0)) {
        // 新的一层开战：清掉上一层的「已择意」标记，重新锁住出口
        me.set_temp("sws_picked", 0);
        var npc = NPC.CLONE("sws/shouhu");
        if (!npc) {
            me.notify("云雾翻涌，守护者迟迟未现，请联系管理员。");
            return;
        }
        npc.init_from(me, layer);
        npc.die = function (killer) {
            var area = this.environment && this.environment.parent;
            if (area && area.sws_on_npc_die) return area.sws_on_npc_die(this, killer);
        };
        npc.environment = room;
        room.items.push(npc);
    } else {
        this.sws_show_picks(me);
    }
    room.refresh();
};

// 进入房间后自动开战（仅未通关时）
this.sws_enter_fight = function (room, me) {
    if (me.query_temp("sws_cleared", 0)) return;
    var npc = room.find_by_path("sws/shouhu");
    if (npc && npc.hp > 0) {
        me.send(npc.name + "：山外有山，胜过吾身，方可登天。");
        me.die = this.sws_die_hook;
        npc.do_kill(me);
    }
};

// 房间出口闸门：up 需通关且已择意，out 视为放弃本次挑战
// 状态说明：cleared=0 且 picked=0 为战斗中；cleared=1 为待择意；
// cleared=0 且 picked=1 为已择意、可登临下一层。
this.sws_room_leave = function (room, me, dir) {
    if (dir === "up") {
        var cleared = me.query_temp("sws_cleared", 0);
        var picked = me.query_temp("sws_picked", 0);
        if (!cleared && !picked) {
            var npc = room.find_by_path("sws/shouhu");
            if (npc && npc.hp > 0) {
                return me.notify_fail(npc.name + "拦在阶前：胜过吾，方可登天。");
            }
            return me.notify_fail("山雾弥漫遮住了去路，你应重新踏入这一层。");
        }
        if (cleared && me.query_temp("sws_picks")) {
            return me.notify_fail("你必须先择定一道「山外之意」，才能继续攀登。");
        }
        return; // 放行，下一间的 on_before_enter 会布置下一层
    }
    if (dir === "out") {
        this.sws_end_run(me, "leave");
    }
};

// 守护者被击败：结算奖励、掷三选一、亮出按钮
this.sws_on_npc_die = function (npc, me) {
    if (!(me && me.is_player)) return;
    var room = me.environment;
    var layer = me.query_temp("sws_layer", 1);
    me.set_temp("sws_cleared", 1);
    me.set_temp("sws_picked", 0);
    npc.destroy && npc.destroy();

    var exp = 1500 + layer * 500;
    me.add_exp(exp, exp);
    // 奖励：每层玄晶 1000×层数；每 10 层 20 武道残页 + 1 元晶；每 100 层 5 神魂碎片 + 5 神器碎片
    this.sws_grant(me, "st/xuanjing", 1000 * layer);
    if (layer % 10 === 0) {
        this.sws_grant(me, "book/wd", 20);
        this.sws_grant(me, "st/yuanjing", 1);
    }
    if (layer % 100 === 0) {
        this.sws_grant(me, "eq/lv6/wushen/shenhunsuipian", 5);
        this.sws_grant(me, "eq/lv6/wushen/shenqisuipian", 5);
    }
    var max = WORLD.DATA.query_temp("sws_max", 0);
    if (layer > max) {
        WORLD.DATA.set_temp("sws_max", layer);
        WORLD.DATA.set_temp("sws_max_user", me.name);
        if (layer >= 10) {
            COMMAND.DO("rumor", "听说" + me.name + "已登临山外山第" + UTIL.to_c(layer) + "层！");
        }
    }

    me.notify("<hig>你战胜了第" + UTIL.to_c(layer) + "层守护者！</hig>");
    var pool = BUFFS.slice();
    var idxs = [];
    while (idxs.length < 3 && pool.length) {
        idxs.push(BUFFS.indexOf(pool.splice(this.random(pool.length), 1)[0]));
    }
    me.set_temp("sws_picks", idxs);
    if (room) {
        this.sws_show_picks(me);
        room.refresh(me);
    }
};

// 择定山外之意：写入累计、挂属性、层数+1
// key 为对话按钮回发的词条 key（如 gjsd/bao），旧层的失效按钮无法误选新层词条。
this.sws_choose = function (me, key) {
    if (!me.query_temp("sws_active", 0)) return me.notify("你并不在山外山秘境之中。");
    if (!me.query_temp("sws_cleared", 0)) return me.notify("先战胜本层守护者再说吧。");
    var picks = me.query_temp("sws_picks") || [];
    var pickIdx = -1;
    for (var i = 0; i < picks.length; i++) {
        if (BUFFS[picks[i]] && BUFFS[picks[i]].key === key) {
            pickIdx = i;
            break;
        }
    }
    if (pickIdx < 0) return me.notify("这道山外之意已经消散了。");
    var b = BUFFS[picks[pickIdx]];

    var buffs = me.query_temp("sws_buffs") || {};
    buffs[b.key] = (buffs[b.key] || 0) + 1;
    me.set_temp("sws_buffs", buffs);
    me.remove_temp("sws_picks");
    me.set_temp("sws_cleared", 0);
    me.set_temp("sws_picked", 1);
    this.sws_reapply_buffs(me);
    me.notify_hp();
    var layer = me.add_temp("sws_layer", 1);

    var parts = [];
    for (var i = 0; i < BUFFS.length; i++) {
        var n = buffs[BUFFS[i].key] || 0;
        if (n > 0) parts.push(BUFFS[i].tag + "×" + n + "（" + BUFFS[i].desc + "）");
    }
    me.notify("<hic>你领悟了山外之意「" + b.tag + "」：" + b.desc + "。</hic>\n当前加持：" +
        (parts.length ? parts.join("，") : "无") +
        "\n点击「下一层」继续攀登，当前已至<hic>第" + UTIL.to_c(layer) + "层</hic>。");
};

// 发放固定奖励道具（创建、入包、提示）
this.sws_grant = function (me, path, count) {
    var obj = OBJ.CREATE(path, count);
    if (!obj) return;
    var item = me.add_obj(obj);
    if (item) me.send("你获得了" + UTIL.to_c(count) + item.unit + item.color_name + "。");
};

// 玩家死亡钩子：境界守护（on_die）优先，否则结束本次挑战并送下山
this.sws_die_hook = function (killer) {
    var me = this;
    var area = me.environment && me.environment.parent;
    if (me.on_die && me.on_die(killer) === false) {
        me.hp = 1;
        return false;
    }
    if (me.hp <= 0) me.hp = 1;
    if (area && area.sws_end_run) area.sws_end_run(me, "die");
    me.end_fight();
    var hub = ROOM.Get(SWS_HUB);
    if (hub) {
        me.moveto(hub, null, me.name + "从云雾中跌了出来。");
    }
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.notify_hp();
    return; // 返回非 false，end_attack 正常收尾
};

// 结束本次挑战：卸下山外之意、清状态、清副本（幂等）
this.sws_end_run = function (me, how) {
    if (me.query_temp("sws_active", 0)) {
        var layer = me.query_temp("sws_layer", 1);
        var done = layer - (me.query_temp("sws_cleared", 0) ? 0 : 1);
        var applied = me.query_temp("sws_applied");
        if (applied) {
            for (var k in applied) me.add_prop(k, -applied[k]);
            me.remove_temp("sws_applied");
        }
        me.recount();
        me.notify_hp();
        me.remove_temp("sws_active");
        me.remove_temp("sws_layer");
        me.remove_temp("sws_cleared");
        me.remove_temp("sws_picked");
        me.remove_temp("sws_picks");
        me.remove_temp("sws_buffs");
        if (me.die !== USER.prototype.die) me.die = USER.prototype.die;
        var best = me.query_temp("sws_best", 0);
        if (done > best) me.set_temp("sws_best", done);
        if (how === "die") {
            me.notify("<hir>你倒在了山外山第" + UTIL.to_c(layer) + "层，本次共通过" + UTIL.to_c(done) + "层，山外之意尽数消散。</hir>");
        } else {
            me.notify("<hic>你离开了山外山，本次共通过" + UTIL.to_c(done) + "层。</hic>");
        }
    }
    var first = ROOM.Get("sws/ceng");
    if (first) {
        var copy = first.query_copy2(me);
        if (copy) copy.clear_copy(me);
    }
};

// ============ 内部工具 ============

// 开始新一轮：重置层数与词条，回满状态
this.sws_start_run = function (me) {
    me.set_temp("sws_active", 1);
    me.set_temp("sws_layer", 1);
    me.set_temp("sws_cleared", 0);
    me.set_temp("sws_picked", 0);
    me.remove_temp("sws_picks");
    me.set_temp("sws_buffs", {});
    me.remove_temp("sws_applied");
    me.recount();
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.notify_hp();
    me.notify("<hio>山外青山楼外楼，你踏入了山外山。击败守护者，择一道「山外之意」随身而行，直至力竭。</hio>");
};

// 按 sws_buffs 累计重新挂载词条属性（先卸后挂，可重复调用）
this.sws_reapply_buffs = function (me) {
    var applied = me.query_temp("sws_applied");
    if (applied) {
        for (var k in applied) me.add_prop(k, -applied[k]);
        me.remove_temp("sws_applied");
    }
    var buffs = me.query_temp("sws_buffs");
    if (!buffs) {
        me.recount();
        return;
    }
    var total = {};
    for (var i = 0; i < BUFFS.length; i++) {
        var b = BUFFS[i];
        var n = buffs[b.key] || 0;
        if (n > 0) {
            total[b.prop] = b.val * n;
            me.add_prop(b.prop, b.val * n);
        }
    }
    me.set_temp("sws_applied", total);
    me.recount();
};

// 把待选的三道山外之意以对话按钮发给玩家（消息区内按钮，不占用动作栏）。
// 按钮命令携带词条 key，由房间的无名动作 sws_pick 接住后转给 sws_choose。
this.sws_show_picks = function (me) {
    var picks = me.query_temp("sws_picks");
    if (!picks || !picks.length) return;
    var args = [];
    for (var i = 0; i < picks.length; i++) {
        var b = BUFFS[picks[i]];
        if (!b) continue;
        args.push("sws_pick " + b.key, b.tag + "（" + b.desc + "）");
    }
    if (!args.length) return;
    me.notify("<hig>请择定一道「山外之意」：</hig>");
    me.send_commands.apply(me, args);
};

// 状态查询（房间动作「山外之意」）
this.sws_status = function (me) {
    if (!me.query_temp("sws_active", 0)) {
        return me.notify("你并不在山外山秘境之中。从江湖-禁地可前往。");
    }
    var layer = me.query_temp("sws_layer", 1);
    var cleared = me.query_temp("sws_cleared", 0);
    var best = me.query_temp("sws_best", 0);
    var max = WORLD.DATA.query_temp("sws_max", 0);
    var max_user = WORLD.DATA.query_temp("sws_max_user", "");
    var buffs = me.query_temp("sws_buffs") || {};
    var str = ["<hic>【山外山】第" + UTIL.to_c(layer) + "层</hic>" + (cleared ? "（已通关，待择意）" : "（战斗中）") + "\n"];
    var parts = [];
    for (var i = 0; i < BUFFS.length; i++) {
        var n = buffs[BUFFS[i].key] || 0;
        if (n > 0) parts.push(BUFFS[i].tag + "×" + n);
    }
    str.push("山外之意：" + (parts.length ? parts.join("，") : "尚无"));
    str.push("\n本人最佳：第" + UTIL.to_c(best) + "层　全服纪录：" + (max_user ? max_user + "·第" + UTIL.to_c(max) + "层" : "暂无"));
    me.notify(str.join(""));
};
