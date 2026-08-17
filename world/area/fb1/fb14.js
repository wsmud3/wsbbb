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
    { n: "山路", id: "qc/shanlu", p: [0, 0], exits: ["s"] },
    { n: "松风观", id: "qc/songfengguan", p: [0, -1], exits: ["n", "s"] },
    { n: "练武场", id: "qc/lianwuchang", p: [0, -2], exits: ["n", "s"] },
    { n: "上清殿", id: "qc/shangqingdian", p: [0, -3], exits: ["n", "s", "e"] },
    { n: "后山剑洞", id: "qc/jiandong1", p: [1, -3], exits: ["w", "n"] },
    { n: "剑洞深处", id: "qc/jiandong2", p: [1, -4], exits: ["s", "n"] },
    { n: "剑洞尽头", id: "qc/jiandong3", p: [1, -5], exits: ["s", "w"] },
    { n: "花园", id: "qc/huayuan", p: [0, -4], exits: ["n", "s"] },
    { n: "卧室", id: "qc/woshi", p: [0, -5], exits: ["n"] }
];
this.drops = [
    "book/bc#tagexing", "book/bc#cuixinzhang", "book/bc#songfengjianfa"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: "book/bc#tagexing", odds: 2100 },
	    { obj: ["book/bc#cuixinzhang", "book/bc#songfengjianfa"], odds: 2400 },
	];
