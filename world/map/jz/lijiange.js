this.inherits(ROOM);
this.name = "利剑阁";
this.desc = "第一座剑冢。一柄青光闪闪的利剑斜插于石台之上，剑身薄如蝉翼，刃口隐现寒芒。四壁满是深浅不一的剑痕——仔细看去，每面墙上的剑痕似乎排列成不同的走向。利剑的锋锐之气充盈整个石室，北面的通道被一层剑气封住，令人汗毛倒竖。";
this.exits = { "south": "jz/changlang", "north": "jz/lijiantai" };
this.no_fight = true;

// 机关【利剑问锋】：四壁剑痕只有一面指向出路。正确方向按玩家随机，存于玩家 temp。
// 四面都写成有去向的剑痕；正确那面暗合长廊利剑铭文「凌厉刚猛，无坚不摧」（遇坚石径直贯穿），
// 错的三面分别是避坚绕行、柔曲游走（软剑）、钝拙砸出（重剑），须对照铭文自行分辨。
var PZ_KEY = "jz", PZ_ID = 1;
var WALLS = { east: "东", south: "南", west: "西", north: "北" };
var WRONG_DESC = [
    "剑痕细长而迅疾，行至半途遇上一道黑沉沉的石脉，便贴着石脉折向一旁，绕过之后方才续上，蜿蜒没入壁角。",
    "剑痕回环往复，柔曲如带，时深时浅，似是一柄极柔的剑随势游走，一路盘旋着延向壁角。",
    "剑痕宽厚钝拙，入石数寸，边缘却参差不齐，倒像是以重物硬生生砸出，一记接着一记排向壁角。"
];
var RIGHT_DESC = "剑痕细长而迅疾，笔直如线，途中横着一道黑沉沉的石脉，剑痕竟自其中径直穿过，切口平滑如镜，一路延向壁角。";

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
    me.notify("\n你逐一细看四壁：\n" + lines.join("\n") + "\n\n<hiy>四壁剑痕各有来历，只有一面是那柄利剑所留。循错了剑痕，会为剑气所伤。</hiy>");
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
