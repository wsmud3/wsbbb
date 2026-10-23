this.inherits(AREA);
this.set({
    id: "jncz",
    name: "净念禅宗",
    desc: "净念禅宗隐于深山之中，乃佛门武学圣地。天僧祖师在此参禅三百年，长生诀已臻化境。寺中藏有传国至宝和氏璧，更有如来神掌、伏魔杖等佛门绝学流传。江湖中人无不向往，却鲜有人能踏足此地。",
    score: 310,
    is_show: true,
    first: "jncz/shanmen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 50000,
    pot: 42000,
    room_path: "jncz/",
    record_0: true
});
		this.map = [
	    { n: "山门", id: "jncz/shanmen", p: [0, 0], exits: ["n","ne"] },
	    { n: "石阶", id: "jncz/shijie", p: [0, -1], exits: ["s","n"] },
	    { n: "殿门", id: "jncz/dianmen", p: [0, -2], exits: ["s","n"] },
	    { n: "钟楼", id: "jncz/zhonglou", p: [-1, -7], exits: ["e","n"] },
	    { n: "铜殿", id: "jncz/tongdian", p: [0, -8], exits: ["s"] },
	    { n: "山路", id: "jncz/xiaolu", p: [1, -1], exits: ["sw","n"] },
	    { n: "崖底", id: "jncz/yadi", p: [3, -4], exits: ["s"] },
	    { n: "长生门", id: "jncz/changshengmen", p: [0, -10], exits: [] },
		];
this.drops = [
    "eq/lv5/wushen/xiedisheli",
    "eq/lv5/wushen/jingangfumozhang",
    "book/bc#rulaishenzhang",
    "book/bc#fumozhang",
    "book/bc#wunianchangong",
    "book/bc#zhenyanshouyin",
    "book/bc#changshengjue",
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#rulaishenzhang", "book/bc#fumozhang", "book/bc#wunianchangong", "book/bc#zhenyanshouyin"], odds: 2900 },
	    { obj: ["eq/lv5/wushen/xiedisheli", "eq/lv5/wushen/jingangfumozhang"], odds: 17 },
	    { obj: "book/bc#changshengjue", odds: 1800 },
	];

// 离开副本时清理和氏璧相关状态
this.on_leaved = function(me) {
    if (me.query_status("heshibi_carry")) {
        me.remove_status("heshibi_carry");
        me.notify('<hiy>你离开了净念禅宗，和氏璧的力量从你身上消散。</hiy>');
    }
    me.remove_temp("jncz_stolen");
    me.remove_temp("jncz_ambush");
    me.remove_temp("jncz_wangsheng_passed");
};
