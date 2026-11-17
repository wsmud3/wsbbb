this.inherits(NPC);
this.set({
    name: "阿紫",
    desc: "星宿派小师妹，虽是男儿身却喜作女装打扮，妖冶异常。",
    gender: 1,
    age: 20,
    per: 22,
    hp: 357000,
    max_hp: 357000,
    mp: 129000,
    max_mp: 129000,
    score: 0,
    gj: 38010,
    fy: 18497,
    mz: 38850,
    ds: 26302,
    zj: 775
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
    obj: ["eq/lv3/bilinzhen"],
    odds: 8850
}, {
    obj: ["book/bc#zhaixinggong"],
    odds: 7080
});
// 攻略第 21 节：此关只需击杀丁春秋和狮吼子，其他人不会拦你——不主动叫杀、score 为 0，不卡完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("阿紫掩嘴笑道：又来一个不知死的。想跟本姑娘比划比划么？");
};

// ── 比试刷「五神剑」buff ──
// 攻略：小师妹阿紫（他男的），可以找他比试刷五神剑 buff。每比试完一场（胜负都算），
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
// 比试用 NPC 自带的「比试」按钮（fight 命令），比完在 on_fight_over 里给 buff
this.on_fight_over = function (other, issuc) {
    this.wushen_grant(other);
};
