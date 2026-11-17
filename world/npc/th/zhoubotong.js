this.inherits(NPC);
this.set({
    name: "周伯通",
    desc: "一个白发白须的老顽童，虽年过花甲却童心未泯，嬉皮笑脸，武功却是当世绝顶。",
    title: "老顽童",
    gender: 1,
    age: 65,
    per: 12,
    hp: 572000,
    max_hp: 572000,
    mp: 122000,
    max_mp: 122000,
    score: 0,
    gj: 21442,
    fy: 14995,
    mz: 23435,
    ds: 16506,
    zj: 670
});
this.skill_map(
    ["dodge", 2220],
    ["parry", 2346],
    ["force", 2220],
    ["unarmed", 2164],
    ["kongmingquan", 2164, "unarmed"],
    ["jinyangong", 2220, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 100,
    max: 200
}, {
    obj: ["book/bc#kongmingquan", "book/bc#jinyangong"],
    odds: 8500
});

// 原版机制（攻略第 19 节，普通模式）：桃林山洞里的老顽童。
//   比试（fight）赢了他，或者干脆杀掉他，都能拿到石匣；
//   直接开口要石匣是行不通的，周伯通会告诉你「没门儿」。
// 进度存副本存储：th_ask（问过黄蓉）、th_done（已交回）。score 为 0，杀不杀不影响结算。
var ZBT_SHIXIA = "res/shixia";
function zbt_room(npc) { return npc.environment || npc.die_room; }
function zbt_get(npc, me, k) { var r = zbt_room(npc); return r ? r.query_temp(me, k, 0) : 0; }

// 给石匣（身上已有或已交回就不再给）
this.zbt_give = function (me, msg) {
    if (!me || !me.is_player) return false;
    if (zbt_get(this, me, "th_done") || me.find_obj_bypath(ZBT_SHIXIA)) return false;
    me.add_obj(ZBT_SHIXIA, 1);
    if (msg) me.notify(msg);
    me.notify("<hig>你得到了石匣，带回卧室交给黄蓉吧。</hig>");
    return true;
};

this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("周伯通跳起来拍手笑道：「好啊好啊，有人来陪老顽童玩了！来来来，咱们比划比划！」");
};

this.add_action("yao", "索要石匣", function (me) {
    if (!me.is_player) return true;
    if (zbt_get(this, me, "th_done") || me.find_obj_bypath(ZBT_SHIXIA)) {
        me.notify("周伯通摆手道：石匣已经给你啦，还要什么。");
        return true;
    }
    me.notify("周伯通把石匣往怀里一揣，摇头晃脑：「没门儿！想要石匣？先跟老顽童打一架，赢了再说！」");
    me.send_commands("fight " + this.id, "比试", "kill " + this.id, "杀");
    return true;
});
// 比试用 NPC 自带的「比试」按钮（fight 命令），胜负在 on_fight_over 里处理

// 比试分出胜负：on_fight_over(对手, 自己是否赢了)
this.on_fight_over = function (other, issuc) {
    if (!other || !other.is_player) return;
    if (issuc) {
        other.notify("周伯通哈哈大笑：「你打不过我，石匣不给！歇够了再来！」");
        return;
    }
    this.zbt_give(other, "<hiy>周伯通揉着胳膊笑道：好小子，有点意思！这石匣你拿去罢，反正我也打不开。</hiy>");
};

// 被杀也会掉出石匣
this.on_died = function (killer, corpse) {
    var me = killer && killer.is_player ? killer : null;
    if (!me || !me.is_player) {
        var r = zbt_room(this);
        if (r && r.items) for (var i = 0; i < r.items.length; i++) if (r.items[i] && r.items[i].is_player) { me = r.items[i]; break; }
    }
    if (me) this.zbt_give(me, "<hiy>周伯通临死前还嘟囔了一句：石匣……给你罢……</hiy>");
};
