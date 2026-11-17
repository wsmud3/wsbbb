	this.inherits(AREA);
	this.set({
	    id: "hs",
	    name: "恒山",
	    desc: "恒山为五岳之一，山势险峻，白云缭绕。恒山派由定静、定闲、定仪三位师太执掌，剑法轻灵，身法飘逸，名震武林。",
	    score: 100,
	    is_show: true,
	    first: "hs/daziling",
	    is_copy: true,
	    expend: 10,
	    is_multi: false,
	    exp: 10000,
	    pot: 8000,
	    room_path: "hs/",
	    ss_title: "采花大盗"
	});
		this.map = [
	    { n: "见性峰", id: "hs/jianxingfeng", p: [0, 0], exits: ["n","sd"] },
	    { n: "白云庵", id: "hs/baiyunan", p: [0, -1], exits: ["n","s","e","w"] },
	    { n: "后殿", id: "hs/houdian", p: [0, -2], exits: ["s"] },
	    { n: "东廊", id: "hs/donglang", p: [1, -1], exits: ["n","w"] },
	    { n: "西廊", id: "hs/xilang", p: [-1, -1], exits: ["n","e"] },
	    { n: "练功房", id: "hs/liangongfang", p: [1, -2], exits: ["s"] },
	    { n: "斋堂", id: "hs/zaitang", p: [-1, -2], exits: ["s"] },
	    { n: "北岳殿", id: "hs/beiyuedian", p: [-1, 0], exits: ["nu","e"] },
	    { n: "山道", id: "hs/shandao", p: [-1, 1], exits: ["nu","se"] },
	    { n: "果老岭", id: "hs/guolaoling", p: [0, 2], exits: ["se","nw","nu"] },
	    { n: "通元谷", id: "hs/tongyuangu", p: [0, 1], exits: ["sd"] },
	    { n: "虎风口", id: "hs/hufengkou", p: [1, 3], exits: ["nw","sd"] },
	    { n: "大字岭", id: "hs/daziling", p: [1, 4], exits: ["nu"] },
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
