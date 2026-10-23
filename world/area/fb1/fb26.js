this.inherits(AREA);
this.set({
    id: "pm",
    name: "缥缈峰",
    desc: "缥缈峰灵鹫宫，天山之巅，云雾缭绕。天山童姥威震西域，生死符控人生死，缥缈峰上藏有上乘武学秘笈。",
    score: 250,
    is_show: true,
    first: "pm/shanjiao",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 36000,
    pot: 32000,
    room_path: "pm/",
    ss_title: "灵鹫宫主"
});
		this.map = [
	    { n: "山脚", id: "pm/shanjiao", p: [0, 0], exits: ["nu"] },
	    { n: "断魂崖", id: "pm/ya", p: [0, -1], exits: ["nu","sd"] },
	    { n: "失足岩", id: "pm/yan", p: [0, -2], exits: ["nu","sd"] },
	    { n: "百丈涧", id: "pm/jian", p: [0, -3], exits: ["sd"] },
	    { n: "仙愁门", id: "pm/xianchou", p: [0, -4], exits: ["nu","sd"] },
	    { n: "青石大道", id: "pm/dadao", p: [0, -5], exits: ["n","sd"] },
	    { n: "独尊厅大门", id: "pm/damen", p: [0, -6], exits: ["n","s"] },
	    { n: "独尊厅", id: "pm/dating", p: [0, -7], exits: ["n","s"] },
	    { n: "长廊", id: "pm/changlang", p: [0, -8], exits: ["n","s","w","e"] },
	    { n: "花园", id: "pm/huayuan", p: [0, -9], exits: ["n","s","w","e"] },
	    { n: "戏凤阁", id: "pm/liangong", p: [-1, -8], exits: ["e"] },
	    { n: "蓼风轩", id: "pm/wuqi", p: [1, -8], exits: ["w"] },
	    { n: "憩凤阁", id: "pm/woshi", p: [-1, -9], exits: ["e"] },
	    { n: "藕香榭", id: "pm/chufang", p: [1, -9], exits: ["w"] },
	    { n: "小路", id: "pm/xiaodao", p: [0, -10], exits: ["n","s"] },
	    { n: "闭关室", id: "pm/biguan", p: [0, -11], exits: ["s"] },
		];
this.drops = [
    "book/bc#tianyuqijian",
    "book/bc#shenjianjue",
    "book/bc#bulaochangchungong",
    "eq/lv5/wushen/tianlong_necklace",
    "eq/lv4/zhuyandan"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#shenjianjue", odds: 2100 },
	    { obj: "book/bc#tianyuqijian", odds: 2400 },
	    { obj: "eq/lv4/zhuyandan", odds: 90 },
	    { obj: "book/bc#bulaochangchungong", odds: 2900 },
	    { obj: "eq/lv5/wushen/tianlong_necklace", odds: 17 },
	];

// 离开副本时清理背负状态
this.on_leaved = function(me) {
    me.remove_temp("pm_carry_tonglao");
    me.remove_status("carry_tonglao");
};
