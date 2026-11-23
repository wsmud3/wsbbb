this.inherits(SKILL);
this.name = "杀生决";
this.id = "shashengjue2";
this.source_skill = "shashengjue";
this.grade = 4;
this.force_rad = 0.75;
this.family = FAMILIES.SHASHOU;
this.desc = "杀手楼的高级内功";
this.can_enables = ["force"];
this.learn_condition = {
    skill: { force: 300 }
};
// 1000 级：攻击 +2002 命中 +2001 暴击伤害 +4%（每 300 级 +1%）内力上限 +160000，唯一：内力的 75% 转化为气血
this.query_enable_prop = function (lv) {
    return {
        force: {
            gj: lv * 2 + 2,
            mz: lv * 2 + 1,
            add_bjsh_per: 1 + parseInt(lv / 300),
            limit_mp: lv * 160,
            desc: "唯一：将你内力的75%转化为气血"
        }
    };
};
// 斩杀：持续 1 秒 + 每 200 级 1 秒（不设上限）；攻击、暴击几率每 100 级 +1%（1000 级 6 秒、30%、33%）
function power_time(lv) { return (1 + parseInt(lv / 200)) * 1000; }
function power_gj(lv) { return 20 + parseInt(lv / 100); }
function power_bj(lv) { return 23 + parseInt(lv / 100); }
this.pfm = {
    power: {
        name: "斩杀",
        distime: 30000,
        enable_skill: "force",
        mp: 20,
        release_time: 0,
        use: function (me, target, lv) {
            me.send_room("<hir>$N默运杀生决，全身黑气笼罩，仅剩双眼一片血红，有如杀神降世！\n</hir>", target);
            me.add_status({
                id: "force",
                name: "杀神",
                desc: "攻击增加" + power_gj(lv) + "%，暴击几率增加" + power_bj(lv) + "%",
                duration: power_time(lv),
                prop: { gj_per: power_gj(lv), bj_per: power_bj(lv) }
            });
        },
        query_desc: function (me, lv) {
            return "全力战斗，" + (power_time(lv) / 1000) + "秒内增加自己" + power_gj(lv) + "%攻击力，" + power_bj(lv) + "%暴击几率";
        }
    },
    tuoli: {
        name: "隐杀",
        distime: 45000,
        enable_skill: "force",
        mp: 0,
        release_time: 0,
        no_auto: true,
        allow_busy: true,
        use: function (me, target, lv) {


            if (me.is_rash) return me.notify('你现在无法使用轻功身法。');
            if (!me.environment.exits)
            return me.notify('这里无法逃脱。');
            var list = Object.keys(me.environment.exits);
            // for (var dir in me.environment.exits) {
            //     list.push(dir);
            // }
            if (!list.length) return me.notify('这里无法逃脱。');
            let func = YS_ROOMS[me.environment.path];

            if (func && func(me, list) === false) return;

            me.send_room("\n<blk>$N的身形一闪，渐渐模糊不见了。<blk>\n");
            me.end_fight();
            me.do_command("go", list.random());
            // if (!me.is_in("yz/leitai/leitai") && !me.is_in("yz/leitai/biwu")) {
            //     me.end_fight();
            // }

        },
        query_desc: function (me, lv) {
            var gj = 10 + parseInt(lv / 300);
            var nl = 3000 + lv * 4;
            if (nl > 15000) nl = 15000;
            return"脱离战斗，迅速隐入其他房间";
        }
    }
};

const YS_ROOMS = {
    "yz/leitai/leitai": function (me) {
        me.send_room("\n<blk>$N的身形一闪，渐渐模糊不见了。<blk>\n");
    },
    'wudao/ta': function (me, list) {
        let lv = me.query_temp('wd_level', 0);
        if (lv >= 89) {
            list.length = 1;
            list[0] = 'out';
        }
    }
};
