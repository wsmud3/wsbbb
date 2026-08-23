	this.inherits(AREA);
	this.set({
	    id: "slj",
	    name: "神龙教",
	    desc: "神龙教位于辽东蛇岛之上，教中弟子行事诡异，武功自成一家。教主洪安通武功深不可测，麾下教众数千，雄踞一方。",
	    score: 100,
	    is_show: true,
	    first: "bj/shenlong/haitan",
	    is_copy: true,
	    expend: 10,
	    exp: 7000,
	    pot: 5000,
	    is_multi: false,
	    room_path: "bj/shenlong/",
	    ss_title: "白龙使"
	});
	this.map = [
	    { n: "海滩", id: "bj/shenlong/haitan", p: [0, 0], exits: ["n"] },
	    { n: "灌木林", id: "bj/shenlong/lin1", p: [0, -1], exits: ["n", "s"] },
	    { n: "灌木林", id: "bj/shenlong/lin2", p: [0, -2], exits: ["n", "s"] },
	    { n: "空地", id: "bj/shenlong/kongdi", p: [0, -3], exits: ["n", "s", "e"] },
	    { n: "小屋", id: "bj/shenlong/xiaowu", p: [0, -4], exits: ["s"] },
	    { n: "大道", id: "bj/shenlong/dadao", p: [1, -3], exits: ["w", "e"] },
	    { n: "练武场", id: "bj/shenlong/wuchang", p: [2, -3], exits: ["w", "n"] },
	    { n: "山道", id: "bj/shenlong/dadao2", p: [2, -4], exits: ["n", "s"] },
	    { n: "大门", id: "bj/shenlong/damen", p: [2, -5], exits: ["n", "s"] },
	    { n: "大厅", id: "bj/shenlong/dating", p: [2, -6], exits: ["s"] },
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

