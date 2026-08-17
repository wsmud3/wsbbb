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
    { n: "大门", id: "wudu/damen", p: [0, 0], exits: ["s"] },
    { n: "练武场", id: "wudu/lianwuchang", p: [0, -1], exits: ["n", "s"] },
    { n: "南院", id: "wudu/nanyuan", p: [0, -2], exits: ["n", "s", "w"] },
    { n: "西房", id: "wudu/xifang", p: [0, -3], exits: ["n", "s", "e"] },
    { n: "毒虫室", id: "wudu/chongshi", p: [1, -3], exits: ["w", "n"] },
    { n: "蛊窟", id: "wudu/guku", p: [1, -2], exits: ["s", "w"] },
    { n: "练毒室", id: "wudu/liandushi", p: [0, -4], exits: ["n", "s"] },
    { n: "大厅", id: "wudu/dating", p: [0, -5], exits: ["n", "s"] },
    { n: "花园", id: "wudu/huayuan", p: [0, -6], exits: ["n"] }
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
