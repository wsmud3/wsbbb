	this.inherits(AREA);
	this.set({
	    id: "xy_party",
	    name: "帮派守城",
	    desc: "帮派守卫襄阳副本，只有本帮派成员可以进入。",
	    is_area: true,
	    first: "xy_party/guangchang",
	    index: 11,
	    room_path: "xy_party/",
	    is_copy: true,
	    not_fb: true
	});

	this.map = [
	    { n: "中央广场", id: "xy_party/guangchang", p: [0, 0], exits: ["west", "east", "south", "north"] },
	    { n: "东大街", id: "xy_party/eastjie1", p: [1, 0] },
	    { n: "东大街", id: "xy_party/eastjie2", p: [2, 0], exits: ["west", "east"] },
	    { n: "东大街", id: "xy_party/eastjie3", p: [3, 0] },
	    { n: "东门", id: "xy_party/eastgate1", p: [4, 0], exits: ["west", "east", "south", "north"] },
	    { n: "东门外", id: "xy_party/eastgate2", p: [5, 0] },
	    { n: "西大街", id: "xy_party/westjie1", p: [-1, 0] },
	    { n: "西大街", id: "xy_party/westjie2", p: [-2, 0], exits: ["west", "east"] },
	    { n: "西大街", id: "xy_party/westjie3", p: [-3, 0] },
	    { n: "西门", id: "xy_party/westgate1", p: [-4, 0], exits: ["west", "east", "south", "north"] },
	    { n: "西门外", id: "xy_party/westgate2", p: [-5, 0] },
	    { n: "南大街", id: "xy_party/southjie1", p: [0, 1] },
	    { n: "南大街", id: "xy_party/southjie2", p: [0, 2], exits: ["south", "north"] },
	    { n: "南大街", id: "xy_party/southjie3", p: [0, 3] },
	    { n: "南门", id: "xy_party/southgate1", p: [0, 4], exits: ["west", "east", "south", "north"] },
	    { n: "南门外", id: "xy_party/southgate2", p: [0, 5] },
	    { n: "北大街", id: "xy_party/northjie1", p: [0, -1] },
	    { n: "北大街", id: "xy_party/northjie2", p: [0, -2], exits: ["south", "north"] },
	    { n: "北大街", id: "xy_party/northjie3", p: [0, -3] },
	    { n: "北门", id: "xy_party/northgate1", p: [0, -4], exits: ["west", "east", "south", "north"] },
	    { n: "北门外", id: "xy_party/northgate2", p: [0, -5] },
	    { n: "城墙", id: "xy_party/walle1", p: [4, -1] },
	    { n: "城墙", id: "xy_party/walle2", p: [4, -2], exits: ["south", "north"] },
	    { n: "城墙", id: "xy_party/walle3", p: [4, -3] },
	    { n: "城墙", id: "xy_party/walle4", p: [4, -4], exits: ["south", "west"] },
	    { n: "城墙", id: "xy_party/walle5", p: [3, -4] },
	    { n: "城墙", id: "xy_party/walle6", p: [2, -4], exits: ["east", "west"] },
	    { n: "城墙", id: "xy_party/walle7", p: [1, -4] },
	    { n: "城墙", id: "xy_party/walle8", p: [-1, -4], exits: ["east", "west"] },
	    { n: "城墙", id: "xy_party/walle9", p: [-2, -4] },
	    { n: "城墙", id: "xy_party/walle10", p: [-3, -4], exits: ["east", "west"] },
	    { n: "城墙", id: "xy_party/walle11", p: [-4, -4] },
	    { n: "城墙", id: "xy_party/walle12", p: [-4, -3], exits: ["north", "south"] },
	    { n: "城墙", id: "xy_party/walle13", p: [-4, -2] },
	    { n: "城墙", id: "xy_party/walle14", p: [-4, -1], exits: ["north", "south"] },
	    { n: "城墙", id: "xy_party/walle15", p: [-4, 1] },
	    { n: "城墙", id: "xy_party/walle16", p: [-4, 2], exits: ["north", "south"] },
	    { n: "城墙", id: "xy_party/walle17", p: [-4, 3] },
	    { n: "城墙", id: "xy_party/walle18", p: [-4, 4], exits: ["north", "east"] },
	    { n: "城墙", id: "xy_party/walle19", p: [-3, 4] },
	    { n: "城墙", id: "xy_party/walle20", p: [-2, 4], exits: ["west", "east"] },
	    { n: "城墙", id: "xy_party/walle21", p: [-1, 4] },
	    { n: "城墙", id: "xy_party/walle22", p: [1, 4], exits: ["west", "east"] },
	    { n: "城墙", id: "xy_party/walle23", p: [2, 4] },
	    { n: "城墙", id: "xy_party/walle24", p: [3, 4], exits: ["west", "east"] },
	    { n: "城墙", id: "xy_party/walle25", p: [4, 4] },
	    { n: "城墙", id: "xy_party/walle26", p: [4, 3], exits: ["south", "north"] },
	    { n: "城墙", id: "xy_party/walle27", p: [4, 2] },
	    { n: "城墙", id: "xy_party/walle28", p: [4, 1], exits: ["south", "north"] },
	    { n: "兵营", id: "xy_party/bingying1", p: [2, 2] },
	    { n: "兵营内", id: "xy_party/bingying2", p: [2, 3], exits: ["south"] },
	];

	this.query_owner = function (me) {
	    return me.query_temp("pt");
	};

	// 仅帮派成员可进入
	this.on_enter = function (me) {
	    var pt = me.query_temp("pt");
	    if (!pt) {
	        return me.notify_fail("你还没有加入帮派，无法参与帮派守城。");
	    }
	    return true;
	};

	// 帮派守城操作按钮
	this.query_actions = function (me) {
	    let actions = [];
	    let status = WORLD.DATA.query_temp("xy_party_status", 0);
	    let pt = me.query_temp("pt");
	    if (!pt) return actions;

	    if (status === 0) {
	        actions.push(["systask xyparty start", "开启守城", "<mag>帮派守卫襄阳：开启后蒙古大军将在5分钟后攻城！</mag>"]);
	    } else if (status === 1) {
	        actions.push(["systask xyparty bm", "报名参战", "<mag>襄阳战事正紧，报名参与守城！</mag>"]);
	    } else if (status >= 10) {
	        actions.push(["systask xyparty reward", "领取军功", "<hig>战斗已结束，领取你的军功奖励！</hig>"]);
	    }
	    return actions;
	};
