this.inherits(ROOM);
this.name = "小厅";
this.desc = "你走进这间小小的厅室, 看到里面放着一张紫檀木茶几和几张湘妃竹椅子，紫檀木的茶几上摆放着茶壶和几只白玉杯，专供客人饮用。你忍不住想坐在竹椅上，让疲惫的身心得到充分的休息。";
this.exits = {
    "west": "yz2/yunjinlou",
};
this.set_npc(["yz2/auto_2", 1]);
