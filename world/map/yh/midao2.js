this.inherits(ROOM);
this.name = "密室";
this.desc = "你正处在一个密洞中。这里光线很暗，只能隐隐约约看出地上有些其花异草。花丛之中的一块石头上好象放着一个宝匣(xia)。";
this.exits = {
    "east": "yh/midao",
    "west": "yh/xiaojing",
};
this.set_npc([]);
this.set_item("xia", "宝匣", "石头上放着一个宝匣，看起来有些年头了。", []);
