    this.inherits(SKILL);
    this.name = "覆雨剑法";
    this.id = "fuyujianfa";
    this.grade = 6;
    this.desc = "浪翻云依据洞庭湖水性而自创的剑法，如行云流水，惊涛骇浪";

    this.attack_actions = [
        "$N手中$w一抖，剑尖化作点点繁星，宛如春雨绵绵洒向$n的$l！",
        "$N剑势如潮，一招「覆雨翻云」带起漫天水雾，笼罩$n周身！",
        "$N运剑如风，剑光织成一张密不透风的雨幕，向$n的$l倾泻而下！",
        "$N剑走轻灵，剑刃破空之声如雨打芭蕉，直取$n的$l！",
        "$N身形飘忽，$w如灵蛇出洞，绵绵不绝地刺向$n的$l！",
        "$N大喝一声，剑势骤然加快，千百道剑影仿佛暴雨倾盆，$n无从闪避！",
        "$N剑意连绵，一招「烟雨迷蒙」使得$n眼前尽是剑光水汽，分不清虚实！"
    ];

    this.parry_actions = [
        "$n手中$w顺势一圈，剑光如雨幕般挡在身前，化解了$P的攻势。",
        "$n剑势绵绵，以柔劲卸开$P的力道，顺势反击。",
        "$n不退反进，$w化作一片雨墙，将$P的攻击尽数挡下。",
        "$n施展「滴水不漏」，剑网严密，$P难以突破。"
    ];

    this.can_enables = ["sword", "parry"];

    this.learn_condition = {
        max_mp: 5000,
        skill: { sword: 500 }
    };

    // 属性加成（按最新公式）
    this.query_enable_prop = function (lv) {
        return {
            sword: {
                gj: Math.floor(10 + lv * 3),                     // 攻击 = 10 + 等级×3
                mz: 20 + Math.floor(lv * 3),                     // 命中 = 20 + 等级×3
                add_sh_per: 5 + Math.floor(lv / 200),            // 最终伤害百分比
                mz_per: 3 + Math.floor(lv / 200),                // 命中百分比
                gjsd_per: 15,                        // 攻击速度百分比固定15
                desc: "你的攻击有几率穿透防御"      // 新增被动描述
            },
            parry: {
                zj: 10 + Math.floor(lv * 2.3),                   // 招架 = 10 + 等级×2.3
                diff_sh_per: 5 + Math.floor(lv / 200),           // 伤害减免百分比
                zj_per: 5 + Math.floor(lv / 200)                 // 招架百分比
            }
        };
    };

    // ========== 概率穿透（完全使用 ct.txt 中的代码） ==========
    function fy_ignore_rate(lv) {
        var rate = Math.floor(lv / 100);
        if (rate > 100) rate = 100;
        return rate;
    }

    this.on_before_attack = function (me, target, par) {
        if (!par || par.is_throwing) return;
        let lv = me.query_skill ? me.query_skill("fuyujianfa", 0) : 0;
        let rate = fy_ignore_rate(lv);
        if (me.query_status && me.query_status("fuyujianfa_fuyu")) rate = Math.min(100, rate * 2);
        if (Math.random() * 100 < rate) {
            par.ignore_fixed_defense = true;
            par.diff_fy = Math.max(par.diff_fy || 0, 100);
            me.send_combat("<HIR>$N剑意洞穿虚空，$n的防御如同虚设！</HIR>", target);
        }
    };

    // ========== 辅助函数：强制启动自动攻击（解决进入战斗不平A） ==========
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

    // ========== 绝招 ==========
    this.pfm = {
        // 剑雨：多段攻击，增加穿透几率（描述中体现）
        rain: {
            name: "剑雨",
            distime: 21000,
            enable_skill: "sword",
            weapon_type: WEAPON_TYPE.SWORD,
            release_time: 2500,
            mp: 0,
            use: function (me, target, lv) {
                if (!target) return me.notify("你要对谁使用绝招？");
                me.send_room("<HIB>$N深吸一口气，$W骤然大亮，无数剑影如暴雨般向$n倾泻！</HIB>", target);

                // 初始3段，每500级+1段，上限10段
                var count = 3 + Math.floor(lv / 500);
                if (count > 10) count = 10;

                for (var i = 0; i < count; i++) {
                    me.do_attack({
                        target: target,
                        no_append: true,
                        attack_msg: "<HIR>剑雨落下，造成伤害！</HIR>"
                    });
                }
                start_auto_attack(me);
            },
            query_desc: function (me, lv) {
                var count = 3 + Math.floor(lv / 500);
                if (count > 10) count = 10;
                return "化剑为雨，连续攻击" + count + "次，每次攻击有几率穿透防御。";
            }
        },

        // 剑罡：高倍率，必定穿透
        gang: {
            name: "剑罡",
            distime: 13000,
            enable_skill: "sword",
            weapon_type: WEAPON_TYPE.SWORD,
            release_time: 2500,
            mp: 0,
            use: function (me, target, lv) {
                if (!target) return me.notify("你要对谁使用绝招？");
                me.send_room("<HIR>$N浑身真气暴涨，$W上凝聚出一道凌厉无匹的剑罡，破空之声震耳欲聋！</HIR>", target);

                // 攻击力倍数：初始2倍，每1000级+1倍
                var dmgBonus = 2 + Math.floor(lv / 1000);
                var mzBonus = 2 + Math.floor(lv / 1000);

                // 强制触发穿透
                me._temp_force_through = true;

                me.do_attack({
                    target: target,
                    gj: me.gj * dmgBonus,
                    mz: me.mz * mzBonus,
                    attack_msg: "<HIY>$N手中$w化作一道惊虹，剑罡直贯$n胸口！</HIY>",
                    damage_msg: "<HIR>$n被剑罡击中，鲜血飞溅！</HIR>"
                });

                delete me._temp_force_through;
                start_auto_attack(me);
            },
            query_desc: function (me, lv) {
                var dmgBonus = 2 + Math.floor(lv / 1000);
                return "极致的剑法，大幅度增加命中和伤害（" + dmgBonus + "倍），必定触发穿透防御。";
            }
        }
    };

    // 为剑罡覆盖 on_before_attack，实现必定穿透
    (function() {
        var original = this.on_before_attack;
        this.on_before_attack = function(me, target, par) {
            if (me._temp_force_through) {
                par.ignore_fixed_defense = true;
                par.diff_fy = Math.max(par.diff_fy || 0, 100);
                me.send_combat("<HIR>$N剑罡所至，$n的防御完全无效！</HIR>", target);
                return;
            }
            if (original) original.call(this, me, target, par);
        };
    }).call(this);
