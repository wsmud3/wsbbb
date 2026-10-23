this.inherits(ROOM);
this.name = "小洞";
this.desc = "此处为一小山洞，中间透入一线天光，宛如天窗一般。这里陶碗、土灶、石床、厨具等一应俱全。";
this.exits = {
    "east": "bh/xiongdong",
};
this.set_npc(["bh/xiexun", 1]);
