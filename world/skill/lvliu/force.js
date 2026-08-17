this.inherits(SKILL);
this.name = "绿柳心法";
this.id = "lvliu_force";
this.grade = 3;
this.no_auto = true;
this.desc = "绿柳山庄的内功心法，真气阴寒绵长。";
this.can_enables = ["force"];
this.query_enable_prop = function (lv) {
    return {
        force: { gj: lv * 2, mz: lv * 1, limit_mp: lv * 1000 }
    };
};
this.pfm = {
    hanjin: {
        name: "寒劲",
        distime: 15000,
        release_time: 3000,
        enable_skill: "force",
        mp: 0,
        use_type: 2,
        allow_busy: true,
        use: function (me, target, lv) {
            me.add_status({
                id: "force",
                duration: 2000 + parseInt(lv * 10),
                name: "寒劲贯体",
                desc: "内力化为寒劲，攻击和命中提升",
                prop: { gj_per: 20 + parseInt(lv / 100), mz_per: 10 + parseInt(lv / 100) }
            });
            me.send_room("<hib>$N运转绿柳心法，一股阴寒之气弥漫四周！</hib>");
        },
        query_desc: function (me, lv) { return "提升攻击" + (20 + parseInt(lv / 100)) + "%和命中" + (10 + parseInt(lv / 100)) + "%，持续" + (2 + parseInt(lv * 10 / 1000)) + "秒"; }
    },
    hanbingzhenqi: {
        name: "寒冰锥",
        distime: 10000,
        release_time: 2500,
        enable_skill: "force",
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<hib>$N运起绿柳心法，阴寒真气于掌心凝聚成一道冰锥，带着刺骨寒意射向$n！</hib>", target);
            // 物理攻击
            me.do_attack({
                target: target,
                attack_msg: "",
                miss_msg: "$n急闪避开了冰锥。",
            });
            // 真气伤害（无视防御）
            var trueDmg = lv * 25 + Math.floor(Math.random() * lv * 15);
            target.damage(trueDmg, me);
            // 寒气减速debuff
            target.add_status({
                id: "lvliu_force_slow",
                duration: 8000,
                downside: true,
                name: "寒气侵体",
                desc: "寒气侵入经脉，攻击速度和闪避大幅降低",
                prop: { gjsd_per: -25, ds_per: -20 }
            }, me);
            me.end_attack(target);
        },
        query_desc: function () { return "凝聚冰锥攻击敌人，附加真气伤害和减速debuff（攻速-25%,闪避-20%，持续8秒）"; }
    }
};
