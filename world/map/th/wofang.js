this.inherits(ROOM);
this.name = "卧房";
this.desc = "你走进了一间卧房。一股若有若无的甜香扑鼻而来。琴剑书画，挂在墙上。锦笼纱罩，金彩珠光。小几上汝窑美人瓶内的桃花正自盛开。右首一张床，床头放着五彩鸾纹被。";
this.exits = {
    "south": "th/dating",
};
this.set_npc(["th/huangrong", 1]);
