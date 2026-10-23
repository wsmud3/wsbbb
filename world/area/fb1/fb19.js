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
	    { n: "海滩", id: "th/haitan", p: [0, 0], exits: ["s"] },
	    { n: "桃花林", id: "th/tao1", p: [0, 1], exits: ["s","n"] },
	    { n: "桃林出口", id: "th/taolin", p: [0, 2], exits: ["n","s"] },
	    { n: "小路", id: "th/road1", p: [0, 3], exits: ["s","n"] },
	    { n: "试剑亭", id: "th/shijianting", p: [0, 4], exits: ["e","n"] },
	    { n: "大门", id: "th/damen", p: [1, 4], exits: ["e","w"] },
	    { n: "前院", id: "th/qianyuan", p: [2, 4], exits: ["e","w"] },
	    { n: "大厅", id: "th/dating", p: [3, 4], exits: ["e","w"] },
	    { n: "书房", id: "th/shufang", p: [4, 4], exits: ["w"] },
	    { n: "卧室", id: "th/woshi", p: [3, 3], exits: ["s"] },
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
