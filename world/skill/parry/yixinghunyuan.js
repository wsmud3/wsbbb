this.inherits(SKILL);
this.name = "移形混元";
this.id = "yixinghunyuan";
this.grade = 6;
this.desc = "一门以守为攻的奇门武学，讲究移形换位、借力打力。修习有成后，遇袭时能随机应变，借势反击。";
this.can_enables = ["parry"];
this.learn_condition = {
    max_mp: 800,
    skill: {
        parry: 150
    }
};

this.weapon_vs_weapon_actions = [
    "只听见「锵」一声，被$p用手中$i格开，混元劲力随之一引，将$N的力道卸去大半。",
    "结果「当」地一声，$p手中$i划出一道圆弧，将$N的$W荡了开去。"
];
this.parry_actions = [
    "但是被$p双掌一圈，混元劲力流转，将$N的攻势卸在一旁。",
    "结果$p身形一转，移形换位，借力打力，化解了$N的攻势。"
];
this.unarmed_vs_weapon_actions = [
    "$p双掌轻轻一拨，$N的$w失了准头，和$p的$l偏了几寸。",
    "$p往$N的手腕轻轻一按，结果$w偏向一边。"
];

this.query_enable_prop = function (lv) {
    return {
        parry: {
            zj: parseInt(lv * 1.5 + 20),
            zj_per: 5 + parseInt(lv / 200),
            str: parseInt(lv / 6),
            fy: parseInt(lv * 1.2 + 20),
            desc: "受到攻击时，有几率借势反击一次，几率随等级提升"
        }
    };
}

//被动：受到攻击时概率反击一次（每100级1%，1万级100%）
//混元之气期间：绝对招架，每次招架成功就连续反击 2+lv/1000 次（上限5次）
this.on_parry_over = function (me, target, par) {
    var lv = me.query_skill("yixinghunyuan", 0);
    if (!lv) return;
    var cnt = 1;
    if (me.query_status("yixinghunyuan")) {
        //混元之气期间：每招架一次连续反击 N 次
        cnt = Math.min(5, 2 + parseInt(lv / 1000));
    } else if (me.random(10000) >= lv) {
        //被动概率反击未触发
        return;
    }
    for (var i = 0; i < cnt; i++) {
        if (target.hp <= 0 || !target.fight_type) break;
        me.do_attack({
            target: target,
            attack_msg: "<hic>$N身形微动，移形换位，借混元之势反手一击，攻向$n的$l！</hic>"
        });
    }
    me.end_attack(target);
}

//绝对招架：混元之气期间强制招架成功
this.on_parry = function (me, target, par) {
    if (me.query_status("yixinghunyuan")) {
        par.is_parry = true;
    }
}

this.pfm = {
    hunyuan:
    {
        name: "混元之气",
        distime: 30000,
        enable_skill: "parry",
        mp: 20,
        use_type: 2,
        release_time: 0,
        use: function (me, target, lv) {
            me.send_room("<hiy>$N深吸一口气，运起混元之气，周身霎时笼罩在一层无形气墙之中！</hiy>", target);
            me.add_status({
                id: "yixinghunyuan",
                name: "混元之气",
                desc: "移形混元之混元之气，绝对招架，每次招架成功便连续反击",
                duration: Math.min(30000, 10000 + lv * 2),
                only_combat: true,
                start_msg: "<hiy>$N周身的混元之气流转不息，敌人的攻击尽数被卸开！</hiy>",
                finish_msg: "<wht>$N周身的混元之气渐渐消散。</wht>"
            });
        },
        query_desc: function (me, lv) {
            var cnt = Math.min(5, 2 + parseInt(lv / 1000));
            var tm = Math.min(30000, 10000 + lv * 2);
            return "开启后进入绝对招架状态，每次招架成功便连续反击" + cnt + "次，持续" + (tm / 1000) + "秒。";
        }
    }
};