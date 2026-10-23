this.inherits(ROOM);
this.name = "桃花林";

// ────────────────────────────────────────────────────────────
// 桃花岛桃林迷阵（实测记录见 桃花岛破阵法.md）
//
//   海滩 --south--> 桃花林（本房间，迷阵）
//        描述会写「东南方向大概有 N 棵桃树」，N 决定用哪套 11 步走法
//        走对了原地继续走；走错立刻被弹回海滩（提示「一阵迷乱」）
//        11 步走完后再朝出口方向走一步，才出阵到 th/tao1 桃花林
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
    "north": "th/haitan",
    "south": "th/haitan",
    "east": "th/haitan",
    "west": "th/haitan",
    "northeast": "th/haitan",
    "northwest": "th/haitan",
    "southeast": "th/haitan",
    "southwest": "th/haitan",
};
this.set_npc([]);

// 注意：在 on_leave 里调 moveto 会再次触发本房间的 on_leave（同步递归），
// 所以自己放行的那一次移动要先挂 th_tao_leave 标记让 on_leave 直接放行。
this.tao_move = function (me, path, msg) {
    me.remove_temp("th_tao_step");
    if (msg) me.notify(msg);
    me.set_temp("th_tao_leave", 1, 10000);
    me.moveto(path);
    me.remove_temp("th_tao_leave");
};

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir) return true;                            // 不是走方向（例如 cr over 离开副本），一律放行
    if (me.query_temp("th_tao_leave")) return true;   // 我们自己放行的那一次
    var pat = TAO_PAT[this.tao_n];
    if (!pat) return true;
    var step = me.query_temp("th_tao_step") || 0;
    if (step < 11) {
        if (dir === pat.steps[step]) {
            me.set_temp("th_tao_step", step + 1, 1800000);
            me.notify("<hiy>你顺着桃林间的小径往前走。（" + (step + 1) + "/11）</hiy>");
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
