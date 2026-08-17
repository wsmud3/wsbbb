this.inherits(AREA);
this.set({
    id: "bt",
    name: "白驼山",
    desc: "西域白驼山，山势险峻，毒物遍地。欧阳锋在此苦心经营，驯养无数毒蛇，武功诡异莫测，令人闻风丧胆。",
    score: 190,
    is_show: true,
    first: "bt/damen",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 24000,
    pot: 20000,
    room_path: "bt/",
    ss_title: "西毒"
});
this.map = [
    { n: "大门", id: "bt/damen", p: [0, 0], exits: ["s"] },
    { n: "练功房", id: "bt/liangongfang", p: [0, -1], exits: ["n", "s", "w"] },
    { n: "门廊", id: "bt/menlang", p: [0, -2], exits: ["n", "s"] },
    { n: "花园", id: "bt/huayuan", p: [0, -3], exits: ["n", "s"] },
    { n: "长廊", id: "bt/changlang", p: [1, -1], exits: ["e", "w"] },
    { n: "药房", id: "bt/yaofang", p: [2, -1], exits: ["e", "w"] },
    { n: "草丛", id: "bt/caocong", p: [3, -1], exits: ["n", "w"] },
    { n: "岩洞", id: "bt/yandong", p: [3, 0], exits: ["s"] },
];
this.drops = [
    "book/bc#lingshezhangfa", "book/bc#chanchubufa", "book/bc#hamagong",
    "eq/lv4/lingshezhang"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#chanchubufa", odds: 2100 },
	    { obj: ["book/bc#lingshezhangfa", "book/bc#hamagong"], odds: 2900 },
	    { obj: "eq/lv4/lingshezhang", odds: 90 },
	];
