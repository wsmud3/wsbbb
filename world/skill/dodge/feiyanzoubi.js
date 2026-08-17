this.inherits(SKILL);
this.name = "飞檐走壁";
this.id = "feiyanzoubi";
this.grade = 1;

this.family = FAMILIES.GAIBANG;
this.dodge_actions = [
    "$n身形急转，避过了$N的攻势。",
    "可是$n拔地而起，躲过了$N这一招。。",
    "$n作闪右避，总算躲过了$N这一招。。",
    "$n一式「飞檐掠影」，身形贴着墙壁急速游走，$N的招式尽数打在墙上。",
    "只见$n施展「走壁无痕」，足尖在墙壁上连点数下，身形凌空翻转，$N的攻击落了个空。",
    "$n使出「凌虚步」，脚步虚虚实实，身形如踏在无形阶梯之上，$N的攻击差之毫厘。",
    "$n一招「燕子三点水」，身形轻灵如燕，在半空中连踏三步，$N的招式从脚下掠过。",
    "但见$n「壁虎游墙」，身体紧贴墙壁，如壁虎般急速游走，$N的攻击尽数落空。",
    "$n忽然「鹞子钻天」，拔地而起三丈有余，在空中一个翻身，稳稳落在$N身后。",
    "$n身形一晃，一招「檐上飞星」，如流星般在屋檐之间穿梭闪避，$N根本追之不及。",
];
this.desc = "江湖中常见的轻功身法。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["dodge"];
this.learn_condition = {
    max_mp: 700,
    skill: {
        dodge: 50
    }
};
this.query_enable_prop = function (lv) {
    return {
        dodge: {
            ds: lv +5
        }
    };
};
