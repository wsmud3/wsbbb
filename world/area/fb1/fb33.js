this.inherits(AREA);
this.set({
    id: "cihang",
    name: "慈航静斋",
    desc: "慈航静斋隐于云雾缭绕的群山之巅，乃武林中最神秘的门派之一。天下四大奇书之一的慈航剑典便珍藏于此。江湖传言，浪翻云与庞斑两位绝世高手正在此约战，引动天下风云。",
    score: 330,
    is_show: true,
    first: "cihang/shanmen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    is_diffi: true,
    exp: 55000,
    pot: 46000,
    room_path: "cihang/",
    record_0: true,
    record_1: true,
    drop_npcs0: ["cihang/fanqinghui"],
    drop_npcs1: ["cihang/fanqinghui"]
});
this.map = [
    { n: "山门",     id: "cihang/shanmen",     p: [0, 0],  exits: ["n"] },
    { n: "前院",     id: "cihang/qianyuan",    p: [0, 1],  exits: ["n", "s"] },
    { n: "竹林",     id: "cihang/zhulin",      p: [0, 2],  exits: ["n", "s"] },
    { n: "七重门",   id: "cihang/qichongmen",  p: [0, 3],  exits: ["n", "w", "e", "s"] },
    { n: "赏雨亭",   id: "cihang/shangyuting", p: [-1, 3], exits: ["e", "w"] },
    { n: "听雨亭",   id: "cihang/tingyuting",  p: [1, 3],  exits: ["w"] },
    { n: "拦江岛",   id: "cihang/lanjiangdao", p: [0, 4],  exits: ["s"] },
    { n: "死关密室", id: "cihang/siguan",      p: [2, 3],  exits: ["w"] },
];
this.drops = [
    "book/bc#fuyujianfa",
    "book/bc#bianjiushi",
    "eq/lv5/wushen/feiyi_sword",
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#bianjiushi", odds: 2900 },
	    { obj: "eq/lv5/wushen/feiyi_sword", odds: 17 },
	    { obj: "book/bc#fuyujianfa", odds: 1800 },
	];

this.on_leaved = function (me) {
    me.remove_temp("qcm_step");
    me.remove_temp("qcm_path");
    me.remove_temp("cihang_route");
    me.remove_temp("cihang_spar_win");
    me.remove_temp("cihang_lanjiang_kills");
    me.remove_temp("cihang_lanjiang_done");
    me.remove_temp("cihang_yishu");
    me.remove_temp("cihang_yishu_got");
    me.remove_temp("cihang_siguan_ready");
    me.remove_status("cihang_lanjiang_lock", true);
};
