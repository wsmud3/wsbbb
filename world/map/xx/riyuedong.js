this.inherits(ROOM);
this.name = "日月洞";
this.desc = "这里是星宿派总舵所在地日月洞。洞内灯火通明，正中一把虎皮椅上端坐着星宿派掌门人丁春秋。洞壁上装饰着虎皮、鹿头、雕羽，及一些字画(zihua)。洞两侧竖立兵器架，上面排列的大多是各种棍棒。";
this.exits = {
    "south": "xx/zhonghaishi",
};
this.set_npc(["xx/dingchunqiu", 1]);

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("xx_shihouzi")) return;
    me.notify("<red>洞口被星宿派弟子拦住：二师兄狮吼子不放行，谁也进不了日月洞。</red>");
    me.moveto("xx/zhonghaishi", null, null);
};
