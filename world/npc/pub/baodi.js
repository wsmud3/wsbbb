this.inherits(NPC);
this.set({
    name: "易直非",
    desc: "一个神秘的商人，可以帮你兑换你一直想要却得不到的道具",
    gender: 1,
    age: 25,
    per: this.random(20) + 10,
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400
});

// ============ 副本次数兑换 ============
// 赌场的易直非：所有能换橙装的副本都能换，只列出玩家在该难度有次数的副本（逻辑见 world/extends/fb_exchange.js）
if (WORLD.FB_EXCHANGE) WORLD.FB_EXCHANGE.install(this, { all: true });

// ============ 神器兑换 ============
// 可用神魂碎片、神器碎片兑换的 lv6 神器装备（不含神魂碎片/神器碎片本身）
// 和副本兑换一样走动作按钮浮窗（send_commands，persistent），两级：
//   shenqi_duihuan → 神器列表；shenqi_pick_N → 详情 + 确认兑换；shenqi_confirm_N → 兑换后留在详情页，结果显示在浮窗里。
var SHENQI_LIST = [
    "changgeng_glove", "chiyouzhixue", "dihou_axe", "fushen_waist",
    "fuyu_sword", "haotian_shoes", "jinding_head", "jinlan_cape",
    "nvwa_jewels", "pangu_axe", "qibao_ring", "shennong_jewels",
    "taiji_cloth", "taisui_sword", "taiyin_throw", "weizhang_jewels",
    "xuanji_necklace", "xuanyuan_sword", "ying_blade", "yinghuo_blade",
    "yishan_pick", "zaohua", "zhanshenjia", "zhuque_wrist"
];
var SHENQI_NEED = 40; // 神魂碎片、神器碎片各需要 40 个

// 统计玩家身上的神魂/神器碎片数量
function shenqi_frags(me) {
    var soul = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
    var art = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
    return {
        soul: soul ? soul.count : 0,
        art: art ? art.count : 0
    };
}
function shenqi_frags_text(frags) {
    return "你现有：神魂碎片×" + frags.soul + "、神器碎片×" + frags.art;
}
function shenqi_send(me, buttons, text, feedback, size) {
    var args = buttons.slice();
    args.push({ text: text, feedback: feedback || "", persistent: true, size: size || "" });
    me.send_commands.apply(me, args);
}

// 一级：神器列表
function shenqi_show_list(me, npc, feedback) {
    var btn = [];
    for (var i = 0; i < SHENQI_LIST.length; i++) {
        var obj = OBJ.CREATE("eq/lv6/wushen/" + SHENQI_LIST[i]);
        if (!obj) continue;
        var color = obj.query_grade_color ? obj.query_grade_color() : "hiw";
        btn.push("shenqi_pick_" + (i + 1) + " " + npc.id, "<" + color + ">" + obj.name + "</" + color + ">");
    }
    shenqi_send(me, btn, "易直非压低声音道：「上古神器，我这儿也弄得到。拿神魂碎片、神器碎片各 " + SHENQI_NEED +
        " 个来换一件。」<br>" + shenqi_frags_text(shenqi_frags(me)) + "。你要兑换哪件神器？", feedback, "lg");
}

// 二级：详情 / 确认兑换
function shenqi_show_item(me, npc, idx, confirm) {
    var key = SHENQI_LIST[idx];
    var path = "eq/lv6/wushen/" + key;
    var obj = OBJ.CREATE(path);
    if (!obj) return shenqi_show_list(me, npc, "<hir>易直非挠头道：「哎呀，这件神器不知去向，换一件吧。」</hir>");
    var feedback = "";
    if (confirm) {
        var f0 = shenqi_frags(me);
        if (f0.soul < SHENQI_NEED || f0.art < SHENQI_NEED) {
            feedback = "<hir>易直非说道：「碎片不够啊，凑齐了再来吧。」</hir>";
        } else if (me.items && me.items.length > 204) {
            feedback = "<hir>你背包的东西太多了。</hir>";
        } else {
            // 先给神器、给成功了再扣碎片，免得碎片扣了东西却没拿到
            var got = me.add_obj(path, 1);
            if (!got) {
                feedback = "<hir>易直非挠头道：「哎呀，这件神器一时寻不着，换一件吧。」</hir>";
            } else {
                me.remove_obj(me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian"), SHENQI_NEED);
                me.remove_obj(me.find_obj_bypath("eq/lv6/wushen/shenqisuipian"), SHENQI_NEED);
                feedback = "<hig>易直非郑重地将" + (got.color_name || got.name) + "交到你手中：「此乃上古神器，望你善加利用！」</hig>";
                me.notify(feedback);
            }
        }
    }
    var frags = shenqi_frags(me);
    var color = obj.query_grade_color ? obj.query_grade_color() : "hiw";
    var lines = ["<" + color + ">" + obj.name + "</" + color + ">"];
    if (obj.desc) lines.push(obj.desc);
    if (obj.prop && UTIL.prop_toString) lines.push("<" + color + ">" + String(UTIL.prop_toString(obj.prop)).split("\n").join("<br>") + "</" + color + ">");
    lines.push("兑换需要：神魂碎片×" + SHENQI_NEED + " + 神器碎片×" + SHENQI_NEED);
    lines.push(shenqi_frags_text(frags));
    var btn = [];
    if (frags.soul >= SHENQI_NEED && frags.art >= SHENQI_NEED) btn.push("shenqi_confirm_" + (idx + 1) + " " + npc.id, "确认兑换");
    btn.push("shenqi_duihuan " + npc.id, "返回");
    shenqi_send(me, btn, lines.join("<br>"), feedback);
}

// 入口：直接打开神器列表浮窗
this.add_action("shenqi_duihuan", "神器兑换", function (me) {
    shenqi_show_list(me, this);
});

// 注册每个神器的查看与确认兑换动作
for (var i = 0; i < SHENQI_LIST.length; i++) {
    (function (idx) {
        this.add_action("shenqi_pick_" + (idx + 1), null, function (me) { shenqi_show_item(me, this, idx, false); });
        this.add_action("shenqi_confirm_" + (idx + 1), null, function (me) { shenqi_show_item(me, this, idx, true); });
    }).call(this, i);
}
