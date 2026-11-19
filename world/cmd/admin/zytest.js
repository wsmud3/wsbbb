// 真意 / 门派禁地 GM 测试命令。仅 user_level >= 5 可用。
// 用途：没有满足「武帝 + 武道塔100层」的各门派测试号时，用任意低级角色验收真意与禁地。
//   zytest                       查看帮助与当前状态
//   zytest bypass on|off         开关测试旁路（视为已满足境界与武道塔条件；门派仍须匹配）
//   zytest family <门派ID>       切换门派（会先遗忘原门派真意；不会授予技能），如 HUASHAN / WUDANG
//   zytest grant <编号|all> [重数]  直接领悟真意并设为指定重数（默认 1）
//   zytest active <编号>         启用真意（等同 zhenyi active）
//   zytest puzzle reset|solve <编号|all>  重置或直接解开禁地机关
//   zytest reset <编号|all>      清除领悟、重数、机关与今日次数，恢复为可首次挑战
//   zytest daily                 清零今日试炼次数
//   zytest goto                  传送到本门禁地入口
//   zytest values                打印本门全部真意 1～10 重的数值
this.inherits(COMMAND);
this.command = "zytest";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_level = 5;

var FAMILY_IDS = ["HUASHAN", "WUDANG", "SHAOLIN", "EMEI", "GAIBANG", "XIAOYAO", "SHASHOU", "SUNV"];

this.enter = function (me, arg) {
    if (!me || !((me.user_level || 0) >= 5)) return me && me.send("什么？");
    var Z = WORLD.ZHENYI;
    if (!Z) return me.notify("真意系统未加载。");
    var parts = String(arg || "").trim().split(/\s+/), action = parts[0] || "";
    var data = Z.family_data(me);

    if (action === "bypass") {
        var on = parts[1] !== "off";
        if (on) me.set_temp("zy_gm_bypass", 1); else me.remove_temp("zy_gm_bypass");
        if (on && Z.check_unlock) Z.check_unlock(me, false);
        return me.notify("真意测试旁路已" + (on ? "开启：境界与武道塔条件视为满足。" : "关闭。"));
    }
    if (action === "family") {
        var fid = String(parts[1] || "").toUpperCase();
        if (FAMILY_IDS.indexOf(fid) < 0 || !FAMILIES[fid]) return me.notify("门派ID须为：" + FAMILY_IDS.join(" / "));
        if (me.is_fighting && me.is_fighting()) return me.notify("战斗中不能切换门派。");
        var oldId = me.family && me.family.id;
        if (oldId && oldId !== fid) Z.forget_family(me, oldId);
        me.family = FAMILIES[fid];
        me.set_temp("family", fid);
        if (Z.check_unlock) Z.check_unlock(me, false);
        return me.notify("已切换为" + FAMILIES[fid].name + "（测试用）。注意：未授予该派技能，绑定绝招类真意需另行学习对应技能。");
    }
    if (!data) return me.notify("你当前门派没有真意。可用 zytest family <门派ID> 切换。\n" + this.help());

    var ids = function (token) {
        if (token === "all") return data.list.map(function (it) { return it.id; });
        var intent = Z.find_intent(data, token);
        return intent ? [intent.id] : [];
    };
    var K = Z.keys;

    if (action === "grant") {
        var list = ids(parts[1]), level = Math.max(1, Math.min(Z.MAX_LEVEL, parseInt(parts[2]) || 1));
        if (!list.length) return me.notify("用法：zytest grant <编号|all> [重数]");
        list.forEach(function (id) {
            me.set_temp(K.acquired(data.key, id), 1); me.set_temp(K.level(data.key, id), level); me.set_temp(K.clear(data.key, id), 1);
        });
        return me.notify("已领悟" + list.join("、") + "号真意，重数设为" + level + "。");
    }
    if (action === "active") return Z.set_active(me, parts[1]);
    if (action === "puzzle") {
        var plist = ids(parts[2]);
        if (!plist.length || (parts[1] !== "reset" && parts[1] !== "solve")) return me.notify("用法：zytest puzzle reset|solve <编号|all>");
        plist.forEach(function (id) {
            if (parts[1] === "solve") Z.solve_puzzle(me, data.key, id);
            else ["zy_pz_", "zy_pzhp_", "zy_pzbonus_", "zy_pzs_", "zy_pzstep_"].forEach(function (p) { me.remove_temp(p + data.key + "_" + id); });
        });
        return me.notify("机关" + plist.join("、") + "已" + (parts[1] === "solve" ? "解开" : "重置") + "。");
    }
    if (action === "reset") {
        var rlist = ids(parts[1]);
        if (!rlist.length) return me.notify("用法：zytest reset <编号|all>");
        rlist.forEach(function (id) {
            [K.acquired, K.level, K.clear, K.daily].forEach(function (fn) { me.remove_temp(fn(data.key, id)); });
            ["zy_pz_", "zy_pzhp_", "zy_pzbonus_", "zy_pzs_", "zy_pzstep_"].forEach(function (p) { me.remove_temp(p + data.key + "_" + id); });
        });
        var active = me.query_temp("zy_active", "");
        if (active && rlist.indexOf(parseInt(active.split("_")[1])) >= 0) me.remove_temp("zy_active");
        return me.notify("已重置" + rlist.join("、") + "号真意：可从机关开始重新走一遍首次挑战。");
    }
    if (action === "daily") {
        data.list.forEach(function (it) { me.remove_temp(K.daily(data.key, it.id)); });
        return me.notify("今日试炼次数已清零。");
    }
    if (action === "goto") {
        var base = ROOM.Get(data.trialRoom), area = base && base.parent, first = area && area.first;
        if (!first) return me.notify("找不到禁地入口。");
        return me.moveto(first, me.name + "化作一道清光消失了。", me.name + "出现在禁地入口。");
    }
    if (action === "values") {
        var out = ["【" + data.name + "】数值表" + (data.v2 ? "（v2）" : "（旧公式）")];
        data.list.forEach(function (it) {
            out.push("<hiy>" + it.id + ". " + it.name + "（" + it.mech + "）</hiy>");
            [1, 2, 4, 6, 8, 10].forEach(function (lv) { out.push("  " + lv + "重：" + Z.describe(data, it, lv)); });
        });
        return me.notify(out.join("\n"));
    }
    return me.notify(this.help() + "\n\n当前：" + data.name + "，旁路" + (me.query_temp("zy_gm_bypass", 0) ? "开" : "关") + "，启用" + (me.query_temp("zy_active", "") || "无"));
};

this.help = function () {
    return "zytest bypass on|off / family <门派ID> / grant <编号|all> [重数] / active <编号> / puzzle reset|solve <编号|all> / reset <编号|all> / daily / goto / values";
};
