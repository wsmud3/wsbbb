this.inherits(ROOM);
this.name = "大厅";
this.desc = "这是『日月神教』下第三大堂：青龙堂的大厅。一位长者居中，神情恍惚。";
this.exits = {
    "north": "hmy/ql_lang",
};
this.set_npc(["hmy/jiabu", 1]);

// [mech] 困难模式：三位堂主只在崖顶大门出现（见 hmy/damen.js），大厅里不再有贾布——
// 否则这里会留一个活着的有分 NPC，完成度永远卡在 99%。
this.on_set_difficulty = function (type) {
    if (type !== 1) return;
    var npc = this.find_obj_bypath("hmy/jiabu");
    if (npc) npc.destroy();
};
