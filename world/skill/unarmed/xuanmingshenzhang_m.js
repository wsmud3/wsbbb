// 玄冥神掌（怪物特供版）- 玄冥二老专用
this.inherits(SKILL);
this.name = "玄冥神掌";
this.id = "xuanmingshenzhang_m";
this.grade = 4;
this.desc = "百损道人所创的极寒掌法，玄冥二老将其修炼至化境，掌力阴毒无比。";
this.attack_actions = [
    "$N阴恻恻一笑，双掌自袖中翻出，掌缘浮现一层青黑之气，玄冥神掌的阴毒掌力直扑$n面门",
    "$N沉声喝道：「尝尝老夫的玄冥神掌！」话音未落，一股阴寒掌力已如跗骨之蛆袭向$n",
    "$N身形不动，内力疾吐，玄冥真气化作万载寒冰，$n四周的空气竟凝出白霜",
    "$N眼中寒光一闪，双掌连环拍出，每一掌都暗含九幽冥气，铺天盖地涌向$n",
    "$N冷笑一声：「死在老夫掌下，也算你的造化！」掌力激荡，室内温度骤降如坠冰窟",
    "$N须发皆张，玄冥神掌催至巅峰，双掌之间仿佛有厉鬼哀嚎，阴风怒号直扑$n",
];
this.parry_actions = [
    "$n双掌翻出，玄冥神掌阴毒劲力在身前凝成一道冰墙，$N的攻击被极寒之气冻结于半途",
    "$n冷笑一声，玄冥神掌「九幽护体」守势运转，青黑掌气翻涌将$N的攻势尽数吞噬",
    "$n身形不动如山，一式「玄冥不破」展开，阴寒真气层层叠叠将$N的攻击消弭于无形",
    "$n不退反进，玄冥神掌「寒冰铁壁」守招施出，$N的拳掌撞上极寒掌劲被冻得发麻",
    "$n须发间白气蒸腾，玄冥神掌「万载玄冰」守势全面展开，$N只觉攻击如撞冰山寸步难进"
];
this.can_enables = ["unarmed"];
this.query_enable_prop = function (lv) {
    return {
        unarmed: {
            gj: lv * 3,
            mz: lv * 2,
            bj_per: 8,
        }
    };
};

this.pfm = {
    hanbing: {
        name: "玄冥寒冰掌",
        distime: 4000,
        release_time: 0,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<hib>$N眼中凶光大盛，双掌翻飞如玄冥降世，霎时间冰霜飞舞、寒气四溢，仿佛九幽地狱降临人间！</hib>");
            var room = me.environment;
            if (!room) return;
            // 群攻：对房间内所有玩家造成伤害
            for (var i = 0; i < room.items.length; i++) {
                var p = room.items[i];
                if (!p.is_player || p.hp <= 0) continue;
                // 物理伤害（无视招架）
                var sh = me.do_attack({
                    target: p,
                    attack_msg: "",
                    miss_msg: "",
                    no_parry: true,
                    no_dodge: true,
                });
                // 内力伤害：扣除目标当前内力30%
                var mpDrain = Math.floor(p.mp * 0.3);
                if (mpDrain > 0) p.add_mp(-mpDrain);
                // 真气伤害
                var trueDmg = lv * 30 + Math.floor(Math.random() * lv * 15);
                p.damage(trueDmg, me);
                // 寒毒debuff
                p.add_status({
                    id: "xuanming_cold",
                    duration: 5000 + parseInt(lv * 5),
                    downside: true,
                    name: "寒毒入体",
                    desc: "玄冥寒毒在体内肆虐，攻击命中和速度大幅降低",
                    prop: { mz_per: -(20 + parseInt(lv / 100)), gjsd_per: -(20 + parseInt(lv / 100)), gj_per: -(10 + parseInt(lv / 100)) }
                }, me);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            return "群攻，无视招架必中，附带内力扣除+真气伤害+寒毒debuff";
        }
    }
};
