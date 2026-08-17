	this.inherits(AREA);
	this.set({
	    id: "by",
	    name: "兵营",
	    desc: "这是扬州城兵营，扬州守备史青山就驻扎在这里",
	    score: 100,
	    is_show: true,
	    first: "yz/by/damen",
	    is_copy: true,
	    expend: 10,
	    is_multi: false,
	    exp: 3000,
	    pot: 3000,
	    room_path: "yz/by/",
	    ss_title: "扬州守备"
	});
	this.map = [
	        { n: "大门", id: "yz/by/damen", p: [0, 0], exits: ["s"] },
	                    { n: "兵营", id: "yz/by/bingying", p: [0, 1], exits: ["n", "s"] },
	                    { n: "兵器库", id: "yz/by/bingqiku", p: [0, 2], exits: ["n"] }
	];
	this.drops = ["book/book#blade", "book/book#sword", "eq/lv2/jiangjunjian", "eq/lv1/jundao", "eq/lv1/junfu", "eq/lv1/qimeigun", "eq/lv1/guanfu"];

		this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/book#blade", "book/book#sword", "eq/lv1/jundao", "eq/lv1/junfu", "eq/lv1/qimeigun", "eq/lv1/guanfu"], odds: 10000 },
	    { obj: "eq/lv2/jiangjunjian", odds: 9300 },
	];