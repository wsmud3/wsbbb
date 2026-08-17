this.inherits(AREA);
this.set({
    id: "wf",
    name: "温府",
    desc: "温府位于江南，是当地有名的武林世家。温家五兄弟武功高强，府中更藏着金蛇郎君留下的绝世武学秘籍。",
    score: 100,
    is_show: true,
    first: "wf/damen",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 9000,
    pot: 7000,
    room_path: "wf/",
    ss_title: "金蛇郎君"
});
this.map = [
    { n: "大门", id: "wf/damen", p: [0, 0], exits: ["s"] },
    { n: "大院", id: "wf/dayuan", p: [0, -1], exits: ["n", "s", "e"] },
    { n: "大厅", id: "wf/dating", p: [0, -2], exits: ["n", "s"] },
    { n: "东厢房", id: "wf/dongxiang", p: [1, -1], exits: ["n", "e"] },
    { n: "西厢房", id: "wf/xixiang", p: [2, -1], exits: ["w", "s"] },
    { n: "后厢房", id: "wf/houxiang", p: [2, -2], exits: ["n", "w"] },
    { n: "走廊", id: "wf/lang1", p: [0, -3], exits: ["n", "s"] },
    { n: "走廊", id: "wf/lang2", p: [0, -4], exits: ["n", "s", "w"] },
    { n: "走廊", id: "wf/lang3", p: [0, -5], exits: ["n", "s"] },
    { n: "走廊尽头", id: "wf/lang_end", p: [0, -6], exits: ["n", "s"] },
    { n: "木桩", id: "wf/muzhuang", p: [0, -7], exits: ["n", "s"] },
    { n: "金蛇郎君处", id: "wf/jinshe", p: [0, -8], exits: ["n"] },

	];
	this.drops = [
	    "book/bc#jinshejianfa",
	    "book/bc#jinsheyoushenbu",
	    "book/bc#jinsheyoushenzhang",
	    "book/bc#baguaquan",
	    "book/bc#baguagunfa",
	    "eq/lv3/wf_jian",
	    "eq/lv3/wf_gun",
	    "eq/lv2/wf_pifeng",
	    "eq/lv2/wf_jie",
	    "eq/lv1/jinshezhui",
	    "eq/lv2/wf_xiangnang"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#baguaquan", "book/bc#baguagunfa", "eq/lv1/jinshezhui"], odds: 2100 },
	    { obj: ["book/bc#jinshejianfa", "book/bc#jinsheyoushenbu", "book/bc#jinsheyoushenzhang"], odds: 2400 },
	    { obj: ["eq/lv2/wf_pifeng", "eq/lv2/wf_jie", "eq/lv2/wf_xiangnang"], odds: 9300 },
	    { obj: ["eq/lv3/wf_jian", "eq/lv3/wf_gun"], odds: 250 },
	];
