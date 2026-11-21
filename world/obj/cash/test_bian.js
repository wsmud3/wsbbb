// 无限变性丹：测试号专用（sktest fix 发放），流程同变性丹（会移除不满足性别条件的武功），用后不消耗。
this.inherits(OBJ);
this.set({
    unit: "颗",
    name: "无限变性丹",
    desc: "测试号专用。使用后可以使男性变为女性，女性变为男性，不满足条件的武功将被移除，用后不会消耗。",
    grade: 5,
    value: 0
});
this.no_consume = true;
this.transable = false;
this.on_use = function (me) {
    if (!(me.is_test_char && me.is_test_char())) return me.notify_fail("只有测试号才能使用" + this.name + "。");
    var g0 = me.gender;
    var r = OBJ.CREATE("cash/bian").on_use.call(this, me);
    // 变性完成后清掉确认标记：普通变性丹用完就没了，无限版不清的话下次使用会跳过确认直接变性
    if (me.gender !== g0) me.remove_temp("bianxing");
    return r;
}
