this.inherits(NPC);
this.set({
    name: "田伯光",
    desc: "一个身形消瘦的男子，手持一柄快刀，双目如鹰，嘴角带着一丝淫邪的笑意。他便是臭名昭著的采花大盗田伯光，一身狂风刀法快如闪电，轻功更是出神入化。此人极难对付，据说要连杀三次才能真正将他置于死地。",
    title: "<hri>万里独行</hri>",
    gender: 1,
    age: 35,
    hp: 272000,
    max_hp: 272000,
    mp: 94600,
    max_mp: 94600,
    score: 0,
    gj: 19632,
    fy: 13348,
    mz: 17168,
    ds: 9514,
    zj: 910
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv1/dandao", 1, 1
]);
this.skill_map(
    ["dodge", 1504],
    ["parry", 1504],
    ["force", 1504],
    ["unarmed", 1504],
    ["blade", 1504],
    ["yanxingbu", 1504, "dodge"],    ["kuangfengkuaidao", 1504], ["parry", 1504, "blade"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
}, {
    obj: ["book/bc#kuangfengkuaidao", "book/bc#yanxingbu"],
    odds: 7100
}, {
    obj: ["eq/lv3/kuangfengdao", "eq/lv3/mianzhao"],
    odds: 4260
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_shoes"],
    odds: 4260
});
// 只对玩家叫杀：他换房间时，房间里的 NPC 也会收到 on_enter，不能对 NPC 开战
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("田伯光怪笑一声：嘿嘿，又来一个小娘们……哦不，是个男人？那也不妨，老子的刀可不挑人！");
    this.do_kill(me);
};

// ────────────────────────────────────────────────────────────
// 原版机制（攻略第 13 节）：
//   杀田伯光拿完成度——前两次他挨一刀就怪笑着逃走、随机落到恒山另一间房，
//   第三次（最后一刀）才真的死在刀下；三次合计 30 + 30 + 40 = 100%。
//
// 三个坑：
//   1) die() 里 on_die 返回 false 之后引擎会把 hp 置成 1，
//      所以必须趁他换房间再把血补满，否则下一照面又秒。
//   2) 原来用 ROOM.Get(path) 直接塞房间，塞进的是**模板房**而不是玩家这局的副本，
//      人等于凭空消失；必须用本队副本实例（query_copy）。
//   3) 挑房间时带上 hp=0：room.item_changed 只在 obj.hp 为真时才回调屋里其它
//      NPC 的 on_enter，借这个口子让三定/不戒他们不把他当闯入者开打。
// ────────────────────────────────────────────────────────────
this.tbg_killed = 0;

this.tbg_escape = function (killer) {
    var here = this.environment;
    if (!here || !here.parent) return;
    var area = here.parent;
    var team = killer && killer.query_teamid ? killer.query_teamid() : here.owner;
    if (!area.rooms) return;
    var cands = [];
    for (var i = 0; i < area.rooms.length; i++) {
        var cp = area.rooms[i].query_copy(team);
        if (!cp || cp === here) continue;      // 排除他现在待的这间
        cands.push(cp);
    }
    if (!cands.length) return;
    var dest = cands[Math.floor(Math.random() * cands.length)];
    var old_hp = this.hp;
    this.hp = 0;                               // 搬家期间不惊动屋里的 NPC（见上注 3）
    this.moveto(dest, this.name + "身形一晃，已经不知去向。", this.name + "怪笑着从窗外翻进来，落地无声。");
    if (this.hp === 0) this.hp = old_hp;
};

this.on_die = function (me) {
    // 被 NPC 打「死」不算数（他没在玩家面前认输，也不会掉东西）
    if (!me || !me.is_player) return false;
    if (this.tbg_killed < 2) {
        this.tbg_killed++;
        me.add_fbscore(30);
        me.notify("田伯光中了你一刀，却怪笑一声翻身掠走");
        this.tbg_escape(me);
        // die() 之后会把 hp 压到 1，趁他换房间补满，等下次照面再正经打一场
        this.call_out(function () {
            this.hp = this.max_hp;
            this.mp = this.max_mp;
            this.clear_status && this.clear_status();
        }, 200);
        return false;   // 不死
    }
    me.add_fbscore(40);
    me.notify("<hig>田伯光第三次中刀，怪笑声戛然而止，终于倒在你刀下。</hig>");
    return true;
};