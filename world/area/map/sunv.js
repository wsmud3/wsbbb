	this.inherits(FAMILY_AREA);
	this.set({
	    id: "sunv",
	    name: "素女道",
	    desc: "素女道隐于深山幽谷之中，传承自上古女仙一脉。门中皆为女子，以容貌与修为并重，武功柔中带刚，独步天下。当代玄女修为通玄，座下弟子皆是绝代佳人。",
	    sp: "只收女弟子，内功可驻颜不老，武功以柔克刚",
	    is_area: true,
	    first: "sunv/shanmen",
	    index: 10,
	    room_path: "sunv/",
	    family: "SUNV"
	});
	this.map = [
	    { n: "山门", id: "sunv/shanmen", p: [0, -3], exits: ["n"] },
	    { n: "前庭", id: "sunv/qianting", p: [0, -2], exits: ["s", "n"] },
	    { n: "素女广场", id: "sunv/guangchang", p: [0, -1], exits: ["s", "n", "e", "w", "nw", "se"] },
	    { n: "练功房", id: "sunv/liangong", p: [-1, 0], exits: ["se"] },
	    { n: "静修室", id: "sunv/jingxiu", p: [1, -2], exits: ["sw"] },
	    { n: "琼花园", id: "sunv/huayuan", p: [-1, -1], exits: ["e"] },
	    { n: "素女仙界", id: "sunv/xiujie", p: [0, 0], exits: ["s"] },
	    { n: "传承殿", id: "sunv/chuancheng", p: [1, -1], exits: ["w", "n"] },
	    { n: "无名宫殿", id: "sunv/wuming", p: [1, 0], exits: ["s"] }
	];
