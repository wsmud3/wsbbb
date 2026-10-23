	this.inherits(AREA);
	this.set({
	    id: "ym",
	    name: "云梦沼泽",
	    desc: "云梦沼泽终年浓雾弥漫，泥泞难行，毒虫猛兽出没其间。传闻洪荒古泽深处有火龙盘踞，其鳞甲可炼制神兵宝甲。",
	    score: 170,
	    is_show: true,
	    first: "ym/rukou",
	    is_copy: true,
	    expend: 10,
	    is_multi: true,
	    exp: 20000,
	    pot: 16000,
	    room_path: "ym/",
	    ss_title: "黑沼之主"
	});
		this.map = [
	    { n: "森林", id: "ym/senlin", p: [0, 0], exits: ["e"] },
	    { n: "云梦沼泽", id: "ym/zhaoze3", p: [1, 0], exits: [] },
	    { n: "云梦沼泽", id: "ym/zhaoze1", p: [1, -1], exits: ["w","n"] },
	    { n: "云梦沼泽", id: "ym/zhaoze4", p: [2, -1], exits: [] },
	    { n: "云梦沼泽", id: "ym/zhaoze2", p: [1, -2], exits: ["s","n"] },
	    { n: "洪荒古泽", id: "ym/huozhao2", p: [1, -3], exits: ["n","s"] },
	    { n: "洪荒古泽", id: "ym/huangguze", p: [1, -4], exits: ["n"] },
	    { n: "洪荒古泽", id: "ym/huozhao1", p: [1, -5], exits: ["n"] },
	    { n: "洪荒古泽", id: "ym/huozhao4", p: [1, -6], exits: ["s"] },
	    { n: "围墙", id: "ym/weiqiang", p: [2, -2], exits: [] },
	    { n: "茅屋", id: "ym/maowu", p: [3, -2], exits: [] },
		];
	this.drops = [
	    "eq/lv3/hl_jian", "eq/lv3/hl_gun", "eq/lv3/hl_bian", "eq/lv3/hl_dao", "eq/lv3/hl_quan",
	    "res/huolongpi", "res/eyupi", "st/xuanjing",
	    "eq/lv2/lanbaoshi", "eq/lv2/hongbaoshi", "eq/lv2/lvbaoshi", "eq/lv2/huangbaoshi"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["res/huolongpi", "res/eyupi", "st/xuanjing"], odds: 10000 },
	    { obj: ["eq/lv2/lanbaoshi", "eq/lv2/hongbaoshi", "eq/lv2/lvbaoshi", "eq/lv2/huangbaoshi"], odds: 9300 },
	    { obj: ["eq/lv3/hl_jian", "eq/lv3/hl_gun", "eq/lv3/hl_bian", "eq/lv3/hl_dao", "eq/lv3/hl_quan"], odds: 250 },
	];
