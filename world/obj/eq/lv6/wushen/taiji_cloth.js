
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "先天太极图",
    desc: "武当至宝，先天太极"
    ,
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        fy: 1936,
        con: 440,
        diff_sh_per: 13,
        fy_per: 13,
        zj_per: 17,
        desc: "太极护体：激活后8秒内无视所有伤害",
    },
});

// 太极护体只看角色对象上的内存标记 _wushen_taiji_invincible（damage() 据此免伤，不随存档保存）。
// 旧版另设了一个不带过期时间的 temp "wushen_taiji"，由 8 秒后的 setTimeout 清除；temp 会存档，
// 8 秒内下线/存档的话新角色对象永远带着它，从此一直提示「已经在庇护之下」。现在不再写这个 temp，
// 并在使用时清掉旧存档里残留的值，已卡住的玩家再用一次即自动恢复。
var TAIJI_DURATION = 8000;
this.on_use = function (me) {
    if (me.temp && me.temp.wushen_taiji) me.remove_temp("wushen_taiji");
    if (me._wushen_taiji_invincible && Date.now() < (me._wushen_taiji_until || 0)) {
        me.notify("你已经在先天太极图的庇护之下了。");
        return false; // 未生效，不计冷却
    }

    var token = {};
    me._wushen_taiji_invincible = true;
    me._wushen_taiji_until = Date.now() + TAIJI_DURATION;
    me._wushen_taiji_token = token;
    me.send_room("<HIZ>$N展开先天太极图，周身笼罩在太极金光中，万法不侵！</HIZ>");
    var selfRef = me;
    setTimeout(function () {
        if (selfRef._wushen_taiji_token !== token) return; // 已被新一次激活接管
        selfRef._wushen_taiji_invincible = false;
        selfRef._wushen_taiji_token = null;
        selfRef.send_room("$N身上的太极金光渐渐消散。");
    }, TAIJI_DURATION);
    return true;
};
