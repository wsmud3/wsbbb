this.inherits(ROOM);
this.name = "山门";
this.desc = "这是神龙教总坛的山门，一座高大的竹门耸立在前。门外站着几个年轻弟子，神情警惕地打量着来人。北面便是神龙教的前厅。";
this.exits = { "north": "bj/slj/shandao", "south": "bj/slj/qianting" };
this.on_leave = function (me, dir) {
    if (dir == "south" && this.find_by_path("bj/slj/dizi")) {
        return me.notify_fail("神龙教弟子拦住你喝道：没有教主允许，不得入内！");
    }
};
this.set_npc(["bj/slj/dizi", 2]);
