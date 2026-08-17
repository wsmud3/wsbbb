this.inherits(AREA);
this.set({
    id: "th",
    name: "桃花岛",
    desc: "东海桃花岛，四季如春，桃花烂漫。岛主黄药师精通奇门遁甲、琴棋书画，岛上遍布桃花迷阵，外人难入。",
    score: 180,
    is_show: true,
    first: "th/damen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 22000,
    pot: 18000,
    room_path: "th/",
    ss_title: "东邪"
});
this.map = [
    { n: "大门", id: "th/damen", p: [0, 0], exits: ["s"] },
    { n: "练功房", id: "th/liangongfang", p: [0, -1], exits: ["n", "s"] },
    { n: "门廊", id: "th/menlang", p: [0, -2], exits: ["n", "s", "e"] },
    { n: "试剑亭", id: "th/shijianting", p: [1, -2], exits: ["w", "s", "n"] },
    { n: "前院", id: "th/qianyuan", p: [1, -1], exits: ["n", "s"] },
    { n: "卧室", id: "th/woshi", p: [1, 0], exits: ["s"] },
    { n: "弹指峰", id: "th/tanzhifeng", p: [1, -3], exits: ["n", "s"] },
    { n: "清啸亭", id: "th/qingxiaoting", p: [1, -4], exits: ["n", "e", "s"] },
    { n: "桃林迷阵", id: "th/mizhen1", p: [1, -5], exits: ["n", "e", "s"] },
    { n: "桃林迷阵", id: "th/mizhen2", p: [2, -5], exits: ["w", "s"] },
    { n: "桃林迷阵", id: "th/mizhen3", p: [1, -6], exits: ["n", "e"] },
    { n: "桃林迷阵", id: "th/mizhen4", p: [2, -6], exits: ["n", "w"] },
    { n: "大厅", id: "th/dating", p: [0, -3], exits: ["n", "s"] },
    { n: "桃林入口", id: "th/taolin", p: [0, -4], exits: ["n", "s"] },
    { n: "桃林深处", id: "th/taolinshendi", p: [0, -5], exits: ["n", "s"] },
    { n: "后山", id: "th/houshan", p: [0, -6], exits: ["n", "w", "e"] },
    { n: "山洞", id: "th/shandong", p: [1, -6], exits: ["w"] },
    { n: "黄药师居", id: "th/huangyaoshiju", p: [0, -7], exits: ["n"] }
];
this.drops = [
    "book/bc#jinyangong","book/bc#anyingfuxiang",
    "book/bc#luoyingshenjian", "book/bc#tanzhishengong", "book/bc#kongmingquan",
    "eq/lv4/yuxiao", "eq/lv4/ruanjia",
    "book/bc#biboshengong"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#biboshengong", odds: 2100 },
	    { obj: "book/bc#jinyangong", odds: 2900 },
	    { obj: ["book/bc#anyingfuxiang", "book/bc#luoyingshenjian"], odds: 2400 },
	    { obj: ["book/bc#tanzhishengong", "book/bc#kongmingquan"], odds: 2900 },
	    { obj: ["eq/lv4/yuxiao", "eq/lv4/ruanjia"], odds: 90 },
	];
