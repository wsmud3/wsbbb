this.inherits(ROOM);
this.name = "断魂崖";
this.desc = "这是通向[灵鹫宫]的必经之路，一条小道蜿蜒曲折地通向缥缈峰顶。路的右侧是一条陡峭的山崖，一阵山风吹过，你似乎听见从下面传来几声惨号，你心中一凛，不禁加快脚步赶紧离开这里。";
this.exits = {
    "northup": "pm/yan",
    "southdown": "pm/shanjiao"
};
this.set_npc(["pm/wudaolaoda", 1], ["pm/bupingdaoren", 1], ["pm/tianshantonglao", 1]);
// 铁索桥在百丈涧（pm/jian），那里的描述才写着铁索；原先误挂在这里，按界面走到百丈涧是死路。

// [mech] 乌老大、不平道人见有人上山，先扑向童姥要她的命，再来对付你（攻略：速度要快，否则女童会被2个小怪秒杀；
// 也可以先背起童姥再杀两人）。规则见 world/area/fb1/fb26.js。
this.on_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (!area || !area.pm_alive) return;
    var foes = [];
    var paths = ["pm/wudaolaoda", "pm/bupingdaoren"];
    for (var i = 0; i < paths.length; i++) {
        var f = area.pm_alive(this, paths[i]);
        if (f) foes.push(f);
    }
    if (!foes.length) return;
    var tl = area.pm_alive(this, "pm/tianshantonglao");
    if (tl && !area.pm_get(this, "pm_ya_started", 0)) {
        area.pm_set(this, "pm_ya_started", 1);
        me.notify("<hir>" + foes.map(function (x) { return x.name; }).join("、") + "正围着一个女童，一见有人上来，抢先向女童下了杀手！</hir>");
        me.notify("<hiy>（女童便是天山童姥：赶快杀掉二人，或先背起她）</hiy>");
        for (var j = 0; j < foes.length; j++) foes[j].do_kill(tl);
    }
    for (var k = 0; k < foes.length; k++) foes[k].do_kill(me);
};
