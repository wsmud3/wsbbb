this.inherits(ROOM);
this.name = "金蛇郎君处";
this.desc = "密室的最深处，墙壁上镶嵌着数颗夜明珠，发出幽暗的光芒。正中一把金蛇缠绕的椅子上，坐着一位面容冷峻的男子——金蛇郎君。四周的墙壁上密密麻麻刻满了武功秘籍和毒药配方，金色的蛇形花纹在黑暗中若隐若现。这里便是温府最深的秘密所在。北面是木桩练功房。";
this.exits = { "north": "wf/muzhuang" };
this.set_npc(["wf/jinshelangjun", 1], ["wf/wenyi", 1]);
