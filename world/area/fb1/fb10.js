	this.inherits(AREA);
	this.set({
	    id: "kw",
	    name: "关外",
	    desc: "关外雪原，冰天雪地，猛兽横行。据说闯王宝藏埋藏于此，引得无数江湖中人前来寻宝。",
	    score: 120,
	    is_show: true,
	    first: "kw/damenkanzi",
	    is_copy: true,
	    expend: 10,
	    exp: 8000,
	    pot: 6000,
	    room_path: "kw/",
	    ss_title: "雪山飞狐"
	});
	this.map = [
	    { n: "大门坎子", id: "kw/damenkanzi", p: [0, 0], exits: ["e", "w"] },
	    { n: "二门坎子", id: "kw/ermenkanzi", p: [1, 0], exits: ["e", "w"] },
	    { n: "满天星", id: "kw/mantianxing", p: [2, 0], exits: ["e", "w"] },
	    { n: "谷草跺", id: "kw/gucaoduo", p: [3, 0], exits: ["e", "w"] },
	    { n: "白河", id: "kw/baihe", p: [4, 0], exits: ["e", "n"] },
	    { n: "小屋", id: "kw/xiaowu", p: [4, 1], exits: ["s"] },
	    { n: "密林", id: "kw/milin1", p: [5, 0], exits: ["e", "w"] },
	    { n: "密林", id: "kw/milin2", p: [6, 0], exits: ["e", "w"] },
	    { n: "密林", id: "kw/milin3", p: [7, 0], exits: ["e", "w"] },
	    { n: "黑风口", id: "kw/heifengkou", p: [8, 0], exits: ["e", "w"] },
	    { n: "小天池", id: "kw/xiaotianchi", p: [9, 0], exits: ["e", "w"] },
	    { n: "瀑布", id: "kw/pubu", p: [10, 0], exits: ["w"] },
	    { n: "松花江", id: "kw/songhuajiang", p: [-1, 0], exits: ["e", "w"] },
	    { n: "雪地", id: "kw/xuedi1", p: [-2, 0], exits: ["e", "w"] },
	    { n: "雪地", id: "kw/xuedi2", p: [-3, 0], exits: ["e", "w", "n"] },
	    { n: "山神庙", id: "kw/shanmiao", p: [-3, 1], exits: ["s"] },
	];
	this.drops = [
	    "book/bc#lengyueshengong", "book/bc#hujiadaofa", "book/book#sixiangbu",
	    "eq/lv3/kw_dao", "res/xiongdan"
	];

		this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#hujiadaofa", "book/book#sixiangbu"], odds: 2100 },
	    { obj: "book/bc#lengyueshengong", odds: 2900 },
	    { obj: "eq/lv3/kw_dao", odds: 250 },
	];
