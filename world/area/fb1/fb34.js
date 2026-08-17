this.inherits(AREA);
this.set({
	id: "zhanshen",
	name: "战神殿",
	desc: "战神殿，远古神魔大战后遗落人间的最后一座神殿。殿中封存着上古战神蚩尤的残魂，唯有踏破九重天者，方能登临武神之境。江湖传闻，此地乃武道终极，万古以来无人能及。",
	score: 350,
	is_show: true,
	first: "zhanshen/shanmen",
	is_copy: true,
	expend: 10,
	is_multi: false,
	drop_npcs0: ["zhanshen/chiyou"],
	exp: 60000,
	pot: 50000,
	room_path: "zhanshen/",
	unlock_index: 33,
	record_0: true,
	ss_title: "踏破九重天"
});
this.map = [
	{ n: "山门",       id: "zhanshen/shanmen",       p: [0, 0], exits: ["n"] },
	{ n: "神道",       id: "zhanshen/shendao",       p: [0, 1], exits: ["n", "s"] },
	{ n: "前殿",       id: "zhanshen/qiandian",      p: [0, 2], exits: ["n", "s"] },
	{ n: "九重天",     id: "zhanshen/jiuchongtian",  p: [0, 3], exits: ["n", "s"] },
	{ n: "武神殿",     id: "zhanshen/wushendian",    p: [0, 4], exits: ["s"] }
];
this.drops = [];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	];


this.on_quick_over = function (me) {
	var count = me.add_temp("zhanshen_sweep", 1);
	if (count >= 200) {
		me.remove_temp("zhanshen_sweep");
		var frag = Math.random() < 0.5 ?
			"eq/lv6/wushen/shenhunsuipian" :
			"eq/lv6/wushen/shenqisuipian";
		var obj = me.add_obj(frag, 1);
		if (obj) {
			me.notify("\n<hig>扫荡之余，你在战神殿的废墟中发现了一" + obj.unit + obj.color_name + "！</hig>");
		}
	}
};
