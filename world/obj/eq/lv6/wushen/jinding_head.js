
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "金顶佛光",
    desc: "峨眉至宝，佛光护身",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 5,
    prop: {
        fy: 1716,
        con: 440,
        diff_sh_per: 13,
        distime_per: 13,
        diff_bj: 33,
        desc: "佛光普照：每5秒恢复5%气血"
    },
});

this.on_eq = function (me) {
    // 兼容旧版：清理误存进 temp 的定时器句柄（会导致存档 JSON 循环引用崩溃）
    if (me.query_temp("jinding_timer")) {
        try { clearInterval(me.query_temp("jinding_timer")); } catch (e) {}
        me.remove_temp("jinding_timer");
    }
    if (me.__jinding_timer) return;
    var handler = setInterval(function () {
        if (!me.environment || me.hp <= 0) return;
        var heal = Math.floor(me.max_hp * 5 / 100);
        if (heal > 0 && me.hp < me.max_hp) {
            me.add_hp(heal);
        }
    }, 5000);
    // 定时器句柄是 Node Timeout 对象，绝不能进 temp（temp 会被序列化存档）
    me.__jinding_timer = handler;
    // 装备时弹出提醒
    me.notify("<HIZ>金顶佛光绽放——头顶浮现金色佛光，温暖祥和的佛力护持周身！</HIZ>");
};

this.on_uneq = function (me) {
    if (me.__jinding_timer) {
        clearInterval(me.__jinding_timer);
        me.__jinding_timer = null;
    }
    if (me.query_temp("jinding_timer")) {
        try { clearInterval(me.query_temp("jinding_timer")); } catch (e) {}
        me.remove_temp("jinding_timer");
    }
    me.notify("金顶佛光消散，佛力褪去。");
};

// 登录时重新启动
this.on_reload = function (me) {
    if (me.equipment && me.equipment[this.eq_type] === this) {
        this.change_prop(me, false);
        this.change_prop(me, true);
        me.recount();
    }
    if (me.__jinding_timer) {
        clearInterval(me.__jinding_timer);
        me.__jinding_timer = null;
    }
    if (me.query_temp("jinding_timer")) {
        try { clearInterval(me.query_temp("jinding_timer")); } catch (e) {}
        me.remove_temp("jinding_timer");
    }
    this.on_eq(me);
    me.notify("<HIZ>金顶佛光重新绽放——佛力再次护持你左右。</HIZ>");
};
