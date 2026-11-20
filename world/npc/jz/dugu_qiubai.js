// 无剑虚空中的独孤求败（剑冢第五关问心）：不可攻击，上前拜见后以对话引出抉择，选择在浮窗中进行，
// 结果交给房间的机关（world/map/jz/wujianxukong.js 的 zy_puzzle：humble / proud）。
this.inherits(NPC);
this.set({
    name: "独孤求败", title: "剑魔", gender: 1, age: 60,
    desc: "一道负手而立的模糊人影，青衫落拓，鬓发如霜。你看不清他的面容，甚至不确定他是否真实存在，只觉他身上没有一丝剑气，却又像天下的剑都在他身上。",
    hp: 1000000, max_hp: 1000000, mp: 1000000, max_mp: 1000000,
    no_fight: true, no_refresh: true
});

this.add_action("jz_dugu_talk", "上前拜见", function (me) {
    if (!WORLD.ZHENYI) return false;
    // 更新前已通关剑冢、尚未领过首通奖励的角色在此补领
    if (WORLD.ZHENYI.claim_first_clear_reward(me)) me.notify("<hig>独孤求败微微颔首：「当年你闯过剑冢，我还欠你一份东西。」</hig>");
    if (WORLD.ZHENYI.stage_cleared(me, "jz", 5)) {
        return me.notify("独孤求败望着你，微微颔首：「剑已在你心中，去吧。」");
    }
    me.notify("\n<hiw>你走上前去，躬身一礼。</hiw>\n\n"
        + "人影缓缓转过身来。他的声音不响，却像是从你心底升起：\n"
        + "<hig>「一千年了，你是第一个走到这里的人。」</hig>\n"
        + "<hig>「我纵横江湖三十余载，杀尽仇寇，败尽英雄，天下更无抗手。无可奈何，惟隐居深谷，以雕为友。」</hig>\n"
        + "他望向虚空深处，像是望着很远很远的地方。\n"
        + "<hig>「呜呼！生平求一敌手而不可得，诚寂寥难堪也。」</hig>\n"
        + "良久，他的目光落回你身上。");
    me.send_commands(
        "zhenyi puzzle humble", "坦然道：我不如你",
        "zhenyi puzzle proud", "拔剑道：我来败你",
        { text: "独孤求败淡淡道：「今日，我只问你一句——你，觉得自己能胜过我吗？」" }
    );
    return true;
});

this.on_before_fight = function () { return false; };
this.on_kill = function () { return false; };
