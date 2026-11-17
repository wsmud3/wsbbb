this.inherits(ROOM);
this.name = "莲花池";
this.desc = "这里是移花宫内的一个莲花池，池内开满了<cmd cmd='look lian'>莲花</cmd>，忍不住想伸手去摘一朵。不过这个池内传言淹死过无数的人！";
this.exits = {
    "east": "yh/xiaojing",
};
this.set_npc([]);

// 碧玉血莲（攻略掉落表）：池心长着碧玉血莲，伸手去摘可能失足落水。
//   每个副本最多摘 3 次；成功率普通 40%、困难 80%；失手落水损失 15% 最大气血（不致死）。
//   摘到一朵后不能再摘。
var YH_LIAN_TRIES = 3;
this.yh_pick = function (me) {
    if (!me || !me.is_player) return true;
    if (me.is_fighting && me.is_fighting()) { me.notify("你正在战斗，哪有空摘花？"); return true; }
    if (this.query_temp(me, "yh_lian_got")) { me.notify("池心那朵碧玉血莲已经被你摘走了，剩下的都是寻常莲花。"); return true; }
    var n = this.query_temp(me, "yh_lian_try", 0);
    if (n >= YH_LIAN_TRIES) { me.notify("池水已被你搅浑，再也看不清那朵碧玉血莲长在哪里了。"); return true; }
    this.set_temp(me, "yh_lian_try", n + 1);
    var odds = this.query_temp(me, "diff", 0) === 1 ? 0.8 : 0.4;
    me.send_room("$N探身向池心伸出手去……");
    if (Math.random() < odds) {
        this.set_temp(me, "yh_lian_got", 1);
        me.add_obj("res/yh_biyuxuelian");
        me.notify("<hig>你指尖一勾，摘下了一朵通体碧绿、花心殷红的碧玉血莲！</hig>");
        return true;
    }
    var hurt = Math.floor(me.max_hp * 0.15);
    if (hurt > me.hp - 1) hurt = me.hp - 1;
    if (hurt > 0) me.add_hp(-hurt);
    me.send_room("<hir>$N脚下一滑，扑通一声跌进了莲花池，呛了好几口水才狼狈地爬上岸来！</hir>");
    me.notify("<hir>你损失了 " + hurt + " 点气血。</hir>");
    return true;
};
this.set_item("lian", "莲花", "满池莲花开得正盛，池心有一朵通体碧绿、花心殷红的莲花，格外显眼。", [
    ["yh_pick", "摘莲花", function (me) { return this.yh_pick(me); }]
]);
