this.inherits(ROOM);
this.name = "日月洞";
this.desc = "这里是星宿派总舵所在地日月洞。洞内灯火通明，正中一把虎皮椅上端坐着星宿派掌门人丁春秋。洞壁上装饰着虎皮、鹿头、雕羽，及一些字画(zihua)。洞两侧竖立兵器架，上面排列的大多是各种棍棒。";
this.exits = {
    "south": "xx/xxh1",
};
this.set_npc(["xx/dingchunqiu", 1]);
// 狮吼子门禁在 xx/xxh1 的 on_leave 里：进洞前拦住，不再进洞后弹回
