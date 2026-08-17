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
    { n: "山门",       id: "jncz/shanmen",          p: [0, 0],  exits: ["n"] },
    { n: "放生池",     id: "jncz/fangshengchi",      p: [0, 1],  exits: ["n", "s"] },
    { n: "前院",       id: "jncz/qianyuan",          p: [0, 2],  exits: ["n", "e", "w", "s"] },
    { n: "大雄宝殿",   id: "jncz/daxiongbaodian",    p: [0, 3],  exits: ["n", "s"] },
    { n: "观音殿",     id: "jncz/guanyindian",       p: [0, 4],  exits: ["n", "s"] },
    { n: "后山崖",     id: "jncz/houshanya",         p: [0, 5],  exits: ["n", "s", "e"] },
    { n: "天僧禅房",   id: "jncz/tiansengchanfang",  p: [0, 6],  exits: ["s"] },
    { n: "往生径",     id: "jncz/wangshengjing",      p: [1, 5],  exits: ["w", "e"] },
    { n: "问心台",     id: "jncz/wenxintai",          p: [2, 5],  exits: ["w", "e"] },
    { n: "生门",       id: "jncz/shengmen",           p: [3, 5],  exits: ["w"] },
    { n: "崖底",       id: "jncz/yadi",              p: [1, 6],  exits: ["w"] },
    { n: "邪王石窟",   id: "jncz/xiewangshiku",     p: [0, 6],  exits: ["e"] },
    { n: "禅院",       id: "jncz/chanyuan",          p: [-1, 2], exits: ["e", "n"] },
    { n: "戒律院",     id: "jncz/jielvyuan",         p: [-1, 3], exits: ["s"] },
    { n: "藏经阁",     id: "jncz/cangjingge",        p: [1, 2],  exits: ["w", "n"] },
    { n: "密室",       id: "jncz/mishi",             p: [1, 3],  exits: ["s"] }
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
