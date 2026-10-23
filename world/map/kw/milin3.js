this.inherits(ROOM);
this.name = "密林";
this.desc = "这是一片茂密的松林，杂乱的生长在倾斜的山坡上。每棵松树都有三四抱粗细，高达十几丈。树冠枝多叶密，将天空完全遮住，因此林内显得有些昏暗。";
this.exits = {
    "eastup": "kw/heifengkou",
    "northdown": "kw/milin",
};
this.set_npc(["kw/laohu", 1]);

// 原版机制：地图最东方可以挖「大清龙脉」（需集齐 8 本四十二章经 + 基础轻功 300）
this.set_item("longmai", "龙脉", "林间一处土坡，草木长势异于四周，隐隐透着一股王气。", [
    "wa", "挖龙脉", function (me) {
        if (me.query_temp("kw_longmai")) {
            me.notify("这处龙脉已经被挖过了。");
            return true;
        }
        var lv = me.query_skill("dodge", 0);
        if (lv < 300) {
            me.notify("<red>土坡上尽是坚硬的冻土，你的基本轻功不到 300 级，挖不动。</red>");
            return true;
        }
        var cnt = 0;
        if (me.items) {
            for (var i = 0; i < me.items.length; i++) {
                var o = me.items[i];
                if (o && o.name && o.name.indexOf("四十二章经") >= 0) cnt += o.count || 1;
            }
        }
        if (cnt < 8) {
            me.notify("<red>龙脉要用八本《四十二章经》镇住才能开挖，你手上只有 " + cnt + " 本。</red>");
            return true;
        }
        me.set_temp("kw_longmai", 1, 7200000);
        me.send_room("$N按经书所示方位掘开冻土，一股紫气自土中腾起！");
        me.add_obj("st/xuanjing", 100);
        me.notify("<hiy>你在龙脉里挖到了一些玄晶。</hiy>");
        return true;
    }
]);
