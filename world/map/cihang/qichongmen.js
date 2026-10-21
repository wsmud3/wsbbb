this.inherits(ROOM);
this.name = "七重门";
this.desc = "你来到慈航静斋名闻天下的“七重门”，厚重的木门上观世音菩萨面露悲苦，手持净瓶杨柳净世救人。另外一边楔刻着几行小字：世间有七苦，谓人品有贵富贫贱，相貌有残缺妍丑，是名生苦。";
this.exits = {
    "south": "cihang/guangchang",
};

// [mech] 七重门：七苦迷障（攻略：生、老、病、死、爱别离、怨憎会、求不得，路线不固定，可在门上描述看见）
this.qcm_ku = ["生苦", "老苦", "病苦", "死苦", "爱别离苦", "怨憎会苦", "求不得苦"];
this.qcm_ku_desc = {
    "生苦": "门缝里透出产房的血腥与婴啼，是名生苦。",
    "老苦": "门内白发苍颜、齿摇步迟，是名老苦。",
    "病苦": "门内呻吟不绝、药气弥漫，是名病苦。",
    "死苦": "门内一片死寂、寒气刺骨，是名死苦。",
    "爱别离苦": "门内传出亲人生离死别的哭声，是名爱别离苦。",
    "怨憎会苦": "门内怨毒之气扑面，冤家聚头，是名怨憎会苦。",
    "求不得苦": "门内尽是伸手而不可得之影，是名求不得苦。"
};
this.qcm_order = null;   // 本局七扇门各自对应的苦（随机排列）
this.qcm_step = 0;       // 已通过的重数

// 每次进入副本随机打乱七苦的分布（路线不固定）
this.qcm_shuffle = function () {
    if (this.qcm_order) return;
    var pool = [];
    for (var i = 0; i < this.qcm_ku.length; i++) pool.push(this.qcm_ku[i]);
    this.qcm_order = [];
    while (pool.length > 0) {
        var k = Math.floor(Math.random() * pool.length);
        this.qcm_order.push(pool.splice(k, 1)[0]);
    }
    this.qcm_step = 0;
};

// 推开一扇门：必须按七苦次序（生→老→病→死→爱别离→怨憎会→求不得）
this.qcm_push = function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("cihang_qcm")) {
        me.notify("七重门已开，你径直走了过去。");
        return true;
    }
    this.qcm_shuffle();
    var idx = parseInt(String(arg || "").replace(/^men/, ""), 10);
    if (!(idx >= 1 && idx <= 7)) return true;
    var ku = this.qcm_order[idx - 1];
    var need = this.qcm_ku[this.qcm_step];
    if (ku === need) {
        this.qcm_step++;
        me.notify("<hig>你推开" + ku + "之门，门后罡风散开——第" + this.qcm_step + "重已过。</hig>");
        if (this.qcm_step >= 7) {
            me.set_temp("cihang_qcm", 1);
            me.notify("<hio>七苦皆渡，七重门轰然中开！慈航静斋内院已在眼前。</hio>");
            me.send_room("$N周身佛光微现，七重门缓缓向两侧开启。");
        } else {
            me.notify("<hiy>下一重是「" + this.qcm_ku[this.qcm_step] + "」。看准门上的字迹再推。</hiy>");
        }
    } else {
        this.qcm_step = 0;
        me.notify("<hir>你推开" + ku + "之门，门内罡风骤起，把你逼了回来！七苦次序不对，重头再来。</hir>");
        me.notify("<hiy>切记次序：生、老、病、死、爱别离、怨憎会、求不得。</hiy>");
    }
    return true;
};
this.add_action("tui", null, this.qcm_push);

// 七扇门：描述即为门上的字迹（攻略：可以在门上的描述上看见）
this.qcm_open_doors = function () {
    for (var i = 1; i <= 7; i++) {
        this.set_item("men" + i, "第" + i + "重门", "门楣上镌着三个古字：「" + this.qcm_order[i - 1] + "」。",
            [["tui", "推开此门", this.qcm_push]]);
    }
};
// set_item 时描述已定，故按当前排列重建一次
this.qcm_order = null;
this.qcm_shuffle();
this.qcm_open_doors();
// 打乱后重写门上的字（副本每次创建都重新排列）
this.qcm_retitle = function () {
    if (!this.hidden_items) return;
    for (var i = 0; i < this.hidden_items.length; i++) {
        var it = this.hidden_items[i];
        if (!it || !it.id || it.id.indexOf("men") !== 0) continue;
        var idx = parseInt(it.id.replace(/^men/, ""), 10);
        if (!(idx >= 1 && idx <= 7)) continue;
        it.desc = "门楣上镌着三个古字：「" + this.qcm_order[idx - 1] + "」。";
        it.json = null;
    }
};
this.qcm_retitle();

// 未参透七苦者不得过门
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (me.query_temp("cihang_qcm")) return true;
    me.notify("<hiy>七重门紧闭如铁，你还未参透七苦，过不去。</hiy>");
    return false;
};
