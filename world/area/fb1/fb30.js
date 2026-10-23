this.inherits(AREA);
this.set({
    id: "gm2",
    name: "古墓派",
    desc: "终南山活死人墓，古墓派世代隐居于此。林朝英所创武功精妙绝伦，玉女心经冠绝天下，墓中机关重重，暗藏玄机。",
    score: 290,
    is_show: true,
    first: "gm2/gumurukou",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 44000,
    pot: 40000,
    room_path: "gm2/",
    ss_title: "神雕大侠"
});
		this.map = [
	    { n: "古墓入口", id: "gm2/gumukou", p: [0, 0], exits: ["enter"] },
	    { n: "前厅", id: "gm2/qianting", p: [1, 0], exits: ["out","e"] },
	    { n: "后堂", id: "gm2/houtang", p: [2, 0], exits: ["w","n","e"] },
	    { n: "卧室", id: "gm2/woshi", p: [2, -1], exits: ["s"] },
	    { n: "琴室", id: "gm2/qinshi", p: [3, 0], exits: ["w","d"] },
	    { n: "暗河", id: "gm2/anhe", p: [4, 0], exits: [] },
	    { n: "峭壁", id: "gm2/qiaobi", p: [4, -1], exits: ["n","s"] },
	    { n: "平台", id: "gm2/pingtai", p: [4, -2], exits: ["n","e"] },
	    { n: "剑冢", id: "gm2/jianzhong", p: [5, -2], exits: ["w"] },
		];
	this.drops = [
	    "book/bc#yunvxinjing",
	    "book/bc#yinsuojinling",
	    "book/bc#anranxiaohunzhang",
	    "book/bc#xuantiejianfa",
	    "eq/lv5/wushen/longgu_ring",
	    "eq/lv5/wushen/panlong_head",
	    "eq/lv4/bingpoyinzhen",
	    "eq/lv4/jinlingsuo"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#yunvxinjing", "book/bc#yinsuojinling"], odds: 2400 },
	    { obj: ["eq/lv4/bingpoyinzhen", "eq/lv4/jinlingsuo"], odds: 90 },
	    { obj: ["book/bc#anranxiaohunzhang", "book/bc#xuantiejianfa"], odds: 2900 },
	    { obj: ["eq/lv5/wushen/longgu_ring", "eq/lv5/wushen/panlong_head"], odds: 17 },
	];
