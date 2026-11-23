this.inherits(SKILL);
this.name = "漫天花雨";
this.id = "mantianhuayu2";
this.source_skill = "mantianhuayu";
this.grade = 5;
this.family = FAMILIES.SHASHOU;
this.attack_actions = [
    "$N双手一晃，一招「千变万化」，手中的$w幻出万道金光，如一条金龙般飞向$n的$l",
    "$N右手一抖，一道金光冒出，正是一招「奇诡莫测」，抢先飞向$n的$l",
    "$N突然旋身，$w在旋转中化作「银轮割风」，边缘泛着锐光，既封退路又取$l",
    "$N掌心一翻，$w悄然滑出，一招「无声夺命」，不见破空之声却已抵近$n$l",
    "$N手腕轻抖，$w骤然化作「飞星追影」，一道冷光划破虚空，直取$n$l要害",
    "$N指尖一弹，$w化作「流光穿云」，破风之声忽强忽弱，轨迹飘忽难测地缠向$n$l"
];
this.desc = "杀手楼的暗器武功，使用的时候如漫天星光而得名";
this.can_enables = ["throwing", "sword"];
this.learn_condition = {
    max_mp: 25,
    skill: { throwing: 300 }
};
// 1000 级：暴击 +8%（不需装备）
//   暗器：攻击 +1504 命中 +1504 命中 +9% 最终伤害 +9% 忽视对方防御 +9%
//   剑法：攻击 +1504 命中 +1504 暴击 +10% 忽视忙乱 +9% 暴击伤害 +9%
// 百分比项（命中%、最终伤害、忽视防御、忽视忙乱、暴击伤害）每 300 级 +1%
this.query_prop = function (lv) {
    return { bj_per: 5 + parseInt(lv / 300) };
};
function pct(lv) { return 6 + parseInt(lv / 300); }
this.query_enable_prop = function (lv) {
    return {
        throwing: {
            gj: parseInt(lv * 1.5) + 4,
            mz: parseInt(lv * 1.5) + 4,
            mz_per: pct(lv),
            add_sh_per: pct(lv),
            diff_fy_per: pct(lv),
        },
        sword: {
            gj: parseInt(lv * 1.5) + 4,
            mz: parseInt(lv * 1.5) + 4,
            bj_per: 10,
            diff_busy_per: pct(lv),
            add_bjsh_per: pct(lv),
        }
    };
};
// 定影：5 秒 + 每 300 级 1 秒，上限 15 秒（1000 级 8 秒）
function ding_time(lv) { return Math.min(15, 5 + parseInt(lv / 300)) * 1000; }
this.pfm = {
    luo: {
        name: "落花",
        distime: 10000,
        mp: 20,
        release_time: 4000,
        use: function (me, target, lv, type) {
            var is_throwing = type !== "sword";
            me.send_room(is_throwing ? "<hiy>$N手中$T一抖，幻出万点星光，如朵朵落花般撒向$n</hiy>" : "<hiy>$N手中$W一抖，幻出万点星光，如朵朵落花般撒向$n</hiy>", target);
            // 每 5% 暴击多一次攻击，并且每次攻击的命中再加 5%，最多 10 次
            var count = Math.min(10, 1 + parseInt(me.bj / 5));
            var mz = parseInt(me.mz * (100 + (count - 1) * 5) / 100);
            for (var i = 0; i < count; i++) {
                if (target.hp <= 0 || me.hp <= 0) break;
                me.do_attack({ target: target, attack_msg: "", gj: me.gj, mz: mz, no_append: true, is_throwing: is_throwing });
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "漫天暗器攻击敌人，每5%暴击增加一次攻击和5%的命中，最多10次";
        }
    },
    wu: {
        name: "定影",
        distime: 30000,
        enable_skill: "throwing",
        mp: 20,
        release_time: 500,
        use: function (me, target, lv) {
            me.do_attack({
                target: target, gj: me.gj, mz: me.mz, is_throwing: true,
                attack_msg: "<hiy>$N手中青光冒出，一瞬间$T已飞向$n化作点点星光笼罩$p周身大穴！</hiy>"
            });
            // 与原技能一致：定身必中，不看这一击是否命中
            if (target.hp > 0) {
                target.add_status({
                    id: "rash",
                    name: "定影",
                    duration: ding_time(lv),
                    is_rash: true,
                    downside: true
                }, me);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "使用暗器攻击敌人，如果命中则使敌人定身" + (ding_time(lv) / 1000) + "秒";
        }
    }
};
