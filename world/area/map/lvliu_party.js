	this.inherits(AREA);
	this.set({
	    id: "lvliu_party",
	    name: "绿柳山庄",
	    desc: "帮派副本：赵敏的绿柳山庄，庄内机关重重，玄冥二老镇守其中。",
	    first: "lvliu/menqian",
	    room_path: "lvliu/",
	    is_copy: true,
	    not_fb: true
	});
	this.query_owner = function (me) {
	    return me.query_temp("pt");
	};
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
