// 测试号 GM 命令。仅 user_level >= 5 可用。
//   sktest                         查看帮助与当前状态
//   sktest fix [等级] [玩家]        把角色设为测试号：
//                                   · 学会全部基础武功 + 公共武学（不属于门派的武学）+ 知识技能，连同原有技能一起设为指定等级（默认 3000）并锁定
//                                   · 境界设为武士；之后可找金古易「提升境界」自由调整
//                                   · 可无限叛师（叛师符无冷却、不消耗）
//                                   · 首次设置时发放 1 万本武道、1 万块元晶、1 张叛师符
//                                   · 发放测试专用的无限精力丹、无限扫荡符、无限洗髓丹、无限变性丹（缺哪个补哪个）
//   sktest unfix [玩家]             取消测试号（解除技能锁定与测试特权，等级/境界/物品保留）
// [玩家] 填在线玩家的 id 或名字，不填就是自己。
// 标记都存在 temp 里（skill_fixed / test_char），下线重登仍然有效。技能锁定后学习、练习、读书、
// 技能书、武道进阶/残页的等级换算、放弃技能都不会改变等级（见 CHARACTER.prototype.skill_fixed）。
this.inherits(COMMAND);
this.command = "sktest";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_level = 5;

var DEFAULT_LEVEL = 3000;
// 测试号专用的无限道具：每次 fix 时缺哪个补哪个（不可交易，普通玩家拿到也用不了）
var TEST_TOOLS = [["cash/test_jing", "无限精力丹"], ["cash/test_saodang", "无限扫荡符"], ["cash/test_xi", "无限洗髓丹"], ["cash/test_bian", "无限变性丹"]];
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
// 怪物/NPC 专用技能（绿柳山庄 NPC、玄冥二老），不给测试号
var NPC_ONLY = ["lvliu_force", "lvliu_unarmed", "lvliu_dodge", "lvliu_sword", "xuanmingshenzhang_m"];
var BASE_IDS = ["force", "dodge", "parry", "sword", "blade", "club", "staff", "whip", "unarmed", "throwing"];

this.skill_ids = function () {
    var ids = BASE_IDS.filter(function (id) { return !!SKILL.get(id); });
    // 公共武学 = 不属于任何门派（或标了 is_public）的武学；知识技能（读书写字、炼药术、《论语》）也包含。
    // 排除怪物/NPC 专用技能和玩家自创技能。
    Object.keys(WORLD.SKILLS || {}).sort().forEach(function (id) {
        var s = WORLD.SKILLS[id];
        if (!s || s.id !== id || s.type === SKILL_TYPES.BASE || s.is_custom || NPC_ONLY.indexOf(id) >= 0) return;
        if (s.family && s.family === FAMILIES.MONSTER) return;
        var noFamily = !s.family || s.family === FAMILIES.NONE;
        if ((noFamily || s.is_public) && ids.indexOf(id) < 0) ids.push(id);
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
        // 角色原本已学的技能（含门派武学、知识类、自创）也统一设为固定等级
        var owned = Object.keys(target.skills || {}).filter(function (id) { return SKILL.get(id) && ids.indexOf(id) < 0; });
        var all = ids.concat(owned), learned = 0;
        target._skill_fix_bypass = true;
        try {
            all.forEach(function (id) {
                var isNew = !(target.skills && target.skills[id]);
                target.set_skill(id, level);
                var item = target.skills[id];
                if (!item) return;
                item.exp = 0;
                if (isNew) learned++;
                // 通知客户端刷新技能列表（不然要重新登录才看得到新学的技能和新等级）
                if (isNew) {
                    var str = ['{type:"dialog",dialog:"skills",item:'];
                    SKILL.get(id).item_to_json(str, item, target);
                    str.push("}");
                    target.notify(str.join(""));
                } else {
                    target.notify('{type:"dialog",dialog:"skills",id:"' + id + '",level:' + item.level + ',exp:0}');
                }
            });
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
        var tools = [];
        TEST_TOOLS.forEach(function (it) {
            if (target.find_obj_bypath(it[0])) return;
            if (target.add_obj(it[0], 1)) tools.push(it[1]);
        });
        if (tools.length) gave += (gave ? "，" : "，并获得") + tools.join("、");
        target.save && target.save();
        target.notify("<hiy>你已成为测试号：新学会" + learned + "门技能，全部" + all.length + "门技能（基础武功、公共武学及原有技能）等级固定为" + level + "级；境界设为武士，可找金古易调整；可无限叛师" + gave + "。</hiy>");
        if (target !== me) me.notify("已将" + target.name + "设为测试号：新学会" + learned + "门，全部" + all.length + "门技能固定为" + level + "级" + gave + "。");
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
        "sktest fix [等级] [玩家]   设为测试号：全部基础 + 公共武学 + 原有技能固定为指定等级（默认 3000）、境界武士（金古易可调）、无限叛师，首次发 1 万武道和 1 万元晶",
        "sktest unfix [玩家]        取消测试号（解除技能锁定与测试特权）",
        "[玩家] 为在线玩家的 id 或名字，不填为自己。",
    ].join("\n");
};
