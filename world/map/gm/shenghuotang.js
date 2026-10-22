this.inherits(ROOM);
this.name = "圣火堂";
this.desc = "这里是明教最深处——圣火堂。堂中燃着一炉不灭的圣火，火光映着满壁的火焰纹。张无忌立在圣火之前，左右两侧站着两位光明使者：杨逍与范遥。";
this.exits = {
    "south": "gm/lianwu",
};
this.set_npc(["gm/yangxiao", 1], ["gm/fanyao", 1], ["gm/zhangwuji", 1]);
