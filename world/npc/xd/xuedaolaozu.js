this.inherits(NPC);
this.set({
    name: "血刀老祖",
    desc: "血刀门掌门，一身血海魔功歹毒无比。他血刀在手，越战越勇，刀下每多一条人命，刀上血光便盛一分。",
    title: "<hir>血刀门掌门</hir>",
    gender: 1,
    age: 65,
    per: 8,
    hp: 1495652,
    max_hp: 1495652,
    mp: 946000,
    max_mp: 946000,
    score: 280,
    gj: 107500,
    fy: 55900,
    mz: 104641,
    ds: 51800,
    zj: 1118
});
// 手持血刀（NPC 专用，可被卸下；见 world/obj/xd/laozu_xuedao.js）
this.set_objects(["eq/lv0/cloth", 1, 1], ["xd/laozu_xuedao", 1, 1]);
this.skill_map(
    ["dodge", 5725],
    ["parry", 4375],
    ["force", 5575],
    ["blade", 5575],
    ["xuehaimogong", 5575, "force"],
    ["xuedao", 5575, "blade"],
    ["shenkongxing2", 5725, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#xuehaimogong"], odds: 12700},
    {obj: ["book/bc#xuedao"], odds: 12700},
    {obj: ["book/bc#shenkongxing2"], odds: 12700},
    {obj: ["eq/lv5/wushen/xuedao_blade"], odds: 7620},
    {obj: ["eq/lv5/wushen/longxue_cape"], odds: 7620}   // 攻略列有龙血斗篷
);

// 机制见 world/area/fb1/fb29.js：老祖坐镇山洞 xd/xuedao，与赶来的「落花流水」四侠混战，
// 每砍死一人往山谷走一步；到山谷前锁血，到了雪山山谷 xd/shangu 才能被杀。
function xd_area(npc) {
    var r = npc.environment;
    return r && r.parent && r.parent.xd_engage ? r.parent : null;
}
this.on_enter = function (me) {
    if (!me || !me.is_player || this.hp <= 0) return;
    var a = xd_area(this);
    if (!a) return this.do_kill(me);
    if (!a.xd_get(this.environment, "xd_started", 0))
        me.notify("<hir>血刀老祖狞笑道：「天堂有路你不走，地狱无门你闯进来！」</hir>");
    a.xd_engage(this, me);
};
// 玩家主动叫杀：同样把四侠引来；不再「一叫杀就往山谷走」
this.on_kill = function (me) {
    var a = xd_area(this);
    if (a && me && me.is_player) a.xd_engage(this, me);
    return true;
};
// 到山谷前锁血用 min_hp（扣血到 1 为止，控制类状态照样能挂上——攻略的「无缝控」打法）；
// 被引进雪山山谷时由 fb29.js xd_step 改为 0。on_die 只作兜底（非玩家击杀、血祭自损）。
this.min_hp = 1;
this.on_die = function (me) {
    var here = this.environment;
    var a = xd_area(this);
    var lock = here && here.path !== "xd/shangu";
    // 没有击杀者 = 血海魔功「血祭」自损把自己耗死（from_attack 里 die() 不带 killer）。
    // 这种死法不给分（npc.die 只给 killer 记分），在山谷也不能让他就这么死掉。
    // 四侠（NPC）补刀也不算：npc.die 只给击杀者记副本分，NPC 击杀者记不上分 → 永远 0%。只能死在玩家（或其随从）手里。
    if (!me || !(me.is_player || me.master)) lock = true;
    if (lock) {
        if (me && me.is_player && here && here.send_room && here.path !== "xd/shangu") {
            here.send_room("<hiy>血刀老祖周身血光缭绕，刀剑及体竟似砍在铁石之上。</hiy>");
        }
        // from_attack 在 die() 被拒后仍会 end_fight()，混战会整个停下：稍后把战场重新接上
        var self = this;
        if (a) this.call_out(function () { a.xd_reengage(self); }, 100);
        return false;
    }
    return true;
};
// 每次出招前核对血刀是否还在手上（被卸下兵刃后血魔之力消散）
this.do_attack = function (par) {
    var a = xd_area(this);
    if (a && this.xd_xuemo) {
        var before = this.xd_xuemo;
        a.xd_xuemo_check(this);
        if (!this.xd_xuemo && par) {
            if (par.gj !== undefined) par.gj -= before * a.XD_XUEMO;
            if (par.mz !== undefined) par.mz -= before * a.XD_XUEMO;
        }
    }
    return CHARACTER.prototype.do_attack.call(this, par);
};
// 混战开始后脱战也不回血：一路上被四侠和玩家打掉的血要带进山谷（攻略：到山谷时血量看杀人快慢）
this.heart_beat = function (dt) {
    if (this.xd_engaged && !this.fight_type && this.hp > 0) {
        this.on_heart_beat && this.on_heart_beat(dt);
        return;
    }
    return NPC.prototype.heart_beat.call(this, dt);
};
// 脱战后把被卸下的血刀重新拿回手上
this.on_heart_beat = function () {
    if (this.query_weapon() || !this.items) return;
    for (var i = 0; i < this.items.length; i++) {
        var it = this.items[i];
        if (it && it.path === "xd/laozu_xuedao") { this.equip(it); break; }
    }
};
