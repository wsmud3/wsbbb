this.inherits(AREA);
this.set({
    id: "wudu",
    name: "五毒教",
    desc: "五毒教位于苗疆深处，教中弟子擅长使毒，以五毒为尊。教主何铁手武功诡异，教中藏有天下罕见的毒功秘籍。",
    score: 130,
    is_show: true,
    first: "wudu/damen",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 10000,
    pot: 8000,
    room_path: "wudu/",
    ss_title: "五毒仙子"
});
	this.map = [
	    { n: "大门", id: "wudu/damen", p: [0, 0], exits: ["e"] },
	    { n: "厢房", id: "wudu/xiangfang", p: [0, 1], exits: ["e"] },
	    { n: "练武场", id: "wudu/lianwuchang", p: [1, 0], exits: ["e", "s", "w"] },
	    { n: "南院", id: "wudu/nanyuan", p: [1, 1], exits: ["n", "s", "w", "e"] },
	    { n: "练毒室", id: "wudu/liandushi", p: [1, 2], exits: ["n"] },
	    { n: "药室", id: "wudu/dating", p: [2, 0], exits: ["w", "e"] },
	    { n: "药室", id: "wudu/yaoshi", p: [2, 1], exits: ["w"] },
	    { n: "花园", id: "wudu/huayuan2", p: [3, -1], exits: ["e", "s"] },
	    { n: "花园", id: "wudu/huayuan", p: [3, 0], exits: ["w", "e", "n"] },
	    { n: "腾蛟亭", id: "wudu/huating2", p: [4, -1], exits: ["w", "s"] },
	    { n: "花厅", id: "wudu/huating", p: [4, 0], exits: ["w", "n"] },
	];
this.drops = [
    "book/bc#wudushengong", "book/bc#wuduyanluobu", "book/bc#wudugoufa",
    "book/bc#qianzhuwandushou", "eq/lv2/wd_mianju", "eq/lv2/wd_gou"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#wudushengong", odds: 2100 },
	    { obj: ["book/bc#wuduyanluobu", "book/bc#wudugoufa", "book/bc#qianzhuwandushou"], odds: 2400 },
	    { obj: ["eq/lv2/wd_mianju", "eq/lv2/wd_gou"], odds: 9300 },
	];
