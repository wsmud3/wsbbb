// 炼药：在能炼药的房间（家里炼药房、帮会炼药房、扬州内室等 can_lianyao 的房间）用已学会的丹方炼丹。
//   lianyao          浮窗：已掌握几个丹方，选择炼制几级丹药
//   lianyao g<品级>   浮窗：这一级已学会的丹药，每行「丹药按钮 + 所需材料」，材料不够的标「材料不足」
//   lianyao <丹方id>  开始炼制：进入「炼药」状态，像采药一样持续进行，材料用完自动停止
// 随从代炼（dc <随从> lianyao）：丹方按主人学会的算，材料从随从自己的背包扣，炼出的丹药也进随从背包；
// 浮窗发给主人，按钮命令带上 dc 前缀。
// 炼药本身不需要炼药术等级（学丹方才需要）；炼药术只通过炼药效率（lianyao1）影响炼制速度。
// 测试号（及其随从）炼药不需要也不消耗材料（见 WORLD.LIANYAO.free_materials）。
this.inherits(COMMAND);
this.command = "lianyao";
this.regex = /^(g?\d+)?$/;
this.allow_fight = false;

var GRADE_CN = ["", "一", "二", "三", "四", "五", "六"];

this.enter = function (me, arg) {
    var L = WORLD.LIANYAO;
    if (!L) return me.notify("这里没法炼药。");
    var owner = L.owner_of(me);
    if (!owner) return me.notify("只有玩家和随从才能炼药。");
    if (!me.environment || !me.environment.can_lianyao) return me.notify("这里没有炼药炉，没法炼药。");
    var prefix = me === owner ? "lianyao" : "dc " + me.id + " lianyao";
    var free = L.free_materials(owner);
    if (!arg) return show_grades(me, owner, L, prefix);
    if (arg.charAt(0) === "g") return show_grade(me, owner, L, prefix, parseInt(arg.substr(1)), free);

    var rec = L.get(arg);
    if (!rec) return me.notify("没有这种丹方。");
    if (!L.knows(owner, rec.id)) return me.notify("你还不会炼制" + L.GRADE_TEXT[rec.grade] + rec.name + "，先找到它的丹方研读一番。");
    if (L.craftable(me, rec, free) < 1) return me.notify("炼制" + rec.name + "需要" + L.material_text(rec) + "，材料不够。");

    var dan = OBJ.CREATE("drug/dan#" + rec.id);
    var name = dan ? dan.color_name : rec.name;
    me.send_room("$N把药材依次投入炼药炉，开始炼制" + name + "。");
    me.set_state({
        id: "lianyao",
        type: "work",
        title: "炼药",
        player: me,
        rate: 1,
        recipe: rec.id,
        free: free,
        progress: 0,
        made: 0,
        on_enter: tick,
        on_check: function (who) {
            who.send("你正在炼制" + name + "，炼药效率" + (who.query_prop("lianyao1") || 0) + "，每" + (L.craft_interval(who) / 1000) + "秒炼成一颗，已炼成" + this.made + "颗。");
        },
        no_move: "你正在炼药，丹炉离不得人！",
        desc: '["炉火正旺，药香四溢。","你盯着炉火，小心掌握着火候。","丹炉中隐隐传出药材交融的声响。"]',
    });
};

// 每次心跳（5 秒）累计火候，够一颗就扣材料出一颗；材料用完返回 false 结束炼药
function tick(me, dt) {
    var L = WORLD.LIANYAO, rec = L.get(this.recipe);
    if (!rec || !me.environment || !me.environment.can_lianyao) return false;
    this.progress += 5000;
    var interval = L.craft_interval(me);
    while (this.progress >= interval) {
        if (!L.consume(me, rec, this.free)) {
            me.notify("药材用完了，你熄了炉火。这次一共炼成" + this.made + "颗" + rec.name + "。");
            return false;
        }
        this.progress -= interval;
        var dan = me.add_obj("drug/dan#" + rec.id);
        if (dan) {
            this.made++;
            me.send_room("<hig>$N炼成了一颗" + dan.color_name + "。</hig>");
        }
        if (me.add_exp) {
            var exp = WORLD.DATA.get_exp(me);
            me.add_exp(exp, exp + (me.query_prop("ly_qn") || 0), 0);
        }
    }
}

// 浮窗统一走 me.popup（随从代炼时 me 是随从，popup 自动弹给正在指挥它的主人）

// 第一级：选择炼制几级丹药
function show_grades(me, owner, L, prefix) {
    var known = L.known_list(owner);
    if (!known.length) return me.notify("你还没有掌握任何丹方。丹方需要研读后才能炼制。");
    var buttons = [];
    for (var g = 1; g <= 6; g++) {
        var has = known.some(function (id) { var r = L.get(id); return r && r.grade === g; });
        if (has) buttons.push([prefix + " g" + g, "炼制" + GRADE_CN[g] + "级丹药"]);
    }
    me.popup({
        text: (me === owner ? "你" : me.name + "照你") + "目前已掌握" + known.length + "个药方，要炼制哪个级别的丹药？",
        buttons: buttons
    });
}

// 第二级：这一级的丹药，每行「丹药按钮 + 需要材料」
function show_grade(me, owner, L, prefix, grade, free) {
    var recs = L.known_list(owner).map(L.get).filter(function (r) { return r && r.grade === grade; });
    if (!recs.length) return show_grades(me, owner, L, prefix);
    var rows = [(me === owner ? "你" : me.name) + "目前可以炼制以下" + GRADE_CN[grade] + "级丹药："];
    recs.forEach(function (rec) {
        var dan = OBJ.CREATE("drug/dan#" + rec.id);
        var mats = [];
        for (var p in rec.mats) {
            var o = OBJ.CREATE(p);
            mats.push((o ? o.color_name : p) + "<wht>x" + rec.mats[p] + "</wht>");
        }
        var n = L.craftable(me, rec, free);
        var tail = free ? "（不耗材料）" : n > 0 ? "<hig>可炼" + n + "颗</hig>" : "<hiw>材料不足</hiw>";
        rows.push(UTIL.popup_btn(prefix + " " + rec.id, dan ? dan.color_name : rec.name) + "需要材料：" + mats.join("，") + " " + tail);
    });
    me.popup({ rows: rows, back: prefix, size: "lg" });
}
