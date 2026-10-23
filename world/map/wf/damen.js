this.inherits(ROOM);
this.name = "大门";
this.desc = "这里就是成都大户温家的<cmd cmd='look men'>大门</cmd>，门口两个大石狮，威武异常，大门紧锁着，门上的铜环却亮得刺眼。围墙很高，门匾上写着两个烫金的大字“温府”，果然气度不凡。门的旁边有一株<cmd cmd='look tree'>参天大树</cmd>, 人站在下面很是凉快。";
this.exits = {
    "north": "wf/dating",
};
this.set_npc([]);
this.set_item("men", "men", "这扇门是紧闭着的，要不翻墙过去吧。", []);
this.set_item("tree", "tree", "这是一株上百年龄的老树，枝叶依然十分茂盛，看来是爬不上去的。", [
    ["climb", "跳上去", function (me) {
        if (!me.is_player) return true;
        me.send_room("$N在古树前深深地吸了口气，猛地跃了起来。只见$N足尖在树枝一点，飞身跃过高墙，已悠然飘落院中。");
        me.moveto("wf/dayuan");
        return true;
    }]
]);
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir === "north") return me.notify_fail("这扇门是紧闭着的，要不想想办法翻墙过去吧。");
    return true;
};

// 进入温府（大门）时清空上一趟残留的 wf_ 标记，保证每次都是全新一趟
this.on_enter = function (me) {
    if (!me.is_player) return;
    var keys = ["wf_aw_da", "wf_aw_xs", "wf_aw_wenfangyi", "wf_aw_wenfangshan", "wf_aw_wenfangshi", "wf_aw_wenfangnan", "wf_jinshe_dead", "wf_fangda_dead", "wf_wenlaoda", "wf_zhen_start", "wf_zhen_done", "wf_entered",
        "wf_zhuang_spawned", "wf_zhuang_clear", "wf_jinshe_spawned",
        "wf_jinshe_done", "wf_tingzi_spawned", "wf_tingzi_done",
        "wf_wufangda_dead", "wf_zhen_full", "wf_zhen_awarded", "wf_jinshe_award"];
    for (var i = 0; i < keys.length; i++) me.remove_temp(keys[i]);
};
