// 测试号 GM 命令。仅 user_level >= 5 可用。
//   sktest                         查看帮助与当前状态
//   sktest fix [等级] [玩家]        把角色设为测试号：
//                                   · 学会全部基础武功 + 公共武学，设为指定等级（默认 3000）并锁定技能等级
//                                   · 境界设为武士；之后可找金古易「提升境界」自由调整
//                                   · 可无限叛师（叛师符无冷却、不消耗）
//                                   · 首次设置时发放 1 万本武道、1 万块元晶、1 张叛师符
//   sktest unfix [玩家]             取消测试号（解除技能锁定与测试特权，等级/境界/物品保留）
// [玩家] 填在线玩家的 id 或名字，不填就是自己。
// 标记都存在 temp 里（skill_fixed / test_char），下线重登仍然有效。技能锁定后学习、练习、读书、
// 技能书、残页/领悟重算等级、放弃技能都不会改变等级（见 CHARACTER.prototype.skill_fixed）。
this.inherits(COMMAND);
this.command = "sktest";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_level = 5;

var DEFAULT_LEVEL = 3000;
var TEST_ITEMS = [["book/wudao", 10000], ["st/yuanjing", 10000], ["cash/tuoli", 1]];
var LEVEL_NAMES = ["普通百姓", "武士", "武师", "宗师", "武圣", "武帝", "武神"];

// 直接设定境界（不检查条件、不发升级奖励），金古易给测试号调整境界时也用这个
this.set_level = function (me, lv) {
    lv = Math.max(0, Math.min(LEVEL_NAMES.length - 1, parseInt(lv) || 0));
    me.level = lv;
    me.color_name = null;
    me.commands_json = null;
    if (me.environment && me.environment.item_changed) me.environment.item_changed(me, true);
    me.send && me.send('{type:"levelup",level:' + lv + '}');
    if (me.check_unlock_sect_jds) me.check_unlock_sect_jds();
    return lv;
};
// 玩家可学的基础武功（与武馆教习一致；基本咬技是宠物用的，不算）
var BASE_IDS = ["force", "dodge", "parry", "sword", "blade", "club", "staff", "whip", "unarmed", "throwing"];

this.skill_ids = function () {
    var ids = BASE_IDS.filter(function (id) { return !!SKILL.get(id); });
    Object.keys(WORLD.SKILLS || {}).sort().forEach(function (id) {
        var s = WORLD.SKILLS[id];
        if (s && s.is_public && s.id === id && s.type !== SKILL_TYPES.BASE && s.type !== SKILL_TYPES.KNOWLEDGE && ids.indexOf(id) < 0) ids.push(id);
    });
    return ids;
};

function find_player(key) {
    for (var i = 0; i < WORLD.USERS.length; i++) {
        var u = WORLD.USERS[i];
        if (u && (u.id == key || u.name == key)) return u;
    }
    return null;
}

this.enter = function (me, arg) {
    if (!me || !((me.user_level || 0) >= 5)) return me && me.send("什么？");
    var parts = String(arg || "").trim().split(/\s+/).filter(Boolean), action = parts[0] || "";

    if (action === "fix") {
        var level = DEFAULT_LEVEL, rest = parts.slice(1);
        if (rest.length && /^\d+$/.test(rest[0])) level = parseInt(rest.shift());
        if (!(level >= 1 && level <= 99999)) return me.notify("等级须在 1～99999 之间。");
        var target = rest.length ? find_player(rest[0]) : me;
        if (!target) return me.notify("找不到在线玩家：" + rest[0]);
        if (target.is_fighting && target.is_fighting()) return me.notify("战斗中不能操作。");
        if (target.state && target.set_state) target.set_state(null);   // 中断正在进行的学习/练习

        var ids = this.skill_ids();
        target._skill_fix_bypass = true;
        try {
            ids.forEach(function (id) { target.set_skill(id, level); });
        } finally {
            target._skill_fix_bypass = false;
        }
        target.set_temp("skill_fixed", level);
        target.set_temp("test_char", 1);
        this.set_level(target, 1);
        var gave = "";
        if (!target.query_temp("test_char_items")) {
            TEST_ITEMS.forEach(function (it) { target.add_obj(it[0], it[1]); });
            target.set_temp("test_char_items", 1);
            gave = "，并获得 1 万本武道、1 万块元晶、1 张叛师符";
        }
        target.save && target.save();
        target.notify("<hiy>你已成为测试号：学会全部基础武功与公共武学（共" + ids.length + "门），等级固定为" + level + "级；境界设为武士，可找金古易调整；可无限叛师" + gave + "。</hiy>");
        if (target !== me) me.notify("已将" + target.name + "设为测试号：" + ids.length + "门技能固定为" + level + "级" + gave + "。");
        return;
    }
    if (action === "unfix") {
        var t = parts[1] ? find_player(parts[1]) : me;
        if (!t) return me.notify("找不到在线玩家：" + parts[1]);
        t.remove_temp("skill_fixed");
        t.remove_temp("test_char");
        t.save && t.save();
        return me.notify((t === me ? "你" : t.name) + "已不再是测试号：技能等级锁定与测试特权已解除。");
    }
    var cur = me.skill_fixed ? me.skill_fixed() : 0;
    return me.notify(this.help() + "\n\n当前：" + (me.is_test_char() ? "测试号，" : "") + (cur ? "技能等级固定为" + cur + "级" : "技能未锁定"));
};

this.help = function () {
    return [
        "sktest fix [等级] [玩家]   设为测试号：全部基础 + 公共武学固定为指定等级（默认 3000）、境界武士（金古易可调）、无限叛师，首次发 1 万武道和 1 万元晶",
        "sktest unfix [玩家]        取消测试号（解除技能锁定与测试特权）",
        "[玩家] 为在线玩家的 id 或名字，不填为自己。",
    ].join("\n");
};
