	this.inherits(AREA);
	this.set({
	    id: "slj",
	    name: "神龙教",
	    desc: "神龙教位于辽东蛇岛之上，教中弟子行事诡异，武功自成一家。教主洪安通武功深不可测，麾下教众数千，雄踞一方。",
	    score: 100,
	    is_show: true,
	    first: "bj/slj/haitan",
	    is_copy: true,
	    expend: 10,
	    exp: 7000,
	    pot: 5000,
	    is_multi: false,
	    room_path: "bj/slj/",
	    ss_title: "白龙使"
	});
	this.map = [
	    { n: "海滩", id: "bj/slj/haitan", p: [0, 0], exits: ["s"] },
	    { n: "灌木林", id: "bj/slj/lin1", p: [0, -1], exits: ["n", "s"] },
	    { n: "蛇道", id: "bj/slj/lin2", p: [0, -2], exits: ["n", "s"] },
	    { n: "空地", id: "bj/slj/kongdi", p: [0, -3], exits: ["n", "s"] },
	    { n: "练武场", id: "bj/slj/wuchang", p: [0, -4], exits: ["n", "s", "w"] },
	    { n: "蛇窟", id: "bj/slj/sheku", p: [-1, -4], exits: ["e", "w"] },
	    { n: "蛇窟深处", id: "bj/slj/sheku2", p: [-2, -4], exits: ["e", "w"] },
	    { n: "蛇王巢穴", id: "bj/slj/sheku3", p: [-3, -4], exits: ["e"] },
	    { n: "山道", id: "bj/slj/shandao", p: [0, -5], exits: ["n", "s"] },
	    { n: "山门", id: "bj/slj/damen", p: [0, -6], exits: ["n", "s"] },
	    { n: "前厅", id: "bj/slj/qianting", p: [0, -7], exits: ["n", "s"] },
	    { n: "大厅", id: "bj/slj/dating", p: [0, -8], exits: ["n"] },
	];
	this.drops = [
	    "book/bc#yixingbufa", "book/bc#shenlongxinfa", "book/bc#shedaoqigong",
	    "book/bc#shenlongjian", "book/bc#huagumianzhang",
	    "eq/lv2/sl_zhang", "eq/lv2/sl_cloth", "eq/lv2/sl_tou",
	    "eq/lv2/sl_shoes", "eq/lv2/sl_shou", "eq/lv2/sl_yao", "eq/lv2/sl_ling"
	];

		this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#shenlongxinfa", "book/bc#shedaoqigong", "book/bc#huagumianzhang"], odds: 2100 },
	    { obj: ["book/bc#yixingbufa", "book/bc#shenlongjian"], odds: 2900 },
	    { obj: ["eq/lv2/sl_zhang", "eq/lv2/sl_cloth", "eq/lv2/sl_tou", "eq/lv2/sl_shoes", "eq/lv2/sl_shou", "eq/lv2/sl_yao", "eq/lv2/sl_ling"], odds: 9300 },
	];
