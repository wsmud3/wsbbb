this.inherits(SKILL);
this.name = "疾风剑法";
this.id = "jifengjianfa";
this.grade = 6;
this.desc = "以疾风入剑，剑出如风，快如闪电。相传乃远古风神所传之无上剑道，习之者攻速冠绝天下，剑势密如骤雨，迅若奔雷。";

this.attack_actions = [
    "$N手中$w挟风劲疾刺而出，「追风逐影」直取$n的$l！",
    "$N身随剑走，$w化作一道残影，「疾风挥剑」快若惊鸿斩向$n！",
    "$N剑锋破空，带起一阵凌厉风啸，「风卷残云」卷向$n的$l！",
    "$N身形一纵，$w连环刺出，「电光石火」令人目不暇接！",
    "$N按剑运气，剑气如疾风骤起，「狂风穿林」直贯$n要害！",
    "$N剑走轻灵，$w捷如流风，一招「迅雷不及掩耳」突刺$n！",
    "$N脚下轻点，身形如风中飞叶，$w一闪而逝，「风过无痕」划过$n的$l！",
    "$N把$w疾舞如风，幻出漫天剑影，一招「疾风破空」罩向$n周身！"
];

this.parry_actions = [
    "$n回剑如风，$w在身前划出一道风墙，堪堪化解了$P的攻势。",
    "$n剑势凭风相迎，将$P凌厉的剑招化为无形。",
    "$n步伐如飘风，侧身架起$w，「破风式」挡下了这一击。",
    "$n旋身一剑，以风卸力，将$P的攻击荡开。"
];

this.can_enables = ["sword"];

this.learn_condition = {
    max_mp: 5000,
    skill: { sword: 500 }
};

// ========== 属性加成（攻击、命中、百分比攻/命、破防、终伤） ==========
this.query_enable_prop = function (lv) {
    return {
        sword: {
            gj: 10 + Math.floor(lv * 3),                 // 攻击
            mz: 20 + Math.floor(lv * 3),                 // 命中
            gj_per: 3 + Math.floor(lv / 200),            // 百分比攻击
            mz_per: 3 + Math.floor(lv / 200),            // 百分比命中
            diff_fy_per: 5 + Math.floor(lv / 200),       // 破防（忽视对方防御）
            add_sh_per: 5 + Math.floor(lv / 200),        // 终伤（最终伤害）
            desc: "被动：命中敌方时叠加风意，每层提升2%攻击速度（内置冷却为当前攻击速度）；风意可使攻击速度突破0.5秒下限，最高提升至0.25秒"
        }
    };
};

// ========== 风意被动：命中敌方时叠加，内置冷却为当前攻击速度 ==========
this.on_attack_over = function (me, target, par, sh) {
    if (!target || target === me) return;
    // 仅命中的攻击（造成伤害）才叠风意
    if (!(sh > 0)) return;
    var lv = me.query_skill ? me.query_skill("jifengjianfa", 0) : 0;
    if (!(lv > 0)) return;

    // 内置冷却 = 当前攻击速度（gjsd，毫秒）
    var now = Date.now();
    var last = me.query_temp ? me.query_temp("jifeng_fengyi_cd", 0) : 0;
    var cd = me.gjsd || 1000;
    if (now - last < cd) return;
    me.set_temp && me.set_temp("jifeng_fengyi_cd", now);

    // 每层风意提升2%攻击速度
    me.add_status({
        id: "jifeng_fengyi",
        name: "风意",
        desc: "风意附身，攻速提升",
        duration: 10000 + lv * 10,
        override: 1,
        count: 1,
        max_count: 30,
        prop: {
            gjsd_per: 2
        },
        start_msg: "<HIC>$N剑随心动，周身风意流转，出手愈发迅疾！</HIC>",
        finish_msg: "<CYN>$N周身的风意渐渐平息。</CYN>"
    }, me);
};

// ========== 攻击速度突破 0.5 秒 → 0.25 秒 ==========
this.on_recount_gjsd = function (me) {
    var base = 4000 - (me.query_prop ? me.query_prop("gjsd") || 0 : 0);
    var g = base;
    if (g > 500) {
        g = parseInt(g - (g * (me.query_prop ? me.query_prop("gjsd_per") || 0 : 0) / 100));
    }
    // 疾风剑法被动：突破攻速下限 0.5秒(500ms)，最高可至 0.25秒(250ms)
    var min = 250;
    if (g < min) g = min;
    return g;
};

// ========== 绝招 ==========
this.pfm = {
    // 狂风骤雨：200% + lv/10 + 风意*(20% + lv/20)
    kuangfeng: {
        name: "狂风骤雨",
        distime: 18000,
        enable_skill: "sword",
        weapon_type: WEAPON_TYPE.SWORD,
        release_time: 2000,
        mp: 30,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用狂风骤雨？");
            lv = me.query_skill ? me.query_skill("jifengjianfa", lv || 0) : (lv || 0);
            var wind = me.query_status ? me.query_status("jifeng_fengyi") : 0;
            var percent = 200 + lv / 10 + wind * (20 + lv / 20);
            var gj = Math.floor(me.gj * percent / 100);

            me.send_room("<HIC>$N剑光暴涨，卷起漫天狂风骤雨，直向$n倾泻而下！</HIC>", target);
            me.do_attack({
                target: target,
                gj: gj,
                mz: me.mz,
                no_append: true,
                attack_msg: "<HIW>「狂风骤雨」剑势如山洪倾泻，$n避无可避！</HIW>",
                damage_msg: "<HIR>$n被狂风骤雨般的剑招贯穿，鲜血飞溅！</HIR>"
            });
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            lv = me.query_skill ? me.query_skill("jifengjianfa", lv || 0) : (lv || 0);
            var wind = me.query_status ? me.query_status("jifeng_fengyi") : 0;
            var percent = 200 + lv / 10 + wind * (20 + lv / 20);
            return "化作狂风骤雨斩向敌手：造成" + Math.round(percent) + "%攻击力的伤害，所持风意层数越高，伤害越强。";
        }
    },
    // 风起云涌：造成敌方已损失气血 30%+lv/20（上限50%）的伤害，并恢复等量气血
    fengqiyunyong: {
        name: "风起云涌",
        distime: 25000,
        enable_skill: "sword",
        weapon_type: WEAPON_TYPE.SWORD,
        release_time: 2500,
        mp: 30,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用风起云涌？");
            lv = me.query_skill ? me.query_skill("jifengjianfa", lv || 0) : (lv || 0);
            if (!(target.hp > 0)) return;

            var lostHp = (target.max_hp || 0) - target.hp;
            if (lostHp <= 0) {
                return me.send_room("<HIW>$n气血充盈，无可乘之机。</HIW>", target);
            }
            var pct = 30 + lv / 20;
            if (pct > 50) pct = 50;
            var raw = Math.floor(lostHp * pct / 100);
            if (!(raw > 0)) return;

            me.send_room("<HIR>$N剑势翻涌，卷起风起云涌，直取$n已被消磨的气血！</HIR>", target);
            var dmg = target.damage(raw, me, 0);
            if (dmg > 0) {
                var healed = me.add_hp(dmg);
                me.send_combat("<HIG>$N汲取风云之势，恢复了" + healed + "点气血！</HIG>", target);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            lv = me.query_skill ? me.query_skill("jifengjianfa", lv || 0) : (lv || 0);
            var pct = 30 + lv / 20;
            if (pct > 50) pct = 50;
            return "风起云涌：造成" + pct + "%（上限50%）敌方已损失气血的伤害，并恢复等量的气血。";
        }
    }
};