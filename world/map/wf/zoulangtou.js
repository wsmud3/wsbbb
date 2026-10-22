this.inherits(ROOM);
this.name = "走廊尽头";
this.desc = "你来到走廊的尽头，往北看去是好大的一个湖泊，前面有个小亭，温氏兄弟还真会享受。";
this.exits = {
    "southwest": "wf/zoulang2",
    "southeast": "wf/zoulang3",
    "north": "wf/tingzi",
};
this.set_npc([]);

// 原版机制：点击木桩跳上去 → 温家五老一起出战（1v5）→ 打完再点 → 金蛇郎君出现。
this.set_item("zhuang", "木桩", "一根练功用的木桩，桩身布满刀痕与掌印。", [
    ["tiao", "跳上去", function (me) {
        var alive = 0;
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
        }
        if (alive) { me.notify("<hiy>温家五老正在结阵，先打完再说！</hiy>"); return true; }
        if (me.query_temp("wf_zhen_done")) {
            var x = NPC.CREATE("wf/jinshelangjun", this);
            if (x) { me.notify("<hiy>你再次跳上木桩，石门缓缓打开——金蛇郎君走了出来！</hiy>"); x.do_kill(me); }
            return true;
        }
        me.send_room("$N纵身跳上木桩，四周忽然响起衣袂破风之声。");
        var names = ["wenfangda", "wenfangyi", "wenfangshan", "wenfangshi", "wenfangnan"];
        for (var j = 0; j < names.length; j++) {
            var e = NPC.CREATE("wf/" + names[j], this);
            if (e) e.do_kill(me);
        }
        me.set_temp("wf_zhen_start", 1, 7200000);
        me.notify("<hir>温家五老结阵向你围来！以 1 敌 5，务必全部击杀。</hir>");
        return true;
    }]
]);
this.on_zhen_done = function (me) { me.set_temp("wf_zhen_done", 1, 7200000); };
