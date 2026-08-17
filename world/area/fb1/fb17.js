		this.inherits(AREA);
		this.set({
		    id: "ss",
		    name: "嵩山",
		    desc: "中岳嵩山，气势磅礴，胜观峰上的峻极禅院乃是五岳剑派嵩山派的总舵。左冷禅在此网罗高手，图谋吞并五岳，会盟堂中暗藏杀机。",
		    score: 140,
		    first: "ss/taishique",
		    is_show: true,
		    is_copy: true,
		    expend: 10,
		    exp: 12000,
		    pot: 10000,
		    room_path: "ss/",
		    ss_title: "五岳盟主"
		});
		this.map = [
    { n: "太室阙", id: "ss/taishique", p: [0, 0], exits: ["e"] },
    { n: "中岳大殿", id: "ss/zhongyuedadian", p: [1, 0], exits: ["e", "w"] },
    { n: "峻极山门", id: "ss/junjishanmen", p: [2, 0], exits: ["e", "w"] },
    { n: "峻极禅院", id: "ss/junjichanyuan", p: [3, 0], exits: ["e", "w", "n"] },
    { n: "侧道", id: "ss/cedao", p: [3, 1], exits: ["s", "n"] },
    { n: "石碑林", id: "ss/shibeilin", p: [3, 2], exits: ["s", "n"] },
    { n: "达摩洞", id: "ss/damodong", p: [3, 3], exits: ["s", "n"] },
    { n: "封禅台", id: "ss/fengshantai", p: [3, 4], exits: ["s", "n"] },
    { n: "峻极峰", id: "ss/junjifeng", p: [3, 5], exits: ["s"] },
    { n: "中门", id: "ss/zhongmen", p: [4, 0], exits: ["e", "w"] },
    { n: "会盟堂", id: "ss/huimengtang", p: [5, 0], exits: ["w"] }
];
		this.drops = [
		    "book/bc#dasongyangshenzhang", "book/bc#songshanjianfa", "eq/lv3/ss_lingqi",
		    "eq/lv3/ss_pifeng", "book/bc#hanbingzhenqi"
		];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#dasongyangshenzhang", "book/bc#songshanjianfa"], odds: 2400 },
	    { obj: "book/bc#hanbingzhenqi", odds: 2900 },
	    { obj: ["eq/lv3/ss_lingqi", "eq/lv3/ss_pifeng"], odds: 250 },
	];