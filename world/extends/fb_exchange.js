// ────────────────────────────────────────────────────────────
// 易直非·副本次数兑换
//   用某个副本的副本次数（普通 + 困难的单人通关/扫荡次数）兑换该副本掉落的橙装（eq/lv5）。
//   每件统一 FBX_COST 次；只列出有橙装掉落的副本。
//   已花掉的次数单独记在 fbx_spent_<fb_index>，不会扣减真实的副本次数
//   （「800 次前不出橙装」的门槛看的是真实次数，见 os/room/area.js AREA.ORANGE_MIN_RUNS）。
//   NPC 动作只能带 NPC 自己的 id 当参数，所以副本/物品的序号编进动作名：
//     fbx → 副本列表；fbx_a<副本序号> → 该副本橙装；fbx_i<物品序号> → 详情；fbx_c<物品序号> → 确认兑换。
// ────────────────────────────────────────────────────────────
var FBX_COST = 1000;
var FBX_MAX_AREA = 64;
var FBX_MAX_ITEM = 24;
var FBX_CELL = "display:inline-block;width:46%;box-sizing:border-box;text-align:center;border:1px solid #b8943f;background:#151515;border-radius:0.4em;padding:0.55em 0;margin:0.4em 1%;cursor:pointer;vertical-align:top;";

function fbx_click(cmd) {
    return "onclick=\"window.SendCommand('" + cmd + "')\"";
}
function fbx_all_areas() {
    var jh = WORLD.COMMANDS && WORLD.COMMANDS.jh;
    return (jh && jh.fbs) || [];
}
// 某个副本会掉的橙装（普通 + 困难两套掉落表，含运行时补上的困难掉落和宝箱），结果缓存在副本上
function fbx_items(area) {
    if (!area) return [];
    if (area._fbx_items) return area._fbx_items;
    var seen = {}, out = [];
    for (var d = 0; d < 2; d++) {
        var lists = null;
        try { lists = area.query_drops(d === 1); } catch (e) { lists = null; }
        if (!lists) continue;
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i] || [];
            for (var j = 0; j < list.length; j++) {
                var drop = list[j];
                if (!drop || !drop.obj) continue;
                var objs = drop.obj instanceof Array ? drop.obj : [drop.obj];
                for (var k = 0; k < objs.length; k++) {
                    var p = objs[k];
                    if (AREA.is_orange(p) && !seen[p]) { seen[p] = 1; out.push(p); }
                }
            }
        }
    }
    area._fbx_items = out.slice(0, FBX_MAX_ITEM);
    return area._fbx_items;
}
function fbx_areas() {
    var all = fbx_all_areas(), out = [];
    for (var i = 0; i < all.length && i < FBX_MAX_AREA; i++) {
        if (all[i] && fbx_items(all[i]).length) out.push(i);
    }
    return out;
}
function fbx_avail(me, area) {
    var used = me.query_temp("fbx_spent_" + area.fb_index, 0);
    return Math.max(0, area.query_run_count(me) - used);
}
function fbx_obj_name(path) {
    var obj = OBJ.CREATE(path);
    if (!obj) return { obj: null, html: path };
    var color = obj.query_grade_color ? obj.query_grade_color() : "hio";
    return { obj: obj, color: color, html: "<" + color + ">" + obj.name + "</" + color + ">" };
}

function fbx_show_areas(me, npc) {
    var idx = fbx_areas(), all = fbx_all_areas();
    if (!idx.length) return me.notify("易直非摇头道：眼下没有能换的东西。");
    var html = ["<hiy>易直非搓着手笑道：「副本跑得多了，总有些好东西从指缝里漏掉。拿你的副本次数来，我替你寻来——一件 " + FBX_COST + " 次。」</hiy>", '<div style="text-align:center;">'];
    for (var i = 0; i < idx.length; i++) {
        var a = all[idx[i]];
        html.push('<span ' + fbx_click("fbx_a" + idx[i] + " " + npc.id) + ' style="' + FBX_CELL + '"><hiw>' + a.name + '</hiw><br><wht>可用次数 ' + fbx_avail(me, a) + '</wht></span>');
    }
    html.push("</div>");
    me.notify(html.join(""));
}
function fbx_show_items(me, npc, ai) {
    var a = fbx_all_areas()[ai];
    var items = fbx_items(a);
    if (!a || !items.length) return me.notify("易直非摇头道：这个副本没有我能换的东西。");
    me._fbx_area = ai;
    var html = ["<hiy>" + a.name + "</hiy>：已完成 " + a.query_run_count(me) + " 次，可用 <hig>" + fbx_avail(me, a) + "</hig> 次。每件 " + FBX_COST + " 次。", '<div style="text-align:center;">'];
    for (var k = 0; k < items.length; k++) {
        html.push('<span ' + fbx_click("fbx_i" + k + " " + npc.id) + ' style="' + FBX_CELL + '">' + fbx_obj_name(items[k]).html + '</span>');
    }
    html.push("</div>");
    me.notify(html.join(""));
    me.send_commands("fbx " + npc.id, "返回副本列表");
}
function fbx_pick(me, npc, k, confirm) {
    var ai = me._fbx_area;
    var a = ai === undefined ? null : fbx_all_areas()[ai];
    var path = a && fbx_items(a)[k];
    if (!path) return fbx_show_areas(me, npc);
    var avail = fbx_avail(me, a);
    var info = fbx_obj_name(path);
    if (!confirm) {
        var lines = ["\n" + info.html];
        if (info.obj && info.obj.desc) lines.push(info.obj.desc);
        if (info.obj && info.obj.prop && UTIL.prop_toString) lines.push("<" + info.color + ">" + UTIL.prop_toString(info.obj.prop) + "</" + info.color + ">");
        lines.push("\n<hiz>── 兑换需求 ──</hiz>");
        lines.push("<hiw>" + a.name + "副本次数 ×" + FBX_COST + "（你可用 " + avail + " 次）</hiw>");
        lines.push(avail >= FBX_COST ? "<hig>次数足够，可以兑换。</hig>" : "<hir>次数不足。</hir>");
        me.notify(lines.join("\n"));
        return me.send_commands("fbx_c" + k + " " + npc.id, "确认兑换", "fbx_a" + ai + " " + npc.id, "返回");
    }
    if (avail < FBX_COST) {
        return me.notify("<hiw>易直非摊手道：「" + a.name + "的次数还差 " + (FBX_COST - avail) + " 次，多跑几趟再来吧。」</hiw>");
    }
    if (me.items && me.items.length > 204) return me.notify("你背包的东西太多了。");
    var got = me.add_obj(path, 1);
    if (!got) return me.notify("易直非挠头道：哎呀，这件东西一时寻不着，换一件吧。");
    me.set_temp("fbx_spent_" + a.fb_index, me.query_temp("fbx_spent_" + a.fb_index, 0) + FBX_COST);
    me.notify("<hig>易直非从身后的包袱里摸出" + (got.color_name || got.name) + "，郑重地交到你手上。</hig>\n<hiw>" + a.name + "可用次数还剩 " + fbx_avail(me, a) + " 次。</hiw>");
    if (got.is_equipment && got.grade >= 5 && typeof COMMAND !== "undefined" && COMMAND.DO) {
        COMMAND.DO("rumor", "听说有人得到了一" + got.unit + got.name + "。");
    }
}

WORLD.FB_EXCHANGE = {
    COST: FBX_COST,
    items: fbx_items,
    areas: fbx_areas,
    avail: fbx_avail,
    install: function (npc) {
        npc.add_action("fbx", "副本兑换", function (me) { fbx_show_areas(me, this); });
        for (var i = 0; i < FBX_MAX_AREA; i++) {
            (function (ai) {
                npc.add_action("fbx_a" + ai, null, function (me) { fbx_show_items(me, this, ai); });
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
