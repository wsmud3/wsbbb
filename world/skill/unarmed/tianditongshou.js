this.inherits(SKILL);
this.name = "天地同寿";
this.id = "tianditongshou";
this.grade = 6;
this.attack_actions = [
    "$N运起同归于尽的狂烈掌力，周身气血翻涌，双掌直扑$n",
    "$N不顾自身经脉受损，以本命气血催动招式，一掌轰向$n",
    "$N舍弃半条性命，燃烧气血打出天地同寿，掌风死死锁住$n全身"
];
this.desc = "我不活了！";
this.can_enables = ["unarmed"];
this.learn_condition = {};
this.query_enable_prop = function (lv) {
    return {
        unarmed: {
            gj: parseInt(lv * 1.3),
            mz: parseInt(lv * 0.9)
        }
    };
}
this.pfm = {
    zhong:
    {
        name: "天地同寿",
        distime: 4500,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 0,
        release_time: 0,
        use: function (me, target, lv) {
            // 边界前置校验
            if (me.is_faint || me.hp <= 0) {
                me.send_combat("<red>你气血衰竭，无力催动天地同寿！</red>\n");
                return;
            }
            if (!target || target.hp <= 0 || !me.is_fighting(target)) {
                me.send_combat("<red>目标不存在或不在战斗中，无法打出印记！</red>\n");
                return;
            }

            var time = 1;
            if (time < 1) time = 1;

            // 临时保存原有shadow状态，执行完恢复
            const oldShadowState = me.is_shadow;
            me.is_shadow = true; // 开启影子必中：禁用闪避+招架

            // 攻击参数，移除no_parry，依靠is_shadow实现强制必中
            var sh = me.do_attack({
                target: target,
                attack_msg: "<red>$N燃烧本命气血，双掌带着影子真气拍向$n，同寿印记死死打入对方体内，根本无从躲闪格挡。</red>",
                miss_msg: "$n拼尽全力躲闪格挡，却发现这道影子掌力如跗骨之蛆完全避不开！",
            });

            // 还原shadow标记，防止永久影子状态
            me.is_shadow = oldShadowState;

            // 只要招式流程走完（必中逻辑生效）就挂印记，不再依赖sh常规伤害
            target.add_status({
                id: "tianditongshou",
                duration: time,
                downside: false,
                name: "天地同寿",
                desc: "周身萦绕同寿印记，时效结束将受到50%最大气血真实伤害，施术者损耗五成当前气血真实伤害；脱离战斗印记消散",
                no_clear: true,
                caster: me,
                on_expire: function (p) {
                    if (p.hp <= 0) return;
                    var caster = this.caster;
                    // 施法者已死亡，印记无伤害
                    if (!caster || caster.hp <= 0) {
                        p.notify("<hiw>施术者已殒命，天地同寿印记消散，无额外损伤。</hiw>");
                        return;
                    }
                    // 双方仍在战斗才爆发真实伤害
                    if (p.is_fighting(caster)) {
                        p.send_room("<hib>$N身上天地同寿印记轰然爆发，两股本命气血对冲，真实损伤席卷全身！</hib>");
                        // 目标真实伤害：50%最大气血，damage3无视所有防御减伤
                        var targetDmg = parseInt(p.max_hp * 0.5);
                        p.damage3(targetDmg, caster);

                        // 施法者真实自损：50%当前气血，最低保留1点血不死
                        var selfDmg = parseInt(caster.hp * 0.5);
                        if (caster.hp > selfDmg) {
                            caster.damage3(selfDmg, p);
                        } else {
                            caster.damage3(caster.hp - 1, p);
                        }
                        caster.end_attack(p);
                    } else {
                        p.notify("<hiw>脱离战斗，天地同寿印记失去真气牵引自行消散。</hiw>");
                    }
                }
            });
            me.end_attack(target);
            me.send_combat(`<hig>天地同寿！</hig>`);
        },
        query_desc: function (me, lv) {
            var time = 1;
            if (time < 1) time = 1;
            return "自爆";
        }
    }
};
