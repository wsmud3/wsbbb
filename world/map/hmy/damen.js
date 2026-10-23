this.inherits(ROOM);
this.name = "大门";
this.desc = "日月神教的大门，杨莲亭在此拦路。";
this.exits = { "west": "hmy/up1", "east": "hmy/chengdedian" };
this.set_npc(["hmy/yanglianting", 1]);

// [mech] 困难模式：三令上崖后，三位堂主一起出战（攻略：困难需三个令牌上崖后才见到3位堂主，然后1v3）
this.v3_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.query_temp(me, "diff", 0) !== 1) return;
    if (this.v3_spawned) return;
    if (me.query_temp("hmy_v3_done")) {
        me.notify("<hiy>崖顶尸横遍地，三位堂主已尽数伏诛。</hiy>");
        return;
    }
    this.v3_spawned = true;
    var self = this;
    var paths = ["hmy/shangguanyun", "hmy/jiabu", "hmy/tongbaixiong"];
    var names = ["上官云", "贾布", "童百熊"];
    for (var i = 0; i < paths.length; i++) {
        if (this.find_obj_bypath(paths[i])) continue;
        NPC.CREATE(paths[i], this);
    }
    this.refresh(me);
    this.notify("<hir>崖顶白影闪动，白虎、青龙、风雷三位堂主已并肩拦住去路——「三令齐至，便由我们三人送你上路！」</hir>");
    for (var j = 0; j < this.items.length; j++) {
        var it = this.items[j];
        if (it && !it.is_player && it.hp > 0 && it.do_kill) it.do_kill(me);
    }
};
