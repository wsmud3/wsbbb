this.inherits(ROOM);
this.name = "刘府大厅";
this.desc = "大厅陈设典雅，红木桌椅摆放整齐，墙上挂着名家字画，案上焚着上好的檀香。刘正风端坐主位，面带微笑却目光深邃，似乎在等待什么。厅中气氛微妙，宾主之间客套中暗藏机锋。南边是前院，东西两侧各有一间厢房。";
this.exits = {
    "south": "hs2/liufudayuan",
    "east": "hs2/dongxiang",
    "west": "hs2/xixiang",
};
this.set_npc(["hs2/feibin", 1], ["hs2/liuzhengfeng", 1]);
