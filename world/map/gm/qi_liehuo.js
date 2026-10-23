this.inherits(ROOM);
this.name = "烈火期";
this.desc = "这里是明教的烈火旗，许多教众在忙着把山下采集到的黑黝黝的稠油提炼成火油，然后小心翼翼地装进一个个喷筒中。据说这就是最厉害的火焰枪，只可惜稠油采集不易，所以一般不轻易使用";
this.exits = {
    "south": "gm/qi_hongshui",
    "east": "gm/duanya",
};
this.set_npc(["gm/xinran", 1], ["gm/auto_4", 1]);
