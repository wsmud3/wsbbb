// 帮派绿柳山庄任务
this.inherits(TASK);
this.id = "lvliu_party";
this.name = "帮派绿柳山庄";
this.allow_commands = { start: true, bm: true };

var STATE_PREFIX = "lvliu_pt_";

// 房间顺序配置 [房间名, [npc路径, 数量], ...]
var ROOM_MONSTERS = [
    { room: "zoulang1", npcs: [["lvliu/huwei", 3]] },
    { room: "zoulang2", npcs: [["lvliu/jingying", 3]] },
    { room: "huayuan",  npcs: [["lvliu/gaoshou", 3]] },
    { room: "houting",  npcs: [["lvliu/hufa", 3]] },
    { room: "mishi",    npcs: [["lvliu/zhanglao", 3]] },
    { room: "dilao",    npcs: [["lvliu/hebibweng", 1], ["lvliu/luzhangke", 1]] },
];

// 启动
this.start = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");
    var myRole = pt.get_role(me.id);
    if (!myRole || myRole.level > 2) return me.notify("只有帮主和副帮主才能开启绿柳山庄。");

    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status === 1) return me.notify("绿柳山庄正在进行中！");

    var score = pt.query_score();
    if (score < 200) return me.notify("帮派活跃度不足200，无法开启。当前活跃度：" + score);

    // 清除上次残留的生成标记
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        pt.remove_temp(STATE_PREFIX + "spawned_" + ROOM_MONSTERS[r].room);
    }
    pt.set_temp(STATE_PREFIX + "status", 1);

    // 30分钟自动关闭定时器
    var self = this;
    var timerKey = STATE_PREFIX + "timer";
    var existingTimer = pt.query_temp(timerKey, 0);
    if (existingTimer) clearTimeout(existingTimer);
    var timerId = setTimeout(function () {
        self.auto_close(pt);
    }, 1800000); // 30分钟 = 1800000ms
    pt.set_temp(timerKey, timerId);

    WORLD.COMMANDS["pty"].send_system(pt, "<mag>【帮派绿柳】" + me.name + "开启了绿柳山庄！请通过帮会管理员进入副本。</mag>");

    me.notify("<hig>绿柳山庄已开启！副本将在30分钟后自动关闭。</hig>");
};

// 报名
this.bm = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return me.notify("当前没有绿柳山庄活动。");
    if (me.query_temp("lvliu_pt_bm")) return me.notify("你已经报名过了。");
    me.set_temp("lvliu_pt_bm", 1, 3600000);
    me.notify("<hig>你已报名绿柳山庄！</hig>");
};

// 一次性生成所有怪物
this.spawn_all = function (pt) {
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return;

    var self = this;
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        var cfg = ROOM_MONSTERS[r];
        var baseRoom = ROOM.Get("lvliu/" + cfg.room);
        if (!baseRoom) continue;
        var copy = baseRoom.query_copy(pt.id);
        if (!copy) continue;

        // 清除旧怪
        self.clear_room(copy);

        // 生成新怪
        for (var n = 0; n < cfg.npcs.length; n++) {
            var npcPath = cfg.npcs[n][0];
            var count = cfg.npcs[n][1];
            for (var c = 0; c < count; c++) {
                var npc = NPC.CLONE(npcPath);
                if (!npc) continue;
                // 设置属性
                self.setup_npc(npc, pt, r);
                npc.lvliu_pt = pt.id;
                npc.lvliu_room = cfg.room;
                copy.items.push(npc);
                npc.environment = copy;
                copy.item_changed(npc, true);
                // 攻击房间内所有玩家
                for (var p = 0; p < copy.items.length; p++) {
                    var player = copy.items[p];
                    if (player.is_player && player.hp > 0) {
                        npc.do_kill(player);
                    }
                }
            }
        }
    }

    // 超3人狂暴
    var memberCount = self.count_players(pt);
    if (memberCount > 3) {
        for (var r = 0; r < ROOM_MONSTERS.length; r++) {
            var baseRoom2 = ROOM.Get("lvliu/" + ROOM_MONSTERS[r].room);
            if (!baseRoom2) continue;
            var copy2 = baseRoom2.query_copy(pt.id);
            if (copy2) self.apply_rage_buff(copy2);
        }
    }
};

// 设置NPC属性（面板属性直接×1.5提升50%）
this.setup_npc = function (npc, pt, roomIndex) {
    var baseLv = (roomIndex + 1) * 300;
    var mult = 1.5;  // 基础属性提升50%
    npc.level = baseLv;
    npc.max_hp = Math.floor(baseLv * 2000 * mult);
    npc.hp = npc.max_hp;
    npc.max_mp = Math.floor(baseLv * 100 * mult);
    npc.mp = npc.max_mp;
    npc.gj = Math.floor(baseLv * 30 * mult);
    npc.mz = Math.floor(baseLv * 25 * mult);
    npc.str = Math.floor(baseLv * 2 * mult);
    npc.zj = Math.floor(baseLv * 20 * mult);
    npc.ds = Math.floor(baseLv * 15 * mult);
    npc.fight_type = 2;
    npc.record_damage = true;
};

// 统计玩家人数
this.count_players = function (pt) {
    var count = 0;
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        var baseRoom = ROOM.Get("lvliu/" + ROOM_MONSTERS[r].room);
        if (!baseRoom) continue;
        var copy = baseRoom.query_copy(pt.id);
        if (!copy) continue;
        for (var i = 0; i < copy.items.length; i++) {
            if (copy.items[i].is_player) count++;
        }
    }
    return count;
};

// 清理房间怪物
this.clear_room = function (room) {
    for (var i = room.items.length - 1; i >= 0; i--) {
        if (room.items[i].lvliu_pt && !room.items[i].is_player) {
            room.items.splice(i, 1);
        }
    }
};

// 超3人狂暴：基础属性翻倍，最大血量三倍，免疫控制
this.apply_rage_buff = function (room) {
    for (var i = 0; i < room.items.length; i++) {
        var npc = room.items[i];
        if (npc.lvliu_pt && !npc.is_player && !npc.query_status("lvliu_rage")) {
            npc.add_status({
                id: "lvliu_rage",
                duration: 0,
                downside: false,
                override: 10,
                name: "群战狂暴",
                desc: "敌方人多势众，进入狂暴状态——基础属性翻倍，最大血量提升三倍，免疫所有控制效果",
                prop: { gj_per: 100, mz_per: 100, zj_per: 100, ds_per: 100, max_hp_per: 200, max_mp_per: 100, str_per: 100, ig_control: 1 }
            });
            npc.hp = npc.max_hp;
            npc.mp = npc.max_mp;
        }
    }
};

// 传送所有玩家到聚义堂
this.teleport_players = function (pt) {
    var jytBase = ROOM.Get("banghui/juyitang");
    if (!jytBase) return;
    var jytCopy = jytBase.query_copy(pt.id);
    if (!jytCopy) jytCopy = jytBase; // 如果没有副本就用原版房间

    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        var baseRoom = ROOM.Get("lvliu/" + ROOM_MONSTERS[r].room);
        if (!baseRoom) continue;
        var copy = baseRoom.query_copy(pt.id);
        if (!copy) continue;
        for (var j = copy.items.length - 1; j >= 0; j--) {
            var p = copy.items[j];
            if (p.is_player && p.hp > 0) {
                p.end_fight();
                if (p.hp <= 0) p.hp = 1;
                p.moveto(jytCopy, p.name + "离开了绿柳山庄。", p.name + "走进了聚义堂。");
                p.notify("<red>绿柳山庄副本已结束，你被传送回聚义堂。</red>");
            }
        }
    }
};

// 玩家进入房间时生成怪物
this.on_enter_room = function (me, roomName) {
    var pt = me.query_party();
    if (!pt) return;
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return;

    // 查找房间配置
    var cfg = null;
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        if (ROOM_MONSTERS[r].room === roomName) { cfg = ROOM_MONSTERS[r]; break; }
    }
    if (!cfg) return;

    // 生成怪物（每个房间只生成一次）
    var spawnedKey = STATE_PREFIX + "spawned_" + roomName;
    if (!pt.query_temp(spawnedKey, 0)) {
        pt.set_temp(spawnedKey, 1);

        var baseRoom = ROOM.Get("lvliu/" + roomName);
        if (baseRoom) {
            var copy = baseRoom.query_copy(pt.id);
            if (copy) {
                var self = this;
                for (var n = 0; n < cfg.npcs.length; n++) {
                    var npcPath = cfg.npcs[n][0];
                    var count = cfg.npcs[n][1];
                    for (var c = 0; c < count; c++) {
                        var npc = NPC.CLONE(npcPath);
                        if (!npc) continue;
                        self.setup_npc(npc, pt, r);
                        npc.lvliu_pt = pt.id;
                        npc.lvliu_room = roomName;
                        copy.items.push(npc);
                        npc.environment = copy;
                        copy.item_changed(npc, true);
                        // 攻击房间内所有玩家
                        for (var p = 0; p < copy.items.length; p++) {
                            var player = copy.items[p];
                            if (player.is_player && player.hp > 0) {
                                npc.do_kill(player);
                            }
                        }
                    }
                }
            }
        }
    }

    // 动态检测：超3人时给所有房间NPC施加狂暴buff（每次进入都检查）
    var self2 = this;
    var memberCount = self2.count_players(pt);
    if (memberCount > 3) {
        for (var r2 = 0; r2 < ROOM_MONSTERS.length; r2++) {
            var baseRoom2 = ROOM.Get("lvliu/" + ROOM_MONSTERS[r2].room);
            if (!baseRoom2) continue;
            var copy2 = baseRoom2.query_copy(pt.id);
            if (copy2) self2.apply_rage_buff(copy2);
        }
    }
};

// BOSS死亡检测 → 通关
this.check_bosses = function (pt) {
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return;

    var baseRoom = ROOM.Get("lvliu/dilao");
    if (!baseRoom) return;
    var copy = baseRoom.query_copy(pt.id);
    if (!copy) return;

    var bossAlive = false;
    for (var i = 0; i < copy.items.length; i++) {
        if (copy.items[i].lvliu_pt && !copy.items[i].is_player && copy.items[i].hp > 0) {
            bossAlive = true;
            break;
        }
    }

    if (!bossAlive) {
        pt.set_temp(STATE_PREFIX + "status", 10);
        WORLD.COMMANDS["pty"].send_system(pt, "<hig>【帮派绿柳】玄冥二老被击败！绿柳山庄通关！</hig>");
        // 帮派全员奖励
        pt.add_temp("sc" + Math.min(6, Math.max(1, 5)), 50);
        // 通关后传送所有玩家回聚义堂
        var self = this;
        self.teleport_players(pt);
        this.cleanup(pt);
    }
};

// 清理副本状态
this.cleanup = function (pt) {
    // 清除定时器
    var timerKey = STATE_PREFIX + "timer";
    var existingTimer = pt.query_temp(timerKey, 0);
    if (existingTimer) {
        clearTimeout(existingTimer);
        pt.remove_temp(timerKey);
    }
    // 重置状态，清除生成标记
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        pt.remove_temp(STATE_PREFIX + "spawned_" + ROOM_MONSTERS[r].room);
    }
    pt.set_temp(STATE_PREFIX + "status", 0);
};

// 自动关闭（30分钟超时）
this.auto_close = function (pt) {
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1 && status !== 10) return;

    // 清理所有房间怪物
    var self = this;
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        var baseRoom = ROOM.Get("lvliu/" + ROOM_MONSTERS[r].room);
        if (!baseRoom) continue;
        var copy = baseRoom.query_copy(pt.id);
        if (copy) self.clear_room(copy);
    }

    // 传送所有玩家回聚义堂
    self.teleport_players(pt);
    this.cleanup(pt);

    WORLD.COMMANDS["pty"].send_system(pt, "<red>【帮派绿柳】绿柳山庄副本时间已到（30分钟），自动关闭。</red>");
};

// 手动结束副本（帮主/副帮主）
this.stop = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");
    var myRole = pt.get_role(me.id);
    if (!myRole || myRole.level > 2) return me.notify("只有帮主和副帮主才能结束副本。");

    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1 && status !== 10) {
        // 清理残留状态
        this.cleanup(pt);
        return me.notify("当前没有进行中的绿柳山庄活动。");
    }

    // 清理所有房间怪物
    var self = this;
    for (var r = 0; r < ROOM_MONSTERS.length; r++) {
        var cfg = ROOM_MONSTERS[r];
        var baseRoom = ROOM.Get("lvliu/" + cfg.room);
        if (!baseRoom) continue;
        var copy = baseRoom.query_copy(pt.id);
        if (copy) self.clear_room(copy);
    }

    // 传送所有玩家回聚义堂
    self.teleport_players(pt);
    this.cleanup(pt);

    WORLD.COMMANDS["pty"].send_system(pt, "<red>【帮派绿柳】" + me.name + "手动结束了绿柳山庄副本。</red>");
    me.notify("<red>已结束绿柳山庄副本，所有怪物已清除，成员已被传送回聚义堂。</red>");
};
