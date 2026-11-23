this.inherits(SKILL);
this.name = "踏雪寻梅";
this.id = "taxuexunmei2";
this.source_skill = "taxuexunmei";
this.grade = 5;
this.family = FAMILIES.SHASHOU;
this.dodge_actions = [
    "$n一式「华发寻春喜见梅」，身子掣忽一转，$N只觉的眼前一花，失去了目标。",
    "$n一式「一株临路雪倍堆」，双脚点地，身子突然拔高了丈许，缓缓飘落在$N身后。",
    "$n一式「凤城南陌他年忆」，身行一晃，顿时无数条身影一下子出现在$N的面前。",
    "$n一式「香杳难随驿使来」，飘然向后一退，躲开$N的凌厉攻势。"
];
this.desc = "踏雪寻梅是杀手楼一种特别厉害的上乘轻功，即使穿着铁鞋踩在雪上，也不会留下一点脚印。";
this.can_enables = ["dodge"];
this.learn_condition = {
    max_mp: 1000,
    skill: { dodge: 200 }
};
// 1000 级：躲闪 +2100 命中 +1710 身法 +510 暴击 +4%
this.query_enable_prop = function (lv) {
    return {
        dodge: {
            ds: parseInt(lv * 2.1),
            mz: parseInt(lv * 1.7) + 10,
            dex: parseInt(lv * 0.51),
            bj_per: 1 + parseInt(lv / 300),
        }
    };
};
// 无痕：3 秒 + 每 200 级 1 秒，上限 8 秒（1000 级 8 秒）
function wuhen_time(lv) { return Math.min(8, 3 + parseInt(lv / 200)) * 1000; }
this.pfm = {
    power: {
        name: "无痕",
        distime: 45000,
        enable_skill: "dodge",
        mp: 30,
        release_time: 0,
        no_auto: true,
        use: function (me, target, lv) {
            var t = wuhen_time(lv);
            me.send_room("<hiw>$N身体急转，化为一道白光，虚幻不定的出现在$N的周围\n</hiw>", target);
            me.add_status({
                id: "dodge",
                name: "无痕",
                desc: "免疫控制，躲闪增加40%",
                duration: t,
                ig_control: t,
                prop: { ds_per: 40 }
            });
        },
        query_desc: function (me, lv) {
            return (wuhen_time(lv) / 1000) + "秒内免疫控制，并增加40%躲闪";
        }
    }
};
