this.inherits(NPC);
this.set({
    name: "小青",
    desc: "一位身着青衣的少女，面容姣好，但眼角带着几分毒蛇般的冷意。她是欧阳锋的弟子，精通蛇毒制药之术，可以为武林中人配置蛇血药剂。",
    title: "蛇毒药师",
    gender: 2,
    age: 18,
    per: 24,
    hp: 60000,
    max_hp: 60000,
    mp: 15000,
    max_mp: 15000,
    score: 0,
    gj: 1774,
    fy: 734,
    mz: 1419,
    ds: 675,
    zj: 389
});
this.skill_map(
    ["dodge", 420],
    ["parry", 400],
    ["force", 420],
    ["unarmed", 420],
    ["chanchubufa", 420, "dodge"]
);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
});

// ── 配置蛇血药剂（攻略：药房小青可以给你配置蛇血，10 份蛇血一份药剂）──
// 10 份怪蟒蛇血（res/shexue，毒蛇/蟒蛇随机掉落）→ 1 颗白驼山蛇血丹（drug/yao#N）。
// 蛇血丹四种功效由玩家挑：再生(回血)/暴虐/龟灵/培元(内力上限)。小青 score 为 0，杀不杀不影响进度。
var XQ_BLOOD = "res/shexue", XQ_NEED = 10;
var XQ_KINDS = [
    { cmd: "peiyao0", name: "再生", desc: "恢复三成气血" },
    { cmd: "peiyao1", name: "暴虐", desc: "增加伤害、减少防御" },
    { cmd: "peiyao2", name: "龟灵", desc: "增加防御、减少伤害" },
    { cmd: "peiyao3", name: "培元", desc: "提升内力上限" }
];
function xq_count(me) {
    var o = me.find_obj_bypath(XQ_BLOOD);
    return o ? (o.count || 1) : 0;
}
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("小青抬起头看了你一眼：「你要是有蛇血，我可以帮你配成药剂。十份蛇血，一份药剂。」");
};
this.add_action("peiyao", "配置蛇血药剂", function (me) {
    if (!me.is_player) return true;
    var n = xq_count(me);
    if (n < XQ_NEED) {
        me.notify("小青摇头道：「蛇血不够呀，十份才能配一份药剂。你现在只有" + n + "份。后山岩洞里那条怪蟒的血最好。」");
        return true;
    }
    me.notify("小青点点头：「你有" + n + "份蛇血，想配哪一种？」");
    var btns = [];
    for (var i = 0; i < XQ_KINDS.length; i++) {
        me.notify("  " + XQ_KINDS[i].name + "蛇血丹：" + XQ_KINDS[i].desc);
        btns.push(XQ_KINDS[i].cmd + " " + this.id, XQ_KINDS[i].name);
    }
    me.send_commands.apply(me, btns);
    return true;
});
function xq_make(npc, me, kind) {
    if (!me.is_player) return true;
    var o = me.find_obj_bypath(XQ_BLOOD);
    if (!o || (o.count || 1) < XQ_NEED) {
        me.notify("小青摇头道：「蛇血不够呀，十份才能配一份药剂。」");
        return true;
    }
    if (!me.remove_obj(o, XQ_NEED)) {
        me.notify("小青皱眉道：「你的蛇血好像拿不出来……」");
        return true;
    }
    me.add_obj("drug/yao#" + kind, 1);
    me.notify("<hig>小青把十份蛇血倒进药炉，捣弄了半晌，递给你一颗" + XQ_KINDS[kind].name + "蛇血丹。</hig>");
    return true;
}
this.add_action("peiyao0", null, function (me) { return xq_make(this, me, 0); });
this.add_action("peiyao1", null, function (me) { return xq_make(this, me, 1); });
this.add_action("peiyao2", null, function (me) { return xq_make(this, me, 2); });
this.add_action("peiyao3", null, function (me) { return xq_make(this, me, 3); });
