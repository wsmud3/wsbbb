this.inherits(NPC);
this.set({
    name: "丫鬟",
    desc: "她是一个长得很好看的小姑娘。",
    gender: 2,
    age: 16,
    per: 30,
    mp: 100,
    max_mp: 100,
    hp: 100,
    max_hp: 100,
    score: -10,
    exp: 0,
    pot:0

});
this.add_action("ok", "救出丫鬟", function (me) {

    var type = me.query_temp("fb/cuifu/yahuan");
    if (!type) {
        me.send_room("$N看了看$n，把旁边的衣服丢给$n，道：穿好衣服，我带你出去。\n$n穿上她的衣服。",this);
        this.do_follow(me);
        me.set_temp("fb/cuifu/yahuan", 1);
        me.add_fbscore(10);
    } else {
        if (type == 2 || type == 4) {
            if (me.add_follower(this)) {
                me.notify("你想了一下觉得这个小丫头也怪可怜的，便对她说道：好吧，你就先跟着我吧！");
                me.notify("<him>你获得了丫鬟的追随，你可以去你的住所找她。</him>");
                this.do_follow(null);
                this.destroy();
            } else {
                me.notify("你现在无法收留她，或许是你随从已满，或是她已在你家中。");
            }

        } else {
            me.notify("你已经答应她了。");
        }

    }

});

this.on_enter = function (me) {
    if (!this.follow_target && !me.query_temp("fb/cuifu/yahuan")) {
        me.notify("丫鬟看到你进来，吓了一跳，待看清来人，扑到你前面泣声喊道：大人，救救我！", this);
        me.send_commands("ok " + this.id, "答应她");
    }
}

this.on_leave = function (obj, dir) {
    if (this.follow_target != obj) return;
    var rm = this.environment && this.environment.exits && this.environment.exits[dir];
    if (!rm) return;
    var next_room = ROOM.Get(rm);
    if (!next_room) return;
    if (this.environment.owner && next_room.parent === this.environment.parent) {
        next_room = next_room.query_copy(this.environment.owner);
    }
    if (next_room) {
        this.moveto(next_room);
    }
}
