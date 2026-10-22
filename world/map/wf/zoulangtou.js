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
// 原版机制（攻略第 11 节）：
//   温家五老分散在府中各处（大厅温方达 / 亭子温方义+温方山 / 侧房温方施、温方南），
//   玩家必须先破掉五老，再到走廊尽头点木桩跳上去——此时金蛇郎君才会现身。
//   （采集数据里五老的尸体就分布在这些房间，说明他们是静态放置，不是木桩召唤的）

this.on_zhen_done = function (me) { me.set_temp("wf_zhen_done", 1, 7200000); };
