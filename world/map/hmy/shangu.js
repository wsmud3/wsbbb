this.inherits(ROOM);
this.name = "山谷";
this.desc = "这里是一处山谷，上面种植着草坪。南下是『日月神教』的青龙堂。北面是白虎堂，东面是个树林，据说『日月神教』总部就在那里面。";
// 补上通往白虎堂(北)/青龙堂(南)的出口（原来缺失，三位堂主碰不到 → 令牌拿不到、完成度卡 99%）
this.exits = {
    "east": "hmy/shulin",
    "north": "hmy/bh_tang",
    "south": "hmy/ql_tang",
};
this.set_npc(["hmy/auto_3", 1]);
