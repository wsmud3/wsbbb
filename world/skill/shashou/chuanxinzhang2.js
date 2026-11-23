this.inherits(SKILL);
this.name = "穿心掌";
this.id = "chuanxinzhang2";
this.source_skill = "chuanxinzhang";
this.grade = 4;
this.family = FAMILIES.SHASHOU;
this.attack_actions = [
    "$N使出一招「破山刀」，运掌如飞，招招直打$n的$l",
    "$N使出一招「碎石手」，双掌急运内力，带着凛冽的掌风直拍$n的$l",
    "$N惨然一声长啸，一招「摄魄掌」，双掌猛然击下，直扑$n的要脉",
    "$N骨骼暴响，双臂忽然暴长数尺，一招「追魂掌」直直攻向$n的$l",
    "$N施展出一招「撩阴掌」，双掌缤纷拍出，陡然间双掌已至$n跟前"
];
this.desc = "杀手楼的拳脚功夫，出招阴狠毒辣";
this.can_enables = ["unarmed", "parry"];
this.learn_condition = {
    max_mp: 2000,
    skill: { unarmed: 100 }
};
// 1000 级：拳脚 攻击 +1720 暴击 +4% 命中 +1710；招架 招架 +1420 躲闪 +1420 身法 +144
this.query_enable_prop = function (lv) {
    return {
        unarmed: {
            gj: parseInt(lv * 1.7) + 20,
            bj_per: 1 + parseInt(lv / 300),
            mz: parseInt(lv * 1.7) + 10,
        },
        parry: {
            zj: parseInt(lv * 1.4) + 20,
            ds: parseInt(lv * 1.4) + 20,
            dex: parseInt(lv * 144 / 1000),
        }
    };
};
// 昏迷时间：1 秒 + 每 300 级 1 秒，上限 7 秒（1000 级 4 秒）
function faint_time(lv) { return Math.min(7, 1 + parseInt(lv / 300)) * 1000; }
this.pfm = {
    chuan: {
        name: "掌心雷",
        distime: 30000,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 20,
        release_time: 4000,
        use: function (me, target, lv) {
            var par = {
                target: target,
                gj: me.gj * 2,
                mz: me.mz,
                attack_msg: "<hir>$N暗藏真气于掌心，一招「掌心雷」闪烁着雷光直贯$n</hir>",
                no_weapon: true
            };
            var hit = me.do_attack(par);
            if (par.is_dodge || par.is_parry) hit = 0;   // 被闪避/招架不算命中
            if (hit > 0 && target.hp > 0) {
                target.add_status({
                    id: "faint",
                    is_faint: true,
                    duration: faint_time(lv),
                    name: "昏迷", downside: true,
                    finish_msg: "<hiy>慢慢的$N又恢复了知觉...</hiy>\n",
                    start_msg: "<hir>$N只觉得眼前一黑，接着什么都不知道了。</hir>\n"
                }, me);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "对敌人造成200%攻击力的伤害，命中后昏迷对方" + (faint_time(lv) / 1000) + "秒";
        }
    }
};
