this.inherits(ROOM);
this.name = "走廊尽头";
this.desc = "走廊到此到了尽头，眼前是一间宽敞的练功房。房中竖着几根练功用的木桩，桩身布满刀痕与掌印，地上散落着破碎的兵器。";
this.exits = { "southwest": "wf/zoulang1", "southeast": "wf/zoulang3", "north": "wf/zoulang2" };
this.set_npc([]);

// 原版机制（攻略原文）：
//   点击木桩跳上去 → 温家五老一起出战，1v5 杀死 → 打完再点木桩 → 金蛇郎君出现 → 杀死 = 100%
this.set_item("zhuang", "木桩", "一根练功用的木桩，桩身布满刀痕与掌印。", [
    "tiao", "跳上去", function (me) {
        var alive = this.items.filter(function (o) {
            return o && !o.is_player && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0;
        });
        var ljs = this.items.filter(function (o) {
            return o && !o.is_player && o.path === "wf/jinshelangjun" && o.hp > 0;
        });

        // ① 五老还没打完
        if (alive.length) {
            me.notify("<hiy>温家五老正在结阵，先打完再说！</hiy>");
            return true;
        }
        // ② 五老已经打完，且还没见到金蛇郎君
        if (me.query_temp("wf_zhen_done") && !ljs.length) {
            var x = NPC.CREATE("wf/jinshelangjun", this);
            if (x) {
                me.notify("<hiy>你再次跳上木桩，木桩后石门缓缓打开——金蛇郎君走了出来！</hiy>");
                x.do_kill(me);
            }
            return true;
        }
        // ③ 第一次跳：五老结阵
        me.send_room("$N纵身跳上木桩，四周忽然响起衣袂破风之声。");
        var names = ["wenfangda", "wenfangyi", "wenfangshan", "wenfangshi", "wenfangnan"];
        for (var i = 0; i < names.length; i++) {
            var e = NPC.CREATE("wf/" + names[i], this);
            if (e) e.do_kill(me);
        }
        me.set_temp("wf_zhen_start", 1, 7200000);
        me.notify("<hir>温家五老结阵向你围来！以 1 敌 5，务必全部击杀。</hir>");
        return true;
    }
]);
