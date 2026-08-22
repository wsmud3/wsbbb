// 门派真意系统唯一数据源。
// 约束：同时只能启用一个真意；门派红色技能（grade 6）永不获得真意强化。
(function () {
    var FAMILY_TO_KEY = {
        HUASHAN: "jz", WUDANG: "zw", SHAOLIN: "dmd", EMEI: "jdfg",
        GAIBANG: "js", XIAOYAO: "lhfd", SHASHOU: "xl", SUNV: "yc"
    };
    var KEY_TO_FAMILY = {};
    for (var fid in FAMILY_TO_KEY) KEY_TO_FAMILY[FAMILY_TO_KEY[fid]] = fid;

    // balance 是门派补强系数。强势门派较克制，弱势门派获得更明显的成长。
    var DATA = {
        HUASHAN: {
            name: "剑道真意", key: "jz", jd: 2, area: "独孤剑冢", balance: 0.86,
            trialRoom: "jz/wuyitai_trial", guide: "守冢剑侍",
            guideNames: ["守剑老人", "回锋剑客", "负剑道人", "洗剑客", "无剑客"],
            list: [
                zy(1, "利剑·争锋", "破式", "利剑问锋", "precision", ["dugujiujian/pojian", "dugujiujian/poqi"], "jz_edge"),
                zy(2, "软剑·回锋", "反击", "软剑回环", "counter", ["dugujiujian/wu", "kuangfengkuaijian/duoming"], "jz_counter"),
                zy(3, "重剑·崩岳", "破坚", "重剑负山", "burst", ["dugujiujian/poqi", "huashanjianfa/jiang"], "jz_heavy"),
                zy(4, "木剑·养意", "生息", "木剑守拙", "endure", ["zixiashengong/xi"], "jz_wood"),
                zy(5, "无剑·无招", "剑势", "无剑胜有", "master", ["dugujiujian/wu"], "jz_formless")
            ]
        },
        WUDANG: {
            name: "太极真意", key: "zw", jd: 3, area: "真武秘境", balance: 1.00,
            trialRoom: "zw/yanwutai_trial", guide: "执符道人",
            guideNames: ["听劲道人", "抱元道者", "缠丝剑侍", "守缺真人", "真武道童"],
            list: [
                zy(1, "借力", "蓄劲", "听劲关", "counter", ["taijiquan/zhen", "taijijian/lian"], "zw_borrow"),
                zy(2, "化劲", "卸力", "化劲关", "endure", ["taijishengong/tu"], "zw_yield"),
                zy(3, "粘劲", "缠势", "粘随关", "control", ["taijijian/rao", "taijiquan/zhen"], "zw_stick"),
                zy(4, "乱环", "守御", "乱环关", "endure", ["taijijian/sui"], "zw_circle"),
                zy(5, "无极", "归元", "无极关", "master", ["taijishengong/tu"], "zw_wuji")
            ]
        },
        SHAOLIN: {
            name: "禅武真意", key: "dmd", jd: 4, area: "达摩洞", balance: 1.00,
            trialRoom: "dmd/chanwutai_trial", guide: "守洞老僧",
            guideNames: ["金刚护法", "狮吼罗汉", "般若行者", "罗汉堂首座", "面壁老僧"],
            list: [
                zy(1, "金刚不坏", "不灭", "金刚试", "endure", ["yijinjing/zhao"], "sl_vajra"),
                zy(2, "狮子吼", "震慑", "狮吼试", "control", ["yijinjing/roar"], "sl_roar"),
                zy(3, "般若心", "封招", "般若试", "resource", ["yizhichan/zhen", "damojian/jiang"], "sl_prajna"),
                zy(4, "罗汉阵", "镇守", "罗汉试", "endure", ["ranmudao/hu"], "sl_arhat"),
                zy(5, "禅定", "清净", "禅定试", "master", ["yijinjing/foguang", "shaolinshenfa/lingbo"], "sl_meditate")
            ]
        },
        EMEI: {
            name: "金顶真意", key: "jdfg", jd: 5, area: "金顶佛光", balance: 1.16,
            trialRoom: "jdfg/wuxiangtai_trial", guide: "佛灯女尼",
            guideNames: ["慈航师太", "怒目师太", "双仪剑侍", "倚天剑师", "摄魄行者"],
            list: [
                zy(1, "慈航愿", "回春", "慈航试", "endure", ["linjizhuang/xi", "linjizhuang/huifu", "linjizhuang2/xi", "linjizhuang2/huifu"], "em_mercy"),
                zy(2, "金顶怒目", "反震", "怒目试", "counter", ["jindingzhang/po"], "em_wrath"),
                zy(3, "灭绝双仪", "剑契", "双剑试", "precision", ["huifengjian/mie", "huifengjian/jue"], "em_twin"),
                zy(4, "倚天破魔", "破邪", "倚天试", "burst", ["yitianjianfa/yi", "yitianjianfa/hao"], "em_yitian"),
                zy(5, "九阴摄魄", "夺魄", "摄魄试", "master", ["jiuyinbaiguzhao/duo", "jiuyinbaiguzhao/juan", "jiuyinbaiguzhao2/po", "jiuyinbaiguzhao2/juan"], "em_nineyin")
            ]
        },
        GAIBANG: {
            name: "降龙真意", key: "js", jd: 6, area: "君山密录", balance: 0.92,
            trialRoom: "js/chuanwutang_trial", guide: "传功长老",
            guideNames: ["降龙长老", "飞龙舵主", "摆尾长老", "君山老帮众", "六龙传功使"],
            list: [
                zy(1, "亢龙有悔", "刚劲", "亢龙试", "burst", ["xianglongzhang/qi"], "gb_kanglong"),
                zy(2, "飞龙在天", "连掌", "飞龙试", "precision", ["xianglongzhang/shiba"], "gb_flying"),
                zy(3, "神龙摆尾", "制敌", "摆尾试", "control", ["dagoubang/chan", "jiaohuabangfa/wu"], "gb_tail"),
                zy(4, "龙战于野", "血战", "龙战试", "endure", ["huntianqigong/power"], "gb_field"),
                zy(5, "时乘六龙", "龙劲", "六龙试", "master", ["xianglongzhang/qi", "xianglongzhang/shiba"], "gb_six")
            ]
        },
        XIAOYAO: {
            name: "逍遥真意", key: "lhfd", jd: 7, area: "琅嬛福地", balance: 0.90,
            trialRoom: "lhfd/wendaotai_trial", guide: "玉像侍者",
            guideNames: ["北冥客", "凌波玉女", "白虹使", "生死符使", "琅嬛守卷人"],
            list: [
                zy(1, "北冥鲸吞", "纳气", "北冥试", "resource", ["beimingshengong/huifu", "beimingshengong/power"], "xy_beiming"),
                zy(2, "凌波残影", "轻灵", "凌波试", "precision", ["lingboweibu/lingbo"], "xy_lingbo"),
                zy(3, "白虹贯日", "掌力", "白虹试", "burst", ["liuyangzhang/po"], "xy_baihong"),
                zy(4, "生死符", "寒毒", "生死试", "control", ["liuyangzhang/zhong"], "xy_talisman"),
                zy(5, "无相御风", "化用", "无相试", "master", ["xiaowuxianggong/duo", "xiaowuxianggong/wuwo"], "xy_formless")
            ]
        },
        SHASHOU: {
            name: "暗杀真意", key: "xl", jd: 8, area: "修罗暗殿", balance: 1.22,
            trialRoom: "xl/shengloutai_trial", guide: "暗殿司命",
            guideNames: ["无痕影使", "踏雪客", "穿心刺客", "血债判官", "修罗使"],
            list: [
                zy(1, "无声影遁", "先手", "匿影试", "precision", ["taxuexunmei/power"], "ss_shadow"),
                zy(2, "踏雪暗步", "追魂", "暗步试", "precision", ["taxuexunmei/power", "mantianhuayu/luo"], "ss_step"),
                zy(3, "穿心刺穴", "破绽", "刺穴试", "burst", ["chuanxinzhang/chuan", "feidao/jiang"], "ss_puncture"),
                zy(4, "血债必偿", "追命", "血债试", "master", ["shashengjue/power"], "ss_debt"),
                zy(5, "杀生修罗", "绝境", "修罗试", "endure", ["shashengjue/power", "shashengjue/tuoli", "mantianhuayu/wu"], "ss_asura")
            ]
        },
        SUNV: {
            name: "九天真意", key: "yc", jd: 9, area: "九天瑶池", balance: 1.26,
            trialRoom: "yc/jiutantai_trial", guide: "瑶池玉使",
            guideNames: ["神霄雷使", "玄女侍", "魅魂宫人", "紫电使", "守一仙子"],
            list: [
                zy(1, "神霄·雷贯", "雷霆", "神霄试", "precision", ["shenxiaojiumie/wulei", "shenxiaojiumie/yanglei", "shenxiaojiumie2/wulei", "shenxiaojiumie2/yanglei"], "sn_thunder"),
                zy(2, "玄女·法相", "法相", "法相试", "endure", ["sunvxinjing/faxiang"], "sn_avatar"),
                zy(3, "天魔·魅魂", "摄心", "魅魂试", "control", ["sunvxinjing/meihun", "jileliuxing/liuxing"], "sn_charm"),
                zy(4, "紫电·惊霆", "麻痹", "紫电试", "resource", ["zidianjin/chunlei", "zidianjin/tianlei", "zidianjin2/jinglei", "zidianjin2/tianlei"], "sn_purple"),
                zy(5, "应身·守一", "转伤", "应身试", "master", [], "sn_guard")
            ]
        }
    };

    function zy(id, name, mech, trialName, mode, pfms, effect) {
        return { id: id, name: name, mech: mech, trial: trialName, mode: mode, pfms: pfms || [], effect: effect };
    }

    var UPGRADE_XJ = [0, 0, 100, 150, 220, 300, 400, 520, 660, 820, 1000];
    var UPGRADE_MAT = [0, 0, 5, 8, 12, 18, 25, 34, 45, 58, 75];
    var MAX_LEVEL = 10, DAILY_LIMIT = 10, ENERGY_COST = 20;
    // 与技能、装备共用 grade 0～6 及其颜色。真意重数提升时跨越品质档位。
    var LEVEL_GRADES = [0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6];
    var GRADE_TAGS = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];
    // 品质就是真意的强度档位。每次跨品质均获得明确跃升，重数负责同品质内的小幅成长。
    var GRADE_SCALES = [1, 1, 1.20, 1.40, 1.60, 1.80, 2.00];

    function familyId(me) { return me && me.family && me.family.id; }
    function familyData(me) { return DATA[familyId(me)]; }
    function findDataByKey(key) { var id = KEY_TO_FAMILY[key]; return id ? DATA[id] : null; }
    function findIntent(data, id) {
        if (!data) return null;
        id = parseInt(id);
        for (var i = 0; i < data.list.length; i++) if (data.list[i].id === id) return data.list[i];
        return null;
    }
    function token(key, id) { return key + "_" + id; }
    function acquiredKey(key, id) { return "zy_" + token(key, id); }
    function levelKey(key, id) { return "zy_level_" + token(key, id); }
    function clearKey(key, id) { return "zy_clear_" + token(key, id); }
    function matKey(key, id) { return "zy_mat_" + token(key, id); }
    function matPath(key, id) { return "st/zhenyi_hen#" + token(key, id); }
    function removeAllMaterial(me, key, id) {
        if (!me.find_obj_bypath || !me.remove_obj) return;
        var obj = me.find_obj_bypath(matPath(key, id));
        if (obj) me.remove_obj(obj, obj.count || 1);
    }
    function dailyKey(key, id) { return "zy_daily_" + token(key, id); }
    function gradeForLevel(level) { return LEVEL_GRADES[Math.max(0, Math.min(MAX_LEVEL, parseInt(level) || 0))]; }
    function scaleFor(data, level) {
        var grade = gradeForLevel(level);
        return data.balance * (0.85 + level * 0.05) * GRADE_SCALES[grade];
    }
    function publicOwner(key) { return "zhenyi_public:" + key; }
    function trialOwner(me, key) { return "zhenyi_trial:" + key + ":" + me.id; }
    function percentValue(value) { return Math.max(1, Math.round(value * 100)); }
    function percentPointValue(value) { return Math.max(1, Math.round(value)); }
    function secondValue(value) { return Math.max(1, Math.round(value / 1000)); }
    function percentText(value) { return value + "%"; }
    function secondsText(value) { return value + "秒"; }
    function colorIntentName(intent, grade) {
        var tag = GRADE_TAGS[grade] || "wht";
        return "<" + tag + ">" + intent.name + "</" + tag + ">";
    }
    function hasTower100(me) { return me.query_temp("wd_level", 0) >= 100 || !!me.query_temp("wd100", 0); }
    function canUnlock(me, data) { return !!(me && data && familyId(me) === KEY_TO_FAMILY[data.key] && me.level >= 5 && hasTower100(me)); }

    // 所有玩家可见数字和战斗结算都只读取这里生成的整数，避免描述与实装分叉。
    function valuesFor(data, intent, level) {
        level = Math.max(1, Math.min(MAX_LEVEL, parseInt(level) || 1));
        var s = scaleFor(data, level), e = intent.effect;
        switch (e) {
            case "jz_edge": return { damage: percentValue((0.025 + level * 0.004) * s), ignore: percentPointValue((5 + level) * s) };
            case "jz_counter": return { damage: percentValue((0.08 + level * 0.008) * s) };
            case "jz_heavy": return { damage: percentValue((0.035 + level * 0.004) * s) };
            case "jz_wood": return { heal: percentValue((0.012 + level * 0.002) * s), reduction: percentValue((0.05 + level * 0.004) * s) };
            case "jz_formless": return { damage: percentValue((0.08 + level * 0.006) * s) };
            case "zw_borrow": return { damage: percentValue((0.10 + level * 0.008) * s) };
            case "zw_yield": return { reduction: percentValue((0.07 + level * 0.005) * s) };
            case "zw_stick": return { busy: secondValue((500 + level * 70) * s) };
            case "zw_circle": return { factor: percentValue((0.14 + level * 0.008) * s), cap: 30 };
            case "zw_wuji": return { heal: percentValue((0.05 + level * 0.004) * s), cost: percentValue(0.06 * s), cooldown: percentValue(0.06 * s), minimum: 4 };
            case "sl_vajra": return {};
            case "sl_roar": return { busy: secondValue((600 + level * 80) * s) };
            case "sl_prajna": return { seal: secondValue((900 + level * 70) * s) };
            case "sl_arhat": return { reduction: percentValue((0.04 + level * 0.003) * s), per_enemy: percentValue(0.025 * s), cap: 30 };
            case "sl_meditate": return { cost: percentValue(0.08 * s), cooldown: percentValue(0.07 * s), minimum: 4 };
            case "em_mercy": return { heal: percentValue((0.015 + level * 0.0025) * s) };
            case "em_wrath": return { reflect: percentValue((0.10 + level * 0.006) * s), cap: 50 };
            case "em_twin": return { damage: percentValue((0.11 + level * 0.008) * s) };
            case "em_yitian": return { damage: percentValue((0.025 + level * 0.004) * s), ignore: percentPointValue((5 + level) * s) };
            case "em_nineyin": return { damage: percentValue((0.06 + level * 0.006) * s) };
            case "gb_kanglong": return { damage: percentValue((0.025 + level * 0.004) * s), ignore: percentPointValue((5 + level) * s) };
            case "gb_flying": return { damage: percentValue(0.012 * s) };
            case "gb_tail": return { damage: percentValue((0.10 + level * 0.007) * s) };
            case "gb_field": return { damage: percentValue((0.06 + level * 0.006) * s) };
            case "gb_six": return { damage: percentValue((0.08 + level * 0.006) * s) };
            case "xy_beiming": return { drain: percentValue(0.01 * s), cap: 5 };
            case "xy_lingbo": return { damage: percentValue((0.07 + level * 0.006) * s), hit: percentValue(0.20 * s) };
            case "xy_baihong": return { damage: percentValue((0.08 + level * 0.006) * s), cost: 1 };
            case "xy_talisman": return { extra: percentValue((0.003 + level * 0.0004) * s), cap: 30 };
            case "xy_formless": return { cost: percentValue(0.10 * s), cooldown: percentValue(0.09 * s), minimum: 4 };
            case "ss_shadow": return { seal: secondValue((700 + level * 80) * s) };
            case "ss_step": return { damage: percentValue((0.07 + level * 0.006) * s), hit: percentValue(0.25 * s) };
            case "ss_puncture": return { damage: percentValue((0.09 + level * 0.007) * s), ignore: percentPointValue((10 + level) * s) };
            case "ss_debt": return { damage: percentValue((0.13 + level * 0.008) * s) };
            case "ss_asura": return { damage: percentValue((0.10 + level * 0.008) * s), ignore: percentPointValue((8 + level) * s) };
            case "sn_thunder": return { ignore: percentPointValue(3 * s) };
            case "sn_avatar": return { reduction: percentValue((0.06 + level * 0.005) * s) };
            case "sn_charm": return { damage: percentValue((0.08 + level * 0.006) * s) };
            case "sn_purple": return { damage: percentValue((0.07 + level * 0.006) * s), extra: percentValue((0.08 + level * 0.01) * s), cap: 40 };
            case "sn_guard": return { convert: percentValue((0.08 + level * 0.006) * s), cap: 30 };
        }
        return {};
    }

    // 试炼化身沿用旧禁地 NPC 在武帝阶段的固定量级，不再随玩家属性倍乘。
    var TRIAL_PROFILES = [null,
        { max_hp: 12000000, max_mp: 6000000, gj: 140000, fy: 100000, mz: 140000, zj: 100000, ds: 100000, skill: 2500 },
        { max_hp: 15000000, max_mp: 7500000, gj: 155000, fy: 110000, mz: 150000, zj: 110000, ds: 110000, skill: 2600 },
        { max_hp: 18000000, max_mp: 9000000, gj: 170000, fy: 120000, mz: 160000, zj: 120000, ds: 120000, skill: 2700 },
        { max_hp: 22000000, max_mp: 11000000, gj: 200000, fy: 140000, mz: 190000, zj: 150000, ds: 150000, skill: 2800 },
        { max_hp: 30000000, max_mp: 15000000, gj: 250000, fy: 180000, mz: 220000, zj: 180000, ds: 180000, skill: 3000 }
    ];
    function trialStats(intent) {
        var source = TRIAL_PROFILES[Math.max(1, Math.min(5, parseInt(intent && intent.id) || 1))], stats = {};
        for (var key in source) stats[key] = source[key];
        stats.timeout = intent && intent.mode === "burst" ? 120000 : (intent && intent.mode === "endure" ? 45000 : 180000);
        return stats;
    }

    // 八处真意禁地只保留正式试炼引导 NPC；旧敌人脚本留档但不再生成。
    function allowPublicNpc(roomPath, npcPath) {
        var key = String(roomPath || "").replace(/\\/g, "/").split("/")[0];
        if (!findDataByKey(key)) return true;
        return String(npcPath || "").indexOf("pub/zhenyi_shiyantai#" + key + "_") === 0;
    }

    // 面板描述与实际结算共用 valuesFor；level 为 0 时显示第一重预览。
    function describeIntent(data, intent, level) {
        var v = valuesFor(data, intent, level), e = intent.effect;
        switch (e) {
            case "jz_edge": return "绑定绝招命中时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "jz_counter": return "成功招架后获得10秒回锋；下一次技能伤害提高" + percentText(v.damage) + "，触发后消耗。";
            case "jz_heavy": return "目标当前气血高于70%时，技能伤害提高" + percentText(v.damage) + "。";
            case "jz_wood": return "紫气东来成功后回复最大气血" + percentText(v.heal) + "，并获得8秒护意；护意减伤" + percentText(v.reduction) + "。";
            case "jz_formless": return "施展无招期间，首轮技能伤害提高" + percentText(v.damage) + "；10秒内只触发一次。";
            case "zw_borrow": return "成功招架2次后，12秒内下一次技能伤害提高" + percentText(v.damage) + "，触发后清空层数。";
            case "zw_yield": return "受到伤害时，每8秒首次受击减伤" + percentText(v.reduction) + "。";
            case "zw_stick": return "绕字诀或震字诀命中后，使目标忙乱" + secondsText(v.busy) + "；同一目标10秒内只受一次。";
            case "zw_circle": return "减伤率等于已损气血比例×" + percentText(v.factor) + "，最终减伤上限" + percentText(v.cap) + "。";
            case "zw_wuji": return "气血低于18%时每600秒触发一次，回复最大气血" + percentText(v.heal) + "并清除负面状态；真武除邪精力消耗降低" + percentText(v.cost) + "，调息降低" + percentText(v.cooldown) + "，调息最低" + v.minimum + "秒。";
            case "sl_vajra": return "纯机制：每600秒最多抵挡一次致命伤害，将该次伤害压至仅余1点气血。";
            case "sl_roar": return "狮子吼命中后额外使目标忙乱" + secondsText(v.busy) + "；同一目标12秒内只受一次。";
            case "sl_prajna": return "惊魔一指或达摩三绝命中后，封锁目标绝招" + secondsText(v.seal) + "。";
            case "sl_arhat": return "同时被2名敌人攻击时减伤" + percentText(v.reduction) + "；每多1名敌人增加" + percentText(v.per_enemy) + "，最终上限" + percentText(v.cap) + "。";
            case "sl_meditate": return "佛光守护与一苇渡江的精力消耗降低" + percentText(v.cost) + "，调息降低" + percentText(v.cooldown) + "，调息最低" + v.minimum + "秒。";
            case "em_mercy": return "鹤翔庄或游龙庄成功生效后，回复最大气血" + percentText(v.heal) + "。";
            case "em_wrath": return "成功招架后获得6秒反震；下一次受击反弹所受伤害的" + percentText(v.reflect) + "，8秒冷却，反伤不超过自身攻击力" + percentText(v.cap) + "。";
            case "em_twin": return "灭剑与绝剑成功交替后，12秒内下一次技能伤害提高" + percentText(v.damage) + "。";
            case "em_yitian": return "倚天剑诀或号令天下命中时，伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "em_nineyin": return "目标当前气血高于80%时，技能伤害提高" + percentText(v.damage) + "。";
            case "gb_kanglong": return "施展降龙时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "gb_flying": return "十八掌连续命中叠加掌势，最多5层、持续12秒；每层使后续技能伤害提高" + percentText(v.damage) + "。";
            case "gb_tail": return "绊字诀命中后获得12秒摆尾；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "gb_field": return "自身气血低于40%时，技能伤害提高" + percentText(v.damage) + "。";
            case "gb_six": return "降龙或十八掌成功后获得12秒龙劲；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "xy_beiming": return "北冥绑定绝招命中后，吸取目标最大内力的" + percentText(v.drain) + "并转为自身内力；单次转化不超过自身最大内力" + percentText(v.cap) + "。";
            case "xy_lingbo": return "成功闪避后获得10秒残影；下一次技能伤害提高" + percentText(v.damage) + "，命中提高" + percentText(v.hit) + "。";
            case "xy_baihong": return "当前内力高于80%时，白虹掌力伤害提高" + percentText(v.damage) + "，并消耗最大内力" + percentText(v.cost) + "。";
            case "xy_talisman": return "生死符命中后追加自身最大内力的" + percentText(v.extra) + "作为伤害，单次不超过本次已造成伤害" + percentText(v.cap) + "，8秒冷却。";
            case "xy_formless": return "无相、无我释放已化用的绝招时，精力消耗降低" + percentText(v.cost) + "，调息降低" + percentText(v.cooldown) + "，调息最低" + v.minimum + "秒。";
            case "ss_shadow": return "无痕成功后，20秒内下一次伤害技能命中会封锁目标绝招" + secondsText(v.seal) + "；20秒冷却。";
            case "ss_step": return "成功闪避后获得10秒残影；下一次技能伤害提高" + percentText(v.damage) + "，命中提高" + percentText(v.hit) + "。";
            case "ss_puncture": return "目标当前气血高于80%时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "ss_debt": return "击杀目标后获得120秒血债；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "ss_asura": return "自身气血低于30%时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "sn_thunder": return "绑定雷法命中叠加雷贯，最多5层、持续12秒；每层忽视防御提高" + percentText(v.ignore) + "。";
            case "sn_avatar": return "玄女法相成功后获得15秒护持，期间受到伤害降低" + percentText(v.reduction) + "。";
            case "sn_charm": return "魅魂或极乐六性命中后获得12秒摄心；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "sn_purple": return "春雷暴殛或天雷系绑定绝招伤害提高" + percentText(v.damage) + "；每9秒追加一次攻击力的" + percentText(v.extra) + "作为雷伤，且不超过本次已造成伤害" + percentText(v.cap) + "。";
            case "sn_guard": return "当前内力大于0时，将每次所受伤害的" + percentText(v.convert) + "转为等量内力消耗；最终减伤上限" + percentText(v.cap) + "。";
        }
        return "此真意当前没有可结算的数值效果。";
    }

    function clearTrialTemps(me) {
        me.remove_temp("zy_trial_active");
        me.remove_temp("zy_trial_owner");
        me.remove_temp("zy_trial_return");
        me.remove_temp("zy_trial_control_cd");
        if (me.remove_status) me.remove_status("zy_trial_control", true);
    }

    // 热更新或重启会销毁旧试炼 NPC，但角色 temp 会持久化；每次进入系统都主动自愈。
    function ensureTrialState(me, notify) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", "");
        if (!active) {
            if (me.query_temp("zy_trial_owner", "") || me.query_temp("zy_trial_return", "")) clearTrialTemps(me);
            return false;
        }
        var parts = active.split("_"), key = parts[0], data = findDataByKey(key);
        var owner = me.query_temp("zy_trial_owner", ""), env = me.environment;
        var liveNpc = false;
        if (env && env.items) {
            for (var i = 0; i < env.items.length; i++) {
                if (env.items[i] && env.items[i].is_zhenyi_trial && env.items[i].trial_owner === me) { liveNpc = true; break; }
            }
        }
        var valid = !!(data && owner && owner === trialOwner(me, key) && env && env.owner === owner &&
            env.parent && env.parent.id === key && liveNpc);
        if (valid) return true;

        var oldOwner = owner, returnPath = me.query_temp("zy_trial_return", "");
        if (data && typeof ROOM !== "undefined" && env && env.parent && env.parent.id === key && env.owner === oldOwner) {
            var baseReturn = ROOM.Get(returnPath) || (ROOM.Get(data.trialRoom) && ROOM.Get(data.trialRoom).parent.rooms[0]);
            var publicRoom = baseReturn && (baseReturn.query_copy(publicOwner(key)) || baseReturn.create_copy(publicOwner(key)));
            if (publicRoom) me.moveto(publicRoom, me.name + "离开了失效的真意试炼。", me.name + "自黯淡的试炼石门中走出。");
        }
        clearTrialTemps(me);
        if (data && oldOwner && typeof ROOM !== "undefined") {
            var trialBase = ROOM.Get(data.trialRoom), staleRoom = trialBase && trialBase.query_copy(oldOwner);
            if (staleRoom && me.environment !== staleRoom) staleRoom.clear_by_area(trialBase.parent, oldOwner);
        }
        if (notify) me.notify("先前未结束的真意试炼已失效，残留状态已经自动清理，可以重新挑战。");
        return false;
    }

    function migrate(me) {
        ensureTrialState(me, false);
        var data = familyData(me);
        var migrationStamp = "20260823b:" + (familyId(me) || "NONE");
        if (me.query_temp("zy_migrate_version", "") === migrationStamp) return;
        var migrationComplete = true;
        // 兼容更新前已经判师、但旧真意字段仍残留的角色。
        for (var oldFamilyId in DATA) {
            var old = DATA[oldFamilyId];
            if (data && oldFamilyId === familyId(me)) continue;
            for (var oldId = 1; oldId <= 7; oldId++) {
                me.remove_temp(acquiredKey(old.key, oldId)); me.remove_temp(levelKey(old.key, oldId));
                me.remove_temp(clearKey(old.key, oldId)); me.remove_temp(matKey(old.key, oldId)); me.remove_temp(dailyKey(old.key, oldId));
                removeAllMaterial(me, old.key, oldId);
            }
            me.remove_temp("zy_active_" + old.key); me.set_bool("fb2", old.jd, false);
        }
        if (!data) { me.remove_temp("zy_active"); me.set_temp("zy_migrate_version", migrationStamp); return; }
        for (var i = 0; i < data.list.length; i++) {
            var item = data.list[i];
            if (me.query_temp(acquiredKey(data.key, item.id), 0) && !me.query_temp(levelKey(data.key, item.id), 0)) {
                me.set_temp(levelKey(data.key, item.id), 1);
                me.set_temp(clearKey(data.key, item.id), 1);
            }
            // 一次性把旧版角色计数迁移为可在背包中查看的真实道具。
            var oldMat = parseInt(me.query_temp(matKey(data.key, item.id), 0)) || 0;
            if (oldMat > 0 && me.add_obj) {
                var migrated = me.add_obj(matPath(data.key, item.id), oldMat);
                if (migrated) me.remove_temp(matKey(data.key, item.id));
                else migrationComplete = false;
            }
        }
        if (!me.query_temp("zy_active", "")) {
            var mask = me.query_temp("zy_active_" + data.key, 0) || 0;
            for (var j = 0; j < data.list.length; j++) {
                if ((mask & (1 << j)) && me.query_temp(acquiredKey(data.key, j + 1), 0)) {
                    me.set_temp("zy_active", token(data.key, j + 1));
                    break;
                }
            }
        }
        me.remove_temp("zy_active_" + data.key);
        me.remove_temp("zy_yc_6"); me.remove_temp("zy_yc_7");
        // 清理旧版禁地 NPC 直接发放的草创真意。新系统只认五道正式真意。
        var legacyKeys = [
            "jz_lijian", "jz_ruanjian", "jz_zhongjian", "jz_mujian", "jz_wujian",
            "zw_zhenwu", "dmd_intent_1", "dmd_intent_2", "dmd_intent_3", "dmd_intent_4",
            "jdfg_intent_1", "jdfg_intent_2", "jdfg_intent_3", "jdfg_intent_4",
            "lhfd_intent_1", "lhfd_intent_2", "lhfd_intent_3", "lhfd_intent_4", "lhfd_intent_5",
            "xl_shadow", "xl_step", "xl_puncture", "xl_debt", "xl_asura",
            "yc_jin", "yc_shui", "yc_mu", "yc_huo", "yc_tu"
        ];
        for (var lk = 0; lk < legacyKeys.length; lk++) me.remove_temp(legacyKeys[lk]);
        if (migrationComplete) me.set_temp("zy_migrate_version", migrationStamp);
    }

    function checkUnlock(me, silent) {
        var data = familyData(me);
        if (!data || !canUnlock(me, data)) return false;
        migrate(me);
        if (!me.query_bool("fb2", data.jd)) {
            me.set_bool("fb2", data.jd, true);
            if (!silent) {
                me.send("<him>你心有所感，已可前往【" + data.area + "】参悟" + data.name + "。</him>");
                me.send(JSON.stringify({ type: "dialog", dialog: "jh", unlock2: me.query_temp("fb2", 0) }));
            }
            return true;
        }
        return false;
    }

    function canEnterArea(me, key, notify) {
        var data = findDataByKey(key), msg = "";
        if (!data) msg = "此处并无可寻的门派禁地。";
        else if (familyId(me) !== KEY_TO_FAMILY[key]) msg = "此地只接纳" + FAMILIES[KEY_TO_FAMILY[key]].name + "弟子。";
        else if (me.level < 5) msg = "你境界未到武帝，尚不足以承受禁地真意。";
        else if (!hasTower100(me)) msg = "你尚未通过武道塔第一百层，禁地不会为你开启。";
        if (msg) { if (notify !== false && me) me.notify(msg); return false; }
        checkUnlock(me, true);
        return true;
    }

    function getLevel(me, key, id) {
        if (!me.query_temp(acquiredKey(key, id), 0)) return 0;
        return Math.max(1, Math.min(MAX_LEVEL, parseInt(me.query_temp(levelKey(key, id), 1)) || 1));
    }
    function getActive(me) {
        var data = familyData(me);
        if (!canUnlock(me, data)) return null;
        migrate(me);
        var active = me.query_temp("zy_active", "");
        if (!active) return null;
        var parts = active.split("_");
        if (!data || parts[0] !== data.key) return null;
        var intent = findIntent(data, parts[1]), lv = intent ? getLevel(me, data.key, intent.id) : 0;
        if (!intent || !lv) return null;
        return { data: data, intent: intent, level: lv, grade: gradeForLevel(lv), values: valuesFor(data, intent, lv) };
    }
    function setActive(me, id) {
        if (me.is_fighting && me.is_fighting()) return me.notify("战斗中不可更易真意。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!canUnlock(me, data)) return me.notify("你尚未达到参悟门派真意的条件。"), false;
        if (!intent || !getLevel(me, data.key, intent.id)) return me.notify("你尚未领悟这道真意。"), false;
        var value = token(data.key, intent.id);
        if (me.query_temp("zy_active", "") === value) { me.remove_temp("zy_active"); me.notify("你收敛心神，不再催动任何真意。"); }
        else { me.set_temp("zy_active", value); me.notify("你开始催动【" + colorIntentName(intent, gradeForLevel(getLevel(me, data.key, intent.id))) + "】。"); }
        clearCombatState(me);
        return true;
    }
    function clearCombatState(me) {
        var keys = ["zy_pfm", "zy_pfm_id", "zy_counter", "zy_borrow", "zy_lingbo", "zy_tail", "zy_twin", "zy_charm", "zy_six", "zy_shadow_ready"];
        for (var i = 0; i < keys.length; i++) me.remove_temp(keys[i]);
    }
    function forgetFamily(me, oldFamilyId) {
        var data = DATA[oldFamilyId];
        if (!data) return;
        for (var i = 1; i <= 7; i++) {
            me.remove_temp(acquiredKey(data.key, i)); me.remove_temp(levelKey(data.key, i));
            me.remove_temp(clearKey(data.key, i)); me.remove_temp(matKey(data.key, i)); me.remove_temp(dailyKey(data.key, i));
            removeAllMaterial(me, data.key, i);
        }
        var active = me.query_temp("zy_active", "");
        if (active && active.indexOf(data.key + "_") === 0) me.remove_temp("zy_active");
        me.remove_temp("zy_active_" + data.key); clearTrialTemps(me);
        me.remove_temp("zy_migrate_version");
        clearCombatState(me); me.set_bool("fb2", data.jd, false);
    }

    function currentAreaMatches(me, data) { return !!(me && me.environment && me.environment.parent && me.environment.parent.id === data.key); }
    function dailyCount(me, key, id) { return parseInt(me.query_temp(dailyKey(key, id), 0)) || 0; }
    function addDaily(me, key, id, count) { return me.add_temp(dailyKey(key, id), count, UTIL.diff_time()); }
    // 真意试炼副本不应继承公共试场出口；完成/退出由动作栏提供。
    function configureTrialRoom(room) {
        if (!room) return room;
        room.zhenyi_trial_room = true;
        room.exits = {};
        room.json = null;
        room.commands_json = null;
        room.room_exits_json = null;
        if (room.exits_changed) room.exits_changed();
        return room;
    }

    function startTrial(me, id) {
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这项试炼。"), false;
        if (!canEnterArea(me, data.key)) return false;
        if (!currentAreaMatches(me, data)) return me.notify("你须先进入【" + data.area + "】。"), false;
        if (me.is_fighting()) return me.notify("你尚在战斗，不能另启试炼。"), false;
        ensureTrialState(me, !!me.query_temp("zy_trial_active", ""));
        if (me.query_temp("zy_trial_active", "")) return me.notify("你已有一项真意试炼尚未结束。"), false;
        if (dailyCount(me, data.key, intent.id) >= DAILY_LIMIT) return me.notify("这项试炼今日已达十次。"), false;
        var baseRoom = ROOM.Get(data.trialRoom);
        if (!baseRoom) return me.notify("试炼场暂不可用，请联系管理员。"), false;
        var npc = null;
        try { npc = NPC.CLONE("pub/zhenyi_trial"); } catch (e) { return me.notify("试炼化身凝聚失败，请联系管理员。"), false; }
        if (!npc || !npc.init_trial) return me.notify("试炼化身凝聚失败。"), false;
        if (!me.expend_jingli(ENERGY_COST)) { npc.destroy(); return me.notify("参加试炼需要" + ENERGY_COST + "点精力。"), false; }
        var owner = trialOwner(me, data.key);
        var staleRoom = baseRoom.query_copy(owner);
        if (staleRoom) staleRoom.clear_by_area(baseRoom.parent, owner);
        me.set_temp("zy_trial_owner", owner);
        me.set_temp("zy_trial_return", me.environment.path);
        var room = baseRoom.create_copy(owner);
        configureTrialRoom(room);
        if (!room || me.moveto(room, me.name + "步入试炼石门。", me.name + "踏入了试炼场。") === false) {
            npc.destroy(); me.remove_temp("zy_trial_owner"); me.remove_temp("zy_trial_return");
            if (room) room.clear_by_area(baseRoom.parent, owner);
            return me.notify("试炼场暂时无法进入。"), false;
        }
        for (var i = room.items.length - 1; i >= 0; i--) {
            var old = room.items[i];
            if (!old.is_player && old.is_zhenyi_trial) room.item_changed(old, false);
        }
        me.set_temp("zy_trial_active", token(data.key, intent.id)); addDaily(me, data.key, intent.id, 1);
        npc.init_trial(me, data, intent); room.item_changed(npc, true);
        me.notify("<hiy>你消耗" + ENERGY_COST + "点精力，开始【" + intent.trial + "】。今日次数" + dailyCount(me, data.key, intent.id) + "/" + DAILY_LIMIT + "。</hiy>");
        npc.do_kill(me); return true;
    }

    function returnFromTrial(me, key) {
        if (!me) return;
        var owner = me.query_temp("zy_trial_owner", "");
        var returnPath = me.query_temp("zy_trial_return", "");
        if (!owner) return;
        me.call_out(function () {
            var data = findDataByKey(key), shouldReturn = me.environment && me.environment.parent && me.environment.parent.id === key;
            if (shouldReturn && data) {
                var baseReturn = ROOM.Get(returnPath) || ROOM.Get(data.trialRoom).parent.rooms[0];
                var publicRoom = baseReturn && (baseReturn.query_copy(publicOwner(key)) || baseReturn.create_copy(publicOwner(key)));
                if (!publicRoom || me.moveto(publicRoom, me.name + "离开了真意试炼。", me.name + "自试炼石门中走出。") === false) {
                    me.notify("试炼出口暂时无法开启，请使用地图传送离开后联系管理员。");
                    return;
                }
            }
            me.remove_temp("zy_trial_owner"); me.remove_temp("zy_trial_return");
            if (data) {
                var trialBase = ROOM.Get(data.trialRoom), trialRoom = trialBase && trialBase.query_copy(owner);
                if (trialRoom) trialRoom.clear_by_area(trialBase.parent, owner);
            }
        }, 0);
    }

    function addXuanjing(me, count) { var obj = me.add_obj("st/xuanjing", count); return obj ? count : 0; }
    function addMaterial(me, key, id, count) {
        if (!me || !(count > 0)) return null;
        var path = matPath(key, id), item = null;
        // 先创建带参数的对象再交给角色合并，避免奖励链路丢失 zhenyi_hen 的参数。
        if (typeof OBJ !== "undefined" && OBJ.CREATE) {
            item = OBJ.CREATE(path, count);
            if (item) item = me.add_obj(item);
        }
        if (!item) item = me.add_obj(path, count);
        return item || null;
    }
    function matCount(me, key, id) { var obj = me.find_obj_bypath(matPath(key, id)); return obj ? (obj.count || 1) : 0; }
    function reward(me, data, intent, count, isSweep) {
        var xj = 0, mat = 0, bonus = 0;
        for (var i = 0; i < count; i++) {
            xj += (isSweep ? 12 : 18) + me.random(isSweep ? 7 : 9);
            mat += (isSweep ? 1 : 2) + (me.random(100) < 25 ? 1 : 0);
            if (me.random(100) < 20) bonus++;
        }
        var material = addMaterial(me, data.key, intent.id, mat), materialCount = material ? mat : 0;
        var safeBonusName = "";
        if (bonus > 0) {
            var unlockedSafe = [];
            for (var sj = 0; sj < data.list.length; sj++) if (getLevel(me, data.key, data.list[sj].id)) unlockedSafe.push(data.list[sj]);
            if (unlockedSafe.length) {
                var safeBonus = unlockedSafe[me.random(unlockedSafe.length)];
                if (addMaterial(me, data.key, safeBonus.id, bonus)) safeBonusName = "，另得" + safeBonus.name + "悟痕×" + bonus;
            }
        }
        addXuanjing(me, xj);
        me.notify("<hig>获得玄晶×" + xj + "、" + intent.name + "悟痕×" + materialCount + safeBonusName + "。</hig>");
        if (materialCount < mat) me.notify("<hir>悟痕道具发放失败，请联系管理员检查背包空间。</hir>");
        return;
        var bonusName = "";
        if (bonus > 0) {
            var unlocked = [];
            for (var j = 0; j < data.list.length; j++) if (getLevel(me, data.key, data.list[j].id)) unlocked.push(data.list[j]);
            if (unlocked.length) { var b = unlocked[me.random(unlocked.length)]; me.add_obj(matPath(data.key, b.id), bonus); bonusName = "，另得" + b.name + "悟痕×" + bonus; }
        }
        me.notify("<hig>获得玄晶×" + xj + "、" + intent.name + "悟痕×" + mat + bonusName + "。</hig>");
    }
    function completeTrial(me, key, id) {
        var data = findDataByKey(key), intent = findIntent(data, id);
        if (!me || !data || !intent || familyId(me) !== KEY_TO_FAMILY[key]) return false;
        if (me.query_temp("zy_trial_active", "") !== token(key, intent.id)) return false;
        me.remove_temp("zy_trial_active");
        if (!getLevel(me, key, intent.id)) {
            me.set_temp(acquiredKey(key, intent.id), 1); me.set_temp(levelKey(key, intent.id), 1); me.set_temp(clearKey(key, intent.id), 1);
            me.notify("<him>试炼石壁上道韵流转，你领悟了【" + intent.name + "】！</him>");
        }
        reward(me, data, intent, 1, false);
        if (WORLD.COMMANDS.zhenyi) WORLD.COMMANDS.zhenyi.send_panel(me);
        returnFromTrial(me, key);
        return true;
    }
    function failTrial(me, reason) {
        if (!me) return;
        var active = me.query_temp("zy_trial_active", ""), key = active ? active.split("_")[0] : (me.environment && me.environment.parent && me.environment.parent.id);
        me.remove_temp("zy_trial_active");
        if (reason) me.notify("<hir>真意试炼失败：" + reason + "</hir>");
        if (key) returnFromTrial(me, key);
    }
    function finishTrialAction(me, exitOnly) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_"), key = bits && bits[0], id = bits && parseInt(bits[1]);
        if (!active || !key || !(id >= 0)) return me.notify("你当前不在真意试炼副本中。"), false;
        if (exitOnly) {
            failTrial(me, "你主动退出了真意试炼。");
            return true;
        }
        var data = findDataByKey(key), intent = findIntent(data, id);
        if (intent && intent.mode === "endure") me.notify("请继续坚持至试炼计时结束；达成目标后会自动结算。");
        else me.notify("请先完成试炼目标；击败武意化身后会自动结算。");
        return false;
    }
    function sweep(me, id, count) {
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这项试炼。"), false;
        if (!canEnterArea(me, data.key)) return false;
        if (!currentAreaMatches(me, data)) return me.notify("你须身在【" + data.area + "】中方可扫荡。"), false;
        if (me.is_fighting()) return me.notify("战斗中不能扫荡试炼。"), false;
        if (!me.query_temp(clearKey(data.key, intent.id), 0)) return me.notify("亲自完成一次试炼后方可扫荡。"), false;
        var remain = DAILY_LIMIT - dailyCount(me, data.key, intent.id);
        if (remain <= 0) return me.notify("这项试炼今日已达十次。"), false;
        count = Math.max(1, Math.min(parseInt(count) || 1, remain));
        if (!me.expend_jingli(ENERGY_COST * count)) return me.notify("扫荡" + count + "次需要" + (ENERGY_COST * count) + "点精力。"), false;
        addDaily(me, data.key, intent.id, count);
        me.notify("<hiy>你在" + data.area + "中重温【" + intent.trial + "】" + count + "次。</hiy>"); reward(me, data, intent, count, true); return true;
    }

    function xuanjingCount(me) { var obj = me.find_obj_bypath("st/xuanjing"); return obj ? (obj.count || 1) : 0; }
    function requestUpgrade(me, id) {
        if (me.is_fighting()) return me.notify("战斗中不可参悟升级。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这道真意。"), false;
        var lv = getLevel(me, data.key, intent.id);
        if (!lv) return me.notify("你尚未领悟这道真意。"), false;
        if (intent.effect === "sl_vajra") return me.notify("【" + intent.name + "】是纯机制真意，无需也不能升级。"), false;
        if (lv >= MAX_LEVEL) return me.notify("这道真意已臻圆满。"), false;
        var next = lv + 1, xj = UPGRADE_XJ[next], mat = UPGRADE_MAT[next];
        var nowGrade = gradeForLevel(lv), nextGrade = gradeForLevel(next);
        me.notify("【" + colorIntentName(intent, nowGrade) + "】第" + lv + "重将提升为【" + colorIntentName(intent, nextGrade) + "】第" + next + "重。");
        me.notify("当前效果：" + describeIntent(data, intent, lv));
        me.notify("<hig>升级后：" + describeIntent(data, intent, next) + "</hig>");
        me.notify("消耗玄晶×" + xj + "（持有" + xuanjingCount(me) + "）、" + intent.name + "悟痕×" + mat + "（持有" + matCount(me, data.key, intent.id) + "）。");
        me.send_commands("zhenyi upgrade_confirm " + intent.id + " " + lv, "确认升级", "zhenyi upgrade_cancel", "取消");
        return true;
    }
    function confirmUpgrade(me, id, expectedLevel) {
        if (me.is_fighting()) return me.notify("战斗中不可参悟升级。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这道真意。"), false;
        var lv = getLevel(me, data.key, intent.id);
        if (!lv || lv !== parseInt(expectedLevel)) return me.notify("真意状态已经变化，请重新点击升级。"), false;
        if (intent.effect === "sl_vajra" || lv >= MAX_LEVEL) return me.notify("这道真意不能继续升级。"), false;
        var next = lv + 1, xj = UPGRADE_XJ[next], mat = UPGRADE_MAT[next];
        if (xuanjingCount(me) < xj) return me.notify("玄晶不足，需要" + xj + "枚。"), false;
        if (matCount(me, data.key, intent.id) < mat) return me.notify(intent.name + "悟痕不足，需要" + mat + "枚。"), false;
        var obj = me.find_obj_bypath("st/xuanjing");
        if (!obj || !me.remove_obj(obj, xj)) return me.notify("玄晶扣除失败。"), false;
        var material = me.find_obj_bypath(matPath(data.key, intent.id));
        if (!material || !me.remove_obj(material, mat)) {
            me.add_obj("st/xuanjing", xj);
            return me.notify("悟痕扣除失败，玄晶已返还。"), false;
        }
        me.set_temp(levelKey(data.key, intent.id), next);
        me.notify("<him>【" + colorIntentName(intent, gradeForLevel(next)) + "】提升至第" + next + "重。</him>");
        if (WORLD.COMMANDS.zhenyi) WORLD.COMMANDS.zhenyi.send_panel(me);
        return true;
    }
    function serialize(me) {
        var data = familyData(me);
        if (!data || !canUnlock(me, data)) return null;
        checkUnlock(me, true);
        migrate(me);
        var active = me.query_temp("zy_active", ""), list = [];
        for (var i = 0; i < data.list.length; i++) {
            var item = data.list[i], lv = getLevel(me, data.key, item.id);
            var grade = gradeForLevel(lv);
            list.push({ id: item.id, name: item.name, mech: item.mech, desc: describeIntent(data, item, lv), trial: item.trial,
                acquired: lv > 0, active: active === token(data.key, item.id), level: lv, grade: grade,
                mechanic_only: item.effect === "sl_vajra", preview_level: lv || 1,
                daily: dailyCount(me, data.key, item.id), daily_limit: DAILY_LIMIT,
                cleared: !!me.query_temp(clearKey(data.key, item.id), 0) });
        }
        return { name: data.name, key: data.key, area: data.area, energy_cost: ENERGY_COST, list: list };
    }

    function allowedSkill(skill, me) {
        if (!skill || skill.grade >= 6) return false;
        // 真意只温养本门武学，不借此强化公共、外门或复制来的技能。
        if (me && skill.family !== me.family) return false;
        return true;
    }
    function pfmMatches(active, pfmId, skill) {
        return !!(active && pfmId && allowedSkill(skill) && skill.family &&
            skill.family.id === KEY_TO_FAMILY[active.data.key] && active.intent.pfms.indexOf(pfmId) >= 0);
    }
    function beginPfm(me, pfm, skill) {
        var active = getActive(me);
        if (!active || !pfmMatches(active, pfm.id, skill)) return null;
        me.set_temp("zy_pfm", active.intent.effect, 15000); me.set_temp("zy_pfm_id", pfm.id, 15000); return active;
    }
    function pfmCost(me, pfm, skill, value) {
        var active = getActive(me);
        if (!pfmMatches(active, pfm && pfm.id, skill)) return value;
        var pct = active.values.cost || 0;
        return pct ? Math.max(0, Math.floor(value * (100 - pct) / 100)) : value;
    }
    function pfmCooldown(me, pfm, skill, value) {
        var active = getActive(me);
        if (!pfmMatches(active, pfm && pfm.id, skill)) return value;
        var pct = active.values.cooldown || 0;
        var minimum = (active.values.minimum || 4) * 1000;
        return pct ? Math.max(minimum, Math.floor(value * (100 - pct) / 100)) : value;
    }
    function endPfm(me, target, pfm, skill, success) {
        var active = getActive(me);
        if (!success || !pfmMatches(active, pfm && pfm.id, skill)) return;
        var effect = active.intent.effect, v = active.values;
        if (effect === "jz_wood") { me.do_recover(Math.floor(me.max_hp * v.heal / 100)); me.set_temp("zy_wood_guard", 1, 8000); }
        else if (effect === "em_mercy") me.do_recover(Math.floor(me.max_hp * v.heal / 100));
        else if (effect === "xy_beiming" && target) { var drain = Math.min(Math.floor(target.max_mp * v.drain / 100), Math.floor(me.max_mp * v.cap / 100)); if (drain > 0) { target.add_mp(-drain); me.add_mp(drain); } }
        else if (effect === "sl_roar" && target) addControl(target, "zy_roar", "狮吼震慑", v.busy * 1000, 12000);
        else if (effect === "sl_prajna" && target) target.set_temp("sealed_pfm", 1, v.seal * 1000);
        else if (effect === "zw_stick" && target) addControl(target, "zy_stick", "太极粘劲", v.busy * 1000, 10000);
        else if (effect === "gb_tail") me.set_temp("zy_tail", 1, 12000);
        else if (effect === "gb_six") me.set_temp("zy_six", 1, 12000);
        else if (effect === "em_twin") { var last = me.query_temp("zy_twin_last", ""); if (last && last !== pfm.id) me.set_temp("zy_twin", 1, 12000); me.set_temp("zy_twin_last", pfm.id, 20000); }
        else if (effect === "ss_shadow" && !me.query_temp("zy_shadow_cd")) { me.set_temp("zy_shadow_ready", 1, 20000); me.set_temp("zy_shadow_cd", 1, 20000); }
        else if (effect === "sn_charm") me.set_temp("zy_charm", 1, 12000);
        else if (effect === "sn_avatar") me.set_temp("zy_avatar", 1, 15000);
    }
    function addControl(target, id, name, duration, cooldown) {
        if (!target || target.query_temp(id + "_cd")) return;
        target.set_temp(id + "_cd", 1, cooldown); target.add_status({ id: id, name: name, duration: duration, downside: true, prop: { is_busy: 1 } });
    }

    function addIgnore(par, value) {
        par.diff_fy = Math.min(100, (par.diff_fy || 0) + value);
    }
    function modifyAttack(me, target, par, sh, skill) {
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me)) return sh;
        var e = active.intent.effect, v = active.values, bonus = 0, inPfm = me.query_temp("zy_pfm", "") === e;
        if ((e === "jz_edge" || e === "em_yitian" || e === "gb_kanglong") && inPfm) bonus += v.damage / 100;
        if ((e === "jz_edge" || e === "em_yitian" || e === "gb_kanglong") && inPfm) {
            addIgnore(par, v.ignore);
        }
        if (e === "jz_counter" && me.query_temp("zy_counter")) { bonus += v.damage / 100; me.remove_temp("zy_counter"); }
        else if (e === "jz_heavy" && target.max_hp && target.hp / target.max_hp > 0.7) bonus += v.damage / 100;
        else if (e === "jz_formless" && inPfm && !me.query_temp("zy_formless_cd")) { bonus += v.damage / 100; me.set_temp("zy_formless_cd", 1, 10000); }
        else if (e === "zw_borrow" && me.query_temp("zy_borrow", 0) >= 2) { bonus += v.damage / 100; me.remove_temp("zy_borrow"); }
        else if (e === "gb_field" && me.max_hp && me.hp / me.max_hp < 0.4) bonus += v.damage / 100;
        else if (e === "gb_flying" && inPfm) { var st = Math.min(5, me.add_temp("zy_flying", 1, 12000)); bonus += st * v.damage / 100; }
        else if (e === "gb_tail" && me.query_temp("zy_tail")) { bonus += v.damage / 100; me.remove_temp("zy_tail"); }
        else if (e === "gb_six" && me.query_temp("zy_six")) { bonus += v.damage / 100; me.remove_temp("zy_six"); }
        else if (e === "em_twin" && me.query_temp("zy_twin")) { bonus += v.damage / 100; me.remove_temp("zy_twin"); }
        else if (e === "em_nineyin" && target.max_hp && target.hp / target.max_hp > 0.8) bonus += v.damage / 100;
        else if ((e === "xy_lingbo" || e === "ss_step") && me.query_temp("zy_lingbo")) { bonus += v.damage / 100; par.mz = (par.mz || me.mz) * (1 + v.hit / 100); me.remove_temp("zy_lingbo"); }
        else if (e === "xy_baihong" && inPfm && me.max_mp && me.mp / me.max_mp > 0.8) { bonus += v.damage / 100; me.add_mp(-Math.floor(me.max_mp * v.cost / 100)); }
        else if (e === "ss_puncture" && target.max_hp && target.hp / target.max_hp > 0.8) { bonus += v.damage / 100; addIgnore(par, v.ignore); }
        else if (e === "ss_debt" && me.query_temp("zy_debt")) { bonus += v.damage / 100; me.remove_temp("zy_debt"); }
        else if (e === "ss_asura" && me.max_hp && me.hp / me.max_hp < 0.3) { bonus += v.damage / 100; addIgnore(par, v.ignore); }
        else if (e === "sn_charm" && me.query_temp("zy_charm")) { bonus += v.damage / 100; me.remove_temp("zy_charm"); }
        else if (e === "sn_thunder" && inPfm) { var th = Math.min(5, me.add_temp("zy_thunder", 1, 12000)); addIgnore(par, th * v.ignore); }
        else if (e === "sn_purple" && inPfm) bonus += v.damage / 100;
        return sh * (1 + bonus);
    }
    function afterAttack(me, target, par, dealt, skill) {
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me) || !(dealt > 0)) return;
        var e = active.intent.effect, v = active.values;
        if (e === "ss_shadow" && me.query_temp("zy_shadow_ready")) {
            me.remove_temp("zy_shadow_ready"); target.set_temp("sealed_pfm", 1, v.seal * 1000);
        }
        if (e === "xy_talisman" && me.query_temp("zy_pfm", "") === e && !target.query_temp("zy_talisman_cd")) {
            target.set_temp("zy_talisman_cd", 1, 8000); var extra = Math.min(Math.floor(me.max_mp * v.extra / 100), Math.floor(dealt * v.cap / 100)); if (extra > 0) target.damage(extra, me, 100);
        } else if (e === "sn_purple" && me.query_temp("zy_pfm", "") === e && !target.query_temp("zy_purple_cd")) {
            target.set_temp("zy_purple_cd", 1, 9000); var burn = Math.min(Math.floor(me.gj * v.extra / 100), Math.floor(dealt * v.cap / 100)); if (burn > 0) target.damage(burn, me, 100);
        }
    }
    function onParry(me) {
        var active = getActive(me); if (!active) return;
        if (active.intent.effect === "jz_counter") me.set_temp("zy_counter", 1, 10000);
        else if (active.intent.effect === "zw_borrow") me.set_temp("zy_borrow", Math.min(2, me.query_temp("zy_borrow", 0) + 1), 12000);
        else if (active.intent.effect === "em_wrath" && !me.query_temp("zy_wrath_cd")) me.set_temp("zy_wrath_ready", 1, 6000);
    }
    function onDodge(me) { var active = getActive(me); if (active && (active.intent.effect === "xy_lingbo" || active.intent.effect === "ss_step")) me.set_temp("zy_lingbo", 1, 10000); }
    function modifyDamage(me, from, sh) {
        var active = getActive(me); if (!active || !(sh > 0)) return sh;
        var e = active.intent.effect, v = active.values, reduction = 0;
        if (e === "jz_wood" && me.query_temp("zy_wood_guard")) reduction = v.reduction / 100;
        else if (e === "zw_yield" && !me.query_temp("zy_yield_cd")) { reduction = v.reduction / 100; me.set_temp("zy_yield_cd", 1, 8000); }
        else if (e === "zw_circle" && me.max_hp) reduction = Math.min(v.cap / 100, Math.max(0, (1 - me.hp / me.max_hp) * v.factor / 100));
        else if (e === "sl_arhat" && me.enemy && me.enemy.length > 1) reduction = Math.min(v.cap / 100, (v.reduction + (me.enemy.length - 2) * v.per_enemy) / 100);
        else if (e === "sn_avatar" && me.query_temp("zy_avatar")) reduction = v.reduction / 100;
        else if (e === "sn_guard" && me.mp > 0) { var convert = Math.min(sh * v.convert / 100, sh * v.cap / 100, me.mp); me.add_mp(-Math.floor(convert)); sh -= convert; }
        sh *= (1 - reduction);
        if (e === "sl_vajra" && sh >= me.hp && me.hp > 1 && !me.query_temp("zy_vajra_cd")) { sh = me.hp - 1; me.set_temp("zy_vajra_cd", 1, 600000); me.notify("<hiy>金刚不坏真意护住你最后一线生机！</hiy>"); }
        else if (e === "zw_wuji" && me.max_hp && me.hp / me.max_hp < 0.18 && !me.query_temp("zy_wuji_cd")) { me.set_temp("zy_wuji_cd", 1, 600000); me.do_recover(Math.floor(me.max_hp * v.heal / 100)); me.clear_downside && me.clear_downside(); }
        if (e === "em_wrath" && me.query_temp("zy_wrath_ready") && from && from.hp > 0 && !me._zy_reflecting) {
            me.remove_temp("zy_wrath_ready"); me.set_temp("zy_wrath_cd", 1, 8000);
            var reflect = Math.min(Math.floor(sh * v.reflect / 100), Math.floor(me.gj * v.cap / 100));
            if (reflect > 0) { me._zy_reflecting = true; from.damage(reflect, me, 100); me._zy_reflecting = false; }
        }
        return Math.max(0, sh);
    }
    function onKill(me) { var active = getActive(me); if (active && active.intent.effect === "ss_debt") me.set_temp("zy_debt", 1, 120000); }
    function onCombatEnd(me) { clearCombatState(me); me.remove_temp("zy_flying"); me.remove_temp("zy_thunder"); }

    WORLD.ZHENYI = {
        DATA: DATA, FAMILY_TO_KEY: FAMILY_TO_KEY, MAX_LEVEL: MAX_LEVEL, DAILY_LIMIT: DAILY_LIMIT, ENERGY_COST: ENERGY_COST,
        family_data: familyData, find_by_key: findDataByKey, find_intent: findIntent, migrate: migrate,
        public_owner: publicOwner, is_public_owner: function (owner) { return typeof owner === "string" && owner.indexOf("zhenyi_public:") === 0; },
        allow_public_npc: allowPublicNpc, trial_stats: trialStats,
        grade_for_level: gradeForLevel, values_for: valuesFor, describe: describeIntent,
        check_unlock: checkUnlock, can_enter_area: canEnterArea, get_level: getLevel, get_active: getActive,
        set_active: setActive, forget_family: forgetFamily, serialize: serialize, start_trial: startTrial, ensure_trial_state: ensureTrialState,
        complete_trial: completeTrial, fail_trial: failTrial, finish_trial_action: finishTrialAction,
        configure_trial_room: configureTrialRoom, add_material: addMaterial, sweep: sweep,
        request_upgrade: requestUpgrade, confirm_upgrade: confirmUpgrade,
        begin_pfm: beginPfm, pfm_cost: pfmCost, pfm_cooldown: pfmCooldown, end_pfm: endPfm,
        modify_attack: modifyAttack, after_attack: afterAttack, on_parry: onParry, on_dodge: onDodge,
        modify_damage: modifyDamage, on_kill: onKill, on_combat_end: onCombatEnd, is_allowed_skill: allowedSkill
    };
})();

