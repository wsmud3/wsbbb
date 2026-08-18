this.inherits(NPC);
this.set({
    name: "武馆教习",
    desc: "一个高大威猛的汉子，负责教导武馆新人基本功法",
    gender: 1,
    age: 25,
    per: this.random(20) + 10,
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    family: FAMILIES.NONE
});
this.skill_map(
    ["force", 5000],
    ["dodge", 5000],
    ["parry", 5000],
    ["sword", 5000],
    ["blade", 5000],
    ["club", 5000],
    ["staff", 5000],
    ["whip", 5000],
    ["unarmed", 5000],
    ["throwing", 5000],
    ["niutou", 3000],
    ["nixianmojue", 5000, "force"],
    ["tiandiqipan", 5000, "unarmed"],
    ["tianditongshou", 5000, "unarmed"],
    ["xiuluodao", 5000, "blade"],
    ["cihangjiandian", 5000, "force"],
    ["shandianwulianbian", 5000, "whip"],
    ["dapintianxianjue", 5000, "force"]
);
this.on_checkskill = function (me) {
    if (!me.query_temp("wg_sr")) {
        me.send_room("武馆教习瞄了$N一眼：100两白银，先交钱再学功夫，包教包会。");

        return me.notify_fail('{type:"cmds",items:{cmd:"give ' + this.id + ' 10000 money",name:"交报名费"}}');
    }
    return true;
}
this.on_teach = function (me) {
    return me.query_temp("wg_sr") == 1;
}
this.on_accept = function (me, obj, count) {
    if (obj != "money") return false;
    if (me.query_temp("wg_sr")) {
        me.notify_fail("武馆教习摆摆手：你已经交过钱了，不用再交了。");

        return false;

    }
    if (count < 10000) return me.notify_fail("武馆教习瞪了你一眼：100两白银，不二价，没钱就一边玩去。");
    me.send_room("武馆教习收下$N的钱，拍了拍$N的肩膀：不错，以后你就是本馆的弟子了，本武馆包教基本武技到300级，随到随学，不限学时，全国连锁。");
    me.set_temp("wg_sr", 1);

    if (!me.query_temp("sm_tm")) {
        me.set_temp("sm_tm", Math.floor(Date.now() / 100000));
    }
    return true;
}

// this.add_action("ask1", "武馆任务", function (me) {
//     if (me.family != FAMILIES.NONE) return me.notify("武馆教习对你说道：你还是去找自己的师门看看吧。");
//     me.do_command("task", "sm " + this.id);
// });