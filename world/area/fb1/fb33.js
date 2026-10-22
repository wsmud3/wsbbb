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
	    { n: "赏雨亭", id: "cihang/shangyuting", p: [-2, 2], exits: ["e"] },
	    { n: "拦江岛", id: "cihang/lanjiangdao", p: [-2, 6], exits: [] },
	    { n: "碎石小路", id: "cihang/xiaolu2", p: [-1, 2], exits: ["e", "w"] },
	    { n: "山门", id: "cihang/shanmen", p: [0, 0], exits: ["s"] },
	    { n: "七重门", id: "cihang/qichongmen", p: [0, 1], exits: ["s"] },
	    { n: "广场", id: "cihang/guangchang", p: [0, 2], exits: ["n", "s", "e", "w"] },
	    { n: "慈航殿", id: "cihang/zhudian", p: [0, 3], exits: ["n"] },
	    { n: "碎石小路", id: "cihang/xiaolu1", p: [1, 2], exits: ["s", "e", "w"] },
	    { n: "碎石小路", id: "cihang/xiaolu3", p: [1, 3], exits: ["n", "s"] },
	    { n: "茶园", id: "cihang/chayuan", p: [1, 4], exits: ["n"] },
	    { n: "听雨亭", id: "cihang/tingyuting", p: [2, 2], exits: ["s"] },
	    { n: "典藏塔", id: "cihang/diancangta", p: [2, 3], exits: ["n"] },
	    { n: "石窟", id: "cihang/shiku", p: [2, 4], exits: [] },
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
    me.remove_temp("cihang_qcm");
    me.remove_temp("cihang_done");
    me.remove_temp("cihang_yishu_given");
    me.remove_status("cihang_lanjiang_lock", true);
};
