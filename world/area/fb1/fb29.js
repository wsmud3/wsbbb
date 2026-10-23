this.inherits(AREA);
this.set({
    id: "xd",
    name: "血刀门",
    desc: "血刀门盘踞西域雪山，门人凶残嗜血，以血刀老祖为尊。血刀大法诡异狠辣，刀下亡魂无数，雪山之中藏有血刀门的至宝。",
    score: 280,
    is_show: true,
    first: "xd/shankou",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 42000,
    pot: 38000,
    room_path: "xd/",
    ss_title: "血刀老祖"
});
		this.map = [
	    { n: "雪山山口", id: "xd/shankou", p: [0, 0], exits: ["s"] },
	    { n: "雪山山谷", id: "xd/shangu", p: [0, 1], exits: ["n","e","s"] },
	    { n: "山洞", id: "xd/shandong", p: [1, 1], exits: ["w"] },
	    { n: "忘忧谷", id: "xd/wangyou", p: [0, 2], exits: ["n","eu"] },
	    { n: "洞口", id: "xd/dongkou", p: [1, 2], exits: ["wd","enter"] },
	    { n: "山洞", id: "xd/xuedao", p: [2, 2], exits: ["out"] },
		];
	this.drops = [
	    "book/bc#shenkongxing2",
	    "book/bc#shenzhaojing",
	    "book/bc#xuehaimogong",
	    "book/bc#xuedao",
	    "eq/lv5/wushen/xuedao_blade"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#shenkongxing2", odds: 2100 },
	    { obj: ["book/bc#shenzhaojing", "book/bc#xuehaimogong"], odds: 2900 },
	    { obj: "book/bc#xuedao", odds: 2900 },
	    { obj: "eq/lv5/wushen/xuedao_blade", odds: 17 },
	];
