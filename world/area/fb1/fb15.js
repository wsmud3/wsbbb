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
	    { n: "山涧", id: "hs2/shanjian", p: [-3, 0], exits: ["e"] },
	    { n: "竹林", id: "hs2/zhulin", p: [-3, 5], exits: ["s"] },
	    { n: "琴舍", id: "hs2/qinshe", p: [-3, 6], exits: ["n", "s"] },
	    { n: "后花园", id: "hs2/huayuan", p: [-3, 7], exits: ["n"] },
	    { n: "刘府大厅", id: "hs2/liufudating", p: [-2, -3], exits: ["s"] },
	    { n: "刘府后厅", id: "hs2/liufuhouting", p: [-2, -2], exits: ["n"] },
	    { n: "林间小道", id: "hs2/xiaolu", p: [-2, 0], exits: ["e", "w"] },
	    { n: "刘府大门", id: "hs2/liufudamen", p: [-1, -3], exits: [] },
	    { n: "刘府大院", id: "hs2/liufudayuan", p: [-1, -2], exits: ["n"] },
	    { n: "刘府大门", id: "hs2/liufumen", p: [-1, -1], exits: ["n", "s"] },
	    { n: "衡阳西街", id: "hs2/jiedao", p: [-1, 0], exits: ["n", "e", "w"] },
	    { n: "衡阳城", id: "hs2/hengyang", p: [0, 0], exits: ["e", "w"] },
	    { n: "山路", id: "hs2/shanlu", p: [1, 0], exits: ["w", "se"] },
	    { n: "南天门", id: "hs2/nantianmen", p: [2, 1], exits: ["s", "nw"] },
	    { n: "狮子岩", id: "hs2/shiziyan", p: [2, 2], exits: ["n", "e"] },
	    { n: "望日台", id: "hs2/wangritai", p: [3, 2], exits: ["s", "w"] },
	    { n: "祝融殿", id: "hs2/zhurongdian", p: [3, 3], exits: ["n", "s"] },
	    { n: "祝融峰", id: "hs2/zhurongfeng", p: [3, 4], exits: ["n"] },
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