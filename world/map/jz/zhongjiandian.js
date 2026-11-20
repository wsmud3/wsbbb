this.inherits(ROOM);
this.name = "重剑殿";
this.desc = "第三座剑冢。一柄通体漆黑的玄铁重剑直直插入巨石之中，剑身粗厚无刃，与其说是剑不如说是一块巨大的铁尺。重剑散发出沉重的压迫感，空气都为之凝滞。重剑之后，一道巨大的石门封住去路，门上有一个血红色的掌印凹槽——需以鲜血为引，方能开启。献血越多，门后的重剑剑意越是敬你三分。";
this.exits = { "south": "jz/zhongjianqian", "north": "jz/xuantie" };
this.no_fight = true;

// 机关【重剑负山】：献祭抉择。献得越多，「重剑负山」试炼化身气血越低（100% / 80% / 60%）。
// 抉择按玩家记录；首次挑战前可重新献祭以改变选择。
var PZ_KEY = "jz", PZ_ID = 3;
var CHOICES = {
    30: { hp: 100, msg: "鲜血涌入凹槽，石门缓缓开启——但门后的重剑剑意似乎并未减弱多少。" },
    50: { hp: 80, msg: "大量鲜血涌入凹槽，石门轰然大开！重剑剑意对你的决意生出一丝敬意。" },
    70: { hp: 60, msg: "你将七成气血灌入石门，门扉轰然洞开，整座大殿都在震颤！重剑剑意认可了你的决心。" }
};

function sacrifice(me, pct) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.stage_cleared(me, PZ_KEY, PZ_ID)) return me.notify("你早已参透重剑之意，石门对你敞开。");
    if (me.hp <= Math.floor(me.max_hp * pct / 100)) return me.notify("你的气血不足以献祭这么多。");
    var c = CHOICES[pct];
    me.damage2(Math.floor(me.max_hp * pct / 100));
    me.notify("<hig>你将手掌按在血印上。" + c.msg + "</hig>");
    WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID, { hp: c.hp });
}
this.add_action("sacrifice_30", "献祭三成气血", function (me) { sacrifice(me, 30); });
this.add_action("sacrifice_50", "献祭五成气血", function (me) { sacrifice(me, 50); });
this.add_action("sacrifice_70", "献祭七成气血", function (me) { sacrifice(me, 70); });

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
