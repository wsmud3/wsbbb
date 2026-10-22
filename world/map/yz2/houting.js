this.inherits(ROOM);
this.name = "后厅";
this.desc = "这里是慕容家里商议事情的地方，不是慕容弟子最好不要到这里来。在后堂正中摆放着一个香案，上面摆放着一个<cmd cmd='look pai'>灵位牌子</cmd>，在正中墙上挂着一幅百鸟朝奉图，边墙上挂着一口宝剑。东西两面各是一间厢房，南面是内堂。";
this.exits = {
    "south": "yz2/dating",
    "east": "yz2/neitang",
};
this.set_npc(["yz2/auto_4", 1]);
