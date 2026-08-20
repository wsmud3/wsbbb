this.inherits(NPC);
this.set({
    name: "易直非",
    desc: "一个神秘的商人，可以帮你兑换你一直想要却得不到的道具",
    title: "神秘商人",
    gender: 1,
    age: 25,
    per: this.random(20) + 10,
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400
});

// ============ 神器兑换 ============
// 可用神魂碎片、神器碎片兑换的 lv6 神器装备（不含神魂碎片/神器碎片本身）
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

this.add_action("ask3", "兑换", function (me) {
    var lines = [];
    lines.push("\n<hiz>══ 神秘商人 · 兑换 ══</hiz>");
    lines.push("<hiw>易直非笑眯眯地看着你：“我这儿的宝贝，可都是外面求都求不来的好东西。”</hiw>");
    lines.push("\n<hig>① 神器兑换</hig><hiw> — 消耗<hir>神魂碎片×" + SHENQI_NEED + "</hir>、<hir>神器碎片×" + SHENQI_NEED + "</hir>，换取一件神器装备</hiw>");
    me.notify(lines.join("\n"));
    me.send_commands("shenqi_duihuan " + this.id, "神器兑换");
});

// 打开神器兑换面板（回复编号选择）
this.add_action("shenqi_duihuan", null, function (me) {
    var frags = shenqi_frags(me);
    var lines = [];
    lines.push("\n<hiz>══ 神器兑换 ══</hiz>");
    lines.push("<hiw>易直非抚掌笑道：“想要神器？拿</hiw><hir>神魂碎片×" + SHENQI_NEED + "</hir><hiw>和</hiw><hir>神器碎片×" + SHENQI_NEED + "</hir><hiw>来换，任你挑选！”</hiw>");
    lines.push("<hiw>你身上的碎片：</hiw><hir>神魂碎片×" + frags.soul + "</hir><hiw>　</hiw><hir>神器碎片×" + frags.art + "</hir>");
    lines.push("\n<hiz>──────────────────</hiz>");
    for (var i = 0; i < SHENQI_LIST.length; i++) {
        var obj = OBJ.CREATE("eq/lv6/wushen/" + SHENQI_LIST[i]);
        if (!obj) continue;
        var color = obj.query_grade_color ? obj.query_grade_color() : "hiw";
        lines.push("<hig>" + (i + 1) + ".</hig> <" + color + ">" + obj.name + "</" + color + ">");
    }
    lines.push("\n<hiz>──────────────────</hiz>");
    lines.push("<hiw>回复装备对应的<hiy>编号</hiy>即可兑换（回复<hir>0</hir>或点下方按钮取消）。</hiw>");
    me.notify(lines.join("\n"));
    me.wait_input = this.on_shenqi_pick.bind(this);
    me.send_commands("quxiao", "取消兑换");
});

// 处理兑换编号输入
this.on_shenqi_pick = function (me, input) {
    input = (input || "").trim();
    if (input == "quxiao" || input == "cancle" || input == "取消" || input == "0") {
        me.wait_input = null;
        return me.notify("易直非笑道：“随时欢迎再来兑换！”");
    }
    var num = null;
    var tokens = input.split(/\s+/);
    for (var t = 0; t < tokens.length; t++) {
        if (/^\d+$/.test(tokens[t])) {
            num = parseInt(tokens[t], 10);
            break;
        }
    }
    if (num === null) {
        me.notify("易直非说道：请回复装备对应的编号（回复0取消）。");
        return;
    }
    if (num < 1 || num > SHENQI_LIST.length) {
        me.notify("易直非摇头道：没有这个编号的神器，再选选看。");
        return;
    }

    var path = "eq/lv6/wushen/" + SHENQI_LIST[num - 1];
    var obj = OBJ.CREATE(path);
    if (!obj) {
        me.wait_input = null;
        return me.notify("易直非挠头道：哎呀，这件神器不知去向，换一件吧。");
    }

    var frags = shenqi_frags(me);
    if (frags.soul < SHENQI_NEED || frags.art < SHENQI_NEED) {
        me.notify("<hiw>易直非说道：碎片不够啊，需要</hiw><hir>神魂碎片×" + SHENQI_NEED + "</hir><hiw>（当前" + frags.soul + "）、</hiw><hir>神器碎片×" + SHENQI_NEED + "</hir><hiw>（当前" + frags.art + "），凑齐了再来吧。</hiw>");
        return;
    }

    var soul = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
    var art = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
    me.remove_obj(soul, SHENQI_NEED);
    me.remove_obj(art, SHENQI_NEED);
    var got = me.add_obj(path, 1);
    me.wait_input = null;
    if (got) {
        me.notify("\n<hig>易直非郑重地将" + got.color_name + "</hig><hiw>交到你手中：</hiw><hiy>“此乃上古神器，望你善加利用！”</hiy>");
    }
};
