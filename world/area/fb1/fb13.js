	this.inherits(AREA);
	this.set({
	    id: "hs",
	    name: "恒山",
	    desc: "恒山为五岳之一，山势险峻，白云缭绕。恒山派由定静、定闲、定仪三位师太执掌，剑法轻灵，身法飘逸，名震武林。",
	    score: 130,
	    is_show: true,
	    first: "hs/shanlu",
	    is_copy: true,
	    expend: 10,
	    is_multi: false,
	    exp: 10000,
	    pot: 8000,
	    room_path: "hs/",
	    ss_title: "采花大盗"
	});
	this.map = [
    { n: "山路", id: "hs/shanlu", p: [0, 0], exits: ["s"] },
    { n: "山门", id: "hs/shanmen", p: [0, -1], exits: ["n", "s", "e"] },
    { n: "悬空寺", id: "hs/xuankongsi", p: [1, -1], exits: ["w", "e"] },
    { n: "悬空栈道", id: "hs/xuankongzhandao", p: [2, -1], exits: ["w", "e"] },
    { n: "见性峰", id: "hs/jianxingfeng", p: [3, -1], exits: ["w"] },
    { n: "前厅", id: "hs/qianting", p: [0, -2], exits: ["n", "s"] },
    { n: "大厅", id: "hs/dating", p: [0, -3], exits: ["n", "s"] },
    { n: "后殿", id: "hs/houdian", p: [0, -4], exits: ["n"] }
];
	this.drops = [
	    "book/bc#baiyunxinfa", "book/bc#hengshanjianfa",
	    "book/bc#tianchangzhang", "book/bc#kuangfengkuaidao",
	    "book/bc#hengshanshenfa",
	    "eq/lv3/hs_dao", "eq/lv3/hs_mianzhao"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#hengshanshenfa", odds: 2100 },
	    { obj: ["book/bc#baiyunxinfa", "book/bc#hengshanjianfa", "book/bc#tianchangzhang", "book/bc#kuangfengkuaidao"], odds: 2400 },
	    { obj: ["eq/lv3/hs_dao", "eq/lv3/hs_mianzhao"], odds: 250 },
	];
