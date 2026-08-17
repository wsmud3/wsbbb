this.inherits(SKILL);
this.name = "闪电五连鞭";
this.id = "shandianwulianbian";
this.grade = 6;
this.desc = "以迅雷不及掩耳之势连续挥出五鞭，如闪电般迅猛，号称‘接化发’三字诀，化劲、借力、反击，浑然天成。";

this.attack_actions = [
    "$N手中$w一抖，如闪电般劈向$n的$l！",
    "$N鞭法迅捷，连续五鞭化作一道电网，笼罩$n全身！",
    "$N手腕一翻，$w如灵蛇出洞，直取$n的$l！",
    "$N暴喝一声，$w带着雷鸣之势抽向$n的$l！",
    "$N身形飘忽，$w划出诡异弧线，$n避无可避！",
    "$N鞭梢点地，借力反弹，以不可思议的角度抽向$n！"
];

this.parry_actions = [
    "$n手中$w一横，以柔劲化解$N的攻势。",
    "$n鞭法圆转，将$N的攻击轻松卸开。",
    "$n不退反进，$w如蛇缠绕，荡开$N的兵器。",
    "$n身形微侧，$w顺势一带，$N的招式落空。"
];

this.can_enables = ["whip", "parry"];

this.learn_condition = {
    max_mp: 5000,
    skill: { whip: 500 }
};

this.query_enable_prop = function (lv) {
    var gj = Math.floor(lv * 3.5);
    var mz = Math.floor(lv * 3.5);
    var busy_per = Math.floor(10 + lv / 300);
    var add_sh_per = Math.floor(5 + lv / 200);
    var mz_per = Math.floor(10 + lv / 200);

    return {
        whip: {
            gj: gj,
            mz: mz,
            busy_per: busy_per,
            add_sh_per: add_sh_per,
            mz_per: mz_per,
            desc: "闪电五连鞭，快如闪电，招招致命。"
        },
        parry: {
            zj: Math.floor(lv * 2 + 20),
            diff_sh_per: Math.floor(5 + lv / 200)
        }
    };
};

function start_auto_attack(me) {
    if (!me) return;
    if (me.fight_type && !me.attack_handler && me.call_out && me.auto_attack) {
        me.attack_handler = me.call_out(me.auto_attack, Math.random() * (me.gjsd || 1000));
    }
}

this.on_new_enemy = function(me, target) {
    start_auto_attack(me);
};
this.on_beginfight = function(me, target) {
    start_auto_attack(me);
};

// ========== 全体攻击定时器 ==========
function start_aoe_timer(me, interval, duration, lv) {
    if (!me) return;
    // 清除已有的定时器（实现覆盖）
    if (me.__shandian_timer) {
        clearTimeout(me.__shandian_timer);
        delete me.__shandian_timer;
    }
    var endTime = Date.now() + duration;
    function nextAttack() {
        if (!me || !me.fight_type || Date.now() >= endTime) {
            if (me) delete me.__shandian_timer;
            return;
        }
        var enemies = me.enemy || [];
        if (enemies.length === 0) {
            delete me.__shandian_timer;
            return;
        }
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            if (enemy && enemy.hp > 0) {
                me.do_attack({
                    target: enemy,
                    attack_msg: (i === 0 ? "<HIC>闪电链蔓延，席卷向所有敌人！</HIC>" : ""),
                    no_append_before: (i !== 0)
                });
            }
        }
        var cur_interval = Math.max(500, Math.floor(interval / (1 + (me.gjsd_per || 0) / 100)));
        me.__shandian_timer = setTimeout(nextAttack, cur_interval);
    }
    me.__shandian_timer = setTimeout(nextAttack, interval);
}

function stop_aoe_timer(me) {
    if (me && me.__shandian_timer) {
        clearTimeout(me.__shandian_timer);
        delete me.__shandian_timer;
    }
}

// ========== 绝招：接化发（可覆盖） ==========
this.pfm = {
    jiehuafa: {
        name: "接化发",
        distime: 30000,
        enable_skill: "whip",
        release_time: 2000,
        mp: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");
            // 覆盖：先停止旧的定时器
            stop_aoe_timer(me);
            me.send_room("<HIR>$N大喝一声：「接化发！」鞭法骤然变得诡异莫测，周身气劲如漩涡般旋转！</HIR>", target);

            // 1. 立即对全体敌人攻击一次
            var enemies = me.enemy || [];
            if (enemies.length === 0) enemies = [target];
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (enemy && enemy.hp > 0) {
                    me.do_attack({
                        target: enemy,
                        attack_msg: (i === 0 ? "" : "<HIC>鞭影又至，席卷向$n！</HIC>"),
                        no_append_before: (i !== 0)
                    });
                }
            }

            // 2. 增益 buff（会覆盖旧状态）
            var gjsd_bonus = Math.floor(50 + lv / 100);
            if (gjsd_bonus > 100) gjsd_bonus = 100;
            var mz_bonus = Math.floor(100 + lv / 100);
            var duration_sec = 10 + Math.floor(lv / 100);
            if (duration_sec > 30) duration_sec = 30;
            var duration_ms = duration_sec * 1000;

            me.add_status({
                id: "shandianwulianbian_jiehuafa",
                name: "接化发",
                desc: "攻击速度大幅提升，命中大幅提升，且每1.5秒自动对全体敌人造成一次鞭法伤害",
                duration: duration_ms,
                prop: {
                    gjsd_per: gjsd_bonus,
                    mz_per: mz_bonus
                },
                start_msg: "<HIY>$N进入「接化发」状态，鞭法化劲借力，势不可挡！</HIY>",
                finish_msg: "<CYN>$N的「接化发」状态结束了。</CYN>"
            }, me);

            // 3. 启动新的周期性全体攻击（间隔基础1.5秒，受攻击速度影响）
            start_aoe_timer(me, 1500, duration_ms, lv);

            start_auto_attack(me);
        },
        query_desc: function (me, lv) {
            var gjsd_bonus = Math.floor(50 + lv / 100);
            if (gjsd_bonus > 100) gjsd_bonus = 100;
            var mz_bonus = Math.floor(100 + lv / 100);
            var duration = 10 + Math.floor(lv / 100);
            if (duration > 30) duration = 30;
            return "释放「接化发」，立即对全体敌人攻击一次，并进入增益状态，持续" + duration + "秒，攻击速度提高" + gjsd_bonus + "%，命中提高" + mz_bonus + "%，且每1.5秒自动对全体敌人造成一次鞭法伤害（可覆盖刷新）。";
        }
    }
};

// 战斗结束时清理定时器
this.on_end_fight = function(me) {
    stop_aoe_timer(me);
};
