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
    { n: "山脚", id: "pm/shanjiao", p: [0, 0], exits: ["n"] },
    { n: "山道", id: "pm/shandao1", p: [0, 1], exits: ["n", "s"] },
    { n: "山道", id: "pm/shandao2", p: [0, 2], exits: ["n", "s", "e"] },
    { n: "山涧", id: "pm/shanjian", p: [1, 2], exits: ["w", "e"] },
    { n: "瀑布", id: "pm/pubu", p: [2, 2], exits: ["w", "s"] },
    { n: "悬崖边", id: "pm/xuanyabian", p: [0, 3], exits: ["n", "s"] },
    { n: "山顶", id: "pm/shanding", p: [0, 4], exits: ["n", "s"] },
    { n: "灵鹫宫", id: "pm/lingjiugong", p: [0, 5], exits: ["n", "s"] },
    { n: "大殿", id: "pm/dadian", p: [0, 6], exits: ["n", "s"] },
    { n: "密室", id: "pm/mishi", p: [0, 7], exits: ["s", "n"] },
    { n: "李秋水居", id: "pm/liqiushui", p: [0, 8], exits: ["s"] }
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
