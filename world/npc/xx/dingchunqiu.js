this.inherits(NPC);
this.set({
    name: "丁春秋",
    desc: "星宿老仙，一派宗师。他面容枯槁，眼神阴鸷，周身环绕着碧绿色的毒雾。化功大法威力无穷，三阴蜈蚣爪歹毒无比。",
    title: "<hiy>星宿老仙</hiy>",
    gender: 1,
    age: 55,
    per: 5,
    hp: 844200,
    max_hp: 844200,
    mp: 249000,
    max_mp: 249000,
    score: 300,
    gj: 66780,
    fy: 37064,
    mz: 58800,
    ds: 38179,
    zj: 1550
});
this.set_objects([
    "eq/lv4/shenmuwangding", 1, 1
]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2824],
    ["force", 2440],
    ["unarmed", 2440],
    ["huagongdafa", 2440, "force"],
    ["feixingshu", 2680, "unarmed"],
    ["sanyinwugongzhao", 2680, "unarmed"],
    ["zhaixinggong", 2680, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 150,
    max: 300
}, {
    obj: ["book/bc#huagongdafa", "book/bc#sanyinwugongzhao"],
    odds: 8850
}, {
    obj: ["book/bc#feixingshu", "book/bc#zhaixinggong"],
    odds: 8850
}, {
    obj: ["eq/lv4/shenmuwangding"],
    odds: 5310
}, {
    obj: ["eq/lv3/bilinzhen"],
    odds: 5310
});
// 攻略第 21 节：丁春秋的化功没啥用，要小心他的三阴蜈蚣爪，和「飞星」叠加可是很痛的，
// 可以比试骗掉飞星，然后击杀他。
//   · 不主动叫杀，好让玩家先跟他「比试」。
//   · 不论比试还是叫杀，开打约 DCQ_FX_DELAY 毫秒后他会打出一记「飞星」：碧磷针连发
//     DCQ_FX_HITS 下，并给目标挂上「飞星」易伤（伤害减免 -DCQ_FX_DEBUFF%）。
//   · 打出后要隔 DCQ_FX_CD 毫秒才能再发。冷却记在副本存储（room.set_temp(me, …)），
//     比试结束、他回满血都不会清掉——比试骗出飞星后趁冷却叫杀，就挨不到这一下。
var DCQ_FX_CD = 60000, DCQ_FX_DELAY = 3000, DCQ_FX_TICK = 2000;
var DCQ_FX_HITS = 3, DCQ_FX_DEBUFF = 30, DCQ_FX_DEBUFF_TIME = 20000;

this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("丁春秋端坐药炉之前，阴森森地说道：星宿老仙在此，小辈还不跪下受死！");
};
this.dcq_room = function () { return this.environment; };
this.dcq_cd_left = function (me) {
    var r = this.dcq_room();
    if (!r) return 0;
    var t = r.query_temp(me, "xx_feixing_until", 0) || 0;
    return Math.max(0, t - Date.now());
};
// 打出飞星（成功返回 true）
this.dcq_feixing = function (me) {
    if (!me || !me.is_player || me.hp <= 0 || this.hp <= 0) return false;
    if (!this.is_fighting || !this.is_fighting(me)) return false;
    if (this.dcq_cd_left(me) > 0) return false;
    var r = this.dcq_room();
    if (r) r.set_temp(me, "xx_feixing_until", Date.now() + DCQ_FX_CD);
    this.send_room("<HIG>$N袍袖一拂——「飞星」！数十枚碧磷针化作满天绿星，铺天盖地射向$n！</HIG>", me);
    for (var i = 0; i < DCQ_FX_HITS; i++) {
        if (me.hp <= 0 || !this.fight_type) break;
        this.do_attack({ target: me, gj: this.gj * 1.3, attack_msg: "" });
    }
    me.add_status({
        id: "xx_feixing",
        name: "<hig>飞星</hig>",
        desc: "碧磷针毒入体，伤害减免降低" + DCQ_FX_DEBUFF + "%",
        duration: DCQ_FX_DEBUFF_TIME,
        downside: true,
        prop: { diff_sh_per: -DCQ_FX_DEBUFF }
    });
    this.end_attack(me);
    if (this.fight_type === 1 || me.fight_type === 1)
        me.notify("<hiy>丁春秋的碧磷针已经打空，一时半会儿发不出第二轮飞星了（约" + (DCQ_FX_CD / 1000) + "秒）。</hiy>");
    return true;
};
// 开打后定时检查：冷却好了就打飞星，直到这场战斗结束
this.dcq_arm = function (me) {
    if (!me || !me.is_player) return;
    if (this._dcq_timer) clearTimeout(this._dcq_timer);
    var self = this;
    var tick = function () {
        self._dcq_timer = null;
        if (self.hp <= 0 || me.hp <= 0 || !self.is_fighting(me)) return;
        self.dcq_feixing(me);
        self._dcq_timer = self.call_out(tick, DCQ_FX_TICK);
    };
    var left = this.dcq_cd_left(me);
    if (left > 0) me.notify("<hiy>丁春秋手在袖中一摸，碧磷针却还没装好——飞星暂时发不出来。</hiy>");
    this._dcq_timer = this.call_out(tick, Math.max(DCQ_FX_DELAY, left));
};
// 比试（fight 命令）开始前
this.on_before_fight = function (me) {
    if (me && me.is_player) this.dcq_arm(me);
    return true;
};
// 玩家叫杀
this.on_kill = function (me) {
    if (me && me.is_player) this.dcq_arm(me);
    return true;
};
