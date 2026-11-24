// 火舞旋风：5 品公共剑法（由原 6 品拳法「天地同寿」改造，旧 id tianditongshou 见 SKILL.RENAMED）。
// 面板参照同档 5 品剑法：剑法 攻击/命中 lv*2+10、臂力 lv*0.2、攻击速度 8%；招架 lv*2+10、身法 lv*0.2。
// 被动「火舞」：以火舞旋风出招（手持剑平 A、火舞旋风的绝招）伤害提高 当前气血/最大气血 的比例，满血翻倍。
//   - 平 A 走技能级 on_attack（只有手持剑、火舞旋风装在剑法上才会是 attack_skill）；
//   - 华山真意「无剑·无招」下不持剑施展火云漫天时，attack_skill 不是本技能，由绝招里补算。
//   这是被动，融入自创武学后不随绝招带走（自创里检查不到火舞旋风装在剑法上），属于预期。
this.inherits(SKILL);
this.name = "火舞旋风";
this.id = "huowuxuanfeng";
this.grade = 5;
this.attack_actions = [
    "$N剑走火势，身随剑转，一道赤红剑光卷向$n",
    "$N手中$w舞成一团烈焰，旋风般扑向$n的$l",
    "$N足下一点，剑影如火舌翻卷，直取$n"
];
this.desc = "剑招如烈火旋风，越是气血充盈，剑势越是炽烈。";
this.can_enables = ["sword", "parry"];
this.learn_condition = {};

function hp_ratio(me) {
    if (!me || !(me.max_hp > 0) || !(me.hp > 0)) return 0;
    return Math.min(1, me.hp / me.max_hp);
}

this.query_enable_prop = function (lv) {
    return {
        sword: {
            gj: lv * 2 + 10,
            mz: lv * 2 + 10,
            str: parseInt(lv * 200 / 1000),
            gjsd_per: 8,
            desc: "火舞：以火舞旋风出招时，造成的伤害提高，提高的比例等于你当前气血的百分比（满血时伤害翻倍）",
        },
        parry: {
            zj: lv * 2 + 10,
            dex: parseInt(lv * 200 / 1000),
        },
    };
};

// 被动：平 A（手持剑、本技能为攻击技能）伤害 ×(1 + 当前气血比例)。
// 此处 sh 尚未乘部位系数与增伤，返回 基础伤害×比例 即等效乘算。
this.on_attack = function (me, target, par) {
    if (!par || par.is_throwing) return 0;
    var ratio = hp_ratio(me);
    if (!(ratio > 0)) return 0;
    var base = par.gj ?? me.gj;
    return base * ratio;
};

this.pfm = {
    huoyun: {
        name: "火云漫天",
        distime: 60000,
        enable_skill: "sword",
        weapon_type: WEAPON_TYPE.SWORD,
        release_time: 0,
        mp: 35,
        use: function (me, target, lv) {
            me.send_room("<HIR>$N长剑一引，剑身烈焰翻腾，霎时间火云漫天，$N身形随火势旋舞不休！</HIR>", target);
            me.add_status({
                id: "huowu",
                name: "火舞",
                desc: "攻击速度+30%，攻击+30%，每次攻击恢复1%最大气血",
                duration: 15000,
                prop: {
                    gjsd_per: 30,
                    gj_per: 30,
                },
                start_msg: "<HIR>$N周身火光缭绕，剑势如狂风烈焰！</HIR>",
                finish_msg: "$N周身的火光渐渐熄灭了。",
                // 每次攻击恢复 1% 最大气血：挂在状态上，融入自创武学后照常生效
                on_attack_over: function (owner, t, par, sh) {
                    if (owner.hp > 0 && owner.hp < owner.max_hp) {
                        owner.do_recover(Math.max(1, Math.floor(owner.max_hp * 0.01)));
                        owner.notify_hp && owner.notify_hp();
                    }
                },
            });
            var par = { target: target };
            // 无剑·无招下不持剑施展：平 A 的被动钩子不会触发，这里补上「火舞」被动（仍要求火舞旋风装在剑法上）
            var sword_sk = me.query_used_skill && me.query_used_skill(WEAPON_TYPE.SWORD);
            if (sword_sk && sword_sk.id === "huowuxuanfeng" && (!me.attack_skill || me.attack_skill.id !== "huowuxuanfeng")) {
                par.gj = me.gj * (1 + hp_ratio(me));
            }
            me.do_attack(par);
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "进入「火舞」状态15秒：攻击速度提高30%，攻击提高30%，每次攻击恢复1%最大气血，随即出剑攻击";
        }
    },
    tianditongshou: {
        name: "天地同寿",
        distime: 120000,
        fixed_distime: true,   // 冷却固定 120 秒，不吃冷却缩减
        enable_skill: "sword",
        weapon_type: WEAPON_TYPE.SWORD,
        release_time: 0,
        mp: 0,
        use: function (me, target, lv) {
            if (!target || target.hp <= 0) return;
            var dmg = Math.floor(me.hp - 1);
            if (!(dmg > 0)) {
                me.send_combat("<red>你气血已近枯竭，无力施展天地同寿！</red>\n");
                return;
            }
            me.send_room("<HIR>$N大叫一声：“我跟你们拼了！”</HIR>", target);
            // 气血先燃尽（落空也扣），自己照样虚弱；命中判定与普通攻击相同（闪避/招架），不是必中
            me.add_hp(-dmg);
            me.notify_hp && me.notify_hp();
            if (!me.roll_hit(target, {})) {
                me.send_room("$n间不容发地避开了这玉石俱焚的一击！", target);
                me.add_status(weak_status());
                me.end_attack(target);
                return;
            }
            target.damage3(dmg, me);
            me.send_combat("<HIR>$n受到" + dmg + "点伤害！</HIR>\n", target);
            me.add_status(weak_status());
            if (target.hp > 0) target.add_status(weak_status());
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "燃尽自身气血只留一口气，对敌人造成等量伤害（可被闪避、招架，落空也会燃尽气血）；之后你陷入虚弱60秒，敌人若被击中且未死也陷入虚弱60秒";
        }
    }
};

// 虚弱：攻击、命中、防御、躲闪、招架全部 -90%，持续 60 秒
function weak_status() {
    return {
        id: "huowu_xuruo",
        name: "虚弱",
        desc: "攻击、命中、防御、躲闪、招架降低90%",
        duration: 60000,
        downside: true,
        prop: {
            gj_per: -90,
            mz_per: -90,
            fy_per: -90,
            ds_per: -90,
            zj_per: -90,
        },
        start_msg: "<HIB>$N气血两亏，变得十分虚弱。</HIB>",
        finish_msg: "$N渐渐从虚弱中恢复过来。",
    };
}
