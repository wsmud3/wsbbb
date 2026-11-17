this.inherits(ROOM);
this.name = "山洞";
this.desc = "这是一个小小的山洞，血刀老祖的藏身之地。由於此地比较隐秘，仇家很难寻到这来。洞底有一张供桌，上面供了什麽东西，你看不清。壁上画了一些模糊不清的文字图案，也不知道是些什么。";
this.exits = {
    "out": "xd/dongkou",
};
// 血刀老祖与「落花流水」四侠一开始就在山洞里（四侠可被玩家叫杀）
this.set_npc(["xd/xuedaolaozu", 1], ["xd/auto_1", 1], ["xd/auto_2", 1], ["xd/auto_3", 1], ["xd/auto_4", 1]);
