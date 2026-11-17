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
    if (!me || !me.is_player) return;
    var room = this.environment, area = room && room.parent;
    // 闺房里躺尸之后杨莲亭不再出手
    if (room && room.path === "hmy/guifang" && area && area.hmy_tangshi && area.hmy_tangshi(room)) return;
    me.notify("杨莲亭冷笑一声：「擅闯日月神教，待教主来了，你便死无葬身之地！」");
    this.do_kill(me);
};

// [mech] 杨莲亭之死：同房间的东方不败狂暴 + 鬼魅（攻略：杨莲亭死后东方不败获得狂暴buff，并马上开启鬼魅，约30秒）
// 闺房里的杨莲亭死后记一笔，玩家跑路回来或天师符复活时他会复活（见 fb25.js hmy_revive_ylt）
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (!room || !area || !area.hmy_alive) return;
    var df = area.hmy_alive(room, "hmy/dongfangbubai");
    if (!df) return;
    area.hmy_set(room, "hmy_ylt_killed", 1);
    area.hmy_kuangbao(df);
};
