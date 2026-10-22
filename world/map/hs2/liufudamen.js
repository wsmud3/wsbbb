this.inherits(ROOM);
this.name = "刘府大门";
this.desc = "这里是刘府大门。刘府的主人，就是衡山派中的仅次于掌门人莫大先生的第二号人物刘正风刘老爷子。今天兴许刘府有事吧，大门紧闭，管家家丁也异样紧张。只有檐下的写着 刘府 二字的大红灯笼中的烛火忽闪晃动才显出点活人气。";
this.exits = {
    "south": "hs2/jiedao",
};
this.set_npc(["hs2/songshandizi", 1]);
