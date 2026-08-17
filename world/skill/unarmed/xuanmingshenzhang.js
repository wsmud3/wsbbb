// 玄冥神掌（玩家版）
this.inherits(SKILL);
this.name = "玄冥神掌";
this.id = "xuanmingshenzhang";
this.grade = 4;
this.desc = "百损道人所创的极寒掌法，掌力阴毒无比，中者寒毒入体，生不如死。";
this.attack_actions = [
    "$N双掌一翻，一股阴寒之气扑面而来，玄冥神掌的阴毒掌力直扑$n面门",
    "$N沉声低喝，双掌间寒气大盛，玄冥真气化作彻骨寒冰袭向$n",
    "$N身形不动，内力疾吐，四周温度骤降，$n仿佛置身冰窟",
    "$N眼中寒光一闪，双掌连环拍出，每一掌都暗含九幽冥气，铺天盖地涌向$n",
    "$N须发皆张，玄冥神掌催至巅峰，双掌之间阴风怒号直扑$n",
    "$N冷笑一声，掌风过处凝水成冰，一掌快似一掌地击向$n的$l",
    "$N深吸一口气，双掌泛起一层青黑之色，玄冥神掌的毒劲如跗骨之蛆般缠向$n",
    "$N身形一转，掌力后发先至，一股阴毒寒气无声无息地袭向$n后心",
];
this.can_enables = ["unarmed", "parry"];
this.query_enable_prop = function (lv) {
    return {
        unarmed: {
            gj: lv * 3,
            mz: lv * 2,
            bj_per: 7,
        },
        parry: {
            zj: lv * 2,
        }
    };
};
this.parry_actions = [
    "$n双掌一错，玄冥神掌的阴寒掌力形成一道无形气墙，将$N的攻势尽数封住",
    "$n掌出如电，玄冥真气透掌而出，$N只觉一股刺骨寒意逼来，攻势为之一滞",
    "$n不退反进，双掌间的阴毒寒气硬生生将$N的兵刃震开",
];
this.pfm = {
    hanbing: {
        name: "玄冥寒冰掌",
        distime: 12000,
        release_time: 2000,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 15,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要用玄冥寒冰掌对付谁？");
            me.send_room("<hib>$N眼中凶光大盛，双掌翻飞如玄冥降世，霎时间冰霜飞舞、寒气四溢，仿佛九幽地狱降临人间！</hib>");
            // 物理攻击（无视招架）
            var sh = me.do_attack({
                target: target,
                attack_msg: "<hib>$N运起玄冥神掌的「寒冰掌」，一股至阴至寒的掌力直贯$n胸腹！</hib>",
                miss_msg: "$n拼尽全力闪避，仍被玄冥寒气的边缘扫中。",
                no_parry: true,
            });
            // 内力伤害：扣除目标当前内力20%
            var mpDrain = Math.floor(target.mp * 0.2);
            if (mpDrain > 0) target.add_mp(-mpDrain);
            // 真气伤害
            var trueDmg = lv * 20 + Math.floor(Math.random() * lv * 12);
            target.damage(trueDmg, me);
            // 寒毒debuff
            target.add_status({
                id: "xuanming_cold",
                duration: 3000 + parseInt(lv * 5),
                downside: true,
                name: "寒毒入体",
                desc: "玄冥寒毒在体内肆虐，攻击命中和速度大幅降低",
                prop: { mz_per: -(15 + parseInt(lv / 100)), gjsd_per: -(15 + parseInt(lv / 100)), gj_per: -(5 + parseInt(lv / 100)) }
            }, me);
	            me.end_attack(target);
	        },
	        query_desc: function (me, lv) {
            return "无视招架，附带内力扣除+真气伤害+寒毒debuff（命中-" + (15 + parseInt(lv / 100)) + "%,攻速-" + (15 + parseInt(lv / 100)) + "%,攻击-" + (5 + parseInt(lv / 100)) + "%，持续" + (3 + parseInt(lv * 5 / 1000)) + "秒），CD12秒，消耗100MP";
        }
    }
};
