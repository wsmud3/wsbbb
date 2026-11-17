this.inherits(ROOM);
this.name = "平台";
this.desc = "一处临海的石台，台下惊涛拍岸。石台东侧有一块突兀的<span cmd='look shikuai'>石块</span>，石缝间似有门户。";
// 东面剑冢要「推石块 → 我准备好了 → 硬抗海潮」之后才打开（原先 east 直通，机制形同虚设）
this.exits = { "south": "gm2/qiaobi" };
this.set_npc([]);

// 原版机制（攻略第 30 节）：点石块 → 杨过会来 → 点「我准备好了」抗一下海潮汹涌（一刀 55w 左右）→ 进剑冢。
// 海潮汹涌由杨过打出：伤害按杨过攻击算，玩家的闪避（凌波）、招架（10 万左右基本能架住）、防御与免伤都起作用。
function gm2_area(room) { return room && room.parent && room.parent.gm2_find ? room.parent : null; }

function push_stone(me) {
    if (!me.is_player) return true;
    if (this.query_temp(me, "gm2_tide_ok")) {
        me.notify("石门已经开了，东面就是剑冢。");
        return true;
    }
    var a = gm2_area(this);
    var yg = this.find_obj_bypath("gm2/yangguo") || (a && a.gm2_find(this, "gm2/yangguo"));
    if (!yg) yg = NPC.CREATE("gm2/yangguo", this);
    if (yg && yg.environment !== this) {
        if (yg.end_fight) yg.end_fight();
        yg.moveto(this, "杨过身形一晃，不见了踪影。", "<hiy>一阵海风卷过，杨过抱着玄铁重剑落在了石台上。</hiy>");
    }
    this.set_temp(me, "gm2_stone", 1);
    me.notify("<hiw>你用力推动石块，石块缓缓移开，露出一道石门，门后剑气森然。</hiw>");
    me.notify("<hiy>杨过道：「剑冢岂是说进就进的？接得住我这一招海潮汹涌，便放你过去。」</hiy>");
    me.send_commands("ready", "我准备好了");
    return true;
}
this.set_item("shikuai", "石块", "石台东侧一块突兀的巨石，与山壁之间似乎有缝隙，好像推得动。", [
    ["push_stone", "推动石块", push_stone]
]);
this.add_action("push_stone", "推动石块", push_stone);

this.add_action("ready", "我准备好了", function (me) {
    if (!me.is_player) return true;
    if (this.query_temp(me, "gm2_tide_ok")) {
        me.notify("石门已经开了，东面就是剑冢。");
        return true;
    }
    if (!this.query_temp(me, "gm2_stone")) {
        me.notify("<red>石门还没开，先推动那块石块。</red>");
        return true;
    }
    var yg = this.find_obj_bypath("gm2/yangguo");
    if (!yg || yg.hp <= 0) {
        me.notify("杨过不在这里，再推一下石块看看。");
        return true;
    }
    this.send_room("<hic>杨过长啸一声，玄铁重剑横扫而出，剑风卷起滔天巨浪——「海潮汹涌」！</hic>");
    var mz = yg.mz || 0;
    var dodge = Math.random() * (me.ds / 2) + me.ds / 2 > mz;
    var parry = !dodge && !me.is_busy && (Math.random() * (me.zj / 2) + me.zj / 2 > mz * 0.2);
    var dmg = 0;
    if (dodge) {
        me.notify("<hig>你身形飘忽，巨浪从你身侧轰然拍过，竟没沾到你半点！</hig>");
    } else if (parry) {
        me.notify("<hig>你稳住身形硬架这一剑，借势卸去了海潮之力！</hig>");
    } else {
        dmg = me.damage(Math.floor((yg.gj || 0) * 2.1), yg) || 0;
        me.notify("<hir>海潮狠狠拍在你身上，造成" + dmg + "点伤害！</hir>");
        if (me.notify_hp) me.notify_hp();
    }
    if (me.hp <= 0) {
        me.notify("<hir>你被海潮卷下石台……</hir>");
        me.die(yg);
        return true;
    }
    this.set_temp(me, "gm2_tide_ok", 1);
    this.add_exit("east", "gm2/jianzhong");
    this.refresh(me);
    this.send_room("<hiy>杨过收剑而立，点头道：「好！剑冢就在里面，去吧。」</hiy>");
    return true;
});
