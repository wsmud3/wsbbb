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
    { n: "山门", id: "gm/shanmen", p: [0, 0], exits: ["n"] },
    { n: "半山亭", id: "gm/banshanting", p: [0, 1], exits: ["n", "s"] },
    { n: "半山腰", id: "gm/banshanyao", p: [0, 2], exits: ["n", "s"] },
    { n: "林间小屋", id: "gm/linjianxiaowu", p: [0, 3], exits: ["n", "s"] },
    { n: "光明顶", id: "gm/guangmingding", p: [0, 4], exits: ["n", "s", "e", "w"] },
    { n: "密道", id: "gm/midao1", p: [-1, 4], exits: ["e", "w"] },
    { n: "密道深处", id: "gm/midao2", p: [-2, 4], exits: ["e", "n"] },
    { n: "密室", id: "gm/mishi2", p: [-2, 5], exits: ["s", "e"] },
    { n: "厚土坊", id: "gm/houtufang", p: [0, 5], exits: ["n", "s", "w"] },
    { n: "巨木坊", id: "gm/jumufang", p: [-1, 5], exits: ["e"] },
    { n: "洪水坊", id: "gm/hongshuifang", p: [1, 4], exits: ["w"] },
    { n: "锐金坊", id: "gm/ruijinfang", p: [0, 6], exits: ["n", "s"] },
    { n: "烈火坊", id: "gm/liehuofang", p: [0, 7], exits: ["n", "s"] },
    { n: "圣火坊", id: "gm/shenghuofang", p: [0, 8], exits: ["s"] }
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
