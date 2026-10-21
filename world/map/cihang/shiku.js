this.inherits(ROOM);
this.name = "石窟";
this.desc = "这是茶园中间一块达四丈的巨岩，被挖空用作潜修的石窟，身处茶树包围，自有一番清静入心的禅意。石窟内除了一处石墩外空无一物。";
this.exits = {
    "out": "cihang/chayuan",
};

// [mech] 石窟领悟（攻略：击杀庞斑后，回到初始地，进入桃源小径、石窟，领悟即可，完结）
this.set_item("shibi", "石壁", "一面被岁月磨得温润的石壁，隐约有剑痕自壁中透出，似有若无。", [
    ["lingwu", "领悟石壁", null]
]);
this.add_action("lingwu", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("cihang_done")) {
        me.notify("石壁剑意已尽入你心，再无所得。");
        return true;
    }
    if (!me.query_temp("cihang_lanjiang_done")) {
        me.notify("<hir>你盯着石壁上的剑痕，心头却乱如麻——拦江岛一战未了，你静不下心来。</hir>");
        me.notify("<hiy>（须先在拦江岛了结与浪翻云/庞斑的约战）</hiy>");
        return true;
    }
    var area = this.parent;
    me.set_temp("cihang_done", 1);
    me.notify("<hiz>你在石壁前盘膝而坐，七日七夜，七苦一一自心头流过……</hiz>");
    me.notify("<hio>石壁上剑痕忽然活了过来，化作一路剑意直入眉心——慈航剑典，你悟了！</hio>");
    me.add_title("慈航剑典", "fb");
    if (area && area.score) me.add_fbscore(area.score);
    me.notify("<hig>慈航静斋副本已了，可回动作栏点「完成副本」结算。</hig>");
    me.send_room("$N自石壁前起身，周身剑气内敛，已悟慈航剑典。");
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("cihang_done")) {
        me.notify("<hiy>石窟清静，石壁上的剑痕已黯。</hiy>");
    } else if (me.query_temp("cihang_lanjiang_done")) {
        me.notify("<hiy>石窟中石壁光滑如镜，你只觉七苦皆空，正是领悟之时——看那石壁。</hiy>");
    } else {
        me.notify("<hiy>石窟清静，你却心绪翻涌，难以入定。</hiy>");
    }
};
