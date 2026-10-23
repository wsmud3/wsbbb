this.inherits(ROOM);
this.name = "憩凤阁";
this.desc = "这里是灵鹫宫弟子睡觉的地方，一进门就闻到一阵悠悠的香气，只见房中点了一支大红烛,照的满室生春,床上珠罗纱的帐子，白色缎被上绣着一只黄色的凤凰，壁上挂着一幅工笔仕女图。西首一张几上供着一盆兰花，架子上停着一只白鹦鹉。";
this.exits = {
    "east": "pm/huayuan"
};
this.set_npc(["pm/jujian", 1]);
