this.inherits(ROOM);
this.name = "涟星宫";
this.desc = "这是涟星宫主休息的地方，只见一个身材奇好,貌美如花的女子站立在<cmd cmd='look hua'>花丛</cmd>中,她就是武功奇高,身份神秘的移花宫二宫主。以前因为她的姐姐邀月宫主被燕南天抛弃所以她非常恨男人，如果你是男人最好不要接近她。";
this.exits = {
    "southwest": "yh/woshi",
    "northwest": "yh/changlang1",
};
this.set_npc(["yh/lianxing", 1]);
