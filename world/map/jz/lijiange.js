this.inherits(ROOM);
this.name = "利剑阁";
this.desc = "第一座剑冢。一柄青光闪闪的利剑斜插于石台之上，剑身薄如蝉翼，刃口隐现寒芒。四壁满是深浅不一的剑痕——仔细看去，每面墙上的剑痕似乎排列成不同的走向。利剑的锋锐之气充盈整个石室，北面的通道被一层剑气封住，令人汗毛倒竖。";
this.exits = { "south": "jz/changlang", "north": "jz/lijiantai" };
this.no_fight = true;

// 机关【利剑问锋】：四壁剑痕只有一面指向出路。正确方向按玩家随机，存于玩家 temp。
var PZ_KEY = "jz", PZ_ID = 1;
var WALLS = { east: "东", south: "南", west: "西", north: "北" };
var WRONG_DESC = [
    "剑痕纵横交错，彼此截断，像是一场乱战留下的痕迹，看不出去向。",
    "剑痕自上而下一路劈落，末端深深嵌入地面，戛然而止。",
    "剑痕呈弧形游走一周，首尾相接，又回到了起点。"
];
var RIGHT_DESC = "剑痕一道比一道浅、一道比一道快，末端隐有微光透出，仿佛剑意仍在向前延伸。";

function answerOf(me) {
    var dir = me.query_temp("zy_pzs_jz_1", "");
    if (!WALLS[dir]) {
        var keys = Object.keys(WALLS);
        dir = keys[Math.floor(Math.random() * keys.length)];
        me.set_temp("zy_pzs_jz_1", dir, 3600000);
    }
    return dir;
}

this.add_action("jz_walls", "察看四壁剑痕", function (me) {
    if (WORLD.ZHENYI.puzzle_solved(me, WORLD.ZHENYI.find_by_key(PZ_KEY), PZ_ID))
        return me.notify("四壁剑痕的去向你已了然于胸，北面的剑气不再阻你。");
    var answer = answerOf(me), lines = [], i = 0, cmds = [];
    for (var d in WALLS) {
        lines.push("【" + WALLS[d] + "壁】" + (d === answer ? RIGHT_DESC : WRONG_DESC[i++ % WRONG_DESC.length]));
        cmds.push("zhenyi puzzle " + d, "循" + WALLS[d] + "壁剑痕而行");
    }
    me.notify("\n你逐一细看四壁：\n" + lines.join("\n") + "\n\n<hiy>独孤求败的利剑，只向前，不回头。循错了剑痕，会被剑气所伤。</hiy>");
    me.send_commands.apply(me, cmds);
});

this.zy_puzzle = function (me, arg) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.puzzle_solved(me, data, PZ_ID)) return me.notify("机关早已为你开启。"), true;
    if (!WALLS[arg]) return me.notify("请先察看四壁剑痕。"), false;
    if (arg === answerOf(me)) {
        me.remove_temp("zy_pzs_jz_1");
        me.notify("<hig>你循着剑痕一路前行，剑痕尽头光芒大盛——北面的剑气向两侧分开了。</hig>");
        return WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID);
    }
    // 选错后重新随机，避免逐一试错。
    me.remove_temp("zy_pzs_jz_1");
    me.damage2(Math.floor(me.max_hp * 0.15));
    me.notify("<hir>你沿" + WALLS[arg] + "壁剑痕走了几步，剑气骤然回卷，将你逼退！</hir>四壁剑痕似乎随之变了模样。");
    return false;
};

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
