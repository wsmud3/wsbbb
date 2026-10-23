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
	    // 15 个节点与原版 fb23 map 应答一一对应；每条连线只从一侧写一次（north = -y）
	    { n: "山道", id: "yh/shandao", p: [0, 0], exits: ["s"] },
	    { n: "花径", id: "yh/yihua0", p: [0, 1], exits: ["s"] },
	    { n: "花径", id: "yh/yihua1", p: [0, 2], exits: ["s"] },
	    { n: "大门", id: "yh/damen", p: [0, 3], exits: ["s"] },
	    { n: "移花阁", id: "yh/yihuage", p: [0, 4], exits: ["s"] },
	    { n: "桂花廊", id: "yh/changlang", p: [0, 5], exits: ["s"] },
	    { n: "玫瑰廊", id: "yh/changlang1", p: [0, 6], exits: ["sw","se"] },
	    { n: "邀月宫", id: "yh/yaoyuegong", p: [-1, 7], exits: [] },
	    { n: "涟星宫", id: "yh/lianxinggong", p: [1, 7], exits: [] },
	    { n: "卧室", id: "yh/woshi", p: [0, 8], exits: ["nw","ne"] },
	    { n: "暗道", id: "yh/midao", p: [0, 9], exits: [] },
	    { n: "密室", id: "yh/midao2", p: [-1, 9], exits: ["e"] },
	    { n: "小径", id: "yh/xiaojing", p: [-2, 9], exits: ["e","w"] },
	    { n: "莲花池", id: "yh/lianhuachi", p: [-3, 9], exits: [] },
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
