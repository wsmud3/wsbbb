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
	    { n: "森林", id: "ym/senlin", p: [0, 2], exits: ["s"] },
	    { n: "入口", id: "ym/rukou", p: [0, 1], exits: ["s"] },
	    { n: "沼泽", id: "ym/zhaoze1", p: [0, 0], exits: ["n", "s"] },
	    { n: "沼泽", id: "ym/zhaoze2", p: [0, -1], exits: ["n", "s"] },
	    { n: "沼泽", id: "ym/zhaoze3", p: [0, -2], exits: ["n", "s"] },
	    { n: "芦苇荡", id: "ym/zhaoze4", p: [0, -3], exits: ["n", "s"] },
	    { n: "沼泽深处", id: "ym/long1", p: [0, -4], exits: ["n", "s"] },
	    { n: "沼泽深处", id: "ym/long2", p: [0, -5], exits: ["n", "s"] },
	    { n: "沼泽深处", id: "ym/long3", p: [0, -6], exits: ["n", "s"] },
	    { n: "洪荒古泽", id: "ym/huangguze", p: [0, -7], exits: ["n"] },
	    { n: "泥潭", id: "ym/nitan", p: [2, -1], exits: ["n", "e", "s"] },
	    { n: "沼泽深处", id: "ym/shendi1", p: [3, -1], exits: ["w", "n", "s"] },
	    { n: "沼泽深处", id: "ym/shendi2", p: [2, -2], exits: ["n", "e", "s"] },
	    { n: "大泽", id: "ym/daze", p: [2, -3], exits: ["n", "s"] },
	    { n: "泥沼", id: "ym/nizhao", p: [2, -4], exits: ["n", "s"] },
	    { n: "沼泽尽头", id: "ym/zhaozejintou", p: [2, -5], exits: ["n"] },
	    { n: "毒沼", id: "ym/duzhao1", p: [4, -1], exits: ["w", "s"] },
	    { n: "毒沼深处", id: "ym/duzhao2", p: [4, -2], exits: ["n", "e", "w"] },
	    { n: "毒沼边缘", id: "ym/duzhao3", p: [5, -2], exits: ["w", "s"] },
	    { n: "干地", id: "ym/gandi", p: [3, -3], exits: ["n", "w"] },
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
