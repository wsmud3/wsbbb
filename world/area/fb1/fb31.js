this.inherits(AREA);
this.set({
    id: "hslj",
    name: "华山论剑",
    desc: "五绝论剑，华山之巅。东邪西毒南帝北丐中神通，天下五绝齐聚华山，争夺天下第一之名号。此乃武林至高荣耀之战。",
    score: 300,
    is_show: true,
    first: "hslj/rukou",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 46000,
    pot: 40000,
    room_path: "hslj/",
    ss_title: "中神通"
});
this.map = [
    { n: "入口", id: "hslj/rukou", p: [0, 0], exits: ["n", "s", "e", "w"] },
    { n: "东擂台", id: "hslj/dongleitai", p: [1, 0], exits: ["w", "e"] },
    { n: "西擂台", id: "hslj/xileitai", p: [-1, 0], exits: ["e"] },
    { n: "南擂台", id: "hslj/nanleitai", p: [0, 1], exits: ["n"] },
    { n: "北擂台", id: "hslj/beileitai", p: [0, -1], exits: ["s"] },
    { n: "中央决战台", id: "hslj/zhongyangtai", p: [2, 0], exits: ["w"] }
];
		this.drops = [
	    "book/bc#duanjiajian",
	    "book/bc#kumushengong",
	    "book/bc#tiannanbu",
	    "book/bc#jinyangong",
	    "book/bc#quanzhenjianfa",
	    "book/bc#chanchubufa",
	    "book/bc#anyingfuxiang",
	    "book/bc#biboshengong",
	    "book/bc#luoyingshenjian",
	    "book/bc#hamagong",
	    "book/bc#lingshezhangfa",
	    "book/bc#tanzhishengong",
	    "book/bc#yiyangzhi",
	    "book/bc#jiuyinshengong",
	    "eq/lv4/lingshezhang",
	    "eq/lv4/yuxiao",
	    "eq/lv4/yuzhuzhang",
	    "eq/lv5/wushen/tianlong_waist"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#tiannanbu", "book/bc#chanchubufa", "book/bc#biboshengong"], odds: 2100 },
	    { obj: "book/bc#jinyangong", odds: 2900 },
	    { obj: ["book/bc#duanjiajian", "book/bc#quanzhenjianfa", "book/bc#anyingfuxiang", "book/bc#luoyingshenjian"], odds: 2400 },
	    { obj: ["book/bc#kumushengong", "book/bc#hamagong", "book/bc#lingshezhangfa", "book/bc#tanzhishengong", "book/bc#yiyangzhi"], odds: 2900 },
	    { obj: ["eq/lv4/lingshezhang", "eq/lv4/yuxiao", "eq/lv4/yuzhuzhang"], odds: 90 },
	    { obj: "book/bc#jiuyinshengong", odds: 2900 },
	    { obj: "eq/lv5/wushen/tianlong_waist", odds: 17 },
	];
