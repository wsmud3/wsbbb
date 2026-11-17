this.inherits(ROOM);
this.name = "大门";
this.desc = "日月神教的大门，杨莲亭在此拦路。";
this.exits = { "west": "hmy/up1", "east": "hmy/chengdedian" };
this.set_npc(["hmy/yanglianting", 1]);

// [mech] 困难模式：三令上崖后，三位堂主一起出战（攻略：困难需三个令牌上崖后才见到3位堂主，然后1v3）
// 三堂大厅里的堂主在困难模式开副本时已移走（bh_ting / ql_ting / fl_ting 的 on_set_difficulty）。
this.v3_spawned = false;
var HMY_V3 = ["hmy/shangguanyun", "hmy/jiabu", "hmy/tongbaixiong"];
var HMY_TOKENS = ["res/baihulingpai", "res/qinglonglingpai", "res/fengleilingpai"];

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.query_temp(me, "diff", 0) !== 1) return;
    if (this.v3_spawned) return;
    this.v3_spawned = true;
    for (var i = 0; i < HMY_V3.length; i++) {
        if (this.find_obj_bypath(HMY_V3[i])) continue;
        NPC.CREATE(HMY_V3[i], this);
        var npc = this.find_obj_bypath(HMY_V3[i]);
        // 困难模式的令牌要去普通模式刷（攻略），崖顶的堂主不再掉令牌
        if (npc && npc.drop_list) {
            npc.drop_list = npc.drop_list.filter(function (d) {
                var o = d && d.obj;
                if (o instanceof Array) o = o[0];
                return HMY_TOKENS.indexOf(o) < 0;
            });
        }
    }
    this.refresh(me);
    this.send_room("<hir>崖顶白影闪动，白虎、青龙、风雷三位堂主已并肩拦住去路——「三令齐至，便由我们三人送你上路！」</hir>");
    for (var j = 0; j < this.items.length; j++) {
        var it = this.items[j];
        if (it && !it.is_player && it.hp > 0 && it.do_kill) it.do_kill(me);
    }
};
