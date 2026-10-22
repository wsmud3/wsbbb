this.inherits(NPC);
this.set({
    name: "杨莲亭",
    desc: "东方不败的男宠，日月神教的实际掌权者。面容俊美，心狠手辣。",
    gender: 1,
    age: 28,
    per: 18,
    hp: 755000,
    max_hp: 755000,
    mp: 122000,
    max_mp: 122000,
    score: 104,
    gj: 67075,
    fy: 36736,
    mz: 57325,
    ds: 30340,
    zj: 1575
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2346],
    ["parry", 2381],
    ["force", 2346],
    ["unarmed", 2346]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 200
}, {
    obj: ["eq/lv3/yanglianting_xiangquan"],
    odds: 6150
});
this.on_enter = function (me) {
    me.notify("杨莲亭冷笑一声：「擅闯日月神教，待教主来了，你便死无葬身之地！」");
    this.do_kill(me);
};

// [mech] 杨莲亭之死：东方不败狂暴 + 鬼魅（攻略：杨莲亭死后东方不败获得狂暴buff，并马上开启鬼魅，约30秒）
this.on_die = function (killer) {
    var env = this.environment;
    if (!env) return;
    if (killer && killer.is_player) killer.set_temp("hmy_ylt_dead", 1);
    var df = null;
    for (var i = 0; i < env.items.length; i++) {
        var it = env.items[i];
        if (it && it.path === "hmy/dongfangbubai" && it.hp > 0) { df = it; break; }
    }
    if (!df) return;
    df.add_status({
        id: "hmy_kuangbao",
        name: "<hir>狂暴</hir>",
        desc: "攻击暴涨，悍不畏死",
        duration: 30000,
        downside: false,
        override: 2,
        prop: { gj_per: 60, gjsd: 1200 }
    });
    df.add_status({
        id: "hmy_guimei",
        name: "<hiw>鬼魅</hiw>",
        desc: "身法快如鬼魅，难以捉摸",
        duration: 30000,
        downside: false,
        override: 2,
        prop: { ds_per: 50, mz_per: 20 }
    });
    df.send_room("<hir>杨莲亭倒在血泊之中，东方不败厉啸一声，双目尽赤——狂暴！鬼魅身法随之展开！</hir>");
};
