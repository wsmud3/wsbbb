this.inherits(ROOM);
this.name = "山洞";
this.desc = "桃林深处的一个天然山洞，洞口被桃枝遮得严严实实，不细看根本发现不了。洞里倒也干爽，地上随手扔着几只蟋蟀罐、一堆啃过的桃核，一个白发白须的老头儿正蹲在地上自己跟自己比划拳脚。";
// 第二遍走桃林迷阵时才会露出进洞的小路（见 th/tao0）；出洞直接到桃林出口。
this.exits = {
    "out": "th/taolin",
};
this.set_npc(["th/zhoubotong", 1]);

// 困难模式没有黄蓉，也就没有找周伯通这段剧情（攻略：困难不用找周伯通）
this.on_set_difficulty = function (type) {
    if (type !== 1) return;
    var z = this.find_obj_bypath("th/zhoubotong");
    if (z) z.destroy();
};
