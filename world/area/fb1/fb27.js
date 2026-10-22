this.inherits(AREA);
this.set({
    id: "gm",
    name: "光明顶",
    desc: "明教总舵光明顶，西域大漠之中的武林圣地。明教教众高手如云，五行旗各怀绝技，圣火令上刻有无上武功秘法。",
    score: 260,
    is_show: true,
    first: "gm/shanmen",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 38000,
    pot: 34000,
    room_path: "gm/",
    ss_title: "光明右使"
});
	this.map = [
	    { n: "锐金旗", id: "gm/qi_ruijin", p: [-3, -7], exits: ["s", "e"] },
	    { n: "巨木旗", id: "gm/qi_jumu", p: [-3, -6], exits: ["n", "e"] },
	    { n: "练武场", id: "gm/lianwu", p: [-2, -7], exits: ["s", "e", "w"] },
	    { n: "厚土旗", id: "gm/qi_houtu", p: [-2, -6], exits: ["n", "s", "e", "w"] },
	    { n: "光明顶", id: "gm/guangmingding", p: [-2, -5], exits: ["n", "s"] },
	    { n: "林间小路", id: "gm/xiaolu1", p: [-2, -4], exits: ["n", "s"] },
	    { n: "半山腰", id: "gm/banshanyao", p: [-2, -3], exits: ["n", "s", "e"] },
	    { n: "半山厅", id: "gm/banshanting", p: [-2, -2], exits: ["n", "se"] },
	    { n: "烈火旗", id: "gm/qi_liehuo", p: [-1, -7], exits: ["s", "e", "w"] },
	    { n: "洪水旗", id: "gm/qi_hongshui", p: [-1, -6], exits: ["n", "e", "w"] },
	    { n: "山坡", id: "gm/shanpo1", p: [-1, -3], exits: ["e", "w"] },
	    { n: "山路", id: "gm/shanlu", p: [-1, -1], exits: ["e", "nw"] },
	    { n: "断崖", id: "gm/duanya", p: [0, -7], exits: [] },
	    { n: "山崖", id: "gm/shanya", p: [0, -6], exits: ["w"] },
	    { n: "半山腰", id: "gm/shanpo2", p: [0, -3], exits: ["e", "w"] },
	    { n: "栈道", id: "gm/zhandao", p: [0, -1], exits: ["s", "w"] },
	    { n: "山门", id: "gm/shanmen", p: [0, 0], exits: ["n"] },
	    { n: "悬天石", id: "gm/xuantianshi", p: [1, -3], exits: ["w"] },
	];
	this.drops = [
	    "book/bc#shenghuoshengong",
	    "book/bc#qingfushenfa",
	    "book/bc#yingzhuagong",
	    "book/bc#shenghuolingfa",
	    "book/bc#qiankundanuoyi",
	    "book/bc#jiuyangshengong",
	    "eq/lv4/shenghuoling",
	    "eq/lv5/wushen/yitian_sword",
	    "eq/lv4/zhouzhiruo_shouzhuo",
	    "eq/lv4/yangbuhui_xianglian",
	    "eq/lv4/zhaomin_jiezhi",
	    "eq/lv4/weiyixiao_taomingshoe"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#qingfushenfa", "book/bc#yingzhuagong", "book/bc#shenghuolingfa"], odds: 2100 },
	    { obj: "book/bc#shenghuoshengong", odds: 2400 },
	    { obj: ["eq/lv4/shenghuoling", "eq/lv4/zhouzhiruo_shouzhuo", "eq/lv4/yangbuhui_xianglian", "eq/lv4/zhaomin_jiezhi", "eq/lv4/weiyixiao_taomingshoe"], odds: 90 },
	    { obj: ["book/bc#qiankundanuoyi", "book/bc#jiuyangshengong"], odds: 2900 },
	    { obj: "eq/lv5/wushen/yitian_sword", odds: 17 },
	];
