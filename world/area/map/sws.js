// 山外山：宗师境界自动解锁的无限爬层秘境。
// 结构：sws/start（山门，初始地图，有守山人可查纪录）→ sws/ceng（当前层）与
// sws/ceng2（下一层）两个战斗房间交替攀登；每击败一层守护者，从「山外之意」
// 池随机三选一，择定后方可登临下一层。
// 奖励规则：每层玄晶 1000×层数（周上限：最高层×1000×3，每周一05:00重置，可反复获取）；
// 元晶/武道残页（每 10 层）与神魂碎片/神器碎片（每 100 层）为一次性奖励，
// 同一层仅首次登临发放，领取记录与本人最佳/全服最高纪录均持久化（重启不丢）。
// 守护者按层数固定成长（见 sws/shouhu），层数没有上限。
// 山外之意只在本次挑战内生效，离开/失败/下线时卸下并 recount。
this.inherits(AREA);
this.set({
    id: "sws",
    name: "山外山",
    desc: "山外青山楼外楼。传说山外之山上接天穹，下临云海，每一重天上都有一位守护者镇守。境界达至宗师者可入内攀登：击败守护者可择一道「山外之意」加持己身，层层累加，直至力竭。秘境层数无尽，登临越高，名传越远。",
    first: "sws/start",
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
    { n: "山门", id: "sws/start", p: [0, 1], exits: ["up", "out"] },
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

// ============ 持久化纪录（重启不丢） ============
// 存档文件：data/<服务器ID>/sws.json（经 BASE.read_json/write_json 即时读写），
// 与 WORLD.DATA.temp 双向同步，保证「本人最佳/全服最高/一次性奖励领取记录」
// 在服务器重启、甚至非正常 kill 后依然保留。仅每周玄晶收益（sws_xj_week/sws_xj_got）
// 按周一05:00自然重置，属刻意设计。
this.sws_store_path = function () {
    return __PATH.DATA + "sws.json";
};

// 读取持久化档案（带内存缓存）；兼容旧版只写 WORLD.DATA.temp 的存档。
this.sws_store_load = function () {
    if (this.sws_store) return this.sws_store;
    var store = { max: { layer: 0, user: "" }, players: {} };
    if (BASE.read_json) {
        var d = BASE.read_json(this.sws_store_path());
        if (d && d.max) {
            store.max = { layer: d.max.layer || 0, user: d.max.user || "" };
            store.players = d.players || {};
        }
    }
    if (!store.players) store.players = {};
    // 兼容旧版本：档案缺失时读取 WORLD.DATA.temp 里的全服纪录
    if (!(store.max.layer > 0)) {
        var old = WORLD.DATA.query_temp("sws_max", 0);
        if (old > 0) {
            store.max = { layer: old, user: WORLD.DATA.query_temp("sws_max_user", "") || "" };
        }
    }
    this.sws_store = store;
    return store;
};

// 写回持久化档案（同步写盘，防止重启丢失）
this.sws_store_save = function () {
    var store = this.sws_store_load();
    if (BASE.write_json) BASE.write_json(this.sws_store_path(), store);
};

// 全服最高纪录读取
this.sws_max_get = function () {
    var m = this.sws_store_load().max;
    return { layer: m.layer || 0, user: m.user || "" };
};

// 全服最高纪录写入（同时同步 WORLD.DATA.temp 兼容旧查询路径）
this.sws_max_set = function (layer, user) {
    var store = this.sws_store_load();
    store.max = { layer: layer, user: user };
    WORLD.DATA.set_temp("sws_max", layer);
    WORLD.DATA.set_temp("sws_max_user", user);
    this.sws_store_save();
};

// 玩家档案：{ name, best(本人最高层), m10(已领武道残页/元晶的层), m100(已领神魂/神器碎片的层) }
this.sws_player_get = function (me) {
    var store = this.sws_store_load();
    var p = store.players[me.id];
    if (!p) {
        p = store.players[me.id] = { name: me.name, best: 0, m10: [], m100: [] };
    } else {
        if (!Array.isArray(p.m10)) p.m10 = [];
        if (!Array.isArray(p.m100)) p.m100 = [];
        if (!(p.best > 0)) p.best = 0;
        p.name = me.name;
    }
    return p;
};

// 把档案中的本人纪录同步回临时状态（进入山门/状态查询时调用，防重启后临时值丢失）
this.sws_player_sync = function (me) {
    if (!(me && me.is_player)) return;
    var p = this.sws_player_get(me);
    var best = me.query_temp("sws_best", 0);
    if (p.best > best) me.set_temp("sws_best", p.best);
    return p;
};

// 更新本人最高层（同时写临时状态与持久化档案）
this.sws_best_set = function (me, done) {
    if (!(done > 0)) return;
    var best = me.query_temp("sws_best", 0);
    if (done > best) me.set_temp("sws_best", done);
    var p = this.sws_player_get(me);
    if (done > (p.best || 0)) {
        p.best = done;
        this.sws_store_save();
    }
};

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
    var next_room = ROOM.Get("sws/start");
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

// ============ 房间回调实现（由 sws/start、sws/ceng、sws/ceng2 委托） ============

// 进入山门：同步持久化的本人纪录，欢迎提示（不布置守护者、不开战）
this.sws_setup_start = function (room, me) {
    if (!(me && me.is_player)) return;
    this.sws_player_sync(me);
    var best = me.query_temp("sws_best", 0);
    me.notify("<hio>山外青山楼外楼，你来到了山外山山门。可向守山人询问纪录，或沿「登山」进入秘境。</hio>" +
        (best > 0 ? "\n你目前最高登临第<hic>" + UTIL.to_c(best) + "</hic>层。" : ""));
};

// 守山人：查询本人最高层数
this.sws_ask_self = function (me) {
    if (!(me && me.is_player)) return;
    this.sws_player_sync(me);
    var best = me.query_temp("sws_best", 0);
    if (best > 0) {
        me.notify("守山人捋须笑道：小友已登临山外山第<hic>" + UTIL.to_c(best) + "</hic>层，山风可曾记得你的足迹？");
    } else {
        me.notify("守山人打量了你一番：你尚未登临过山外山，从身后石阶「登山」便是。");
    }
};

// 守山人：查询全服最高层数
this.sws_ask_server = function (me) {
    if (!(me && me.is_player)) return;
    var rec = this.sws_max_get();
    if (rec.layer > 0) {
        me.notify("守山人望向云海深处，叹道：山外青山楼外楼，如今全服最高纪录，是<hic>" + rec.user +
            "</hic>的第<hic>" + UTIL.to_c(rec.layer) + "</hic>层，望君再接再厉。");
    } else {
        me.notify("守山人摇了摇头：山外山至今无人登临，你是第一个来客，去吧，留下你的足迹。");
    }
};

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
    // 奖励：每层玄晶 1000×层数（周上限：最高层×1000×3，每周一05:00重置，可反复获取）；
    // 每 10 层 20 武道残页 + 1 元晶、每 100 层 5 神魂碎片 + 5 神器碎片——
    // 这两组为一次性奖励：同一层仅首次登临发放，领取记录持久化，重启不重复。
    this.sws_grant_xuanjing(me, layer);
    var pd = this.sws_player_get(me);
    var changed = false;
    if (layer % 10 === 0) {
        if (pd.m10.indexOf(layer) < 0) {
            this.sws_grant(me, "book/wd", 20);
            this.sws_grant(me, "st/yuanjing", 1);
            pd.m10.push(layer);
            changed = true;
            me.notify("<hio>第" + UTIL.to_c(layer) + "层的武道残页与元晶奖励已发放（每层仅此一次）。</hio>");
        } else {
            me.notify("<hio>第" + UTIL.to_c(layer) + "层的武道残页与元晶奖励你已领取过，不再重复发放。</hio>");
        }
    }
    if (layer % 100 === 0) {
        if (pd.m100.indexOf(layer) < 0) {
            this.sws_grant(me, "eq/lv6/wushen/shenhunsuipian", 5);
            this.sws_grant(me, "eq/lv6/wushen/shenqisuipian", 5);
            pd.m100.push(layer);
            changed = true;
            me.notify("<hio>第" + UTIL.to_c(layer) + "层的神魂碎片与神器碎片奖励已发放（每层仅此一次）。</hio>");
        } else {
            me.notify("<hio>第" + UTIL.to_c(layer) + "层的神魂碎片与神器碎片奖励你已领取过，不再重复发放。</hio>");
        }
    }
    if (changed) this.sws_store_save();

    // 本人最高层（即时更新，重启不丢）
    this.sws_best_set(me, layer);
    // 全服最高纪录（即时写盘，重启不丢）
    var rec = this.sws_max_get();
    if (layer > rec.layer) {
        this.sws_max_set(layer, me.name);
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

// 本周起点（周一05:00）的时间戳：周一00:00-04:59 归属上周
this.sws_week_key = function (now) {
    var d = new Date(now);
    var toMonday = (d.getDay() + 6) % 7; // 距本周一的天数（周一=0，周日=6）
    var monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - toMonday, 5, 0, 0, 0).getTime();
    if (now < monday) monday -= 7 * 24 * 3600 * 1000; // 周一凌晨尚未到05:00，归属上一周
    return monday;
};

// 玄晶周收益上限结算：每周上限 = 最高层 × 1000 × 3，周一05:00重置
this.sws_grant_xuanjing = function (me, layer) {
    var weekKey = this.sws_week_key(Date.now());
    if (me.query_temp("sws_xj_week") !== weekKey) {
        me.set_temp("sws_xj_week", weekKey);
        me.set_temp("sws_xj_got", 0);
    }
    var best = me.query_temp("sws_best", 0);
    var cap = Math.max(best, layer) * 1000 * 3;
    var got = me.query_temp("sws_xj_got", 0);
    var base = 1000 * layer;
    if (got >= cap) {
        return me.notify("<hio>你本周的山外山玄晶收益已达上限（" + UTIL.to_c(cap) + "枚），下周一再战吧。</hio>");
    }
    var grant = Math.min(base, cap - got);
    if (grant > 0) {
        this.sws_grant(me, "st/xuanjing", grant);
        me.set_temp("sws_xj_got", got + grant);
        if (grant < base) {
            me.notify("<hio>本周玄晶收益已接近上限（" + UTIL.to_c(cap) + "枚），本次仅获得" + UTIL.to_c(grant) + "枚玄晶。</hio>");
        }
    }
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
        // 本人最高层持久化（存档文件 + 临时状态双写，重启不丢）
        this.sws_best_set(me, done);
        if (how === "die") {
            me.notify("<hir>你倒在了山外山第" + UTIL.to_c(layer) + "层，本次共通过" + UTIL.to_c(done) + "层，山外之意尽数消散。</hir>");
        } else {
            me.notify("<hic>你离开了山外山，本次共通过" + UTIL.to_c(done) + "层。</hic>");
        }
    }
    var first = ROOM.Get("sws/start");
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
    this.sws_player_sync(me);
    var best = me.query_temp("sws_best", 0);
    var rec = this.sws_max_get();
    var buffs = me.query_temp("sws_buffs") || {};
    var str = ["<hic>【山外山】第" + UTIL.to_c(layer) + "层</hic>" + (cleared ? "（已通关，待择意）" : "（战斗中）") + "\n"];
    var parts = [];
    for (var i = 0; i < BUFFS.length; i++) {
        var n = buffs[BUFFS[i].key] || 0;
        if (n > 0) parts.push(BUFFS[i].tag + "×" + n);
    }
    str.push("山外之意：" + (parts.length ? parts.join("，") : "尚无"));
    str.push("\n本人最佳：第" + UTIL.to_c(best) + "层　全服纪录：" + (rec.user ? rec.user + "·第" + UTIL.to_c(rec.layer) + "层" : "暂无"));
    var weekKey = this.sws_week_key(Date.now());
    if (me.query_temp("sws_xj_week") !== weekKey) {
        me.set_temp("sws_xj_week", weekKey);
        me.set_temp("sws_xj_got", 0);
    }
    var cap = Math.max(best, layer) * 1000 * 3;
    var got = me.query_temp("sws_xj_got", 0);
    str.push("\n本周玄晶收益：" + UTIL.to_c(got) + " / " + UTIL.to_c(cap) + "枚（上限=最高层×3000，每周一05:00重置）");
    me.notify(str.join(""));
};
