this.inherits(COMMAND);
this.command = "score";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.enter = function (me, arg) {
    var target = me;
    if (arg) {
        if (arg === "title") {
            let str = ['{"type":"dialog","dialog":"score"'];
            str.push(',titles:[');
            if (me.titles) {
                for (var i = 0; i < me.titles.length; i++) {
                    var item = me.titles[i];
                    if (i > 0) str.push(",");
                    str.push("{title:\"");
                    str.push(item.title);
                    str.push("\"");
                    if (item.use) {
                        str.push(",use:true");
                    }

                    str.push("}");

                }
            }
            str.push("]}");
            return me.send(str.join(""));
        }
        if (arg === "zhenyi") {
            return sendZhenyi(me);
        }
        if (arg && arg.startsWith("zhenyi ")) {
            var parts = arg.split(" ");
            if (parts[1] === "toggle" && parts[2]) {
                var idx = parseInt(parts[2]);
                if (idx >= 1 && idx <= 5) {
                    var famId = me.family.id;
                    var zyKey = ZY_KEY2[famId];
                    if (zyKey) {
                        var cur = me.query_temp("zy_active_" + zyKey, 0) || 0;
                        var mask = 1 << (idx - 1);
                        if (me.query_temp("zy_" + zyKey + "_" + idx, 0)) {
                            me.set_temp("zy_active_" + zyKey, cur ^ mask);
                        }
                    }
                }
            }
            return sendZhenyi(me);
        }
        target = me.find_obj(arg, me.environment);
        if (!target && me.user_level > 1) {
            target = WORLD.getUser(arg);
        }
        if (!target) {
            return me.notify("你要查看谁的属性。");
        }
        if (target.master != me.id && me.user_level < 4) {
            return me.notify("你要查看谁的属性。");
        }
    }
    let str = ['{"type":"dialog","dialog":"score"'];
    str.push(',id:"');\nstr.push(target.id);\nstr.push('","name":"');\nstr.push(target.long_name());\nstr.push('","id":"');\nstr.push(target.id);\nstr.push('","age":"');\nvar age = target.query_age();\nif (age < 10) age = 10;\n\nvar int_age = parseInt(age);\nstr.push(UTIL.to_c(int_age));\nstr.push('岁');\n\nlet month = parseInt((age - int_age) * 12);\nif (month) {\nstr.push(UTIL.to_c(month));\nstr.push('个月');\n}\nstr.push('","family":"');\nstr.push(target.family.name);\nstr.push('",master:\"');\nstr.push(target.master ? target.master : "无");\nstr.push('",gender:\"');\nstr.push(target.gender == 1 ? "男" : "女");\nstr.push('",level:\"');\nstr.push(this.get_level_desc(target));\nstr.push('"');
    target.pot = parseInt(target.pot);
    if (isNaN(target.pot)) target.pot = 0;
    target.hp = parseInt(target.hp);
    target.mp = parseInt(target.mp);
    console.log("[score debug] name=" + target.name + " pot=" + target.pot + " formatted=" + formatPot(target.pot));

    for (var i = 0; i < this.props.length; i++) {
        str.push(',"');\nstr.push(this.props[i]);\nstr.push('":');
        str.push(target[this.props[i]] || 0);
    }
    //if (target.dodge_skill.on_score) {

    //    str.push(',ds:', target.dodge_skill.on_score(target));

    //} else {
    //}

    str.push(',ds:', target.ds);
    str.push(',per:');
    str.push(target.query_prop("per") + target.per);
    str.push(',str_add:');
    str.push(target.query_prop("str"));
    str.push(',con_add:');
    str.push(target.query_prop("con"));
    str.push(',dex_add:');
    str.push(target.query_prop("dex"));
    str.push(',int_add:');
    str.push(target.query_prop("int"));
    var limit_mp = target.limit_mp + target.query_prop("limit_mp");
    str.push(',limit_mp:');
    str.push(limit_mp);
    if (target.query_jingli) {

        str.push(',jingli:"', target.query_temp('ad_jl', 0), '/', target.query_jclimit(), "<hig>(+", 200 - target.query_temp('ex_jl', 0), ')</hig>"');
    } else {
        str.push(',jingli:0');
    }
    str.push(',gjsd:');
    str.push(target.gjsd / 1000);
    str.push(',bj:"');\nstr.push(target.bj);\nstr.push('%",');
    str.push('master:"');\nstr.push(MASTER_NAME(target));\nstr.push('",family:"');\nstr.push(target.family.name);\nstr.push('",gongji:');
    str.push(target.query_temp("gongji") || 0);

    // 检测门派禁地是否已解锁，控制真意面板显示
    var has_jd = false;
    if (target.is_player && target.family) {
        var jd = FAMILY_TO_JDS[target.family.id];
        if (jd) has_jd = target.query_bool("fb2", jd);
    }
    str.push(',has_jd:');
    str.push(has_jd);

    str.push('}');
    me.send(str.join(""));
}
const MASTER_NAMES = {};
const MASTER_NAME = function (me) {
    let path = me.query_temp('master');
    if (!path) return '无';
    if (MASTER_NAMES[path])
        return MASTER_NAMES[path];
    let obj = NPC.GET(path);
    MASTER_NAMES[path] = obj.name;
    return obj.name
}
this.props = ["hp", "mp", "max_hp", "max_mp", "str", "con",
    "dex", "int", "kar", "gj", "fy", "mz", "zj", "exp", "pot"];

const level_descs = ["普通百姓", "武士", "武师", "宗师", "武圣", "武帝", "武神"];
const level_color = ["", "wht", "hig", "hiy", "hiz", "hio", "ord"];
const level6_descs = ["武神", '剑神', '刀皇', '兵主', '战神'];
this.get_level_desc = function (me) {
    if (!me.level) return level_descs[me.level];
    var cc = level_color[me.level];
    if (me.level === 6) {
        return "<" + cc + ">" + level6_descs[me.query_temp('lv6', 0)] + "</" + cc + ">";
    }
    return "<" + cc + ">" + level_descs[me.level] + "</" + cc + ">";

}

function formatPot(pot) {
    if (!pot || pot < 0) return "0";
    if (pot >= 100000000) return (pot / 100000000).toFixed(2) + "亿";
    if (pot >= 10000) return (pot / 10000).toFixed(2) + "万";
    return pot.toString();
}

const ZY_DATA = {
    HUASHAN: {
        name: "剑道真意", key: "jz",
        list: [
            { id: 1, name: "利剑·锋锐", mech: "增伤", desc: "连续命中3次→伤害+15%" },
            { id: 2, name: "软剑·无常", mech: "忙乱", desc: "招架后→敌方忙乱3秒" },
            { id: 3, name: "重剑·崩山", mech: "破防", desc: "高耗内技能→无视25%防御" },
            { id: 4, name: "木剑·化生", mech: "回复", desc: "使用内功→回复20%消耗值为生命" },
            { id: 5, name: "无剑·破气", mech: "不灭", desc: "HP<20%→清除负面+减伤25%" },
        ],
    },
    WUDANG: {
        name: "太极真意", key: "zw",
        list: [
            { id: 1, name: "借力",     mech: "增伤", desc: "连续招架2次→下次攻击伤害+25%" },
            { id: 2, name: "化劲",     mech: "减伤", desc: "被暴击→伤害减免+20%" },
            { id: 3, name: "粘劲",     mech: "忙乱", desc: "招架→敌方忙乱2秒" },
            { id: 4, name: "乱环",     mech: "守护", desc: "HP<40%→伤害减免+20%" },
            { id: 5, name: "无极",     mech: "回复", desc: "HP<15%→回复20%HP+清除负面" },
        ],
    },
    SHAOLIN: {
        name: "禅武真意", key: "dmd",
        list: [
            { id: 1, name: "金刚不坏", mech: "不灭", desc: "致命伤害→保留1HP+无敌2秒" },
            { id: 2, name: "狮吼功",   mech: "眩晕", desc: "受击3次→眩晕敌方2秒" },
            { id: 3, name: "般若心",   mech: "封魔", desc: "HP<50%受击→封魔攻击者2秒" },
            { id: 4, name: "罗汉阵",   mech: "减伤", desc: "被围攻→伤害减免+20%" },
            { id: 5, name: "禅定",     mech: "暴击", desc: "脱战打坐→首战暴击率+30%" },
        ],
    },
    EMEI: {
        name: "佛光真意", key: "jdfg",
        list: [
            { id: 1, name: "慈航普度", mech: "回复", desc: "治疗→回复效果+30%" },
            { id: 2, name: "金刚怒目", mech: "反震", desc: "队友HP<30%→受击反弹伤害" },
            { id: 3, name: "菩提心",   mech: "韧性", desc: "受控制→持续时间-40%" },
            { id: 4, name: "轮回",     mech: "回复", desc: "队友濒死→附加持续回复" },
            { id: 5, name: "佛光普照", mech: "增伤", desc: "满血时→攻击伤害+15%" },
        ],
    },
    GAIBANG: {
        name: "降龙真意", key: "js",
        list: [
            { id: 1, name: "亢龙有悔", mech: "破防", desc: "暴击→无视30%防御" },
            { id: 2, name: "飞龙在天", mech: "暴击", desc: "连续命中3次→暴击率+20%" },
            { id: 3, name: "神龙摆尾", mech: "回复", desc: "击杀→回复20%内力" },
            { id: 4, name: "龙战于野", mech: "嗜血", desc: "HP<40%→伤害+20%" },
            { id: 5, name: "时乘六龙", mech: "溅射", desc: "连续命中5次→溅射伤害" },
        ],
    },
    XIAOYAO: {
        name: "北冥真意", key: "lhfd",
        list: [
            { id: 1, name: "北冥鲸吞", mech: "吸血", desc: "击败敌人→吸取内力上限" },
            { id: 2, name: "凌波残影", mech: "闪避", desc: "连续闪避2次→闪避+20%" },
            { id: 3, name: "白虹贯日", mech: "增伤", desc: "内力>80%→伤害+15%" },
            { id: 4, name: "生死符",   mech: "毒伤", desc: "技能附带持续毒伤" },
            { id: 5, name: "逍遥御风", mech: "攻速", desc: "脱战→首击攻速+30%" },
        ],
    },
    SHASHOU: {
        name: "暗杀真意", key: "xl",
        list: [
            { id: 1, name: "影遁",   mech: "封魔", desc: "脱战后首击→封魔3秒" },
            { id: 2, name: "暗步",   mech: "命中", desc: "战斗首击→命中+50%" },
            { id: 3, name: "刺穴",   mech: "破防", desc: "目标HP>80%→无视30%防御" },
            { id: 4, name: "血债",   mech: "增伤", desc: "击杀→下次攻击伤害+25%" },
            { id: 5, name: "修罗道", mech: "穿透", desc: "HP<20%→伤害+30%+无视50%防" },
        ],
    },
    SUNV: {
        name: "九天真意", key: "yc",
        list: [
            { id: 1, name: "金行·锐", mech: "破防", desc: "内力>80%→无视15%防御" },
            { id: 2, name: "水行·润", mech: "回复", desc: "过量治疗→转化额外回复" },
            { id: 3, name: "火行·灼", mech: "毒伤", desc: "连续同属→附加持续灼伤" },
            { id: 4, name: "土行·固", mech: "减伤", desc: "受击→下次受击减伤30%" },
            { id: 5, name: "木行·缚", mech: "忙乱", desc: "技能命中→敌方忙乱3秒" },
        ],
    },
};

const FAMILY_TO_JDS = {
    HUASHAN: 2, WUDANG: 3, SHAOLIN: 4, EMEI: 5,
    GAIBANG: 6, XIAOYAO: 7, SHASHOU: 8, SUNV: 9,
};

const ZY_KEY2 = {
    HUASHAN: "jz", WUDANG: "zw", SHAOLIN: "dmd", EMEI: "jdfg",
    GAIBANG: "js", XIAOYAO: "lhfd", SHASHOU: "xl", SUNV: "yc",
};

function sendZhenyi(me) {
    var famId = me.family.id;
    var zyKey = ZY_KEY2[famId];
    var zy = ZY_DATA[famId];
    if (!zyKey || !zy) return me.notify("你没有武道真意。");

    var activeMask = me.query_temp("zy_active_" + zyKey, 0) || 0;
    var str = ['{"type":"dialog","dialog":"score","zhenyi":['];
    for (var i = 0; i < zy.list.length; i++) {
        var z = zy.list[i];
        var acquired = me.query_temp("zy_" + zyKey + "_" + z.id, 0) ? true : false;
        var active = acquired && !!(activeMask & (1 << i));
        if (i > 0) str.push(",");
        str.push('{"id":');
        str.push(z.id);
        str.push(',"name":"');
        str.push(z.name);
        str.push('","mech":"');
        str.push(z.mech);
        str.push('","desc":"');
        str.push(z.desc);
        str.push('","acquired":');
        str.push(acquired ? "true" : "false");
        str.push(',"active":');
        str.push(active ? "true" : "false");
        str.push("}");
    }
    str.push('],"zy_name":"');
    str.push(zy.name);
    str.push('","zy_key":"');
    str.push(zyKey);
    str.push('"}');
    me.send(str.join(""));
}