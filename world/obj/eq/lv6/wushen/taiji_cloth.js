
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "先天太极图",
    desc: "武当至宝，先天太极\n特效：太极护体：激活后8秒内无视所有伤害"
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
    },
});

this.on_use = function (me) {
    if (me.query_temp("wushen_taiji"))
    return me.notify("你已经在先天太极图的庇护之下了。");

    me._wushen_taiji_invincible = true;
    me.set_temp("wushen_taiji", 1);
    me.send_room("<HIZ>$N展开先天太极图，周身笼罩在太极金光中，万法不侵！</HIZ>");
    var selfRef = me;
    setTimeout(function () {
        selfRef._wushen_taiji_invincible = false;
        selfRef.remove_temp("wushen_taiji");
        selfRef.send_room("$N身上的太极金光渐渐消散。");
    }, 8000);
    return true;
};
