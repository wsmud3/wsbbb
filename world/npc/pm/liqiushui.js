this.inherits(NPC);
this.set({
    name: "李秋水",
    desc: "西夏皇太妃，天山童姥的宿敌。白虹掌力惊天动地，容颜虽毁，武功犹在。",
    title: "<hiy>西夏皇太妃</hiy>",
    gender: 2,
    age: 88,
    per: 10,
    hp: 1294800,
    max_hp: 1294800,
    mp: 210000,
    max_mp: 210000,
    score: 90,
    gj: 95160,
    fy: 43948,
    mz: 96720,
    ds: 50774,
    zj: 1980
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2616],
    ["parry", 2680],
    ["force", 2880],
    ["unarmed", 2880],
    ["lingboweibu", 2616, "dodge"],
    ["liuyangzhang", 2616, "unarmed"],
    ["bulaochangchungong", 2616, "force"],);
this.set_drop({
    obj: "money/silver", min: 50, max: 500
}, {
    obj: ["book/bc#bulaochangchungong"], odds: 10600
}, {
    obj: ["book/bc#shenjianjue"], odds: 10600
}, {
    obj: ["eq/lv5/wushen/tianlong_necklace"], odds: 6360
});

// 战斗由房间 on_enter 触发，NPC 不自动攻击

// 李秋水死亡
this.on_die = function(killer) {
    var room = this.environment;
    if (!room) return;
    // 检查童姥是否还活着（优先用房间引用，回退到遍历查找）
    var tonglaoAlive = false;
    if (room._tonglao && room._tonglao.hp > 0) {
        tonglaoAlive = true;
    } else {
        for (var k = 0; k < room.items.length; k++) {
            var it = room.items[k];
            if (it && it.path === 'pm/tianshantonglao' && it.hp > 0) {
                tonglaoAlive = true;
                break;
            }
        }
    }

    // 先中和副本所有存活NPC的分数，确保无论死亡顺序如何，NPC.die的通用加分都不会干扰
    var area = room.parent;
    if (area && area.rooms) {
        for (var i = 0; i < room.items.length; i++) {
            var p = room.items[i];
            if (!p || !p.is_player) continue;
            var tid = p.query_teamid();
            for (var ri = 0; ri < area.rooms.length; ri++) {
                var cp = area.rooms[ri].query_copy(tid);
                if (!cp) continue;
                for (var ci = 0; ci < cp.items.length; ci++) {
                    var it2 = cp.items[ci];
                    if (it2 && !it2.is_player && it2.hp > 0 && it2.score > 0) {
                        it2.score = 0;
                    }
                }
            }
        }
    }

    // 统一计分并通知玩家
    for (var i = 0; i < room.items.length; i++) {
        var p = room.items[i];
        if (p && p.is_player) {
            if (tonglaoAlive) {
                p.add_fbscore(250);
                p.notify('<hio>李秋水倒下了！天山童姥得以手刃宿敌，缥缈峰试炼完成！</hio>');
                if (!p.titles) p.titles = [];
                var hasTitle = false;
                for (var j = 0; j < p.titles.length; j++) {
                    if (p.titles[j].title === '灵鹫宫主') { hasTitle = true; break; }
                }
                if (!hasTitle) {
                    p.add_title('灵鹫宫主', 'fb');
                    p.notify('<hig>你获得了新称号：「灵鹫宫主」！</hig>');
                }
            } else {
                // 保护失败但击杀了李秋水，结算李秋水自身分数作为部分完成度
                p.add_fbscore(this.score || 90);
                p.notify('<red>天山童姥已死，虽然李秋水倒下了，但保护任务失败了……</red>');
            }
        }
    }
};
