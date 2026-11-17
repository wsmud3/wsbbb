this.inherits(ROOM);
this.name = "剑冢";
this.desc = "剑冢之内，神剑林立。剑灵守护着独孤求败的绝世剑法。";
this.exits = { "west": "gm2/pingtai" };
this.set_npc(["gm2/jianling", 1]);

// 普通：剑灵（不主动出手），掉盘龙簪；困难：剑魔（主动叫杀、免控、绝对命中），掉龙骨环。
this.on_set_difficulty = function (type) {
    var j = this.find_obj_bypath("gm2/jianling");
    if (!j) return;
    if (type === 1 && j.gm2_make_jianmo) j.gm2_make_jianmo();
    if (j.drop_list && this.parent && this.parent.gm2_filter_drops)
        j.drop_list = this.parent.gm2_filter_drops(j.drop_list, type === 1);
};
