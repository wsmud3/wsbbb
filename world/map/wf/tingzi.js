this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版机制：五兄弟平时各自待在自己房间，跳上木桩时被【挪到当前房间】一起出战；
// 温方义 / 温方山 没有单独房间，是在木桩处出现的。
// 注意：这里必须用「NPC 路径 → 所在房间路径」的映射，不能拿 NPC 路径去 ROOM.Get。
var WF_PULL = [
    ["wf/wenfangda", "wf/dating"],
    ["wf/wenfangshi", "wf/wen4"],
    ["wf/wenfangnan", "wf/wen5"]
];
var WF_SPAWN = ["wf/wenfangyi", "wf/wenfangshan"];

this.pull_brothers = function (me) {
    var moved = 0;
    var log = [];
    for (var k = 0; k < WF_PULL.length; k++) {
        var npcPath = WF_PULL[k][0];
        var roomPath = WF_PULL[k][1];
        var tpl = ROOM.Get(roomPath);
        if (!tpl) { log.push(npcPath + ":房间模板缺失"); continue; }
        var owner = null;
        if (tpl.parent && tpl.parent.query_owner) owner = tpl.parent.query_owner(me);
        var copy = null;
        if (owner && tpl.query_copy) copy = tpl.query_copy(owner);
        if (copy && copy.items) {
            var found = null;
            for (var i = 0; i < copy.items.length; i++) {
                var o = copy.items[i];
                if (o && o.path === npcPath && o.hp > 0) { found = o; break; }
            }
            if (found) {
                if (copy !== this) found.moveto(this);
                found.do_kill(me);
                moved++;
                log.push(npcPath + ":挪来");
            } else {
                log.push(npcPath + ":该房间副本内已无存活");
            }
        } else {
            // 玩家还没进过那间房（副本房间懒创建）→ 视为他本来就在那间，直接放到木桩
            var n = NPC.CREATE(npcPath, this);
            if (n) { n.do_kill(me); moved++; log.push(npcPath + ":房间未创建→生成"); }
            else log.push(npcPath + ":生成失败");
        }
    }
    for (var j = 0; j < WF_SPAWN.length; j++) {
        var exist = false;
        for (var m = 0; m < this.items.length; m++) {
            if (this.items[m] && this.items[m].path === WF_SPAWN[j] && this.items[m].hp > 0) { exist = true; break; }
        }
        if (exist) { log.push(WF_SPAWN[j] + ":已在场"); continue; }
        var np = NPC.CREATE(WF_SPAWN[j], this);
        if (np) { np.do_kill(me); moved++; log.push(WF_SPAWN[j] + ":生成"); }
        else log.push(WF_SPAWN[j] + ":生成失败");
    }
    me.notify("<hic>[调试] moved=" + moved + " | " + log.join(" ; ") + "</hic>");
    return moved;
};

this.set_item("zhuang", "木桩", "这是几根分布得怪里怪气的木桩，看上去不是很结实。", [
    ["tiao", "跳上去", function (me) {
        if (!me.is_player) return true;
        var alive = 0;
        for (var i = 0; i < this.items.length; i++) {
            var o = this.items[i];
            if (o && o.path && o.path.indexOf("wf/wenfang") === 0 && o.hp > 0) alive++;
        }
        if (alive > 0) {
            me.notify("<hiy>温家兄弟已经围上来了，先打完再说。</hiy>");
            return true;
        }
        if (!me.query_temp("wf_zhuang_spawned")) {
            me.set_temp("wf_zhuang_spawned", 1, 7200000);
            me.send_room("$N纵身跳上木桩，湖心小岛后忽然转出几条人影。");
            this.pull_brothers(me);
            return true;
        }
        if (me.query_temp("wf_jinshe_spawned")) {
            me.notify("<hiy>木桩后已经没人了。</hiy>");
            return true;
        }
        me.set_temp("wf_jinshe_spawned", 1, 7200000);
        // 副本里跨房间传送：目标房间的副本实例不存在时必须先创建（与 go.js 一致），
        // 否则 me.moveto("路径") 会静默失败（下一跳反而落回本房间）。
        var tpl = ROOM.Get("wf/xiaoyuan");
        if (!tpl) return true;
        var cur = me.environment;
        var owner = cur && cur.owner;
        var dest = owner ? tpl.query_copy(owner) : null;
        if (!dest) {
            dest = BASE.CREATE(__PATH.MAP, "wf/xiaoyuan");
            if (dest) {
                dest.owner = owner;
                if (!tpl.copy_rooms) tpl.copy_rooms = {};
                tpl.copy_rooms[owner] = dest;
            }
        }
        if (!dest) {
            me.notify("这里不能过去。");
            return true;
        }
        me.send_room("$N再次纵身跳上木桩，眼前一花——竟已落在府后的小院里。");
        me.moveto(dest, null, "你落在小院中，院里站着两个人。");
        // 金蛇郎君不主动叫杀，由玩家自己动手。
        return true;
    }]
]);
