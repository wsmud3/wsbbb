// 帮派守卫襄阳任务 - 每个帮派独立副本，帮主/副帮主直接开启
this.inherits(TASK);
this.id = "xyparty";
this.name = "帮派守卫襄阳";
this.allow_commands = { start: true, bm: true, reward: true };

// 帮派对象上存储状态的键前缀
var STATE_PREFIX = "xy_pt_";

// 启动任务（帮主或副帮主在副本中调用）
this.start = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");
    var myRole = pt.get_role(me.id);
    if (!myRole || myRole.level > 2) return me.notify("只有帮主和副帮主才能开启守城。");

    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status === 1) return me.notify("守城正在进行中！");
    if (status >= 10) {
        // 上一轮已结束：清空状态开启新一轮（上一轮未领取的奖励将失效）
        pt.set_temp(STATE_PREFIX + "status", 0);
        pt.set_temp(STATE_PREFIX + "sc", 0);
        me.notify("上一轮守城已结束，新一轮即将开启（未领取的奖励已失效）。");
    }

    // 检查帮派活跃度
    var score = pt.query_score();
    if (score < 100) return me.notify("帮派活跃度不足100，无法开启守城。当前活跃度：" + score);

    pt.set_temp(STATE_PREFIX + "status", 1);
    pt.set_temp(STATE_PREFIX + "wave", 0);
    pt.set_temp(STATE_PREFIX + "users", 0);
    pt.add_temp(STATE_PREFIX + "round", 1);
    pt.set_temp(STATE_PREFIX + "start_time", Date.now());

    var self = this;

    // 通知帮派频道
    WORLD.COMMANDS["pty"].send_system(pt, "<mag>【帮派守城】" + me.name + "发起了守卫襄阳！蒙古大军将在5分钟后攻城，请速到帮派驻地的帮会管理员处进入副本参战！</mag>");

    // 5分钟后开始
    me.call_out(function () {
        var s = pt.query_temp(STATE_PREFIX + "status", 0);
        if (s !== 1) return;
        self.run(pt);
    }, 300000);

    me.notify("<hig>守城已开启！蒙古大军将在5分钟后攻城，请通知帮派成员尽快进入副本。</hig>");
};

// 报名
this.bm = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");

    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return me.notify("当前没有守城活动。");

    var round = pt.query_temp(STATE_PREFIX + "round", 0);
    if (me.query_temp("xy_pt_bm_" + round)) return me.notify("你已经报名过了。");

    var count = pt.query_temp(STATE_PREFIX + "users", 0);
    if (count >= 40) return me.notify("报名人数已达上限(40人)。");

    me.set_temp("xy_pt_bm_" + round, 1, 3600000);
    pt.add_temp(STATE_PREFIX + "users", 1);
    me.notify("<hig>你已成功报名帮派守城！</hig>");
};

// 开始战斗
this.run = function (pt) {
    pt.set_temp(STATE_PREFIX + "wave", 1);

    try {
        WORLD.COMMANDS["pty"].send_system(pt, "<hir>【帮派守城】蒙古大军开始攻城了！请守卫襄阳！</hir>");
    } catch (e) {}

    // 生成郭靖（如果不存在）
    var square = ROOM.Get("xy_party/guangchang");
    if (square) {
        var copy = square.query_copy(pt.id);
        if (copy) {
            var hasGuo = false;
            for (var i = 0; i < copy.items.length; i++) {
                if (copy.items[i].name === "郭靖") {
                    hasGuo = true;
                    break;
                }
            }
            if (!hasGuo) {
                var guo = NPC.CLONE("xiangyang/guo");
                if (guo) {
                    copy.items.push(guo);
                    guo.environment = copy;
                }
            }
        }
    }

    var self = this;
    // 第一波敌人（30秒后）
    setTimeout(function () {
        self.spawn_wave(pt, 0);
    }, 30000);
};

// 敌人生成波次
this.spawn_wave = function (pt, wave) {
    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status !== 1) return;

    var gates = ["northgate2", "southgate2", "eastgate2", "westgate2"];
    var enemies;

    switch (wave) {
        case 0: enemies = [["xiangyang/menggu5", 5]]; break;
        case 1: enemies = [["xiangyang/menggu5", 4], ["xiangyang/menggu4", 1]]; break;
        case 2: enemies = [["xiangyang/menggu5", 3], ["xiangyang/menggu4", 1], ["xiangyang/menggu3", 1]]; break;
        case 3: enemies = [["xiangyang/menggu4", 3], ["xiangyang/menggu3", 1], ["xiangyang/menggu2", 1]]; break;
        case 4: enemies = [["xiangyang/menggu1", 1], ["xiangyang/menggu2", 2]]; break;
        case 5: enemies = [["xiangyang/menggu1", 1], ["xiangyang/menggu2", 2]]; break;
        case 6: this.spawn_boss(pt); return;
        default: return;
    }

    for (var g = 0; g < gates.length; g++) {
        var gateRoom = ROOM.Get("xy_party/" + gates[g]);
        if (!gateRoom) continue;
        var copy = gateRoom.query_copy(pt.id);
        if (!copy) continue;

        this.clear_enemies(copy);

        for (var e = 0; e < enemies.length; e++) {
            var npcPath = enemies[e][0];
            var count = enemies[e][1];
            for (var c = 0; c < count; c++) {
                var npc = NPC.CLONE(npcPath);
                if (npc) {
                    npc.xy_party_pt = pt.id;
                    copy.items.push(npc);
                    npc.environment = copy;
                }
            }
        }
    }

    pt.set_temp(STATE_PREFIX + "wave", wave + 1);

    var self = this;
    if (wave < 5) {
        setTimeout(function () {
            self.spawn_wave(pt, wave + 1);
        }, 30000);
    } else {
        setTimeout(function () {
            self.spawn_wave(pt, 6);
        }, 10000);
    }
};

// 生成BOSS蒙哥
this.spawn_boss = function (pt) {
    var square = ROOM.Get("xy_party/guangchang");
    if (!square) return;
    var copy = square.query_copy(pt.id);
    if (!copy) return;

    var boss = NPC.CLONE("xiangyang/ge");
    if (boss) {
        var self = this;
        boss.xy_party_pt = pt.id;
        // 击杀蒙哥即获胜（守城进行中才结算，避免与超时撤退重复结算）
        boss.on_die = function (killer) {
            if (pt.query_temp(STATE_PREFIX + "status", 0) === 1) {
                self.end(pt, 1);
            }
        };
        copy.items.push(boss);
        boss.environment = copy;

        try {
            WORLD.COMMANDS["pty"].send_system(pt, "<hir>【帮派守城】蒙古可汗蒙哥亲率大军出现在中央广场！击杀蒙哥即可获胜！</hir>");
        } catch (e) {}

        setTimeout(function () {
            var s = pt.query_temp(STATE_PREFIX + "status", 0);
            if (s === 1) self.end(pt, 2);
        }, 600000);
    }
};

// 清理敌人
this.clear_enemies = function (room) {
    for (var i = room.items.length - 1; i >= 0; i--) {
        var item = room.items[i];
        if (item.xy_party_pt && !item.is_player) {
            room.items.splice(i, 1);
        }
    }
};

// 结束战斗
this.end = function (pt, issuc) {
    var statusKey = STATE_PREFIX + "status";
    var scKey = STATE_PREFIX + "sc";

    if (issuc === 1) {
        pt.set_temp(statusKey, 12);
        pt.set_temp(scKey, 2);
        try { WORLD.COMMANDS["pty"].send_system(pt, "<hig>【帮派守城】襄阳城大获全胜！请到中央广场领取军功奖励！</hig>"); } catch (e) {}
    } else if (issuc === 2) {
        pt.set_temp(statusKey, 11);
        pt.set_temp(scKey, 1);
        try { WORLD.COMMANDS["pty"].send_system(pt, "<hig>【帮派守城】蒙古大军撤退，襄阳危机解除！请领取军功奖励！</hig>"); } catch (e) {}
    } else {
        pt.set_temp(statusKey, 10);
        pt.set_temp(scKey, 0);
        try { WORLD.COMMANDS["pty"].send_system(pt, "<hir>【帮派守城】郭大侠战死，襄阳城失守！</hir>"); } catch (e) {}
    }

    // 清理所有敌人
    var gates = ["northgate2", "southgate2", "eastgate2", "westgate2"];
    for (var g = 0; g < gates.length; g++) {
        var gateRoom = ROOM.Get("xy_party/" + gates[g]);
        if (gateRoom) {
            var copy = gateRoom.query_copy(pt.id);
            if (copy) this.clear_enemies(copy);
        }
    }
    var square = ROOM.Get("xy_party/guangchang");
    if (square) {
        var copy = square.query_copy(pt.id);
        if (copy) this.clear_enemies(copy);
    }
};

// 领取奖励
this.reward = function (me) {
    var pt = me.query_party();
    if (!pt) return me.notify("你还没有加入帮派。");

    var status = pt.query_temp(STATE_PREFIX + "status", 0);
    if (status < 10) return me.notify("守城尚未结束。");

    var sc = pt.query_temp(STATE_PREFIX + "sc", 0);
    var round = pt.query_temp(STATE_PREFIX + "round", 0);
    if (me.query_temp("xy_pt_rewarded_" + round)) return me.notify("你已经领取过奖励了。");

    var jungong = 0;
    if (sc === 2) jungong = 200;
    else if (sc === 1) jungong = 100;

    if (jungong > 0) {
        add_jungong(me, jungong);
        me.set_temp("xy_pt_rewarded_" + round, 1, 86400000);
        me.notify("<hig>你获得了" + jungong + "点军功奖励！</hig>");
    } else {
        me.notify("守城失败，没有奖励。");
    }
};

const JUNGONG_LIMITS = [10, 50, 100, 200, 300, 400, 500];//每周军功上限

function add_jungong(me, count) {
    let max = JUNGONG_LIMITS[me.level];
    if (me.query_temp('jg_week', 0) >= max) return false;
    let value = me.add_temp('jg_week', count, UTIL.diff_week_time());
    if (value > max) {
        me.add_temp('jg_week', max - value, UTIL.diff_week_time());
        count = count + max - value;
        me.add_temp('jg', count);
        value = max;
    } else {
        me.add_temp('jg', count);
    }
    me.notify("<hiy>你获得了" + count + "点军功，本周已获得"
        + value + "/" + max + "。</hiy>");
}
