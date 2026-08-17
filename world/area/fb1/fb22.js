this.inherits(AREA);
this.set({
    id: "bh",
    name: "冰火岛",
    desc: "北海冰火岛，一半冰川一半火山，极寒与极热并存。金毛狮王谢逊与屠龙刀曾藏于此，岛上火山熔岩中蕴藏着绝世宝物。",
    score: 210,
    is_show: true,
    first: "bh/haiyanshi",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 28000,
    pot: 24000,
    room_path: "bh/",
    ss_title: "金毛狮王"
});
this.map = [
    { n: "海岩石", id: "bh/haiyanshi", p: [0, 0], exits: ["w", "e"] },
    { n: "火山路", id: "bh/huoshanlu1", p: [-1, 0], exits: ["e", "w"] },
    { n: "火山路", id: "bh/huoshanlu2", p: [-2, 0], exits: ["e", "w"] },
    { n: "火山脚下", id: "bh/huoshanjiaoxia", p: [-3, 0], exits: ["e", "w", "n"] },
    { n: "熔岩洞", id: "bh/rongyandong1", p: [-3, 1], exits: ["s", "n"] },
    { n: "熔岩洞深处", id: "bh/rongyandong2", p: [-3, 2], exits: ["s", "n"] },
    { n: "熔岩洞底", id: "bh/rongyandong3", p: [-3, 3], exits: ["s"] },
    { n: "火山口", id: "bh/huoshan", p: [-4, 0], exits: ["e"] },
    { n: "丛林", id: "bh/conglin1", p: [1, 0], exits: ["e", "w"] },
    { n: "丛林", id: "bh/conglin2", p: [2, 0], exits: ["e", "w", "n"] },
    { n: "冰谷", id: "bh/binggu1", p: [2, 1], exits: ["s", "n"] },
    { n: "冰谷深处", id: "bh/binggu2", p: [2, 2], exits: ["s", "n"] },
    { n: "冰谷尽头", id: "bh/binggu3", p: [2, 3], exits: ["s"] },
    { n: "石山", id: "bh/shishan", p: [3, 0], exits: ["w"] }
];

// 冰火岛区域buff
this.ice_rooms = { 'bh/binggu1': 1, 'bh/binggu2': 1, 'bh/binggu3': 1, 'bh/conglin1': 1, 'bh/conglin2': 1 };
this.fire_rooms = { 'bh/huoshanlu1': 1, 'bh/huoshanlu2': 1, 'bh/huoshanjiaoxia': 1, 'bh/huoshan': 1, 'bh/rongyandong1': 1, 'bh/rongyandong2': 1, 'bh/rongyandong3': 1 };
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
