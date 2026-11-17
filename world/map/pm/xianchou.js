this.inherits(ROOM);
this.name = "仙愁门";
this.desc = "这里就快到缥缈峰绝顶了，越往上走，山势越高，缭绕在你身边的白雾愈来愈浓，往南则是下山的路。沿着山道没走几步，在你眼前出现一个石坊，上书『仙愁门』三个大字，概因上山之艰辛吧。";
this.exits = {
    "northup": "pm/dadao",
    "southdown": "pm/jian",
};
this.set_npc(["pm/liqiushui", 1]);

// [mech] 李秋水拦路；背着童姥到这里数息后童姥落地，李秋水叫杀童姥（困难：要在落地前叫杀李秋水）。
// 规则见 world/area/fb1/fb26.js（pm_arrive_xianchou / pm_on_lqs_died）。
this.on_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (!area || !area.pm_arrive_xianchou) return;
    if (area.pm_carrying(me)) {
        area.pm_ensure_carry_status(me);
        area.pm_arrive_xianchou(this, me);
        return;
    }
    // 李秋水已死、童姥还在这里等着：补发「背起童姥」
    if (area.pm_get(this, "pm_lqs_dead", 0) && area.pm_alive(this, "pm/tianshantonglao"))
        me.send_commands("carry_tonglao", "背起童姥");
};

// 天龙遗珠仅困难模式掉落（攻略）：普通模式开副本时从李秋水的掉落表里去掉
this.on_set_difficulty = function (type) {
    if (type === 1) return;
    var lqs = this.find_obj_bypath("pm/liqiushui");
    if (!lqs || !lqs.drop_list) return;
    lqs.drop_list = lqs.drop_list.filter(function (d) {
        return !(d && JSON.stringify(d.obj || "").indexOf("tianlong_necklace") >= 0);
    });
};
