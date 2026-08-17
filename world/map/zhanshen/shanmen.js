this.inherits(ROOM);
this.name = "战神殿山门";
this.desc = "一座巍峨的石门矗立在云雾之中，门上刻满了上古蝌蚪文字，虽经万载风霜，字迹依然清晰可辨。门楣正中三个古篆大字——「战神殿」，笔锋如刀，一股苍凉肃杀之气扑面而来。门两侧各立一尊石像，高逾三丈，身披残甲，手持断戟，虽无面目，却令人望而生畏。\n\n传说此殿乃远古战神所留，藏有突破武神之秘。石门上隐约可见一行小字：「九重天上，武神为尊。」";
this.exits = { "north": "zhanshen/shendao" };

this.on_enter = function (me) {
    if (me.level >= 6) {
        var area = me.environment && me.environment.parent;
        if (area && area.id === "zhanshen") {
            me.add_fbscore(area.score);
            me.notify("\n<hig>你已是武神之身，战神殿对你而言如履平地。副本已自动完成。</hig>");
        }
    }
};
