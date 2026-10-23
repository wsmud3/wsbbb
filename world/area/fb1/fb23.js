this.inherits(AREA);
this.set({
    id: "yh",
    name: "移花宫",
    desc: "移花宫深藏山谷之中，繁花似锦，美不胜收。邀月怜星二位宫主武功高绝，明玉功震慑武林，宫中暗藏通往外界的地道。",
    score: 220,
    is_show: true,
    first: "yh/damen",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 30000,
    pot: 26000,
    room_path: "yh/",
    ss_title: "移花宫主"
});
		this.map = [
	    { n: "山道", id: "yh/shandao", p: [0, 0], exits: ["s"] },
	    { n: "花径", id: "yh/yihua0", p: [0, 1], exits: ["n","s","e","w"] },
	    { n: "大门", id: "yh/damen", p: [0, 3], exits: ["s"] },
	    { n: "移花阁", id: "yh/yihuage", p: [0, 4], exits: ["n","s"] },
	    { n: "桂花廊", id: "yh/changlang", p: [0, 5], exits: ["n","s"] },
	    { n: "玫瑰廊", id: "yh/changlang1", p: [0, 6], exits: ["n","sw","se"] },
	    { n: "邀月宫", id: "yh/yaoyuegong", p: [-1, 7], exits: ["se","ne"] },
	    { n: "涟星宫", id: "yh/lianxinggong", p: [1, 7], exits: ["sw","nw"] },
	    { n: "卧室", id: "yh/woshi", p: [0, 8], exits: ["nw","ne"] },
	    { n: "暗道", id: "yh/midao", p: [0, 9], exits: ["u"] },
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
