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
//     取 玩家基础轻功 与 轻功栏启用的特殊轻功 中较低的那个 L
//       L < 801        → 必定摔回出发点（岱宗坊）
//       L = 801        → 50% 摔
//       每高 1 级      → 摔的概率再降 1%（851 级及以上不再摔）
//
//   检验本身放在 WORLD 上，全山共用一份，避免十个房间各写一遍。
// ────────────────────────────────────────────────────────────
// 每次加载都覆盖（不判断是否已存在），热更新本文件后新规则立即生效
{
    WORLD.ts_climb = function (me) {
        if (!me || !me.is_player) return true;
        var base = me.query_skill("dodge") || 0;
        // 特殊轻功 = 轻功栏（dodge）当前启用的那门技能的等级。
        // 旧实现去读鞋子装备的 prop.skill，而全项目没有任何装备带这个字段，
        // special 恒为 0 → 永远 <801 → 无论轻功多高都必摔，泰山完全上不去。
        var special = 0;
        var dodge = me.skills && me.skills.dodge;
        if (dodge && dodge.enable_skill && me.skills[dodge.enable_skill])
            special = me.query_skill(dodge.enable_skill, 0) || 0;
        var lv2 = Math.min(base, special);
        var p;
        if (lv2 < 801) p = 100;
        else p = 50 - (lv2 - 801);
        if (p <= 0) return true;
        if (p > 100) p = 100;
        if (Math.random() * 100 >= p) return true;
        me.notify("<hir>石阶又陡又滑，你脚下一个没踩稳，整个人顺着台阶摔了下去！</hir>");
        if (lv2 < 801)
            me.notify("<hiy>（登泰山需要基础轻功与轻功栏启用的特殊轻功都达到801级，851级以上不会再摔。你当前按" + lv2 + "级计。）</hiy>");
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
