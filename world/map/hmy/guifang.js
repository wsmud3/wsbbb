this.inherits(ROOM);
this.name = "闺房";
this.desc = "东方不败的闺房，绣帷低垂，暗藏杀机。";
this.exits = { "west": "hmy/xiaohuayuan" };

// [mech] 进入闺房即被叫杀（攻略：进入闺房后杨莲亭和东方不败会主动叫杀，你会优先击杀杨莲亭）
this.set_npc(["hmy/dongfangbubai", 1]);
this.set_npc(["hmy/yanglianting", 1]);

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("hmy_guifang_entered")) return;
    me.set_temp("hmy_guifang_entered", 1);
    me.notify("<hir>绣帷无风自动，杨莲亭与东方不败已在房中：「来得好，正好试试我的绣花针。」</hir>");
    me.notify("<hiw>（杨莲亭倒下后，东方不败会立时狂暴并展开鬼魅身法，约三十息）</hiw>");
};
