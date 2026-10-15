
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
    // 只有**已装备**时才启动回血。on_eq 会被 on_reload 调用，而 on_reload 对存档里的
    // 每件物品（背包 items / 仓库 stores / 装备 equipment）都会触发 ——
    // 原来的实现不校验装备位，于是把头盔放进背包或仓库、重登一次就能永久每 5 秒回 5% 气血。
    if (!me.equipment || me.equipment[this.eq_type] !== this) return;
    if (me.__jinding_timer) return;
    var item = this;
    var handler = setInterval(function () {
        // 卸下后立即自停并释放句柄（否则定时器会把旧角色对象一直钉在闭包里）
        if (!me.equipment || me.equipment[item.eq_type] !== item) {
            clearInterval(handler);
            me.__jinding_timer = null;
            return;
        }
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
    // 只在真正装备着的时候重启被动并提示。以前无条件调用 on_eq，
    // 导致背包/仓库里的金顶佛光也会挂上回血定时器（且提示文案与实际不符）。
    if (me.equipment && me.equipment[this.eq_type] === this) {
        this.on_eq(me);
        me.notify("<HIZ>金顶佛光重新绽放——佛力再次护持你左右。</HIZ>");
    }
};
