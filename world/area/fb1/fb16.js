this.inherits(AREA);
this.set({
    id: "ts",
    name: "泰山",
    desc: "五岳独尊的东岳泰山，山势雄奇，直插云霄。自山门而上，石阶陡峭，云雾缭绕，非轻功卓绝者难以攀登。据说泰山三道人隐居于此，镇守着山顶的武学秘籍。",
    score: 130,
    first: "ts/shanmen",
    is_show: true,
    is_copy: true,
    expend: 10,
    exp: 10000,
    pot: 8000,
    room_path: "ts/",
    ss_title: "阿西噶"
});
	this.map = [
	    { n: "玉皇顶", id: "ts/yuhaungding", p: [0, -6], exits: ["sd"] },
	    { n: "南天门", id: "ts/nantian", p: [0, -5], exits: ["sd", "nu"] },
	    { n: "十八盘", id: "ts/shiba3", p: [0, -4], exits: ["sd", "nu"] },
	    { n: "龙门", id: "ts/longmen", p: [0, -3], exits: ["sd", "nu"] },
	    { n: "升仙坊", id: "ts/shengxian", p: [0, -3], exits: ["sd", "nu"] },
	    { n: "十八盘", id: "ts/shiba1", p: [0, -2], exits: ["sd", "nu"] },
	    { n: "十八盘", id: "ts/shiba2", p: [0, -2], exits: ["sd", "nu"] },
	    { n: "二天门", id: "ts/ertian", p: [0, -1], exits: ["sd", "nu"] },
	    { n: "一天门", id: "ts/yitian", p: [0, 0], exits: ["sd", "nu"] },
	    { n: "岱宗坊", id: "ts/daizong", p: [0, 1], exits: ["nu"] },
	];
this.drops = [
    "book/bc#taishanquanfa", "book/bc#taishanjianfa", "book/bc#panshishengong",
    "eq/lv3/ts_pao", "eq/lv3/ts_hufu", "eq/lv3/hs2_pao"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#taishanquanfa", odds: 2100 },
	    { obj: ["book/bc#taishanjianfa", "book/bc#panshishengong"], odds: 2400 },
	    { obj: ["eq/lv3/ts_pao", "eq/lv3/ts_hufu", "eq/lv3/hs2_pao"], odds: 250 },
	];
