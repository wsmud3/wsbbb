
this.inherits(AREA);
this.set({
    id: "eyi",
    name: "妖族巢穴",
    desc: "一处隐藏在山脉深处的妖族巢穴，传说其中栖息着上古妖族的后裔，巢穴层层深入，永无止境。这里不提供任何奖励，唯有证明自己实力的勇者才敢踏入。",
    is_area: true,
    first: "eyi/men",
    room_path: "eyi/",
    index: 10,
    is_public: true,
    sp: "无限层数挑战，无任何奖励，仅供自我挑战。每层妖族属性递增，技能完全随机。"
});
this.map = [
    { n: "巢穴入口", id: "eyi/men", p: [0, 0], exits: ["e"] },
    { n: "妖族巢穴", id: "eyi/ta", p: [1, 0], exits: ["u", "w"] },
];

this.query_actions = function (me) {
    var actions = [];
    var name = WORLD.DATA.query_temp("eyi_max_user");
    if (name) {
        var lv = WORLD.DATA.query_temp("eyi_max");
        actions.push([
            'goto eyi1', '前往挑战', "目前最高记录的保持者是" + name
            + "：" + UTIL.to_c(lv) + "层"
        ]);
    } else {
        actions.push([
            'goto eyi1', '前往挑战', "目前尚无挑战记录"
        ]);
    }
    return actions;
}
