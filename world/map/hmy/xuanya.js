this.inherits(ROOM);
this.name = "悬崖";
this.desc = "你终于走出了那片阴深的森林，不由长长地舒了口气。可是，一座陡峭的悬崖又立在了你的面前。悬崖上仿佛有座白色的建筑，可云烟缭绕看不清晰。从悬崖上垂下一条绳索。看上去象是悬崖上下互通消息的工具。绳索的上面似乎隐约有一个掉篮,悬崖的墙上似乎有一个<cmd cmd='look xiazi'>匣子</cmd>。";
this.exits = {
    "west": "hmy/shulin",
};

// 描述里内嵌 <cmd cmd='look xiazi'>匣子</cmd>，此处补上对应对象
// TODO: 匣子内容/后续命令待从原版补齐（当前为占位描述）
this.set_item("xiazi", "匣子", "崖边有一个匣子，此处描述待补。", []);
