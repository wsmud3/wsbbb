// 活动1：福利 — 每个玩家仅可领取一次
EVENTS.add({
    id: "wuxianfuli",
    name: "<HIR>福利</HIR>",
    desc: "仅可领取一次：\n  10000 黄金\n  1000000 经验\n  1000000000 潜能",
    grade: 6,
    time: 0,
    command: "领取",
    check: function (me) {
        return !me.query_temp("wuxianfuli_claimed");
    },
    on_command: function (me) {
        me.add_money(10000 * 10000);  // 10000黄金
        me.add_exp(1000000, 1000000000);  // 100W经验 + 10亿潜能
        me.set_temp("wuxianfuli_claimed", 1);
        me.notify("<HIR>你领取了福利：10000黄金 + 1000000经验 + 1000000000潜能！</HIR>");
    },
});

console.log("活动已加载：福利");
