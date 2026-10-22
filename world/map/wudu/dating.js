this.inherits(ROOM);
this.name = "药室";
this.desc = "这里是个宽广的大厅，高大的盘龙柱一人都合抱不过来。这里是平日教主召集教众们议事的地方，大厅正中供奉着五圣--毒蛇，蜘蛛，蜈蚣，蝎子蟾蜍的画像。几位长老正坐在厅中议事 。";
this.exits = {
    "west": "wudu/lianwu",
    "east": "wudu/huayuan",
};
this.set_npc(["wudu/panxiuda", 1], ["wudu/cenqisi", 1], ["wudu/qiyunao", 1]);
