this.inherits(SKILL);
this.name = "玉女心经";
this.id = "yunvxinjing";
this.grade = 3;
this.desc = "古墓派至高内功心法，源自林朝英所创，讲究以静制动、以柔克刚。需清心寡欲方可修至大成，内力绵长不绝，更可运功疗伤，是古墓派武学的根基所在。";
this.can_enables = ["force"];
this.force_rad = 0.7;
this.learn_condition = {
    skill: {
        force: 300
    }
};
this.query_enable_prop = function (lv) {
    return {
        force: {
            gj: lv * 2,
            mz: lv * 1.5,
            limit_mp: lv * 1500,
            max_hp: lv * 15,
            fy: parseInt(lv * 1.8),
            diff_sh_per: 8,
            desc: "唯一：将你内力的70%转化为气血",
        }
    };
};
this.pfm = {
    yunvxinjing_heal: {
        name: "玉女疗伤",
        distime: 30000,
        release_time: 3000,
        enable_skill: "force",
        mp: 25,
        allow_busy: true,
        use: function (me, target, lv) {
            me.send_room("<hic>$N闭目凝神，玉女心经缓缓运转，周身笼罩在一层清冷如月的光华之中，伤势以肉眼可见的速度愈合！</hic>");
            var heal = Math.floor(me.max_hp * 0.3 + lv * 10);
            me.do_recover(heal);
            me.add_status({
                id: "force",
                duration: 5000 + parseInt(lv * 10),
                name: "玉女心法",
                desc: "玉女心经护体，防御和闪避提升",
                prop: { fy_per: 10 + parseInt(lv / 100), ds_per: 5 + parseInt(lv / 100) }
            });
        },
        query_desc: function (me, lv) {
            return "运转玉女心经疗伤，恢复30%气血附加" + (lv * 10) + "点，并提升防御和闪避，持续" + (5 + parseInt(lv * 10 / 1000)) + "秒，CD30秒";
        }
    }
};
