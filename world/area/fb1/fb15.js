		this.inherits(AREA);
		this.set({
		    id: "hs2",
		    name: "衡山",
		    desc: "衡山为五岳之南岳，山色秀丽，云雾缥缈。刘正风金盆洗手之际，嵩山派前来发难，更有魔教长老曲洋现身，一场武林风波就此展开。",
		    score: 160,
		    is_show: true,
		    first: "hs2/hengyang",
		    is_copy: true,
		    expend: 10,
		    is_multi: false,
		    exp: 16000,
		    pot: 12000,
		    room_path: "hs2/",
		    ss_title: "娜美鲁多"
		});
			this.map = [
	    { n: "山涧", id: "hs2/shanjian", p: [-2, 0], exits: ["e"] },
	    { n: "林间小道", id: "hs2/xiaolu", p: [-1, 0], exits: ["e", "w"] },
	    { n: "刘府大门", id: "hs2/liufudamen", p: [0, -1], exits: ["s", "n"] },
	    { n: "衡阳西街", id: "hs2/jiedao", p: [0, 0], exits: ["n", "e", "w"] },
	    { n: "衡阳城", id: "hs2/hengyang", p: [1, 0], exits: ["w", "e"] },
	    { n: "山路", id: "hs2/shanlu", p: [2, 0], exits: ["w", "se"] },
	    { n: "南天门", id: "hs2/nantianmen", p: [3, 1], exits: ["nw", "s"] },
	    { n: "狮子岩", id: "hs2/shiziyan", p: [3, 2], exits: ["e", "n"] },
	    { n: "望日台", id: "hs2/wangritai", p: [4, 2], exits: ["s", "w"] },
	    { n: "祝融殿", id: "hs2/zhurongdian", p: [4, 3], exits: ["n", "s"] },
	    { n: "祝融峰", id: "hs2/zhurongfeng", p: [4, 4], exits: ["n"] },
	];
		this.drops = [
		    "book/bc#chuanyunzong",
		    "book/bc#liuyunzhang",
		    "book/bc#zhenyuejue",
		    "book/bc#hengshanwushenjian",
		    "eq/lv2/hs2_qin",
		    "eq/lv3/hs2_qinhuan",
		    "eq/lv3/hs2_pao"
		];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#chuanyunzong", "book/bc#liuyunzhang"], odds: 2100 },
	    { obj: ["book/bc#zhenyuejue", "book/bc#hengshanwushenjian"], odds: 2400 },
	    { obj: "eq/lv2/hs2_qin", odds: 9300 },
	    { obj: ["eq/lv3/hs2_qinhuan", "eq/lv3/hs2_pao"], odds: 250 },
	];