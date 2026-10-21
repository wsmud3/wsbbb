this.inherits(AREA);
this.set({
    id: "qc",
    name: "青城山",
    desc: "青城山松风如涛，道观隐于山林之间。青城派掌门余沧海以摧心掌和松风剑法闻名江湖，门下弟子众多。",
    score: 150,
    is_show: true,
    first: "qc/shanlu",
    is_copy: true,
    expend: 10,
    is_multi: false,
    exp: 14000,
    pot: 10000,
    room_path: "qc/",
    ss_title: "哈基米"
});
	this.map = [
	    { n: "三弯九倒", id: "qc/sanwan", p: [-2, 5], exits: ["sd", "eu"] },
	    { n: "古龙桥", id: "qc/gulongqiao", p: [-2, 6], exits: ["s", "nu"] },
	    { n: "天师洞", id: "qc/tianshidong", p: [-2, 7], exits: ["eastdown", "n"] },
	    { n: "青城山路", id: "qc/shanlu", p: [-2, 7], exits: ["westup"] },
	    { n: "上清殿", id: "qc/shangqingdian", p: [-1, 0], exits: ["s"] },
	    { n: "练武场", id: "qc/lianwuchang", p: [-1, 1], exits: ["s", "n", "e"] },
	    { n: "走廊", id: "qc/zoulang", p: [-1, 2], exits: ["s", "n"] },
	    { n: "穿廊门", id: "qc/zhongmen", p: [-1, 3], exits: ["s", "n"] },
	    { n: "松风观", id: "qc/songfengguan", p: [-1, 4], exits: ["n", "sd"] },
	    { n: "上清宫", id: "qc/shangqing", p: [-1, 5], exits: ["wd", "nu"] },
	    { n: "卧室", id: "qc/woshi", p: [0, 0], exits: ["s"] },
	    { n: "花园", id: "qc/huayuan", p: [0, 1], exits: ["w", "n"] },
	];
this.drops = [
    "book/bc#tagexing", "book/bc#cuixinzhang", "book/bc#songfengjianfa"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#tagexing", odds: 2100 },
	    { obj: ["book/bc#cuixinzhang", "book/bc#songfengjianfa"], odds: 2400 },
	];
