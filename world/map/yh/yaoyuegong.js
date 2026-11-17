this.inherits(ROOM);
this.name = "邀月宫";
// 攻略：杀死宫主后，她的房间才有描述「花丛」可以点开（花丛原被宫主身影挡住）
this.yh_desc_closed = "这是邀月宫主休息的地方，只见一个身材奇好, 貌美如花的女子立在一片花木之前,她就是武功奇高,身份神秘的移花宫大宫主。以前因为被燕南天抛弃所以她非常恨男人，如果你是男人最好不要接近她。";
this.yh_desc_open = "这是邀月宫主休息的地方。宫主已然伏诛，她先前立身之处露出一片<cmd cmd='look hua'>花丛</cmd>，花开得正盛，似乎被人刻意栽成了某种数目。";
this.desc = this.yh_desc_closed;
this.exits = {
    "southeast": "yh/woshi",
    "northeast": "yh/changlang1",
};
this.set_npc(["yh/yaoyue", 1]);

this.yh_show_flowers = function () {
    if (this.desc === this.yh_desc_open) return;
    this.desc = this.yh_desc_open;
    this.refresh(true);
};
this.on_set_difficulty = function (type) {
    if (this.parent && this.parent.yh_setup_master) this.parent.yh_setup_master(this, "yh/yaoyue", type);
};

// 原版机制：宫主死后房间描述里有「花丛」，可以点开，记下花朵的数量。
this.set_item("hua", "花丛", "宫墙边一片花丛，花开得正盛。", [
    ["chakan", "查看花丛", function (me) {
        if (!me.is_player) return true;
        if (this.parent.yh_find_npc(this.owner, "yh/yaoyue")) {
            me.notify("邀月宫主就立在花木之前，你哪有机会凑过去细看？");
            return true;
        }
        var n = this.parent.yh_flowers(this, me, "yh_hua_yue");
        me.notify("<hiy>你拨开花丛细数，共有 " + n + " 朵花。</hiy>");
        return true;
    }]
]);

// 两位宫主是否都已伏诛（没杀完谁都别想进卧室、也别想推床）
this.yh_both_dead = function (me) {
    var area = this.parent;
    if (!area || !area.yh_find_npc) return false;
    var owner = this.owner;
    return !area.yh_find_npc(owner, "yh/yaoyue") && !area.yh_find_npc(owner, "yh/lianxing");
};

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir) return true;
    // 只拦通往卧室的方向；杀完一位宫主还要能去另一宫
    if (dir !== "southeast") return true;
    if (this.yh_both_dead(me)) return true;
    me.notify("<red>两宫之主尚未伏诛，你过不去。</red>");
    return false;
};
