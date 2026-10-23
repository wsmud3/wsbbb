this.inherits(AREA);
this.set({
    id: "bh",
    name: "冰火岛",
    desc: "北海冰火岛，一半冰川一半火山，极寒与极热并存。金毛狮王谢逊与屠龙刀曾藏于此，岛上火山熔岩中蕴藏着绝世宝物。",
    score: 210,
    is_show: true,
    first: "bh/haibian",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 28000,
    pot: 24000,
    room_path: "bh/",
    ss_title: "金毛狮王"
});
		this.map = [
	    { n: "海边岩石", id: "bh/haibian", p: [0, 0], exits: ["n"] },
	    { n: "岩石路", id: "bh/yslu1", p: [-1, 0], exits: ["e","w"] },
	    { n: "岩石路", id: "bh/yslu2", p: [-2, 0], exits: ["e","w"] },
	    { n: "火山脚下", id: "bh/huoshanjiao", p: [-3, 0], exits: ["w"] },
	    { n: "火山", id: "bh/huoshan1", p: [-4, 0], exits: ["e"] },
	    { n: "丛林", id: "bh/conglin1", p: [0, -1], exits: ["n"] },
	    { n: "丛林", id: "bh/conglin2", p: [0, -2], exits: ["n","s"] },
	    { n: "石山", id: "bh/shishan", p: [0, -3], exits: ["w","s","n"] },
	    { n: "石山", id: "bh/shishan2", p: [-1, -3], exits: [] },
	    { n: "熊洞", id: "bh/xiongdong", p: [0, -4], exits: ["out"] },
	    { n: "小洞", id: "bh/xiaodong", p: [-1, -4], exits: [] },
		];

// 冰火岛区域buff
this.ice_rooms = { 'bh/conglin1': 1, 'bh/conglin2': 1 };
this.fire_rooms = { 'bh/yslu1': 1, 'bh/yslu2': 1, 'bh/huoshanjiao': 1, 'bh/huoshan1': 1 };
this.on_enterd = function(me) {
    me.set_temp('bh_clear', 0);
};
this.on_leaved = function(me) {
    me.remove_status('bh_ice');
    me.remove_status('bh_fire');
    me.remove_temp('bh_ice_stack');
    me.remove_temp('bh_fire_stack');
};
// Room-level buff will be applied via room on_enter
this.drops = [
	    "book/bc#qingfushenfa",
	    "book/bc#qishangquan",
	    "eq/lv4/lihuozhu",
	    "eq/lv5/wushen/tulong_blade",
	    "eq/lv3/longhuozhi",
	    "st/xuanjing",
	    "eq/lv2/lanbaoshi",
	    "eq/lv2/hongbaoshi",
	    "eq/lv2/lvbaoshi",
	    "eq/lv2/huangbaoshi",
	    "eq/lv3/jingzhihongbaoshi",
	    "eq/lv3/jingzhilanbaoshi",
	    "eq/lv3/jingzhilvbaoshi"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#qingfushenfa", "st/xuanjing"], odds: 2100 },
	    { obj: "book/bc#qishangquan", odds: 2400 },
	    { obj: ["eq/lv2/lanbaoshi", "eq/lv2/hongbaoshi", "eq/lv2/lvbaoshi", "eq/lv2/huangbaoshi"], odds: 9300 },
	    { obj: ["eq/lv3/longhuozhi", "eq/lv3/jingzhihongbaoshi", "eq/lv3/jingzhilanbaoshi", "eq/lv3/jingzhilvbaoshi"], odds: 250 },
	    { obj: "eq/lv4/lihuozhu", odds: 90 },
	    { obj: "eq/lv5/wushen/tulong_blade", odds: 17 },
	];
