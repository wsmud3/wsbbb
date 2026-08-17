this.inherits(SKILL);
this.name = "大品天仙诀";
this.id = "dapintianxianjue";
this.grade = 6;
this.force_rad = 3.0;
this.desc = "大品天仙诀乃天仙正宗，修炼者与天地同寿，战斗中越战越强，每秒积累天仙之力。";

this.attack_actions = [
    "$N运起大品天仙诀，一掌拍向$n的$l！",
    "$N凝神聚气，一道天仙真气直贯$n的$l！",
    "$N掌中泛起仙光，向$n的$l按去！",
    "$N身形不动，一股无形气劲已轰向$n的$l！"
];

this.can_enables = ["force"];

this.learn_condition = {
    max_mp: 10000,
    skill: { force: 500 }
};

this.query_enable_prop = function (lv) {
    return {
        force: {
            gj: 300 + lv * 25,
            mz: 300 + lv * 25,
            add_sh_per: 15 + Math.floor(lv / 150),
            limit_mp: lv * 3000,
            desc: "战斗中每秒增加" + lv + "点攻击和命中（无上限）\n将你内力的300%转化为气血"
        }
    };
};

// ========== 辅助：清空所有本技能相关的状态和定时器 ==========
function clear_all_buffs(me) {
    if (!me) return;
    if (me.__dapin_timer) {
        clearInterval(me.__dapin_timer);
        delete me.__dapin_timer;
    }
    me.remove_status("dapintianxian_power", true);
    me.remove_status("dapintianxian_atk_buff", true);
    me.remove_status("dapintianxian_def_buff", true);
}

// ========== 被动定时器 ==========
function start_passive_timer(me, lv) {
    if (!me) return;
    // 先清空旧定时器
    if (me.__dapin_timer) {
        clearInterval(me.__dapin_timer);
        delete me.__dapin_timer;
    }
    me.__dapin_timer = setInterval(function() {
        if (!me || !me.fight_type || me.hp <= 0) {
            if (me && me.__dapin_timer) {
                clearInterval(me.__dapin_timer);
                delete me.__dapin_timer;
            }
            return;
        }
        me.add_status({
            id: "dapintianxian_power",
            name: "天仙之力",
            desc: "战斗时间累积的攻击和命中加成",
            duration: 86400,
            max_count: Infinity,
            count: 1,
            downside: false,
            override: 1,
            prop: {
                gj: lv,
                mz: lv
            },
            start_msg: "<HIY>$N的天仙之力增长了一分！</HIY>",
            finish_msg: ""
        }, me);
    }, 1000);
}

// ========== 进入战斗：清理残留并启动新被动 ==========
this.on_beginfight = function(me, target) {
    // 先清除所有本技能残留状态（防止卸下后遗留）
    clear_all_buffs(me);
    var lv = me.query_skill ? me.query_skill("dapintianxianjue", 0) : 0;
    if (lv > 0) {
        start_passive_timer(me, lv);
    }
};

// 新敌人加入时确保定时器已启动
this.on_new_enemy = function(me, target) {
    var lv = me.query_skill ? me.query_skill("dapintianxianjue", 0) : 0;
    if (lv > 0 && !me.__dapin_timer) {
        start_passive_timer(me, lv);
    }
};

// ========== 战斗结束：清空所有状态和定时器 ==========
this.on_end_fight = function(me) {
    clear_all_buffs(me);
};

// ========== 绝技 ==========
this.pfm = {
    tianxianfuti: {
        name: "天仙附体",
        distime: 30000,
        enable_skill: "force",
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<HIR>$N周身仙光大盛，气势陡然攀升！</HIR>", target);
            var atk_bonus = 20 + Math.floor(lv / 100);
            var dmg_bonus = 10 + Math.floor(lv / 200);
            me.add_status({
                id: "dapintianxian_atk_buff",
                name: "天仙附体",
                desc: "攻击力与最终伤害提升",
                duration: 20000 + parseInt(lv * 10),
                prop: {
                    gj_per: atk_bonus,
                    add_sh_per: dmg_bonus
                },
                start_msg: "<HIY>$N引动天仙之力，攻击暴涨！</HIY>",
                finish_msg: "<CYN>天仙附体的效果消失了。</CYN>"
            }, me);
        },
        query_desc: function (me, lv) {
            var atk = 20 + Math.floor(lv / 100);
            var dmg = 10 + Math.floor(lv / 200);
            return "提升自身" + atk + "%攻击和" + dmg + "%最终伤害，持续30秒。";
        }
    },
    jinshenbuhuai: {
        name: "金身不坏",
        distime: 30000,
        enable_skill: "force",
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<HIR>$N周身泛起金色光晕，坚不可摧！</HIR>", target);
            var fy_bonus = 30 + Math.floor(lv / 200);
            var sh_bonus = 10 + Math.floor(lv / 300);
            me.add_status({
                id: "dapintianxian_def_buff",
                name: "金身不坏",
                desc: "防御与伤害减免提升",
                duration: 20000 + parseInt(lv * 10),
                prop: {
                    fy_per: fy_bonus,
                    diff_sh_per: sh_bonus
                },
                start_msg: "<HIB>$N身化金身，刀枪不入！</HIB>",
                finish_msg: "<CYN>金身不坏的效果消失了。</CYN>"
            }, me);
        },
        query_desc: function (me, lv) {
            var fy = 30 + Math.floor(lv / 200);
            var sh = 10 + Math.floor(lv / 300);
            return "提升自身" + fy + "%防御和" + sh + "%伤害减免，持续30秒。";
        }
    },
    tianfa: {
        name: "天罚",
        distime: 25000,
        enable_skill: "force",
        release_time: 2500,
        mp: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁施展天罚？");
            me.send_room("<HIR>$N低喝一声：「天罚！」一道璀璨仙光从天而降，直击$n！</HIR>", target);
            var mult = 1 + lv / 500;
            var mp_cost = Math.floor(me.mp * 0.2);
            var extra = mp_cost;
            me.add_mp(-mp_cost);
            var total_gj = me.gj * mult + extra;
            me.do_attack({
                target: target,
                gj: total_gj,
                attack_msg: "<HIY>天罚降世，毁灭一切！</HIY>",
                damage_msg: "<HIR>$n被天罚仙光击中，浑身剧震！</HIR>"
            });
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var mult = 1 + lv / 500;
            return "对敌人造成" + (mult*100).toFixed(0) + "%攻击力+当前内力20%的伤害，消耗当前内力20%。";
        }
    }
};
