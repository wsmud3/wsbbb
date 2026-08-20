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

// 兑换：只弹出一个「神器兑换」按钮
this.add_action("ask3", "兑换", function (me) {
    me.send_commands("shenqi_duihuan " + this.id, "神器兑换");
});

// 神器格子面板：点击神器查看详情
this.add_action("shenqi_duihuan", null, function (me) {
    var _S = function (cmd) {
        return "onclick=\"window.SendCommand('" + cmd + "')\"";
    };
    var CELL = "display:inline-block;width:31%;box-sizing:border-box;text-align:center;border:1px solid #b8943f;background:#151515;border-radius:0.4em;padding:0.55em 0;margin:0.4em 1%;cursor:pointer;vertical-align:top;";
    var html = '<div style="text-align:center;">';
    for (var i = 0; i < SHENQI_LIST.length; i++) {
        var obj = OBJ.CREATE("eq/lv6/wushen/" + SHENQI_LIST[i]);
        if (!obj) continue;
        var color = obj.query_grade_color ? obj.query_grade_color() : "hiw";
        html += '<span ' + _S("shenqi_pick_" + (i + 1) + " " + this.id) + ' style="' + CELL + '"><' + color + '>' + obj.name + '</' + color + '></span>';
    }
    html += '</div>';
    me.notify(html);
});

// 注册每个神器的查看与确认兑换动作
for (var i = 0; i < SHENQI_LIST.length; i++) {
    (function (idx) {
        var key = SHENQI_LIST[idx];
        // 点击神器：显示属性 + 兑换需求 + 确认兑换按钮
        this.add_action("shenqi_pick_" + (idx + 1), null, function (me, par) {
            var obj = OBJ.CREATE("eq/lv6/wushen/" + key);
            if (!obj) return me.notify("易直非挠头道：哎呀，这件神器不知去向，换一件吧。");
            var frags = shenqi_frags(me);
            var color = obj.query_grade_color ? obj.query_grade_color() : "hiw";
            var lines = [];
            lines.push("\n<" + color + ">" + obj.name + "</" + color + ">");
            if (obj.desc) lines.push(obj.desc);
            if (obj.prop) lines.push("<" + color + ">" + UTIL.prop_toString(obj.prop) + "</" + color + ">");
            lines.push("\n<hiz>── 兑换需求 ──</hiz>");
            lines.push("<hiw>神魂碎片×" + SHENQI_NEED + " + 神器碎片×" + SHENQI_NEED + "</hiw>");
            lines.push("<hiw>你现有：神魂碎片×" + frags.soul + "、神器碎片×" + frags.art + "</hiw>");
            lines.push(frags.soul >= SHENQI_NEED && frags.art >= SHENQI_NEED ? "<hig>碎片充足，可以兑换。</hig>" : "<hir>碎片不足。</hir>");
            me.notify(lines.join("\n"));
            me.send_commands("shenqi_confirm_" + (idx + 1) + " " + this.id, "确认兑换", "shenqi_duihuan " + this.id, "返回");
        });
        // 确认兑换：扣除碎片并发放神器
        this.add_action("shenqi_confirm_" + (idx + 1), null, function (me, par) {
            var frags = shenqi_frags(me);
            if (frags.soul < SHENQI_NEED || frags.art < SHENQI_NEED) {
                return me.notify("<hiw>易直非说道：碎片不够啊，需要</hiw><hir>神魂碎片×" + SHENQI_NEED + "</hir><hiw>（当前" + frags.soul + "）、</hiw><hir>神器碎片×" + SHENQI_NEED + "</hir><hiw>（当前" + frags.art + "），凑齐了再来吧。</hiw>");
            }
            var soul = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
            var art = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
            me.remove_obj(soul, SHENQI_NEED);
            me.remove_obj(art, SHENQI_NEED);
            var got = me.add_obj("eq/lv6/wushen/" + key, 1);
            if (got) {
                me.notify("\n<hig>易直非郑重地将" + got.color_name + "</hig><hiw>交到你手中：</hiw><hiy>“此乃上古神器，望你善加利用！”</hiy>");
            }
        });
    }).call(this, i);
}
