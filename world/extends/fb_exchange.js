// ────────────────────────────────────────────────────────────
// 易直非·副本次数兑换
//   用某个副本某个难度的副本次数（该难度的单人通关/扫荡次数），兑换该副本的掉落物。
//   按类别分（FBX_CATS）：目前只有「装备」= 该难度掉落的橙装（eq/lv5），以后加别的类别往 FBX_CATS 里追加。
//   普通、困难各算各的：普通次数只能换普通会掉的橙装，困难次数只能换困难会掉的橙装
//   （如古墓派：普通只掉盘龙簪，困难只掉龙骨环）。每件统一 FBX_COST 次。
//   已花掉的次数单独记在 fbx_spent_<难度>_<fb_index>，不会扣减真实的副本次数
//   （「800 次前不出橙装」的门槛看的是真实次数，见 os/room/area.js AREA.ORANGE_MIN_RUNS）。
//   两种易直非：
//     · 副本入口的易直非（install(npc)）：只换他所在的这个副本；
//     · 赌场的易直非（install(npc, { all: true })）：所有能换的副本都能换，但只列出玩家在该难度有次数的。
//   NPC 动作只能带 NPC 自己的 id 当参数，所以副本/难度/物品的序号编进动作名：
//     fbx → 副本列表；fbx_a<副本序号*2+难度> → 类别；fbx_k<类别序号> → 物品；fbx_i<物品序号> → 详情；fbx_c<物品序号> → 确认兑换。
//   全部用动作按钮浮窗（send_commands，persistent），每层都有「返回」。
//   界面参照赌场神秘商人兑换的样式：一级按钮「副本名(难度)」，物品按钮「N次兑换<品质色道具名>」；
//   只有一个类别时跳过类别这一层，直接列物品。
// ────────────────────────────────────────────────────────────
var FBX_COST = 1000;
var FBX_MAX_AREA = 64;
var FBX_MAX_ITEM = 24;
var FBX_DIFF_NAME = ["普通", "困难"];

function fbx_all_areas() {
    var jh = WORLD.COMMANDS && WORLD.COMMANDS.jh;
    return (jh && jh.fbs) || [];
}
// 某个副本某个难度会掉的橙装（含运行时补上的困难掉落和宝箱），按难度过滤 diff 条目；结果缓存在副本上
function fbx_items(area, diff) {
    if (!area) return [];
    diff = diff === 1 ? 1 : 0;
    area._fbx_items = area._fbx_items || [];
    if (area._fbx_items[diff]) return area._fbx_items[diff];
    var seen = {}, out = [], lists = null;
    try { lists = area.query_drops(diff === 1); } catch (e) { lists = null; }
    for (var i = 0; lists && i < lists.length; i++) {
        var list = lists[i] || [];
        for (var j = 0; j < list.length; j++) {
            var drop = list[j];
            if (!drop || !drop.obj || !OBJ.drop_match(drop, diff)) continue;
            var objs = drop.obj instanceof Array ? drop.obj : [drop.obj];
            for (var k = 0; k < objs.length; k++) {
                var p = objs[k];
                if (AREA.is_orange(p) && !seen[p]) { seen[p] = 1; out.push(p); }
            }
        }
    }
    area._fbx_items[diff] = out.slice(0, FBX_MAX_ITEM);
    return area._fbx_items[diff];
}
function fbx_avail(me, area, diff) {
    var used = me.query_temp("fbx_spent_" + diff + "_" + area.fb_index, 0);
    return Math.max(0, area.query_run_count(me, diff) - used);
}
// 副本入口的易直非所在的副本：按 NPC 路径前缀（如 gm/auto_11 → 光明顶 room_path "gm/"）
function fbx_own_area(npc) {
    var p = npc && npc.path ? String(npc.path) : "";
    var pre = p.indexOf("/") > 0 ? p.slice(0, p.lastIndexOf("/") + 1) : "";
    var all = fbx_all_areas();
    for (var i = 0; i < all.length; i++) if (all[i] && all[i].room_path === pre) return i;
    return -1;
}
// 这个易直非给这位玩家列出的 [副本序号, 难度]
function fbx_entries(me, npc) {
    var all = fbx_all_areas(), out = [];
    if (npc._fbx_all) {
        for (var i = 0; i < all.length && i < FBX_MAX_AREA; i++) {
            for (var d = 0; d < 2; d++) {
                if (all[i] && fbx_items(all[i], d).length && all[i].query_run_count(me, d) > 0) out.push([i, d]);
            }
        }
    } else {
        var own = fbx_own_area(npc);
        for (var d2 = 0; own >= 0 && d2 < 2; d2++) {
            if (fbx_items(all[own], d2).length) out.push([own, d2]);
        }
    }
    return out;
}
function fbx_obj_name(path) {
    var obj = OBJ.CREATE(path);
    if (!obj) return { obj: null, html: path };
    var color = obj.query_grade_color ? obj.query_grade_color() : "hio";
    return { obj: obj, color: color, html: "<" + color + ">" + obj.name + "</" + color + ">" };
}

// ── 兑换类别 ──
// 每个类别：name 按钮名；items(area, diff) 该副本该难度能换的物品；cost 每件花多少次。
// 目前只有装备（橙装）；以后加别的（残页等）往这里追加一项即可，菜单自动多出一个二级选项。
var FBX_CATS = [
    { key: "eq", name: "装备", cost: FBX_COST, items: fbx_items }
];
function fbx_cat_items(cat, area, diff) {
    try { return (cat.items(area, diff) || []).slice(0, FBX_MAX_ITEM); } catch (e) { return []; }
}
// 某副本某难度下有东西可换的类别序号
function fbx_cats_of(area, diff) {
    var out = [];
    for (var i = 0; i < FBX_CATS.length; i++) if (fbx_cat_items(FBX_CATS[i], area, diff).length) out.push(i);
    return out;
}
function fbx_label(area, d) { return area.name + "(" + FBX_DIFF_NAME[d] + ")"; }
function fbx_send(me, buttons, text, feedback, size) {
    var args = buttons.slice();
    // 有按钮时常驻（多级菜单来回点不自动关）；没按钮的纯提示照常可关
    args.push({ text: text, feedback: feedback || "", persistent: buttons.length > 0, size: size || "" });
    me.send_commands.apply(me, args);
}

// ── 门派禁地的试炼兑换（不是副本，单独列在最前）：目前只有华山「独孤剑冢」——剑冢五关的重温（扫荡）次数换独孤剑诀残页 ──
// 次数记在 zy_sweep_<key>（WORLD.ZHENYI 扫荡时累计），已兑换掉的记在 fbx_spent_zy_<key>
function fbx_zy_entry(me) {
    var Z = WORLD.ZHENYI, data = Z && Z.family_data && Z.family_data(me);
    if (!data || !data.sweep || !data.stages) return null;
    var done = parseInt(me.query_temp(Z.sweep_count_key(data.key), 0)) || 0;
    var spent = parseInt(me.query_temp("fbx_spent_zy_" + data.key, 0)) || 0;
    return { data: data, done: done, avail: Math.max(0, done - spent), cost: data.sweep.exchange_cost, piece: data.sweep.piece };
}
function fbx_show_zy(me, npc, confirm) {
    var e = fbx_zy_entry(me);
    if (!e) return fbx_show_areas(me, npc);
    var feedback = "";
    if (confirm) {
        if (e.avail < e.cost) feedback = "<hir>易直非摊手道：「" + e.data.area + "的次数还差 " + (e.cost - e.avail) + " 次，多去重温几趟吧。」</hir>";
        else {
            var got = me.add_obj(e.piece, 1);
            if (!got) feedback = "<hir>易直非挠头道：「哎呀，这东西一时寻不着。」</hir>";
            else {
                me.set_temp("fbx_spent_zy_" + e.data.key, (parseInt(me.query_temp("fbx_spent_zy_" + e.data.key, 0)) || 0) + e.cost);
                feedback = "<hig>易直非从身后的包袱里摸出" + (got.color_name || got.name) + "，郑重地交到你手上。</hig>";
                me.notify(feedback);
                e = fbx_zy_entry(me);
            }
        }
    }
    var info = fbx_obj_name(e.piece), btn = [];
    if (e.avail >= e.cost) btn.push("fbx_zyc " + npc.id, e.cost + "次兑换" + info.html);
    btn.push("fbx " + npc.id, "返回");
    fbx_send(me, btn, e.data.area + "：已重温 " + e.done + " 次，可用 " + e.avail + " 次。每 " + e.cost + " 次可兑换一份" + info.html + "。", feedback);
}

// 一级：副本（难度）列表
function fbx_show_areas(me, npc, feedback) {
    var list = fbx_entries(me, npc), all = fbx_all_areas();
    var zy = npc._fbx_all ? fbx_zy_entry(me) : null;
    if (zy && zy.done > 0) {
        var btn0 = ["fbx_zy " + npc.id, zy.data.area];
        for (var z = 0; z < list.length; z++) btn0.push("fbx_a" + (list[z][0] * 2 + list[z][1]) + " " + npc.id, fbx_label(all[list[z][0]], list[z][1]));
        return fbx_send(me, btn0, "一个神秘的商人，可以帮你兑换你一直想要却得不到的道具。<br>你要兑换哪处的道具？", feedback, "lg");
    }
    if (!list.length) {
        return fbx_send(me, [], npc._fbx_all
            ? "易直非翻了翻账本，摇头道：「你还没在哪个能换东西的副本里留下过次数，先去跑几趟吧。」"
            : "易直非摇头道：「这个副本里没有我能替你寻来的东西。」", feedback);
    }
    var btn = [];
    for (var i = 0; i < list.length; i++) {
        var a = all[list[i][0]], d = list[i][1];
        btn.push("fbx_a" + (list[i][0] * 2 + d) + " " + npc.id, fbx_label(a, d));
    }
    fbx_send(me, btn, "一个神秘的商人，可以帮你兑换你一直想要却得不到的道具。<br>你要兑换哪个副本的道具？", feedback, "lg");
}
// 二级：类别
function fbx_show_cats(me, npc, code, feedback) {
    var ai = code >> 1, d = code & 1;
    var a = fbx_all_areas()[ai];
    // 只能打开这个易直非会列出的副本/难度
    var ok = false, list = fbx_entries(me, npc);
    for (var i = 0; i < list.length; i++) if (list[i][0] === ai && list[i][1] === d) ok = true;
    if (!a || !ok) return fbx_show_areas(me, npc);
    me._fbx_pick = { npc: npc.id, area: ai, diff: d };
    var btn = [], cats = fbx_cats_of(a, d);
    // 只有一个类别：不多点一层，直接列物品
    if (cats.length === 1) return fbx_show_items(me, npc, cats[0], feedback);
    for (var c = 0; c < cats.length; c++) {
        var cat = FBX_CATS[cats[c]];
        btn.push("fbx_k" + cats[c] + " " + npc.id, cat.name + "（" + fbx_cat_items(cat, a, d).length + "件）");
    }
    btn.push("fbx " + npc.id, "返回");
    fbx_send(me, btn, fbx_label(a, d) + "：已完成 " + a.query_run_count(me, d) + " 次，可用 " + fbx_avail(me, a, d) + " 次。", feedback);
}
// 三级：物品
function fbx_show_items(me, npc, ci, feedback) {
    var pick = me._fbx_pick;
    if (!pick || pick.npc !== npc.id || !FBX_CATS[ci]) return fbx_show_areas(me, npc);
    var a = fbx_all_areas()[pick.area], d = pick.diff, cat = FBX_CATS[ci];
    var items = fbx_cat_items(cat, a, d);
    if (!items.length) return fbx_show_cats(me, npc, pick.area * 2 + d);
    pick.cat = ci;
    var btn = [];
    for (var k = 0; k < items.length; k++) {
        btn.push("fbx_i" + k + " " + npc.id, cat.cost + "次兑换" + fbx_obj_name(items[k]).html);
    }
    // 类别那一层被跳过时（只有一个类别），返回直接回副本列表，否则会又被跳回这里
    var multi = fbx_cats_of(a, d).length > 1;
    btn.push((multi ? "fbx_a" + (pick.area * 2 + d) : "fbx") + " " + npc.id, "返回");
    var done = a.query_run_count(me, d), avail = fbx_avail(me, a, d);
    fbx_send(me, btn, "易直非对你说道：「你可以使用你完成副本的次数兑换一些你想要的" + (multi ? cat.name : "道具") +
        "，你在" + fbx_label(a, d) + "共完成" + done + "次" + (avail !== done ? "（还可用" + avail + "次）" : "") +
        "。你可以选择以下道具兑换：」", feedback, "lg");
}
// 四级：详情 / 确认兑换
function fbx_pick(me, npc, k, confirm) {
    var pick = me._fbx_pick;
    if (!pick || pick.npc !== npc.id || pick.cat === undefined) return fbx_show_areas(me, npc);
    var a = fbx_all_areas()[pick.area], d = pick.diff, cat = FBX_CATS[pick.cat];
    var path = a && cat && fbx_cat_items(cat, a, d)[k];
    if (!path) return fbx_show_items(me, npc, pick.cat);
    var label = fbx_label(a, d);
    var feedback = "";
    if (confirm) {
        var avail0 = fbx_avail(me, a, d);
        if (avail0 < cat.cost) {
            feedback = "<hir>易直非摊手道：「" + label + "的次数还差 " + (cat.cost - avail0) + " 次，多跑几趟再来吧。」</hir>";
        } else if (me.items && me.items.length > 204) {
            feedback = "<hir>你背包的东西太多了。</hir>";
        } else {
            var got = me.add_obj(path, 1);
            if (!got) {
                feedback = "<hir>易直非挠头道：「哎呀，这件东西一时寻不着，换一件吧。」</hir>";
            } else {
                var key = "fbx_spent_" + d + "_" + a.fb_index;
                me.set_temp(key, me.query_temp(key, 0) + cat.cost);
                feedback = "<hig>易直非从身后的包袱里摸出" + (got.color_name || got.name) + "，郑重地交到你手上。</hig>";
                me.notify(feedback);
                if (got.is_equipment && got.grade >= 5 && typeof COMMAND !== "undefined" && COMMAND.DO) {
                    COMMAND.DO("rumor", "听说有人得到了一" + got.unit + got.name + "。");
                }
            }
        }
    }
    var info = fbx_obj_name(path), avail = fbx_avail(me, a, d);
    var lines = [info.html];
    if (info.obj && info.obj.desc) lines.push(info.obj.desc);
    if (info.obj && info.obj.prop && UTIL.prop_toString) lines.push("<" + info.color + ">" + String(UTIL.prop_toString(info.obj.prop)).split("\n").join("<br>") + "</" + info.color + ">");
    lines.push("兑换需要：" + label + "副本次数 ×" + cat.cost + "（你可用 " + avail + " 次）");
    var btn = [];
    if (avail >= cat.cost) btn.push("fbx_c" + k + " " + npc.id, "确认兑换");
    btn.push("fbx_k" + pick.cat + " " + npc.id, "返回");
    fbx_send(me, btn, lines.join("<br>"), feedback);
}

WORLD.FB_EXCHANGE = {
    COST: FBX_COST,
    CATS: FBX_CATS,
    items: fbx_items,
    avail: fbx_avail,
    entries: fbx_entries,
    // opts.all：赌场的易直非，能换所有副本（只列出有次数的）
    install: function (npc, opts) {
        npc._fbx_all = !!(opts && opts.all);
        // 赌场易直非同时有「神器兑换」，所以那里叫「副本兑换」以示区分；副本入口的易直非直接叫「兑换」
        npc.add_action("fbx", npc._fbx_all ? "副本兑换" : "兑换", function (me) { fbx_show_areas(me, this); });
        if (npc._fbx_all) {
            npc.add_action("fbx_zy", null, function (me) { fbx_show_zy(me, this, false); });
            npc.add_action("fbx_zyc", null, function (me) { fbx_show_zy(me, this, true); });
        }
        for (var i = 0; i < FBX_MAX_AREA * 2; i++) {
            (function (code) {
                npc.add_action("fbx_a" + code, null, function (me) { fbx_show_cats(me, this, code); });
            })(i);
        }
        for (var c = 0; c < 16; c++) {
            (function (ci) {
                npc.add_action("fbx_k" + ci, null, function (me) { fbx_show_items(me, this, ci); });
            })(c);
        }
        for (var k = 0; k < FBX_MAX_ITEM; k++) {
            (function (ki) {
                npc.add_action("fbx_i" + ki, null, function (me) { fbx_pick(me, this, ki, false); });
                npc.add_action("fbx_c" + ki, null, function (me) { fbx_pick(me, this, ki, true); });
            })(k);
        }
    }
};
