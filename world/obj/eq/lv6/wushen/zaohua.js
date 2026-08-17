this.inherits(EQUIPMENT);

this.set({
    grade: 6,
    name: "造化青莲",
    desc: "造化青莲，生生不息",
    unit: "枚",
    eq_type: EQUIP_TYPE.RING,
    hole_count: 5,

    prop: {
        // 攻击、命中、暴击
        gj_per: 16,
        mz_per: 16,
        bj_per: 16,

        // 绝招释放时间 -50%
        releasetime_per: 50,

        // 绝招冷却时间 -20%
        distime_per: 20,

        desc: "每秒恢复1%最大气血和内力"
    },
});


// 装备时启动被动
this.on_eq = function (me) {

    if (me.query_temp("zaohua_qinglian_timer"))
    return;

    var item = this;

    function recover() {

        // 已经卸下装备
        if (!me.equipment ||
        me.equipment[item.eq_type] !== item) {

            me.remove_temp("zaohua_qinglian_timer");
            return;
        }

        // 死亡不恢复
        if (me.hp > 0) {

            // 固定按照最大气血的1%恢复
            if (me.hp < me.max_hp) {
                var hp = Math.floor(me.max_hp / 100);

                if (hp > 0)
                me.add_hp(hp);
            }

            // 固定按照最大内力的1%恢复
            if (me.mp < me.max_mp) {
                var mp = Math.floor(me.max_mp / 100);

                if (mp > 0)
                me.add_mp(mp);
            }
        }

        // 1秒后再次触发
        me.set_temp(
        "zaohua_qinglian_timer",
        me.call_out(recover, 1000)
        );
    }

    // 1秒后第一次恢复
    me.set_temp(
    "zaohua_qinglian_timer",
    me.call_out(recover, 1000)
    );
};


// 卸下装备
this.on_uneq = function (me) {

    var handler =
    me.query_temp("zaohua_qinglian_timer");

    if (handler) {
        clearTimeout(handler);
        me.remove_temp("zaohua_qinglian_timer");
    }
};


// 登录/刷新装备
this.on_reload = function (me) {

    // 刷新装备属性
    if (me.equipment &&
    me.equipment[this.eq_type] === this) {

        this.change_prop(me, false);
        this.change_prop(me, true);
        me.recount();
    }

    // 清除旧计时器
    var handler =
    me.query_temp("zaohua_qinglian_timer");

    if (handler) {
        clearTimeout(handler);
        me.remove_temp("zaohua_qinglian_timer");
    }

    // 重新启动被动
    this.on_eq(me);
};
