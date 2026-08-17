this.inherits(SKILL);
this.name = "恒山身法";
this.id = "hengshanshenfa";
this.grade = 2;
this.family = FAMILIES.HENGSHAN;
this.desc = "恒山派独门轻功身法，飘逸灵动";
this.dodge_actions = [
    "$n身形一转，恒山身法飘然而退",
    "$n足尖轻点，如白云出岫般闪开",
    "$n施展恒山身法，身形如烟，$N的攻击落空",
    "$n一式「灵虚步」，身法飘忽不定，$N难以捉摸",
    "$n身随意转，脚踏恒山步法，轻巧地避开了$N的攻击",
    "$n衣袂飘飘，宛如仙子凌波，$N的招式尽数打在空处",
    "$n身形一晃，使出恒山绝学，瞬间闪至$N身侧",
    "$n如云中飞燕，身形轻盈地掠出数丈，$N的攻击差之毫厘",
];
this.can_enables = ["dodge"];
this.learn_condition = { skill: { dodge: 200 } };
this.query_enable_prop = function (lv) {
    return {
        dodge: {
            ds: Math.round(lv * 1.1),
            fy: Math.round(lv * 1.2),
        },
    };
};

this.pfm = {
    lingxu:
    {
        name: "灵虚",
        distime: 30000,
        enable_skill: "dodge",
        release_time: 0,
        mp: 5,
        use: function (me, target, lv) {
            var duration = 1000 + lv * 10;
            var per = 10 + parseInt(lv / 100);

            me.add_status({
                id: "dodge",
                name: "灵虚",
                start_msg: "<hig>$N深吸一口气，施展恒山身法之【灵虚】，身如灵虚化境，若隐若现，虚实难辨。</hig>",
                desc: "增加你的躲闪和防御",
                duration: duration,
                prop: {
                    ds_per: per,
                    fy_per: per,
                },
                finish_msg: "<cyn>$N的【灵虚】功力消散，身形恢复了正常。</cyn>",
            });
        },
        query_desc: function (me, lv) {
            var duration = (1000 + lv * 10) / 1000;
            var per = 10 + parseInt(lv / 100);
            return "恒山身法之灵虚，" + duration + "秒内增加你" + per + "%躲闪，防御提高" + per + "%，冷却30秒，每100级增加一秒持续时间和百分一防御/躲闪。";
        },
    },
};
