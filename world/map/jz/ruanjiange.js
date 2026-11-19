this.inherits(ROOM);
this.name = "软剑阁";
this.desc = "第二座剑冢。一柄紫薇软剑横放石台之上，剑身柔软如绸，在没有风的洞中却自行颤动不休，发出嗡嗡剑鸣。石台周围的地面上，九块青石砖排成三行三列，从左到右、自上而下分别刻着一个古篆——第一行「总」「破」「气」，第二行「剑」「刀」「枪」，第三行「掌」「索」「箭」。软剑的每一次颤动，都会让其中一块石砖亮起微光，随即熄灭。";
this.exits = { "south": "jz/jianhen", "north": "jz/ruanjiantai" };
this.no_fight = true;

// 机关【软剑回环】：观察软剑颤动点亮石砖的位置（行/列），再按篆字依次踩踏。
// 序列与进度按玩家保存；踩错扣血并重新出题。
var PZ_KEY = "jz", PZ_ID = 2, STEPS = 5;
var BRICKS = ["总", "破", "气", "剑", "刀", "枪", "掌", "索", "箭"];
var NUM = ["一", "二", "三"];

function newSeq(me) {
    var pool = [0, 1, 2, 3, 4, 5, 6, 7, 8], seq = [];
    for (var i = 0; i < STEPS; i++) seq.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    me.set_temp("zy_pzs_jz_2", seq.join(","), 3600000);
    me.set_temp("zy_pzstep_jz_2", 0, 3600000);
    return seq;
}
function seqOf(me) {
    var raw = me.query_temp("zy_pzs_jz_2", "");
    return raw ? raw.split(",").map(function (x) { return parseInt(x); }) : null;
}
function stepButtons(me) {
    var cmds = [];
    for (var i = 0; i < BRICKS.length; i++) cmds.push("zhenyi puzzle " + i, "踩「" + BRICKS[i] + "」");
    me.send_commands.apply(me, cmds);
}

this.add_action("jz_sword", "凝视软剑", function (me) {
    if (WORLD.ZHENYI.puzzle_solved(me, WORLD.ZHENYI.find_by_key(PZ_KEY), PZ_ID))
        return me.notify("软剑静静横卧，不再颤动。");
    var seq = seqOf(me) || newSeq(me);
    var lines = seq.map(function (b, i) {
        return "第" + (i + 1) + "颤：第" + NUM[Math.floor(b / 3)] + "行第" + NUM[b % 3] + "块亮起";
    });
    me.notify("\n你屏息凝视软剑，它颤动了" + STEPS + "次：\n" + lines.join("\n") + "\n\n<hiy>软剑无常——照它点亮的次序踏过石砖。</hiy>");
    stepButtons(me);
});

this.zy_puzzle = function (me, arg) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.puzzle_solved(me, data, PZ_ID)) return me.notify("机关早已为你开启。"), true;
    var seq = seqOf(me), n = parseInt(arg);
    if (!seq) return me.notify("你还没看清软剑的颤动。"), false;
    if (!(n >= 0 && n < 9)) return false;
    var step = parseInt(me.query_temp("zy_pzstep_jz_2", 0)) || 0;
    if (seq[step] === n) {
        step++;
        if (step >= STEPS) {
            me.remove_temp("zy_pzs_jz_2"); me.remove_temp("zy_pzstep_jz_2");
            me.notify("<hig>软剑发出一声清越的剑鸣，停止了颤动——你已领会变化无常之意。</hig>");
            return WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID);
        }
        me.set_temp("zy_pzstep_jz_2", step, 3600000);
        me.notify("「" + BRICKS[n] + "」砖泛起微光——第" + step + "步已踏下，还需" + (STEPS - step) + "步。");
        stepButtons(me);
        return true;
    }
    newSeq(me);
    me.damage2(Math.floor(me.max_hp * 0.1));
    me.notify("<hir>软剑嗡鸣大作，一股剑意反噬而来！</hir>序列已被打乱，须重新凝视软剑。");
    return false;
};

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
