this.inherits(ROOM);
this.name = "星宿海";
this.desc = "这里是星宿海边。说是海，其实是片湖泊和沼泽，地形十分险恶。东面石壁上一道裂缝通到一个山洞，这里左右两厢通向星宿海的深处，北边是星宿派总舵——日月洞。";
this.exits = {
    "north": "xx/riyuedong",
    "southwest": "xx/xxh2",
    "southeast": "xx/xxh3",
};
this.set_npc(["xx/shihouzi", 1]);

// 原版机制（攻略第 21 节）：必须先击杀二师兄狮吼子，才能进日月洞打丁春秋。
// 原来写在日月洞 on_enter：玩家已进洞、丁春秋已叫杀才被弹回；且依赖 2 小时的
// player temp（跨副本残留、随从补刀时不设置）。改为看本房间狮吼子是否还活着。
this.on_leave = function (me, dir) {
    if (!me.is_player || dir !== "north") return true;
    var shz = this.find_obj_bypath("xx/shihouzi");
    if (shz && shz.hp > 0) {
        me.notify("<red>狮吼子横身拦在洞口：想进日月洞，先过我这一关！</red>");
        return false;
    }
    return true;
};
