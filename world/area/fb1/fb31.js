this.inherits(AREA);
this.set({
    id: "hslj",
    name: "华山论剑",
    desc: "五绝论剑，华山之巅。东邪西毒南帝北丐中神通，天下五绝齐聚华山，争夺天下第一之名号。此乃武林至高荣耀之战。",
    score: 300,
    is_show: true,
    first: "hslj/leitaixia",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 46000,
    pot: 40000,
    room_path: "hslj/",
    ss_title: "中神通"
});
		this.map = [
	    { n: "西峰", id: "hslj/west", p: [-1, -1], exits: ["e"] },
	    { n: "北峰", id: "hslj/north", p: [0, -2], exits: ["s"] },
	    { n: "论剑台", id: "hslj/tai", p: [0, -1], exits: ["w", "e", "s", "n"] },
	    { n: "论剑台下", id: "hslj/leitaixia", p: [0, 0], exits: ["u"] },
	    { n: "南峰", id: "hslj/south", p: [0, 0], exits: ["n"] },
	    { n: "东峰", id: "hslj/east", p: [1, -1], exits: ["w"] },
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
