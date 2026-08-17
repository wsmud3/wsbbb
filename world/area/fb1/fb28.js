this.inherits(AREA);
this.set({
    id: "tl",
    name: "天龙寺",
    desc: "大理天龙寺，段氏皇家寺院，佛门武学圣地。寺中高僧云集，六脉神剑威震武林，枯荣禅功深不可测。",
    score: 270,
    is_show: true,
    first: "tl/damen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 40000,
    pot: 36000,
    room_path: "tl/",
    ss_title: "天龙尊者"
});
this.map = [
    { n: "山门", id: "tl/shanmen", p: [0, 0], exits: ["n"] },
    { n: "前殿", id: "tl/qiandian", p: [0, 1], exits: ["n", "s"] },
    { n: "中殿", id: "tl/zhongdian", p: [0, 2], exits: ["n", "s"] },
    { n: "大殿", id: "tl/dadian", p: [0, 3], exits: ["n", "s", "w"] },
    { n: "禅房", id: "tl/chanfang1", p: [-1, 3], exits: ["e", "n"] },
    { n: "禅房", id: "tl/chanfang2", p: [-1, 4], exits: ["s", "e"] },
    { n: "后殿", id: "tl/houdian", p: [0, 4], exits: ["n", "s", "w"] },
    { n: "枯荣禅房", id: "tl/kurongchanfang", p: [0, 5], exits: ["n", "s"] },
    { n: "大门", id: "tl/damen", p: [2, 0], exits: ["n", "s"] },
    { n: "舍利殿", id: "tl/sheli", p: [2, 1], exits: ["n", "w", "e", "s"] },
    { n: "无我殿", id: "tl/wuwo", p: [1, 1], exits: ["n", "e"] },
    { n: "无常殿", id: "tl/wuchang", p: [1, 0], exits: ["s"] },
    { n: "无乐殿", id: "tl/wule", p: [3, 1], exits: ["s", "w"] },
    { n: "无静阁", id: "tl/wujing", p: [3, 2], exits: ["n"] },
    { n: "崇圣殿", id: "tl/chongsheng", p: [2, 2], exits: ["n", "s"] },
    { n: "般若台", id: "tl/boruo", p: [2, 3], exits: ["n", "s"] },
    { n: "牟尼堂", id: "tl/muni", p: [2, 4], exits: ["s"] },
    { n: "龙树院", id: "tl/longshuyuan", p: [0, 6], exits: ["s"] }
];
	this.drops = [
	    "book/bc#tiannanbu",
	    "book/bc#duanjiajian",
	    "book/bc#kumushengong",
	    "book/bc#liumaishenjian",
	    "eq/lv5/wushen/longgu_jewels"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#tiannanbu", odds: 2100 },
	    { obj: "book/bc#duanjiajian", odds: 2400 },
	    { obj: "book/bc#kumushengong", odds: 2900 },
	    { obj: "book/bc#liumaishenjian", odds: 2900 },
	    { obj: "eq/lv5/wushen/longgu_jewels", odds: 17 },
	];

	// 离开副本时清理背负段誉状态
	this.on_leaved = function(me) {
	    if (me.query_temp('tl_carry_duanyu')) {
	        me.remove_temp('tl_carry_duanyu');
	        me.remove_status('carry_duanyu');
	        me.notify('<hiy>你离开了天龙寺，段誉从你背上下来了。</hiy>');
	    }
	};
