// 无限洗髓丹：测试号专用（sktest fix 发放），流程同洗髓丹，确认后不消耗。
this.inherits(OBJ);
this.set({
    unit: "颗",
    name: "无限洗髓丹",
    desc: "测试号专用。使用后可以重新设置你的先天属性，用后不会消耗。",
    grade: 5,
    value: 0
});
this.no_consume = true;
this.transable = false;
this.on_use = function (me) {
    if (!(me.is_test_char && me.is_test_char())) return me.notify_fail("只有测试号才能使用" + this.name + "。");
    var base = OBJ.CREATE("cash/xi");
    var r = base.on_use.call(this, me);
    me.set_temp("xi_free", 1, 600000);       // 洗髓丹确认时据此跳过扣除（见 cash/xi.js checkResult）
    return r;
}
