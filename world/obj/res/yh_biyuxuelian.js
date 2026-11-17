// 碧玉血莲（移花宫掉落，莲花池采摘）
// 攻略只列为掉落未写用途：这里做成疗伤灵药——服下气血回满，并在 30 分钟内最大气血提升 10%。
this.inherits(OBJ);
this.set({
    unit: "朵",
    name: "<hig>碧玉血莲</hig>",
    grade: 3,
    desc: "生于移花宫莲花池心的奇莲，花瓣碧绿如玉，花心殷红似血。服下后气血尽复，三十分钟内最大气血提升一成。",
    value: 500000
});
this.transable = true;
this.on_use = function (me) {
    me.send_room("<hig>$N取出一朵碧玉血莲，连花带蕊吞了下去。</hig>");
    me.add_status({
        id: "yh_xuelian",
        name: "碧玉血莲",
        desc: "最大气血提升 10%。",
        duration: 1800000,
        override: 2,
        prop: { hp_per: 10 }
    });
    me.hp = me.max_hp;
    if (me.notify_hp) me.notify_hp();
    me.notify("<hig>一股清凉之意自丹田升起，你只觉气血充盈，精神大振。</hig>");
};
