this.inherits(ROOM);
this.name = "海滩";
this.desc = "这里就是神龙岛了。南边是一望无际的大海；往北则是一片灌木林。岛上的空气似乎又热又闷，咸湿的海风中带着一股腥臭，又夹杂了一缕奇特的花香，闻起来十分怪异，海边泊着一艘大船。";
this.exits = { "south": "bj/slj/lin1" };
this.on_leave = function (me, dir) {
    if (dir == "south" && this.find_by_path("bj/slj/dizi")) {
        return me.notify_fail("神龙教弟子拦住你喝道：神龙岛岂是你随便乱闯的地方？！");
    }
};
this.set_npc(["bj/slj/dizi", 2]);
