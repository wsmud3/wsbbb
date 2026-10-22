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
	    { n: "侧房", id: "wf/wen3", p: [-2, -4], exits: ["e"] },
	    { n: "侧房", id: "wf/wen2", p: [-2, -3], exits: ["e"] },
	    { n: "走廊", id: "wf/lang2", p: [-1, -4], exits: ["s", "w", "ne"] },
	    { n: "走廊", id: "wf/lang1", p: [-1, -3], exits: ["n", "w", "se"] },
	    { n: "亭子", id: "wf/tingzi", p: [0, -6], exits: ["s"] },
	    { n: "走廊尽头", id: "wf/lang_end", p: [0, -5], exits: ["n", "se", "sw"] },
	    { n: "大厅", id: "wf/dating", p: [0, -2], exits: ["s", "ne", "nw"] },
	    { n: "大院", id: "wf/dayuan", p: [0, -1], exits: ["n"] },
	    { n: "大门", id: "wf/damen", p: [0, 0], exits: ["n"] },
	    { n: "走廊", id: "wf/lang3", p: [1, -4], exits: ["s", "e", "nw"] },
	    { n: "走廊", id: "wf/zoulang4", p: [1, -3], exits: ["n", "e", "sw"] },
	    { n: "侧房", id: "wf/wen4", p: [2, -4], exits: ["w"] },
	    { n: "侧房", id: "wf/wen5", p: [2, -3], exits: ["w"] },
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
