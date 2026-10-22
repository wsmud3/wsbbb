this.inherits(ROOM);
this.name = "邀月宫";
this.desc = "这是邀月宫主休息的地方，只见一个身材奇好, 貌美如花的女子站立在<cmd cmd='look hua'>花丛</cmd>中,她就是武功奇高,身份神秘的移花宫大宫主。以前因为被燕南天抛弃所以她非常恨男人，如果你是男人最好不要接近她。";
this.exits = {
    "southeast": "yh/woshi",
    "northeast": "yh/changlang1",
};
this.set_npc(["yh/yaoyue", 1]);
