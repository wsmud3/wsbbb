this.inherits(ROOM);
this.name = "亭子";
this.desc = "你正站在湖边的一个小亭里，通过一条曲折迂回的走廊可以回到大厅。小亭修筑得相当雅致，在这里可以欣赏湖中的荷花和锦鲤，亭子北面湖中竖着几根<cmd cmd='look zhuang'>木桩</cmd>，湖心有个小岛，朦胧间看得却是不太真切。";
this.exits = {
    "south": "wf/zoulangtou",
};
this.set_npc([]);

// 原版机制：
//   五兄弟平时各自待在自己房间，跳上木桩时被【挪到当前房间】一起出战；
//   温方义 / 温方山 没有单独房间，直接在木桩处出现。
// 为避免同一个人被生成两次（大厅里还留着一个、尸体占分），
// 这里先打 wf_zhuang_spawned 标记，让各房间不再自行生成；然后能挪的挪、挪不到的才生成。
var WF_PULL = [
    ["wf/wenfangda", "wf/dating"],
    ["wf/wenfangshi", "wf/wen4"],
    ["wf/wenfangnan", "wf/wen5"]
];
var WF_SPAWN = ["wf/wenfangyi", "wf/wenfangshan"];

this.grab_from_room = function (npcPath, roomPath, me) {
    var tpl = ROOM.Get(roomPath);
    if (!tpl) return false;
    var rooms = [];
    if (tpl.copy_rooms) { for (var k in tpl.copy_rooms) rooms.push(tpl.copy_rooms[k]); }
    rooms.push(tpl);
    for (var r = 0; r < rooms.length; r++) {
        var room = rooms[r];
        if (!room || !room.items || room === this) continue;
        for (var i = 0; i < room.items.length; i++) {
            var o = room.items[i];
            if (o && o.path === npcPath && o.hp > 0) {
                o.moveto(this);
                o.do_kill(me);
                return true;
            }
        }
    }
    return false;
};

this.pull_brothers = function (me) {
    var moved = 0;
    for (var k = 0; k < WF_PULL.length; k++) {
        var npcPath = WF_PULL[k][0], roomPath = WF_PULL[k][1];
        if (this.grab_from_room(npcPath, roomPath, me)) { moved++; continue; }
        // 已经死过的兄弟不再补，避免重复计分（温方达可能在大厅已被杀）
        if (npcPath === "wf/wenfangda" && me.query_temp("wf_fangda_dead")) continue;
        var n = NPC.CREATE(npcPath, this);
        if (n) { n.do_kill(me); moved++; }
    }
    for (var j = 0; j < WF_SPAWN.length; j++) {
        var exist = false;
        for (var m = 0; m < this.items.length; m++) {
            if (this.items[m] && this.items[m].path === WF_SPAWN[j] && this.items[m].hp > 0) { exist = true; break; }
        }
        if (exist) continue;
        var np = NPC.CREATE(WF_SPAWN[j], this);
        if (np) { np.do_kill(me); moved++; }
    }
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
        // 小院里金蛇郎君还活着 → 可以反复跳回去；他死了才提示没人
        var tpl0 = ROOM.Get("wf/xiaoyuan");
        if (!tpl0) return true;
        var cur0 = me.environment;
        var owner0 = cur0 && cur0.owner;
        var xy0 = owner0 ? tpl0.query_copy(owner0) : null;
        var xsAlive = false;
        if (xy0 && xy0.items) {
            for (var q0 = 0; q0 < xy0.items.length; q0++) {
                var t0 = xy0.items[q0];
                if (t0 && t0.path === "wf/jinshelangjun" && t0.hp > 0) { xsAlive = true; break; }
            }
        }
        if (!xsAlive && me.query_temp("wf_jinshe_spawned")) {
            me.notify("<hiy>木桩后已经没人了。</hiy>");
            return true;
        }
        me.set_temp("wf_jinshe_spawned", 1, 7200000);
        // 副本内跨房间传送：目标房间副本不存在时必须先创建（同 go.js），
        // 否则 me.moveto("路径") 会静默失败。
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
        return true;
    }]
]);
