this.inherits(ROOM);
this.name = "闺房";
this.desc = "东方不败的闺房，绣帷低垂，暗藏杀机。";
this.exits = { "west": "hmy/huayuan" };

// [mech] 进入闺房即被叫杀（攻略：进入闺房后杨莲亭和东方不败会主动叫杀，你会优先击杀杨莲亭）
// 规则见 world/area/fb1/fb25.js：挡刀、狂暴鬼魅、杨莲亭复活、唐诗剑法躺尸
this.set_npc(["hmy/dongfangbubai", 1]);
this.set_npc(["hmy/yanglianting", 1]);

this.on_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (!area || !area.hmy_get) return;
    if (!area.hmy_get(this, "hmy_guifang_entered", 0)) {
        area.hmy_set(this, "hmy_guifang_entered", 1);
        me.notify("<hir>绣帷无风自动，杨莲亭与东方不败已在房中：「来得好，正好试试我的绣花针。」</hir>");
    } else {
        // 跑路回来 / 天师符原地复活（复活流程会让玩家重新进入本房间）
        area.hmy_revive_ylt(this, me);
    }
};
