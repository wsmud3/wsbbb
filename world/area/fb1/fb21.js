this.inherits(AREA);
this.set({
    id: "xx",
    name: "星宿海",
    desc: "星宿海位于青海荒漠之中，地势险恶，毒雾弥漫。丁春秋在此创立星宿派，门人善使毒功，以化功大法威震江湖。",
    score: 200,
    is_show: true,
    first: "xx/rukou",
    is_copy: true,
    expend: 10,
    exp: 26000,
    pot: 22000,
    room_path: "xx/",
    ss_title: "星宿老仙"
});
this.map = [
    { n: "星宿海", id: "xx/xxh6", p: [-2, -2], exits: [] },
    { n: "毒潭", id: "xx/dutan1", p: [-2, 1], exits: ["s"] },
    { n: "毒潭深处", id: "xx/dutan2", p: [-2, 2], exits: ["n", "s"] },
    { n: "化功殿", id: "xx/huagongdian", p: [-2, 3], exits: ["n", "s"] },
    { n: "化功密室", id: "xx/huagongmishi", p: [-2, 4], exits: ["n"] },
    { n: "星宿海", id: "xx/xxh2", p: [-1, -2], exits: ["s"] },
    { n: "星宿海", id: "xx/xxh4", p: [-1, -1], exits: ["n"] },
    { n: "左星宿海", id: "xx/zuohaishi", p: [-1, 0], exits: ["e"] },
    { n: "日月洞", id: "xx/riyuedong", p: [0, -2], exits: ["s"] },
    { n: "星宿海", id: "xx/zhonghaishi", p: [0, -1], exits: ["n"] },
    { n: "星宿海入口", id: "xx/rukou", p: [0, 0], exits: ["n", "e", "w"] },
    { n: "星宿海", id: "xx/xxh3", p: [1, -2], exits: ["s"] },
    { n: "星宿海", id: "xx/xxh5", p: [1, -1], exits: ["n"] },
    { n: "右星宿海", id: "xx/youhaishi", p: [1, 0], exits: ["w"] },
];
this.drops = [
    "book/bc#zhaixinggong",
    "book/bc#feixingshu",
    "book/bc#sanyinwugongzhao",
    "book/bc#huagongdafa",
    "eq/lv4/shenmuwangding",
    "eq/lv3/bilinzhen"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#zhaixinggong", "book/bc#feixingshu"], odds: 2100 },
	    { obj: "book/bc#sanyinwugongzhao", odds: 2400 },
	    { obj: "book/bc#huagongdafa", odds: 2900 },
	    { obj: "eq/lv3/bilinzhen", odds: 250 },
	    { obj: "eq/lv4/shenmuwangding", odds: 90 },
	];
