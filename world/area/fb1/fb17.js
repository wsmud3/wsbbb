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
	    { n: "太室阙", id: "ss/taishi", p: [0, 0], exits: ["n"] },
	    { n: "天中阁", id: "ss/tianzhongge", p: [0, -1], exits: ["n","s"] },
	    { n: "中岳大殿", id: "ss/dadian", p: [0, -2], exits: ["s"] },
	    { n: "险峻山道", id: "ss/shandao", p: [0, -3], exits: ["ne"] },
	    { n: "铁梁峡", id: "ss/tieliang", p: [1, -4], exits: ["sw"] },
	    { n: "朝天门", id: "ss/chaotianmen", p: [1, -5], exits: [] },
	    { n: "峻极山门", id: "ss/shanmen", p: [1, -5], exits: [] },
	    { n: "极顶山道", id: "ss/shandao2", p: [0, -5], exits: [] },
	    { n: "封禅台", id: "ss/fengshantai", p: [-1, -5], exits: [] },
	    { n: "前庭", id: "ss/qianting", p: [1, -6], exits: ["n"] },
	    { n: "峻极禅院", id: "ss/chanyuan", p: [1, -7], exits: ["s","n"] },
	    { n: "中门", id: "ss/zhongmen", p: [1, -8], exits: ["n","s"] },
	    { n: "会盟堂", id: "ss/huimengtang", p: [1, -9], exits: ["n","s","e","w"] },
	    { n: "西廊", id: "ss/xilang", p: [0, -9], exits: ["e"] },
	    { n: "东廊", id: "ss/donglang", p: [2, -9], exits: ["w"] },
	    { n: "剑池", id: "ss/jianchi", p: [1, -10], exits: ["s"] },
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