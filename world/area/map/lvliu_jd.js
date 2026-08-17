	this.inherits(AREA);
	this.set({
	    id: "lvliu_jd",
	    name: "绿柳山庄",
	    desc: "禁地挑战：独闯赵敏的绿柳山庄，层层突破，挑战自我极限。",
	    first: "lvliu/menqian",
	    room_path: "lvliu/",
	    is_copy: true,
	    expend: 0,
	    exp: 0,
	    pot: 0,
	    jd_index: 1
	});
	this.map = [
	    { n: "山庄门前", id: "lvliu/menqian", p: [0, 0], exits: ["north"] },
	    { n: "前厅", id: "lvliu/qianting", p: [0, -1], exits: ["south", "north"] },
	    { n: "长廊一", id: "lvliu/zoulang1", p: [0, -2], exits: ["south", "north"] },
	    { n: "长廊二", id: "lvliu/zoulang2", p: [0, -3], exits: ["south", "north"] },
	    { n: "花园", id: "lvliu/huayuan", p: [0, -4], exits: ["south", "north"] },
	    { n: "后厅", id: "lvliu/houting", p: [0, -5], exits: ["south", "north"] },
	    { n: "密室", id: "lvliu/mishi", p: [0, -6], exits: ["south", "north"] },
	    { n: "地牢", id: "lvliu/dilao", p: [0, -7], exits: ["south"] },
	];
