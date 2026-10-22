this.inherits(ROOM);
this.name = "暗河";
this.desc = "一条漆黑的地下暗河，水流湍急，寒气逼人。水里似乎有一条通往前方的暗道。";
this.exits = { "north": "gm2/qinshi", "south": "gm2/qiaobi" };
this.set_npc([]);

// 原版机制：往画里剑指的方向游（必须满血），游过去才能到峭壁。
this.add_action("swim", "潜入暗河", function (me) {
    var dir = me.query_temp("gm2_sword_dir");
    if (!dir) {
        me.notify("<red>你还不知道该往哪个方向游——先去卧室看看那幅画。</red>");
        return true;
    }
    if (me.hp < me.max_hp) {
        me.notify("<red>暗河水寒刺骨，你气血未满，下水必死无疑。（需要满血）</red>");
        return true;
    }
    var cn = { north: "北", south: "南", east: "东", west: "西" }[dir];
    me.notify("<hig>你认准画中剑指的方向，向【" + cn + "】面潜入暗河，顺流而下……</hig>");
    me.moveto("gm2/qiaobi", me.name + "潜入暗河走了。", me.name + "从暗河里冒出头来。");
    return true;
});
