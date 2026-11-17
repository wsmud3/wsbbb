this.inherits(NPC);
this.set({
    name: "白衣少女",
    desc: "一名身着白衣的少女，美艳不可方物，却是欧阳锋的侍妾，擅长使用毒功。",
    gender: 2,
    age: 22,
    per: 28,
    hp: 340000,
    max_hp: 340000,
    mp: 141000,
    max_mp: 141000,
    score: 0,
    gj: 37800,
    fy: 19669,
    mz: 27800,
    ds: 22406,
    zj: 900
});
this.skill_map(
    ["dodge", 1752],
    ["parry", 1962],
    ["force", 1752],
    ["unarmed", 1752]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#chanchubufa"],
    odds: 6800
});
// 不主动叫杀：攻略里要先找她比试刷 buff，再去大厅打欧阳锋；score 为 0，杀不杀不影响完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("白衣少女冷冷道：擅闯白驼山花园，你可知死字怎么写？要不要先跟我比划两招？");
};

// ── 比试刷「五神剑」buff ──
// 攻略：可以与她比试刷五神剑你所需要的 buff（祝融最好）。每比试完一场（胜负都算），
// 随机得到祝融/石廪/芙蓉/鹤翔/天柱其中一种，不满意就再比一场重刷。
// 与衡山五神剑「五神赋」用同一个状态 id（wushenfu），互相覆盖、不叠加。
var WUSHEN_LIST = [
    { name: "祝融", stat: "攻击", prop: "gj_per" },
    { name: "石廪", stat: "防御", prop: "fy_per" },
    { name: "芙蓉", stat: "命中", prop: "mz_per" },
    { name: "鹤翔", stat: "躲闪", prop: "ds_per" },
    { name: "天柱", stat: "招架", prop: "zj_per" }
];
var WUSHEN_PER = 20, WUSHEN_TIME = 120000;
this.wushen_grant = function (me) {
    if (!me || !me.is_player || me.hp <= 0) return;
    var info = WUSHEN_LIST[Math.floor(Math.random() * WUSHEN_LIST.length)];
    var prop = {};
    prop[info.prop] = WUSHEN_PER;
    me.remove_status && me.remove_status("wushenfu");
    me.add_status({
        id: "wushenfu",
        name: info.name,
        desc: info.stat + "增加" + WUSHEN_PER + "%",
        duration: WUSHEN_TIME,
        prop: prop
    });
    me.notify("<HIM>一番比试下来，你心有所悟，五神剑意「" + info.name + "」加身，" + info.stat + "增加" + WUSHEN_PER + "%，持续" + (WUSHEN_TIME / 1000) + "秒。</HIM>");
    if (info.name !== "祝融") me.notify("<hiy>（想要别的五神剑 buff，歇好了再比试一场即可重刷。）</hiy>");
};
// 比试用 NPC 自带的「比试」按钮（fight 命令），胜负在 on_fight_over 里处理
this.on_fight_over = function (other, issuc) {
    this.wushen_grant(other);
};
