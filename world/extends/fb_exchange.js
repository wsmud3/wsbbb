// ────────────────────────────────────────────────────────────
// 易直非·副本次数兑换
//   用某个副本某个难度的副本次数（该难度的单人通关/扫荡次数），兑换该副本该难度掉落的橙装（eq/lv5）。
//   普通、困难各算各的：普通次数只能换普通会掉的橙装，困难次数只能换困难会掉的橙装
//   （如古墓派：普通只掉盘龙簪，困难只掉龙骨环）。每件统一 FBX_COST 次。
//   已花掉的次数单独记在 fbx_spent_<难度>_<fb_index>，不会扣减真实的副本次数
//   （「800 次前不出橙装」的门槛看的是真实次数，见 os/room/area.js AREA.ORANGE_MIN_RUNS）。
//   两种易直非：
//     · 副本入口的易直非（install(npc)）：只换他所在的这个副本；
//     · 赌场的易直非（install(npc, { all: true })）：所有能换的副本都能换，但只列出玩家在该难度有次数的。
//   NPC 动作只能带 NPC 自己的 id 当参数，所以副本/难度/物品的序号编进动作名：
//     fbx → 副本列表；fbx_a<副本序号*2+难度> → 该副本该难度的橙装；fbx_i<物品序号> → 详情；fbx_c<物品序号> → 确认兑换。
// ────────────────────────────────────────────────────────────
var FBX_COST = 1000;
var FBX_MAX_AREA = 64;
var FBX_MAX_ITEM = 24;
var FBX_DIFF_NAME = ["普通", "困难"];
var FBX_CELL = "display:inline-block;width:46%;box-sizing:border-box;text-align:center;border:1px solid #b8943f;background:#151515;border-radius:0.4em;padding:0.55em 0;margin:0.4em 1%;cursor:pointer;vertical-align:top;";

function fbx_click(cmd) {
    return "onclick=\"window.SendCommand('" + cmd + "')\"";
}
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

function fbx_show_areas(me, npc) {
    var list = fbx_entries(me, npc), all = fbx_all_areas();
    if (!list.length) {
        return me.notify(npc._fbx_all
            ? "易直非翻了翻账本，摇头道：「你还没在哪个能换东西的副本里留下过次数，先去跑几趟吧。」"
            : "易直非摇头道：「这个副本里没有我能替你寻来的东西。」");
    }
    var html = ["<hiy>易直非搓着手笑道：「副本跑得多了，总有些好东西从指缝里漏掉。拿你的副本次数来，我替你寻来——一件 " + FBX_COST + " 次。」</hiy>", '<div style="text-align:center;">'];
    for (var i = 0; i < list.length; i++) {
        var a = all[list[i][0]], d = list[i][1];
        html.push('<span ' + fbx_click("fbx_a" + (list[i][0] * 2 + d) + " " + npc.id) + ' style="' + FBX_CELL + '"><hiw>' + a.name + "（" + FBX_DIFF_NAME[d] + "）" + '</hiw><br><wht>可用次数 ' + fbx_avail(me, a, d) + '</wht></span>');
    }
    html.push("</div>");
    me.notify(html.join(""));
}
function fbx_show_items(me, npc, code) {
    var ai = code >> 1, d = code & 1;
    var a = fbx_all_areas()[ai];
    // 只能打开这个易直非会列出的副本/难度
    var ok = false, list = fbx_entries(me, npc);
    for (var i = 0; i < list.length; i++) if (list[i][0] === ai && list[i][1] === d) ok = true;
    if (!a || !ok) return fbx_show_areas(me, npc);
    var items = fbx_items(a, d);
    me._fbx_pick = { npc: npc.id, area: ai, diff: d };
    var html = ["<hiy>" + a.name + "（" + FBX_DIFF_NAME[d] + "）</hiy>：已完成 " + a.query_run_count(me, d) + " 次，可用 <hig>" + fbx_avail(me, a, d) + "</hig> 次。每件 " + FBX_COST + " 次。", '<div style="text-align:center;">'];
    for (var k = 0; k < items.length; k++) {
        html.push('<span ' + fbx_click("fbx_i" + k + " " + npc.id) + ' style="' + FBX_CELL + '">' + fbx_obj_name(items[k]).html + '</span>');
    }
    html.push("</div>");
    me.notify(html.join(""));
    me.send_commands("fbx " + npc.id, "返回副本列表");
}
function fbx_pick(me, npc, k, confirm) {
    var pick = me._fbx_pick;
    if (!pick || pick.npc !== npc.id) return fbx_show_areas(me, npc);
    var a = fbx_all_areas()[pick.area], d = pick.diff;
    var path = a && fbx_items(a, d)[k];
    if (!path) return fbx_show_areas(me, npc);
    var avail = fbx_avail(me, a, d);
    var info = fbx_obj_name(path);
    var label = a.name + "（" + FBX_DIFF_NAME[d] + "）";
    if (!confirm) {
        var lines = ["\n" + info.html];
        if (info.obj && info.obj.desc) lines.push(info.obj.desc);
        if (info.obj && info.obj.prop && UTIL.prop_toString) lines.push("<" + info.color + ">" + UTIL.prop_toString(info.obj.prop) + "</" + info.color + ">");
        lines.push("\n<hiz>── 兑换需求 ──</hiz>");
        lines.push("<hiw>" + label + "副本次数 ×" + FBX_COST + "（你可用 " + avail + " 次）</hiw>");
        lines.push(avail >= FBX_COST ? "<hig>次数足够，可以兑换。</hig>" : "<hir>次数不足。</hir>");
        me.notify(lines.join("\n"));
        return me.send_commands("fbx_c" + k + " " + npc.id, "确认兑换", "fbx_a" + (pick.area * 2 + d) + " " + npc.id, "返回");
    }
    if (avail < FBX_COST) {
        return me.notify("<hiw>易直非摊手道：「" + label + "的次数还差 " + (FBX_COST - avail) + " 次，多跑几趟再来吧。」</hiw>");
    }
    if (me.items && me.items.length > 204) return me.notify("你背包的东西太多了。");
    var got = me.add_obj(path, 1);
    if (!got) return me.notify("易直非挠头道：哎呀，这件东西一时寻不着，换一件吧。");
    var key = "fbx_spent_" + d + "_" + a.fb_index;
    me.set_temp(key, me.query_temp(key, 0) + FBX_COST);
    me.notify("<hig>易直非从身后的包袱里摸出" + (got.color_name || got.name) + "，郑重地交到你手上。</hig>\n<hiw>" + label + "可用次数还剩 " + fbx_avail(me, a, d) + " 次。</hiw>");
    if (got.is_equipment && got.grade >= 5 && typeof COMMAND !== "undefined" && COMMAND.DO) {
        COMMAND.DO("rumor", "听说有人得到了一" + got.unit + got.name + "。");
    }
}

WORLD.FB_EXCHANGE = {
    COST: FBX_COST,
    items: fbx_items,
    avail: fbx_avail,
    entries: fbx_entries,
    // opts.all：赌场的易直非，能换所有副本（只列出有次数的）
    install: function (npc, opts) {
        npc._fbx_all = !!(opts && opts.all);
        npc.add_action("fbx", "副本兑换", function (me) { fbx_show_areas(me, this); });
        for (var i = 0; i < FBX_MAX_AREA * 2; i++) {
            (function (code) {
                npc.add_action("fbx_a" + code, null, function (me) { fbx_show_items(me, this, code); });
            })(i);
        }
        for (var k = 0; k < FBX_MAX_ITEM; k++) {
            (function (ki) {
                npc.add_action("fbx_i" + ki, null, function (me) { fbx_pick(me, this, ki, false); });
                npc.add_action("fbx_c" + ki, null, function (me) { fbx_pick(me, this, ki, true); });
            })(k);
        }
    }
};
