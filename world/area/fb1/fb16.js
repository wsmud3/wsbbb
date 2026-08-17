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
    { n: "山门", id: "ts/shanmen", p: [0, 0], exits: ["n"] },
    { n: "石路", id: "ts/shilu1", p: [0, 1], exits: ["n", "s"] },
    { n: "石路", id: "ts/shilu2", p: [0, 2], exits: ["n", "s"] },
    { n: "石路", id: "ts/shilu3", p: [0, 3], exits: ["n", "s", "e"] },
    { n: "观日峰", id: "ts/guanrifeng", p: [1, 3], exits: ["w", "n"] },
    { n: "瞻鲁台", id: "ts/zhanlutai", p: [1, 4], exits: ["s", "n"] },
    { n: "玉皇顶", id: "ts/yuhaungding", p: [1, 5], exits: ["s"] },
    { n: "石路", id: "ts/shilu4", p: [0, 4], exits: ["n", "s"] },
    { n: "天门", id: "ts/tianmen", p: [0, 5], exits: ["s"] }
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
