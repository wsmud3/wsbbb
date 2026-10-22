this.inherits(AREA);
this.set({
    id: "yh",
    name: "移花宫",
    desc: "移花宫深藏山谷之中，繁花似锦，美不胜收。邀月怜星二位宫主武功高绝，明玉功震慑武林，宫中暗藏通往外界的地道。",
    score: 220,
    is_show: true,
    first: "yh/shandao",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 30000,
    pot: 26000,
    room_path: "yh/",
    ss_title: "移花宫主"
});
this.map = [
    { n: "邀月宫", id: "yh/yaoyuegong", p: [-2, 0], exits: [] },
    { n: "涟星宫", id: "yh/lianxinggong", p: [-2, 1], exits: [] },
    { n: "藏剑阁", id: "yh/cangjiange", p: [-2, 5], exits: ["s"] },
    { n: "水榭", id: "yh/shuixie", p: [-2, 6], exits: ["n"] },
    { n: "暗道", id: "yh/andao", p: [-2, 8], exits: [] },
    { n: "前厅", id: "yh/qianting", p: [-1, 1], exits: ["s", "w"] },
    { n: "宫主卧室", id: "yh/woshi", p: [-1, 2], exits: [] },
    { n: "山道", id: "yh/shandao", p: [0, 0], exits: ["s"] },
    { n: "花径", id: "yh/yihua0", p: [0, 1], exits: [] },
    { n: "花径尽头", id: "yh/huajing5", p: [0, 2], exits: [] },
    { n: "花径", id: "yh/huajing4", p: [0, 3], exits: ["n", "s", "e"] },
    { n: "花径", id: "yh/huajing3", p: [0, 4], exits: ["n", "e"] },
    { n: "花径", id: "yh/huajing2", p: [1, 3], exits: [] },
    { n: "花径", id: "yh/huajing1", p: [1, 4], exits: ["n"] },
];
this.drops = [
    "book/bc#mingyugong", "book/bc#yihuajiemu", "book/bc#yifengjianfa",
    "book/bc#jueqingzhang",
    "eq/lv5/wushen/bixue_sword", "eq/lv4/yihuagongzhuang", "eq/lv4/yihuagonglv",
	    "eq/lv3/yaoyue_shouzhuo", "eq/lv3/lianxing_bingyuzan", "eq/lv3/huawuque_yupei",
    "res/huozhezi"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#jueqingzhang", "res/huozhezi"], odds: 2100 },
	    { obj: "book/bc#yifengjianfa", odds: 2400 },
	    { obj: ["book/bc#mingyugong", "book/bc#yihuajiemu"], odds: 2900 },
	    { obj: ["eq/lv3/yaoyue_shouzhuo", "eq/lv3/lianxing_bingyuzan", "eq/lv3/huawuque_yupei"], odds: 250 },
	    { obj: ["eq/lv4/yihuagongzhuang", "eq/lv4/yihuagonglv"], odds: 90 },
	    { obj: "eq/lv5/wushen/bixue_sword", odds: 17 },
	];
