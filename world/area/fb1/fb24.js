this.inherits(AREA);
this.set({
    id: "yz2",
    name: "燕子坞",
    desc: "姑苏燕子坞，慕容世家世代隐居于此。参合庄内曲径通幽，机关重重。慕容复虽已不在，但其绝世武学仍旧藏于书房之中。",
    score: 230,
    is_show: true,
    first: "yz2/anbian",
    is_copy: true,
    expend: 10,
    exp: 32000,
    pot: 28000,
    room_path: "yz2/",
    ss_title: "大燕皇族"
});
	this.map = [
	    { n: "岸边", id: "yz2/anbian", p: [-1, 0], exits: ["e"] },
	    { n: "花丛", id: "yz2/hc1", p: [0, 0], exits: ["w", "e"] },
	    { n: "庄门", id: "yz2/zhuangmen", p: [1, 0], exits: ["w", "e"] },
	    { n: "前院", id: "yz2/qianyuan", p: [2, 0], exits: ["w", "s", "e"] },
	    { n: "小径", id: "yz2/xiaojing", p: [2, 1], exits: ["n", "e"] },
	    { n: "练武场", id: "yz2/wuchang", p: [3, 0], exits: ["w", "e"] },
	    { n: "听雨居", id: "yz2/tingyuju", p: [3, 1], exits: ["w", "s"] },
	    { n: "后院", id: "yz2/houyuan", p: [3, 2], exits: ["n", "s"] },
	    { n: "云锦楼", id: "yz2/yunjinlou", p: [3, 3], exits: ["n", "e"] },
	    { n: "后厅", id: "yz2/houting", p: [4, -1], exits: ["s", "e"] },
	    { n: "大厅", id: "yz2/dating", p: [4, 0], exits: ["w", "e", "n"] },
	    { n: "小厅", id: "yz2/xiaoting", p: [4, 3], exits: ["w"] },
	    { n: "内堂", id: "yz2/neitang", p: [5, -1], exits: ["w"] },
	    { n: "书房", id: "yz2/shufang", p: [5, 0], exits: ["w"] },
	];
this.drops = [
	    "book/bc#douzhuanxingyi",
	    "book/bc#canhezhi",
	    "eq/lv4/yirongmianju"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#canhezhi", odds: 2900 },
	    { obj: "eq/lv4/yirongmianju", odds: 90 },
	    { obj: "book/bc#douzhuanxingyi", odds: 2900 },
	];
