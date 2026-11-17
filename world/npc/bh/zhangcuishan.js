this.inherits(NPC);
this.set({
    name: "张翠山",
    desc: "武当张五侠，手持长剑，面容坚毅。他与谢逊结义为兄弟，在冰火岛上相依多年。",
    title: "<hic>武当张五侠</hic>",
    gender: 1,
    age: 35,
    per: 15,
    hp: 199929,
    max_hp: 199929,
    mp: 185000,
    max_mp: 185000,
    score: 65,
    gj: 14142,
    fy: 11629,
    mz: 20044,
    ds: 9496,
    zj: 640
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
// 攻略（困难）：张五侠会缠字诀、太极拳、真武除邪——
//   太极剑法（taijijian2）自带缠字诀（忙乱）/随字诀（太极），太极拳（taijiquan2），
//   先天太极（taijishengong2）自带真武除邪；NPC 自动出招（auto_pfm）。
this.skill_map(
    ["dodge", 2081],
    ["parry", 2109],
    ["force", 2081],
    ["sword", 2081],
    ["unarmed", 2081],
    ["taijishengong2", 2081, "force"],
    ["taijiquan2", 2081, ["unarmed", "parry"]],
    ["taijijian2", 2081, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 300
});

// 困难模式小洞里协助谢逊（只在困难副本里由 bh/xiaodong 刷出）
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("张翠山长剑一横，挡在谢逊身侧：「义兄眼盲，谁也休想伤他！」");
    this.do_kill(me);
};

this.bh_xiexun = function () {
    var room = this.environment;
    if (!room || !room.find_obj_bypath) return null;
    var xx = room.find_obj_bypath("bh/xiexun");
    return xx && xx.hp > 0 ? xx : null;
};

// 攻略：不论你击杀谢逊还是张五侠，都会先打谢逊，打死了才打张五侠。
//   谢逊还活着时，打向张五侠的招式都由谢逊替他硬接（伤害转到谢逊身上）。
this.damage = function (sh, from, diff_fy, ctx) {
    var xx = this.bh_xiexun();
    var hostile = from && (from.is_player || from.master);
    if (!xx || !hostile || from === xx) return CHARACTER.prototype.damage.call(this, sh, from, diff_fy, ctx);
    var now = Date.now();
    if (!this._bh_guard_msg || now - this._bh_guard_msg > 3000) {
        this._bh_guard_msg = now;
        this.send_room("<hiy>谢逊听风辨位，大喝一声横身挡在$N身前，硬接了这一招！</hiy>");
    }
    var v = xx.damage(sh, from, diff_fy, ctx);
    if (xx.hp <= 0 && xx.die) xx.die(from);
    return v;
};

this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.send_room) room.send_room("<hiy>张翠山长叹一声，倒在了冰火岛上。</hiy>");
};
