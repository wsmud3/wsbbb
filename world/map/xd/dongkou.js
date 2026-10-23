this.inherits(ROOM);
this.name = "洞口";
this.desc = "山谷里积雪被拢成几个雪堆，这里时常有人扫除积雪。你前面的峭壁下隐隐约约有一个山洞。南北两旁都是崖壁，东面则是一处峭壁，非常险要。";
this.exits = {
    "westdown": "xd/wangyou",
    "enter": "xd/xuedao",
};
this.set_npc(["xd/xuedaodizi", 2])
