// 无限精力丹：测试号专用（sktest fix 发放），使用不消耗，普通玩家无法使用。
this.inherits(OBJ);
this.set({
    unit: "枚",
    name: "无限精力丹",
    desc: "测试号专用。使用后精力补满到 10000 点，用后不会消耗。",
    grade: 5,
    value: 0
});
this.no_consume = true;
this.transable = false;
var FULL = 10000;
this.on_use = function (me) {
    if (!(me.is_test_char && me.is_test_char())) return me.notify_fail("只有测试号才能使用" + this.name + "。");
    me.remove_temp("ex_jl");                                   // 今日已消耗的精力清零
    var add = me.query_temp("ad_jl", 0);
    if (me.query_jingli() < FULL) me.set_temp("ad_jl", add + (FULL - me.query_jingli()));
    me.notify("<hiy>你的精力补满了，当前精力 " + me.query_jingli() + " 点。</hiy>");
    return true;
}
