this.inherits(ROOM);
this.name = "论剑台";
this.desc = "这里是华山最高一座山峰，眼前是一方圆数十丈的平台，有一凸起约丈高的石台，岩石上刻着四个大字：【华山论剑】，再上还有一处更加陡峭的<span cmd='look bi'>绝壁</span>，一般人很难再上去了。";
this.exits = {
    "west": "hslj/west",
    "east": "hslj/east",
    "south": "hslj/south",
    "north": "hslj/north",
};

// [mech] 论剑台五绝车轮战（攻略：干掉黄药师、一灯大师、欧阳锋、洪七公、王真人；不要用凌波溜走，不然会中断[0%完成]）
this.hslj_chain = ["hslj/dongxie", "hslj/nandi", "hslj/xidu", "hslj/beigai", "hslj/zhongshentong"];
this.hslj_next = 0;

this.hslj_spawn = function (me) {
    if (this.hslj_next >= this.hslj_chain.length) return null;
    var p = this.hslj_chain[this.hslj_next];
    this.hslj_next++;
    var npc = NPC.CREATE(p, this);
    this.refresh(me || this.find_me());
    if (npc && me) npc.do_kill(me);
    return npc;
};

this.hslj_all_dead = function () {
    if (this.hslj_next < this.hslj_chain.length) return false;
    for (var i = 0; i < this.hslj_chain.length; i++) {
        var npc = this.find_obj_bypath(this.hslj_chain[i]);
        if (npc && npc.hp > 0) return false;
    }
    return true;
};

// 岩壁：五绝尽败之后才能上（攻略：打完之后点岩壁，爬上去，有个宝箱）
this.set_item("bi", "绝壁", "论剑台上方一处陡立的岩壁，石缝间可容手足，隐约有一道旧年的攀痕。", [
    ["pashang", "爬上绝壁", null]
]);
this.add_action("pashang", null, function (me, arg) {
    if (!me.is_player) return true;
    if (!this.hslj_all_dead()) {
        me.notify("<hir>岩壁陡立，你正要攀援，身后剑风骤起——五绝未败，此刻分心便是找死。</hir>");
        return true;
    }
    me.set_temp("hslj_done", 1);
    me.send_room("$N手足并用，攀上绝壁。");
    me.moveto("hslj/juebi");
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("hslj_done")) {
        me.notify("<hiy>论剑台上风声猎猎，五绝已败，岩壁之上自有宝物。</hiy>");
        return;
    }
    if (this.hslj_next === 0) {
        me.notify("<hiy>你踏上论剑台，四下云雾翻涌，五绝的气息已自四方逼来。</hiy>");
        me.notify("<hiw>（切记：此战不可离台，离台则前功尽弃）</hiw>");
        this.hslj_spawn(me);
    }
};

// 五绝逐个登场
this.on_heart_beat = function (dt) {
    if (this.hslj_next === 0) return;
    if (this.hslj_next >= this.hslj_chain.length) return;
    var last = this.hslj_chain[this.hslj_next - 1];
    var npc = this.find_obj_bypath(last);
    if (npc && npc.hp > 0) return;
    if (!this.find_me()) return;
    var me = this.find_me();
    this.hslj_spawn(me);
    if (this.hslj_next >= this.hslj_chain.length) {
        this.notify("<hir>四位绝顶高手已败，华山之巅只剩下一个背影——中神通王重阳缓缓转身。</hir>");
    }
};

// 离台即中断（攻略：不要用凌波溜走不然会中断[0%完成]）
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (me.query_temp("hslj_done")) return true;
    if (this.hslj_next === 0) return true;
    this.hslj_next = 0;
    for (var i = 0; i < this.items.length; i++) {
        var it = this.items[i];
        if (!it || it.is_player) continue;
        if (it.path && it.path.indexOf("hslj/") === 0) it.destroy();
    }
    me.notify("<hir>你中途离开论剑台，五绝气势一泄——此战中断，只得重头再来。</hir>");
    return true;
};
