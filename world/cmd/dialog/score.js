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
            if (parts[1] === "toggle" && parts[2] && WORLD.ZHENYI) WORLD.ZHENYI.set_active(me, parts[2]);
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
        // 旧角色第一次打开属性页时也立即补发，不依赖重新升级或再打一次百层。
        if (WORLD.ZHENYI) WORLD.ZHENYI.check_unlock(target, true);
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

const FAMILY_TO_JDS = {
    HUASHAN: 2, WUDANG: 3, SHAOLIN: 4, EMEI: 5,
    GAIBANG: 6, XIAOYAO: 7, SHASHOU: 8, SUNV: 9,
};

function sendZhenyi(me) {
    if (!WORLD.ZHENYI || !WORLD.COMMANDS.zhenyi) return me.notify("真意系统尚未就绪。");
    return WORLD.COMMANDS.zhenyi.send_panel(me);
}
