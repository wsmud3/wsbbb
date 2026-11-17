this.inherits(ROOM);
this.name = "桃花林";

// ────────────────────────────────────────────────────────────
// 桃花岛桃林迷阵（实测记录见 桃花岛破阵法.md）
//
//   海滩 --south--> 桃花林（本房间，迷阵）
//        描述会写「东南方向大概有 N 棵桃树」，N 决定用哪套 11 步走法
//        走对了原地继续走；走错立刻被弹回海滩（提示「一阵迷乱」）
//        11 步走完后再朝出口方向走一步，才出阵到 th/taolin 桃林出口
//
// 走法（中文→服务端方向）：
//   右下=southeast 左下=southwest 右上=northeast 左上=northwest
//   上=north 下=south 左=west 右=east
// ────────────────────────────────────────────────────────────
var TAO_CN = { 2: "二", 4: "四", 6: "六", 8: "八" };
var TAO_PAT = {
    2: {
        steps: ["southeast", "northwest", "north", "east", "southwest", "southwest",
            "east", "north", "northwest", "southeast", "east"],
        exit: "east"
    },
    4: {
        steps: ["southwest", "northeast", "east", "south", "northwest", "northwest",
            "south", "east", "northeast", "southwest", "south"],
        exit: "south"
    },
    6: {
        steps: ["southwest", "northeast", "north", "west", "southeast", "southeast",
            "west", "north", "northeast", "southwest", "west"],
        exit: "west"
    },
    8: {
        steps: ["northwest", "southeast", "east", "north", "southwest", "southwest",
            "north", "east", "southeast", "northwest", "north"],
        exit: "north"
    }
};
var TAO_NS = [2, 4, 6, 8];

// 每个副本实例各自随机一套（房间文件在建副本时会被重新执行一遍）
this.tao_n = TAO_NS[Math.floor(Math.random() * TAO_NS.length)];
this.desc = "这是一片桃花的海洋，四周栽了一些桃树，全是盛开的桃花，微风拂过，落英缤纷。"
    + "这里比较空旷，视野还算宽阔，能看到东南方向大概有" + TAO_CN[this.tao_n] + "棵桃树。";

// 八个方向先都挂上（真正能不能走由 on_leave 判），走错统一弹回海滩
this.exits = {
    "north": "th/tao0",
    "south": "th/tao0",
    "east": "th/tao0",
    "west": "th/tao0",
    "northeast": "th/tao0",
    "northwest": "th/tao0",
    "southeast": "th/tao0",
    "southwest": "th/tao0",
};
this.set_npc([]);

// ── 第二遍迷阵：山洞小路（攻略：问过黄蓉石匣后返回渔夫处，再走一遍迷阵，
//    其间注意地图变化，会多出一条路让你进入，看见山洞）──
// 问过石匣（副本存储 th_ask）且石匣还没交回时，迷阵走到第 TAO_CAVE_STEP 步，
// 本房间临时多出 enter 出口通往 th/shandong；离开迷阵（出阵/被弹回/进洞）就收起来。
// 步数、是否问过都存在副本存储（this.set_temp(me, …)），随副本销毁，不会带到下一轮。
var TAO_CAVE_STEP = 6;
// 走对一步时的景物描写（不显示步数，原先的「（3/11）」等于把破阵进度直接告诉玩家）
var TAO_WALK = [
    "你拨开低垂的桃枝，又往桃林深处走了几步。",
    "落英纷纷扬扬，你踏着满地花瓣继续前行。",
    "四下里桃树一株挨着一株，你辨了辨方向，走了过去。",
    "一阵风过，花瓣迷了眼，你定了定神，接着往前走。",
    "桃花香气浓得化不开，你屏住呼吸，绕过一株老桃树。"
];
var TAO_DESC = this.desc;

this.tao_show_cave = function (me) {
    if (this.exits && this.exits.enter) return;
    this.desc = TAO_DESC + "桃林间不知何时多出了一条极窄的小路，弯弯曲曲通向一个<hiy>山洞</hiy>。";
    this.add_exit("enter", "th/shandong");
    this.refresh(me);
    me.notify("<hiy>你忽然发现四周的桃树似乎挪动了位置，桃林间多出了一条小路，隐约通向一个山洞。</hiy>");
};
this.tao_hide_cave = function () {
    if (!this.exits || !this.exits.enter) return;
    this.desc = TAO_DESC;
    this.remove_exit("enter");
};
this.tao_want_cave = function (me) {
    return !!this.query_temp(me, "th_ask", 0) && !this.query_temp(me, "th_done", 0);
};
this.tao_reset = function (me) {
    this.set_temp(me, "th_tao_step", 0);
    this.tao_hide_cave();
};

// 注意：在 on_leave 里调 moveto 会再次触发本房间的 on_leave（同步递归），
// 所以自己放行的那一次移动先挂 _tao_leaving 标记让 on_leave 直接放行。
this.tao_move = function (me, path, msg) {
    this.tao_reset(me);
    if (msg) me.notify(msg);
    this._tao_leaving = me;
    try { me.moveto(path); }
    finally { this._tao_leaving = null; }
};

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (this._tao_leaving === me) return true;        // 我们自己放行的那一次
    if (!dir) {                                       // 不是走方向（例如 cr over 离开副本），一律放行
        this.tao_reset(me);
        return true;
    }
    if (dir === "enter") {                            // 第二遍迷阵露出的山洞小路
        if (this.exits && this.exits.enter && this.tao_want_cave(me)) {
            this.tao_reset(me);
            me.notify("<hiy>你拨开桃枝，顺着小路钻了进去。</hiy>");
            return true;
        }
        return false;
    }
    var pat = TAO_PAT[this.tao_n];
    if (!pat) return true;
    var step = this.query_temp(me, "th_tao_step", 0) || 0;
    if (step < 11) {
        if (dir === pat.steps[step]) {
            this.set_temp(me, "th_tao_step", step + 1);
            me.notify("<hiy>" + TAO_WALK[Math.floor(Math.random() * TAO_WALK.length)] + "</hiy>");
            if (step + 1 === TAO_CAVE_STEP && this.tao_want_cave(me)) this.tao_show_cave(me);
            return false;      // 原地推进计数，不真的移动
        }
        this.tao_move(me, "th/haitan",
            "<hiy>你感觉四处的景象一阵迷乱，等你回过神来，发现自己不知不觉又走到了海边。</hiy>");
        return false;
    }
    // 11 步走完：还要朝出口方向再走一步
    if (dir === pat.exit) {
        this.tao_move(me, "th/taolin", "<hig>眼前一亮，你终于走出了桃林迷阵。</hig>");
        return false;
    }
    this.tao_move(me, "th/haitan",
        "<hiy>你感觉四处的景象一阵迷乱，等你回过神来，发现自己不知不觉又走到了海边。</hiy>");
    return false;
};

// 每次进入迷阵都从九宫格中心重新开始
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    this.tao_reset(me);
};
