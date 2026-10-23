this.inherits(ROOM);
this.name = "岱宗坊";
this.desc = "位于泰安县城以北约一里，此处是登泰山的入口。相传当年碧霞元君被姜子牙戏弄，诱她投掷绣花鞋以定泰山地界，结果碧霞元君只能把绣花鞋从山顶掷到此处。从此泰山便以此为起点。";
this.exits = {
    "northup": "ts/yitian",
};
this.set_npc([]);

// ────────────────────────────────────────────────────────────
// 泰山「验轻功」（原版机制）
//
//   每次往上走都要过一次检验：
//     取 玩家基础轻功 与 轻功部位（鞋）装备带的特殊轻功 中较低的那个 L
//       L < 801        → 必定摔回出发点（岱宗坊）
//       L = 801        → 50% 摔
//       每高 1 级      → 摔的概率再降 1%（851 级及以上不再摔）
//
//   检验本身放在 WORLD 上，全山共用一份，避免十个房间各写一遍。
// ────────────────────────────────────────────────────────────
if (!WORLD.ts_climb) {
    WORLD.ts_climb = function (me) {
        if (!me || !me.is_player) return true;
        var base = me.query_skill("dodge") || 0;
        var special = 0;
        var shoe = me.get_equipment ? me.get_equipment(EQUIP_TYPE.SHOES) : null;
        if (shoe && shoe.prop && shoe.prop.skill) {
            for (var sk in shoe.prop.skill) {
                var lv = me.query_skill(sk, 0) || 0;
                if (lv > special) special = lv;
            }
        }
        var lv2 = Math.min(base, special);
        var p;
        if (lv2 < 801) p = 100;
        else p = 50 - (lv2 - 801);
        if (p <= 0) return true;
        if (p > 100) p = 100;
        if (Math.random() * 100 >= p) return true;
        me.notify("<hir>石阶又陡又滑，你脚下一个没踩稳，整个人顺着台阶摔了下去！</hir>");
        me.moveto("ts/daizong", me.name + "脚下一滑摔了下去。", me.name + "从石阶上滚了下来。");
        return false;
    };
}

// 每往上走一步都要验轻功（规则见本文件上面的 WORLD.ts_climb）
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir || dir.indexOf("up") < 0) return true;
    return WORLD.ts_climb(me);
};
