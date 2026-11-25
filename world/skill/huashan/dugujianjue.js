this.inherits(SKILL);
this.name = "独孤剑诀";
this.id = "dugujianjue";
this.grade = 6;
this.family = FAMILIES.HUASHAN;
// 上古传承：不列入门派武功，江湖界面单列（引擎把 is_ultimate 的技能放进 fam.skills4）
this.is_ultimate = true;
this.desc = "上古剑门镇派之术，无剑无我，手持天地";

this.attack_actions = [
    "$N手中$w随意一挥，剑势却如天河倒泻，直落$n的$l",
    "$N身形不动，$w自鞘中一跃而出，剑光所至，$n周身要害尽在其中",
    "$N剑尖轻颤，无招无式，却封尽$n所有退路",
    "$N长啸一声，$w化作一道青虹，人剑合一，贯向$n",
    "$N信手一剑，平平无奇，$n却觉天地间再无可避之处",
    "$N剑意凌空而起，$w未至，剑气已压得$n喘不过气来"
];
this.parry_actions = [
    "$n剑尖斜指，看似随意，却正点在$P攻势最弱之处",
    "$n手中$w轻轻一引，$P的力道便如泥牛入海",
    "$n不闪不避，剑意自生，$P的攻击竟在半途溃散"
];

this.can_enables = ["sword"];

// ===== 成长曲线（1000 级面板：攻击 3000、攻击间隔 -0.4 秒、终伤 10%、命中 10%、暴击 4%）=====
//   攻击        3 × lv
//   攻击间隔    200 + lv/5 毫秒，最多 1 秒（4000 级）
//   终伤 / 命中 5 + lv/200 %，最多 40%（7000 级）
//   暴击        2 + lv/500 %，最多 10%（4000 级）
var bonus_per = function (lv) { return Math.min(40, 5 + Math.floor(lv / 200)); };
this.query_enable_prop = function (lv) {
    return {
        sword: {
            gj: lv * 3,
            gjsd: Math.min(1000, 200 + Math.floor(lv / 5)),
            add_sh_per: bonus_per(lv),
            mz_per: bonus_per(lv),
            bj_per: Math.min(10, 2 + Math.floor(lv / 500)),
            desc: "无剑：你的剑无法被卸下\n无我：战斗中进入忘我境界，持续提高你的战斗力",
        }
    };
};

// ===== 面板被动 =====
// 无剑：装备为剑法且手中持剑时，兵刃不会被卸下（见 CHARACTER.prototype.weapon_locked）
// 无我：剑法命中后进入忘我境界，每层提高攻击与命中（1 + lv/1000 %，每层最多 5%），最多 10 层，战斗结束消散
this.on_attack_over = function (me, target, par, sh) {
    if (!(sh > 0) || !target || par.no_append) return;
    var lv = me.query_skill(this.id, 0);
    if (!lv) return;
    var per = Math.min(5, 1 + Math.floor(lv / 1000));
    me.add_status({
        id: "dugujianjue_wangwo", name: "无我", desc: "忘我之境，每层攻击、命中提高" + per + "%",
        duration: 600000, override: 1, max_count: 10, only_combat: true, no_clear: true,
        prop: { gj_per: per, mz_per: per }
    });
};

// ===== 绝招（效果写在各自的状态上，融入自创武学同样生效）=====
// 剑意：持续 2 + lv×0.005 秒（最多 12 秒）；终伤 / 命中 / 招架 50 + lv/50 %（最多 100%）；出招间隔压到极限（引擎下限）；敌人无法招架
var jianyi_time = function (lv) { return Math.min(12000, 2000 + lv * 5); };
var jianyi_per = function (lv) { return Math.min(100, 50 + Math.floor(lv / 50)); };
// 剑来：飞剑持续 4 + lv×0.005 秒（最多 15 秒）；每次攻击附加攻击力 40 + lv/50 %（最多 100%）的真实伤害
var jianlai_time = function (lv) { return Math.min(15000, 4000 + lv * 5); };
var jianlai_per = function (lv) { return Math.min(100, 40 + Math.floor(lv / 50)); };

this.pfm = {
    jianyi: {
        name: "剑意",
        distime: 30000,
        enable_skill: "sword",
        release_time: 0,
        mp: 1890,
        use: function (me, target, lv) {
            var per = jianyi_per(lv);
            me.send_room("<hiw>$N闭目一瞬，再睁眼时，周身已再无半分剑招痕迹——剑意已成！</hiw>", target);
            me.add_status({
                id: "dugujianjue_jianyi", name: "剑意", desc: "招式无迹可寻，出招快到极限，最终伤害、命中、招架提高" + per + "%",
                duration: jianyi_time(lv), override: 2,
                prop: { add_sh_per: per, mz_per: per, zj_per: per, gjsd: 4000 },
                // 招式无迹可寻：敌人无法招架
                on_before_attack: function (owner, t, par) { par.no_parry = true; },
                finish_msg: "$N的剑意渐渐收敛。"
            });
        },
        query_desc: function (me, lv) {
            return "独孤剑诀之剑意，" + (jianyi_time(lv) / 1000) + "秒内你的招式无迹可寻使敌人难以破解，出招速度加快到极限，增加" + jianyi_per(lv) + "%最终伤害，命中，招架几率。";
        }
    },
    jianlai: {
        name: "剑来",
        distime: 60000,
        enable_skill: "sword",
        release_time: 2320,
        mp: 2150,
        use: function (me, target, lv) {
            var per = jianlai_per(lv);
            me.send_room("<hiw>$N并指向天，一声清喝：「剑来！」四下剑鸣大作，无数飞剑破空而至！</hiw>", target);
            var enemies = (me.enemy || []).slice();
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                if (!e || e.hp <= 0 || e.environment !== me.environment) continue;
                me.do_attack({ target: e, gj: me.gj, mz: me.mz, no_append: true,
                    attack_msg: "<hiw>漫天飞剑如雨落下，罩向$n周身！</hiw>" });
                me.end_attack(e);
            }
            me.add_status({
                id: "dugujianjue_jianlai", name: "剑来", desc: "飞剑环绕，每次攻击附加攻击力" + per + "%的真实伤害",
                duration: jianlai_time(lv), override: 2,
                on_attack_over: function (owner, t, par, sh) {
                    // 可以被闪避，招架挡不住
                    if (!t || t.hp <= 0 || t === owner || (par && par.is_dodge)) return;
                    var dmg = Math.floor(owner.gj * per / 100);
                    if (dmg > 0) {
                        var dealt = t.damage2(dmg, owner);
                        if (dealt > 0) owner.send_combat("<hiw>飞剑随剑势而至，对$n造成" + dealt + "点伤害！</hiw>\n", t);
                    }
                },
                finish_msg: "$N身侧的飞剑纷纷归于虚空。"
            });
        },
        query_desc: function (me, lv) {
            return "召唤飞剑攻击附近敌人，飞剑持续" + (jianlai_time(lv) / 1000) + "秒，你的攻击会对敌人造成" + jianlai_per(lv) + "%攻击力的真实伤害（可被闪避，无法招架）";
        }
    }
};
