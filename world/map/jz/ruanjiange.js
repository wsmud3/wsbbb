this.inherits(ROOM);
this.name = "软剑阁";
this.desc = "第二座剑冢。一柄紫薇软剑横放石台之上，剑身柔软如绸，在没有风的洞中却自行颤动不休，发出嗡嗡剑鸣。石台前的地面铺着九块青石砖，合成一座九宫，每块砖上刻着一个古篆：北首一排自西而东是「总」「破」「气」，当中一排是「剑」「刀」「枪」，南首一排是「掌」「索」「箭」。剑鸣起处，砖缝间偶有微光一闪而没。";
this.exits = { "south": "jz/jianhen", "north": "jz/ruanjiantai" };
this.no_fight = true;

// 机关【软剑回环】：观察软剑每一颤在九宫哪一方位亮起微光（北首一排为第一行，自西而东为第一至三列），再按篆字依次踩踏。
// 提示只给方位、不给行列与做法，须对照房间描述里的九宫篆字自行推出。
// 序列与进度按玩家保存；踩错扣血并重新出题。
var PZ_KEY = "jz", PZ_ID = 2, STEPS = 5;
var BRICKS = ["总", "破", "气", "剑", "刀", "枪", "掌", "索", "箭"];
// 九宫方位，与 BRICKS 下标一一对应
var POS = ["西北隅", "北首正中", "东北隅", "西首正中", "九宫正中", "东首正中", "西南隅", "南首正中", "东南隅"];
var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
var GLOW = ["一砖微光乍现", "幽光一闪即没", "一砖隐隐泛亮", "微光倏然一现", "有光一闪而灭"];
function ordinal(i) {
    if (i === 0) return "初颤";
    if (i === STEPS - 1) return "末颤";
    if (i === 1) return "再颤";
    return CN[i] + "颤";
}

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
        return (i === 0 ? "剑身" : "") + ordinal(i) + "，" + POS[b] + GLOW[i % GLOW.length] + "。";
    });
    me.notify("\n你屏息凝视软剑。剑身无风自颤，连颤" + CN[STEPS - 1] + "下：\n" + lines.join("\n") + "\n\n<hiy>" + CN[STEPS - 1] + "颤既毕，剑鸣渐歇，砖上微光尽灭。</hiy>");
    stepButtons(me);
});

this.zy_puzzle = function (me, arg) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.puzzle_solved(me, data, PZ_ID)) return me.notify("机关早已为你开启。"), true;
    var seq = seqOf(me), n = parseInt(arg);
    if (!seq) return me.notify("你还未看清软剑的变化。"), false;
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
        me.notify("「" + BRICKS[n] + "」砖应足泛起微光，剑鸣稍缓。");
        stepButtons(me);
        return true;
    }
    newSeq(me);
    me.damage2(Math.floor(me.max_hp * 0.1));
    me.notify("<hir>软剑嗡鸣大作，一股剑意反噬而来！</hir>砖上微光尽散，剑势已变。");
    return false;
};

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
