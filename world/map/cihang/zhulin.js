this.inherits(ROOM);
this.name = "竹林";
this.desc = "一片青翠欲滴的竹林，修竹万竿，随风摇曳。竹林中有一条碎石小径蜿蜒向北，两旁竹影婆娑，沙沙作响，仿佛在低语诉说着静斋数百年的往事。一位气质超然的中年女子静立于竹影之间，正是慈航静斋当代斋主梵清惠。";
this.exits = { "north": "cihang/qichongmen", "south": "cihang/qianyuan" };
this.set_npc([]);
this.guard_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!this.guard_spawned) {
        this.guard_spawned = true;
        NPC.CREATE("cihang/fanqinghui", this);
        this.refresh(me);
    }
};
