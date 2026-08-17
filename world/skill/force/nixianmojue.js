this.inherits(SKILL);
this.name = "逆仙魔诀";
this.id = "nixianmojue";
this.grade = 6;
this.force_rad = 4;
this.desc = "上古奇功，仙魔同源，可在仙魔二态间自由转换。魔主杀伐，攻无不克；仙主固守，万法不侵。修炼至大成者，可逆天改命，仙魔由心。";
this.can_enables = ["force"];
this.learn_condition = {
    skill: { force: 1000 }
};

//========== 全局被动：学了即生效（不装备也生效），引擎钩子为 query_prop ==========
this.query_prop = function (lv) {
    return {
        diff_fy_per: 10 + parseInt(lv / 200),
        diff_sh_per: 10 + parseInt(lv / 200)
    };
};

//========== 装备激活属性 ==========
this.query_enable_prop = function (lv) {
    return {
        force: {
            diff_fy_per: 10 + parseInt(lv / 200),
            diff_sh_per: 10 + parseInt(lv / 200),
            gj_per: 15 + parseInt(lv / 150),
            mz_per: 15 + parseInt(lv / 150),
            bj_per: 5 + parseInt(lv / 300),
            add_bjsh_per: 20 + parseInt(lv / 150),
            limit_mp: lv * 1200,
            desc: "唯一：将你内力的400%转化为气血",
        },
    };
};

//========== 房间内敌人查询（引擎无现成API，遍历房间items + 自身enemy列表判定） ==========
function query_room_enemies(me) {
    var room = me.environment;
    if (!room || !room.items || !me.enemy) return [];
    var enemies = [];
    for (var i = 0; i < room.items.length; i++) {
        var item = room.items[i];
        if (item === me || !item.fight_type || item.hp <= 0) continue;
        if (me.enemy.contain(item)) enemies.push(item);
    }
    return enemies;
}

//========== 仙魔buff公共方法 ==========
this.apply_xianmo = function (me, state) {
    var lv = me.query_skill("nixianmojue", 0);
    var baseVal = 100 + parseInt(lv / 200);
    var prop, name, desc, startMsg;
    if (state === "xian") {
        prop = {
            hp_per: baseVal,
            diff_sh_per: baseVal,
            fy_per: baseVal,
            zj_per: baseVal
        };
        name = "仙";
        desc = "气血上限+" + baseVal + "%，伤害减免+" + baseVal + "%，防御+" + baseVal + "%，招架+" + baseVal + "%";
        startMsg = "<hig>$N周身仙辉笼罩，进入仙形态——固守万法不伤！</hig>";
    } else {
        prop = {
            gj_per: baseVal,
            mz_per: baseVal,
            diff_fy_per: baseVal,
            gjsd_per: baseVal
        };
        name = "魔";
        desc = "攻击+" + baseVal + "%，命中+" + baseVal + "%，忽视防御+" + baseVal + "%，攻击速度+" + baseVal + "%";
        startMsg = "<hir>$N周身魔气翻涌，进入魔形态——杀伐无坚不摧！</hir>";
    }

    me.add_status({
        id: "xianmo",
        name: name,
        desc: desc,
        duration: 864000000,
        downside: false,
        override: 2,          //同id替换刷新（原99走的是else分支，行为等价，规范化为2）
        no_clear: true,       //不被清除负面技能误伤
        no_diff: true,        //免疫控制与负面抵抗修正
        only_combat: false,   //战斗结束保留
        prop: prop,
        start_msg: startMsg,
        finish_msg: "$N的仙魔状态消散了。"
    });
    me.set_temp("xianmo_state", state);
};

this.ensure_xianmo = function (me) {
    //以实际buff为准，temp残留不影响（buff会被死亡clear_status清空，temp不会）
    if (me.query_status("xianmo")) return;
    var state = me.query_temp("xianmo_state") || "mo";
    this.apply_xianmo(me, state);
};

//========== 装备/卸下钩子（注意：技能卸下钩子是 on_disenable，不是 on_remove） ==========
this.on_enable = function (me) {
    this.ensure_xianmo(me);
};

this.on_disenable = function (me) {
    me.remove_status("xianmo", true);
    me.remove_status("xianmo_rizhuo", true);
    me.remove_temp("xianmo_state");
};

//========== 战斗兜底钩子 ==========
this.on_beginfight = function (me) {
    this.ensure_xianmo(me);
};

this.on_before_attack = function (me) {
    this.ensure_xianmo(me);
};

this.on_damage = function (me, from, sh) {
    this.ensure_xianmo(me);
    return sh;
};

//========== 绝招 ==========
this.pfm = {
    nixianmo: {
        name: "逆仙魔",
        distime: 25000,
        release_time: 3000,
        enable_skill: "force",
        use_type: 2,
        allow_busy: true,
        allow_faint: false,
        mp: 25,
        use: function (me, target, lv) {
            var skill = me.force_skill;
            if (!me.query_status("xianmo")) {
                //无buff时开启（默认魔形态），以buff为准而非temp
                skill.apply_xianmo(me, "mo");
                me.send_room("<hiy>$N初次催动逆仙魔诀，仙魔一体形态开启！</hiy>");
                return;
            }
            var cur = me.query_temp("xianmo_state");
            var next = cur === "mo" ? "xian" : "mo";
            me.set_temp("xianmo_state", next);
            if (next === "xian") {
                me.send_room("<hio>$N运转逆仙魔诀，魔气散尽，仙光垂落——魔消仙现！</hio>");
            } else {
                me.send_room("<hir>$N运转逆仙魔诀，仙光隐去，黑魔滔天——仙隐魔生！</hir>");
            }
            skill.apply_xianmo(me, next);
        },
        query_desc: function (me, lv) {
            var baseVal = 100 + parseInt(lv / 200);
            return "切换仙魔一体形态（buff不可清除）：魔形态提升" + baseVal + "%攻击、命中、忽视防御、攻击速度；仙形态提升" + baseVal + "%气血上限、伤害减免、防御、招架。基础成长100+等级/200取整。";
        }
    },

    zhenya: {
        name: "镇压",
        distime: 45000,
        release_time: 3500,
        enable_skill: "force",
        use_type: 2,
        mp: 22,
        use: function (me, target, lv) {
            var enemies = query_room_enemies(me);
            if (!enemies.length) return me.notify("附近没有敌人，无法施展镇压！");

            var sealSec = 5 + parseInt(lv / 1000);
            if (sealSec > 10) sealSec = 10;
            var sealMs = sealSec * 1000;

            me.send_room("<hio>$N催动逆仙魔诀，仙魔之力轰然镇压全场，禁锢众生招式！</hio>");

            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];

                //重复镇压时按剩余时间延长封印，避免刷新重置
                var remain = 0;
                var ext = enemy.temp && enemy.temp["seal_all_pfm"];
                if (ext && ext.e && Date.now() <= ext.e) {
                    remain = ext.e - Date.now();
                }
                enemy.set_temp("seal_all_pfm", 1, remain + sealMs);

                enemy.add_status({
                    id: "xianmo_zhenya",
                    name: "仙魔镇压",
                    desc: "被仙魔之力封印，无法释放任何绝招",
                    duration: remain + sealMs,
                    downside: true,
                    override: 3,
                    prop: { no_pfm: 999 },
                    start_msg: "<hir>$N被仙魔镇压之力禁锢，所有绝招封禁无法施展！</hir>",
                    finish_msg: "$N身上的镇压封印解除，招式恢复可用。",
                }, me);
            }
        },
        query_desc: function (me, lv) {
            var sealSec = 5 + parseInt(lv / 1000);
            if (sealSec > 10) sealSec = 10;
            return "仙魔之力镇压全场敌人，封印敌方全部绝招，持续" + sealSec + "秒，最高上限10秒。";
        }
    },

    rizhuo: {
        name: "日灼",
        distime: 60000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        mp: 30,
        use: function (me, target, lv) {
            var enemies = query_room_enemies(me);
            if (!enemies.length) return me.notify("附近没有敌人，无法施展日灼！");

            var durSec = 10 + parseInt(lv / 500);
            if (durSec > 20) durSec = 20;
            var atkCache = me.gj;                              //释放时攻击力
            var trueDmgCache = parseInt(me.max_mp * 0.01);     //释放时1%最大内力真伤
            var totalTicks = durSec * 2;                       //每0.5秒一跳
            var room = me.environment;                         //锁定释放房间

            me.send_room("<hio>$N引仙魔真火覆于周身，日灼仙魔火燃起！</hio>");

            //释放瞬间第一段灼烧
            for (var i = 0; i < enemies.length; i++) {
                var tar = enemies[i];
                if (tar.hp <= 0) continue;
                var total = tar.damage(atkCache, me) + (trueDmgCache > 0 ? tar.damage3(trueDmgCache, me) : 0);
                me.send_room("<hiy>日灼仙魔火骤然爆发，席卷$n，造成" + total + "点灼烧伤害！</hiy>", tar);
            }

            //灼烧走buff的on_interval机制：自动调度、自动清理、重复释放自动替换，无定时器泄漏
            me.add_status({
                id: "xianmo_rizhuo",
                name: "日灼",
                desc: "持续" + durSec + "秒，每0.5秒灼烧周围敌人，必中附加自身1%最大内力真实伤害",
                duration: 500,
                duration_count: totalTicks,
                downside: false,
                override: 2,
                no_diff: true,
                prop: { gj_per: 5 },
                on_interval: function (me, count) {
                    if (me.hp <= 0) return false;              //死亡即灭
                    if (me.environment !== room) return false; //离开释放房间即灭
                    var es = query_room_enemies(me);
                    if (!es.length) return false;              //无敌人即灭
                    for (var j = 0; j < es.length; j++) {
                        var t = es[j];
                        if (t.hp <= 0) continue;
                        var tot = t.damage(atkCache, me) + (trueDmgCache > 0 ? t.damage3(trueDmgCache, me) : 0);
                        me.send_room("<hiy>日灼仙魔火灼烧$n，造成" + tot + "点伤害！</hiy>", t);
                    }
                },
                start_msg: "<hig>仙魔日火环绕$N，灼烧之力弥漫开来！</hig>",
                finish_msg: "$N身上的日灼仙魔火熄灭了。",
            });
        },
        query_desc: function (me, lv) {
            var durSec = 10 + parseInt(lv / 500);
            if (durSec > 20) durSec = 20;
            return "燃起日灼仙魔火，持续" + durSec + "秒（上限20秒），固定每0.5秒无差别灼烧周围全部敌人，攻击强制必中，伤害为自身释放攻击力附加自身1%最大内力固定真实伤害。";
        }
    }
};