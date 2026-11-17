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
        me.notify("<hiw>（杨莲亭在时会替东方不败挡刀；杨莲亭倒下后，东方不败会立时狂暴并展开鬼魅身法，约三十息）</hiw>");
    } else {
        // 跑路回来 / 天师符原地复活（复活流程会让玩家重新进入本房间）
        area.hmy_revive_ylt(this, me);
    }
    this.hmy_watch();
};

// 躺尸检测：唐诗剑法「躺尸」成功会给玩家加一个名为「装死」的忙乱状态，最短只有 2 秒，
// 比房间心跳（5 秒）还短，所以有玩家在房里时用 0.5 秒的轮询来看。
this.hmy_watch = function () {
    if (this._hmy_watch) return;
    var self = this;
    var tick = function () {
        self._hmy_watch = null;
        var area = self.parent;
        if (!area || !area.hmy_tangshi || !self.items || !self.items.length) return;
        if (area.hmy_tangshi(self)) return;
        if (!area.hmy_alive(self, "hmy/dongfangbubai")) return;
        var anyone = false;
        for (var i = 0; i < self.items.length; i++) {
            var p = self.items[i];
            if (!p || !p.is_player) continue;
            anyone = true;
            if (p.hp > 0 && p.status) {
                for (var j = 0; j < p.status.length; j++) {
                    var st = p.status[j];
                    if (st && st.id === "busy" && st.name === "装死") {
                        area.hmy_on_tangshi(self);
                        return;
                    }
                }
            }
        }
        if (!anyone) return;
        self._hmy_watch = setTimeout(tick, 500);
    };
    this._hmy_watch = setTimeout(tick, 500);
};
