this.inherits(ROOM);
this.name = "崖底";
this.desc = "这是禅院后面峭壁的底下，一条小河环流而下，前面就是陡峭的山崖，崖面几近垂直，毫无借力之处，没有高明的轻功几乎不可能从这里上去。峭壁上面就是禅院的后院部分，地势险恶怪不得没有僧兵看守。";
this.exits = {
    "south": "jncz/xiaolu",
};
this.set_npc(["jncz/auto_2", 1], ["jncz/auto_3", 1], ["jncz/auto_4", 1]);

// 原版机制（盗帅线）：崖底击杀三人组后，动作栏点「跳上去」，需要 4000 轻功。
this.add_action("jump_up_4000", "跳上去", function (me) {
    if (!me.is_player) return true;
    var lv = me.query_skill("dodge", 0);
    if (lv < 4000) {
        me.notify("<red>崖壁太陡，你的基本轻功（" + lv + "）不到 4000，跃不上去。</red>");
        return true;
    }
    me.moveto("jncz/houshanya", me.name + "攀着崖壁跃了上去。", me.name + "从崖下跃了上来。");
    return true;
});
