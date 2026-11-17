this.inherits(NPC);
// 副本入口的易直非：用副本次数兑换该副本的橙装（每件 1000 次，只列有橙装的副本）。
// 兑换逻辑在 world/extends/fb_exchange.js（各副本入口的易直非共用）。
// 词条石改由扬州钱庄的钱眼开出售（world/npc/pub/qian.js）。
this.set({
    name: "神秘商人 易直非",
    desc: "一个来历不明的商人，背着个鼓鼓囊囊的大包袱。据说江湖人跑副本时从指缝里漏掉的宝贝，他都有门路弄来——只要你肯拿副本次数来换。",
    title: "",
    gender: 1,
    age: 40,
    per: 25,
    mp: 10000, max_mp: 10000,
    hp: 10000, max_hp: 10000,
});

if (WORLD.FB_EXCHANGE) WORLD.FB_EXCHANGE.install(this);

this.on_kill = function (me) {
    return me.notify_fail("竖子尔敢？光天化日朗朗乾坤，竟敢如此！");
};

this.on_die = function () {
    return false;
};
