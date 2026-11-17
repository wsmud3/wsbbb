this.inherits(AREA);
this.set({
    id: "pm",
    name: "缥缈峰",
    desc: "缥缈峰灵鹫宫，天山之巅，云雾缭绕。天山童姥威震西域，生死符控人生死，缥缈峰上藏有上乘武学秘笈。",
    score: 250,
    is_show: true,
    first: "pm/shanjiao",
    is_copy: true,
    expend: 10,
    is_multi: false,
    is_diffi: true,
    exp: 36000,
    pot: 32000,
    room_path: "pm/",
    ss_title: "灵鹫宫主"
});
		this.map = [
	    { n: "山脚", id: "pm/shanjiao", p: [0, 0], exits: ["nu"] },
	    { n: "断魂崖", id: "pm/ya", p: [0, -1], exits: ["nu","sd"] },
	    { n: "失足岩", id: "pm/yan", p: [0, -2], exits: ["nu","sd"] },
	    { n: "百丈涧", id: "pm/jian", p: [0, -3], exits: ["sd"] },
	    { n: "仙愁门", id: "pm/xianchou", p: [0, -4], exits: ["nu","sd"] },
	    { n: "青石大道", id: "pm/dadao", p: [0, -5], exits: ["n","sd"] },
	    { n: "独尊厅大门", id: "pm/damen", p: [0, -6], exits: ["n","s"] },
	    { n: "独尊厅", id: "pm/dating", p: [0, -7], exits: ["n","s"] },
	    { n: "长廊", id: "pm/changlang", p: [0, -8], exits: ["n","s","w","e"] },
	    { n: "花园", id: "pm/huayuan", p: [0, -9], exits: ["n","s","w","e"] },
	    { n: "戏凤阁", id: "pm/liangong", p: [-1, -8], exits: ["e"] },
	    { n: "蓼风轩", id: "pm/wuqi", p: [1, -8], exits: ["w"] },
	    { n: "憩凤阁", id: "pm/woshi", p: [-1, -9], exits: ["e"] },
	    { n: "藕香榭", id: "pm/chufang", p: [1, -9], exits: ["w"] },
	    { n: "小路", id: "pm/xiaodao", p: [0, -10], exits: ["n","s"] },
	    { n: "闭关室", id: "pm/biguan", p: [0, -11], exits: ["s"] },
		];
this.drops = [
    "book/bc#tianyuqijian",
    "book/bc#shenjianjue",
    "book/bc#bulaochangchungong",
    "eq/lv5/wushen/tianlong_necklace",
    "eq/lv4/zhuyandan"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#shenjianjue", odds: 2100 },
	    { obj: "book/bc#tianyuqijian", odds: 2400 },
	    { obj: "eq/lv4/zhuyandan", odds: 90 },
	    { obj: "book/bc#bulaochangchungong", odds: 2900 },
	    { obj: "eq/lv5/wushen/tianlong_necklace", odds: 17 },
	];

// ────────────────────────────────────────────────────────────
// 缥缈峰：护送天山童姥（全部进度存副本存储 room.set_temp，随副本销毁）
//   断魂崖：乌老大、不平道人一见有人上山，便扑向童姥要她的命——要么速杀二人，要么先背起童姥。
//   背负童姥：后天四维（臂力/根骨/身法/悟性）-100%；百丈涧铁索桥硬性要求 10000 闪避。
//   仙愁门：李秋水拦路。
//     普通：数息后童姥从背上下来，李秋水叫杀童姥，玩家保护童姥并杀死李秋水；
//           之后童姥叫你背起她（战斗描述里的按钮），背到闭关室 = 100%。
//     困难：要在童姥下来之前叫杀李秋水，背着童姥（-100%）把她打死；童姥一落地就会被李秋水
//           一掌毙命。击杀后背到闭关室 = 100%。
//   计分：乌老大 30 + 不平道人 30 + 卓不凡 40 + 李秋水 50 = 150（60%），送童姥进闭关室 +100。
//         童姥死了（或李秋水死时童姥不在场）本轮就拿不到送达的 100 分。
//         卓不凡没杀的话会因「有存活敌人」停在 99%，记得回头杀掉。
// ────────────────────────────────────────────────────────────
var PM_TL = "pm/tianshantonglao";
var PM_LQS = "pm/liqiushui";
var PM_ASSASSINS = ["pm/wudaolaoda", "pm/bupingdaoren"];
var PM_DELIVER_SCORE = 100;

// 副本存储钥匙：NPC 回调里未必有玩家，用房间 owner（即队伍 id）
this.pm_key = function (room) { return { query_teamid: function () { return room.owner; } }; };
this.pm_get = function (room, k, d) { return room.query_temp(this.pm_key(room), k, d); };
this.pm_set = function (room, k, v) { room.set_temp(this.pm_key(room), k, v); };
this.pm_hard = function (room) { return room.query_temp(this.pm_key(room), "diff", 0) === 1; };
this.pm_carrying = function (me) {
    var room = me && me.environment;
    return !!(me && me.is_player && room && room.parent === this && this.pm_get(room, "pm_carry", 0));
};
this.pm_alive = function (room, path) {
    if (!room || !room.items) return null;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && !o.is_player && o.path === path && o.hp > 0) return o;
    }
    return null;
};
// 本副本内某些路径 NPC 的所有活着的实例
this.pm_find_alive = function (room, paths) {
    var out = [];
    if (!this.rooms) return out;
    for (var i = 0; i < this.rooms.length; i++) {
        var cp = this.rooms[i].query_copy(room.owner);
        if (!cp) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (o && !o.is_player && o.hp > 0 && paths.indexOf(o.path) >= 0) out.push(o);
        }
    }
    return out;
};

// 击杀者是 NPC（童姥/灭绝/六派弟子补了最后一刀）时，NPC.die 的通用加分会因 NPC 没有队伍 id 而丢失，
// 这里把分数补记到本副本（与 add_fbscore 记在同一处）
this.pm_credit = function (npc, killer) {
    if (!npc || !(npc.score > 0)) return;
    if (killer && killer.query_teamid && killer.query_teamid()) return;
    var room = npc.environment || npc.die_room;
    var fb = room && room.query_fb_first && room.query_fb_first(room.owner);
    if (fb) fb.score = (fb.score || 0) + npc.score;
};

// 背负状态：后天四维 -100%（直接把当前的后天臂力/根骨/身法/悟性抵消为 0）
this.pm_apply_carry_status = function (me) {
    // 注意 CHARACTER.query_status 是血条 JSON，不是查状态，这里只能遍历 status
    if (me.status) for (var i = 0; i < me.status.length; i++) if (me.status[i] && me.status[i].id === "carry_tonglao") return;
    var prop = {};
    var keys = ["str", "con", "dex", "int"];
    for (var k = 0; k < keys.length; k++) {
        var v = me.query_prop(keys[k]) || 0;
        if (v > 0) prop[keys[k]] = -v;
    }
    me.add_status({
        id: "carry_tonglao", name: "背负童姥", duration: 0, no_clear: true,
        desc: "背着童姥，全身内力都用来支撑她：后天臂力、根骨、身法、悟性 -100%。",
        prop: prop
    });
};
// 躺尸、天师符等会清空状态；还背着就补回去（过铁索桥前也会检查）
this.pm_ensure_carry_status = function (me) {
    if (this.pm_carrying(me)) this.pm_apply_carry_status(me);
};

// 背起童姥（命令 carry_tonglao：童姥身上的「背负童姥」、李秋水死后战斗描述里的「背起童姥」）
this.pm_carry = function (me) {
    var room = me.environment;
    if (!room || room.parent !== this) return me.notify("童姥不在这里。");
    if (this.pm_get(room, "pm_done", 0)) return me.notify("童姥已经回闭关室了。");
    if (this.pm_get(room, "pm_failed", 0)) return me.notify("童姥已经死了，本轮无法完成护送，出副本重来吧。");
    if (this.pm_carrying(me)) {
        this.pm_apply_carry_status(me);
        return me.notify("你已经背着童姥了。");
    }
    var tl = this.pm_alive(room, PM_TL);
    if (!tl) return me.notify("童姥不在这里。");
    // 童姥已在仙愁门落地、李秋水还活着：她要亲眼看着李秋水死
    if (this.pm_get(room, "pm_tl_down", 0) && this.pm_alive(room, PM_LQS)) {
        return me.notify("童姥厉声道：「李秋水这贱人还没死，背什么背！先替我宰了她！」");
    }
    if (tl.is_fighting && tl.is_fighting()) tl.end_fight();
    tl.destroy("童姥跳上了" + me.name + "的背。");
    this.pm_set(room, "pm_carry", 1);
    this.pm_apply_carry_status(me);
    me.notify("<hig>童姥轻盈地落在了你的背上。你感觉全身的内力都用来支撑她了，手脚变得沉重起来。</hig>");
    // 断魂崖的两个刺客转而向你出手
    var foes = [];
    for (var i = 0; i < PM_ASSASSINS.length; i++) {
        var f = this.pm_alive(room, PM_ASSASSINS[i]);
        if (f) foes.push(f);
    }
    if (foes.length) me.notify("<hir>童姥一上背，" + foes.map(function (x) { return x.name; }).join("、") + "便朝你扑了过来！</hir>");
    for (var j = 0; j < foes.length; j++) foes[j].do_kill(me);
    if (this.pm_get(room, "pm_lqs_dead", 0)) me.notify("<hiy>童姥：「去闭关室！」（一路向北，到闭关室即可）</hiy>");
    return true;
};

// 把童姥放下（仙愁门落地 / 背着她的人倒下）。返回放下的童姥 NPC
this.pm_put_down = function (me, room, msg) {
    this.pm_set(room, "pm_carry", 0);
    if (me && me.remove_status) me.remove_status("carry_tonglao");
    var tl = NPC.CREATE(PM_TL, room);
    tl = this.pm_alive(room, PM_TL) || tl;
    if (!tl) return null;
    if (msg) room.send_room(msg);
    room.refresh(me);
    var lqs = this.pm_alive(room, PM_LQS);
    if (lqs) {
        // 落地后不能直接点童姥背起（攻略：要等李秋水死后在战斗描述里背）
        tl.update_action({});
        if (this.pm_hard(room)) {
            room.send_room("<hir>童姥脚尖刚一沾地，李秋水便是一记白虹掌力当胸拍到——童姥闷哼一声，软软倒下。</hir>");
            tl.die(lqs);
            return null;
        }
        this.pm_set(room, "pm_tl_down", 1);
        // 童姥落地后凭真本事抗一阵（攻略：只能看脸童姥是否开启凌波）
        tl.max_hp = tl.hp = 800000;
        tl.fy = 30000;
        tl.ds = 40000;
        room.send_room("<hir>李秋水一见童姥，双目尽赤：「师姊，今日便是你的死期！」——李秋水向童姥下了杀手，快保护童姥！</hir>");
        lqs.do_kill(tl);
    } else {
        // 断魂崖等处：刺客还活着就继续追杀她
        for (var i = 0; i < PM_ASSASSINS.length; i++) {
            var f = this.pm_alive(room, PM_ASSASSINS[i]);
            if (f) f.do_kill(tl);
        }
    }
    return tl;
};

// 仙愁门：背着童姥到达后数息童姥自行落地（困难模式要抢在落地前叫杀李秋水）
this.pm_arrive_xianchou = function (room, me) {
    if (!this.pm_carrying(me)) return;
    if (!this.pm_alive(room, PM_LQS)) return;
    if (room._pm_down_timer) return;
    if (this.pm_hard(room))
        me.notify("<hiy>童姥在你背上低声道：「李秋水那贱人就在前面……」（困难：趁童姥还没下来，立刻叫杀李秋水！她一落地就会被李秋水打死）</hiy>");
    else
        me.notify("<hiy>童姥在你背上动了动：「放我下来，我要亲眼看着那贱人死！」</hiy>");
    var self = this;
    room._pm_down_timer = setTimeout(function () {
        room._pm_down_timer = null;
        if (me.environment !== room || !self.pm_carrying(me)) return;
        if (!self.pm_alive(room, PM_LQS)) return;
        // 困难：已经和李秋水动上手的，童姥就待在背上不下来
        if (self.pm_hard(room)) {
            var lqs = self.pm_alive(room, PM_LQS);
            if (lqs && (lqs.is_fighting(me) || (me.is_fighting && me.is_fighting(lqs)))) return;
        }
        self.pm_put_down(me, room, "<hiy>童姥从" + me.name + "背上一跃而下，落在仙愁门前。</hiy>");
    }, 5000);
};

// 李秋水死了：童姥在场（背上或落地活着）才算替她报了仇
this.pm_on_lqs_died = function (lqs, killer) {
    var room = lqs.environment;
    if (!room) return;
    this.pm_credit(lqs, killer);
    this.pm_set(room, "pm_lqs_dead", 1);
    var carrier = null, i;
    for (i = 0; i < room.items.length; i++) {
        var p = room.items[i];
        if (p && p.is_player && this.pm_get(room, "pm_carry", 0)) { carrier = p; break; }
    }
    var tl = this.pm_alive(room, PM_TL);
    if (carrier || tl) {
        this.pm_set(room, "pm_lqs_ok", 1);
    } else {
        room.send_room("<hiy>李秋水倒下了，可童姥不在此处，没能亲眼看到宿敌伏诛……</hiy>");
        return;
    }
    if (carrier) {
        room.send_room("<hio>李秋水倒下了！童姥伏在" + carrier.name + "背上放声长笑：「好！好！背我回闭关室！」</hio>");
        return;
    }
    if (tl.is_fighting && tl.is_fighting()) tl.end_fight();
    tl.update_action({ carry_tonglao: { name: "背负童姥" } });
    room.send_room("<hio>李秋水倒下了！童姥喘息着朝你招手：「好孩子……快背我去闭关室，我要闭关疗伤。」</hio>");
    for (i = 0; i < room.items.length; i++) {
        var q = room.items[i];
        if (q && q.is_player) q.send_commands("carry_tonglao", "背起童姥");
    }
};

// 童姥死了：本轮护送失败
this.pm_on_tl_died = function (tl) {
    var room = tl.environment;
    if (!room) return;
    this.pm_set(room, "pm_failed", 1);
    room.send_room("<red>天山童姥死了！护送失败——本轮已无法拿到 100%，出副本重来吧。</red>");
};

// 闭关室：背着童姥、李秋水已在童姥面前伏诛 → 100%
this.pm_deliver = function (room, me) {
    if (!this.pm_carrying(me)) return;
    if (!this.pm_get(room, "pm_lqs_ok", 0)) {
        me.notify("<hiy>童姥：「李秋水那贱人还没死，我闭什么关！」</hiy>");
        return;
    }
    this.pm_set(room, "pm_carry", 0);
    this.pm_set(room, "pm_done", 1);
    me.remove_status("carry_tonglao");
    var tl = NPC.CREATE(PM_TL, room);
    tl = this.pm_alive(room, PM_TL) || tl;
    if (tl) tl.update_action({});
    room.refresh(me);
    me.add_fbscore(PM_DELIVER_SCORE);
    me.notify("<hig>你把童姥送进闭关室。童姥盘膝坐下，淡淡道：「这份情，姥姥记下了。」护送完成！</hig>");
    var left = this.pm_find_alive(room, ["pm/zhuobufan"].concat(PM_ASSASSINS));
    if (left.length) me.notify("<hiy>山下还有" + left.map(function (x) { return x.name; }).join("、") + "未除，不杀干净完成度只有 99%。</hiy>");
};

// 背着童姥的人倒下：童姥摔落在原地
this.on_user_die = function (me) {
    var room = me && me.environment;
    if (!room || room.parent !== this || !this.pm_get(room, "pm_carry", 0)) return;
    this.pm_put_down(me, room, "<hir>" + me.name + "倒下了，背上的童姥也摔落在地！</hir>");
};

// 离开副本时清理背负状态
this.on_leaved = function (me) {
    me.remove_temp("pm_carry_tonglao");
    me.remove_status("carry_tonglao");
};
