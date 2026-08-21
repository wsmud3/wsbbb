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
                zy(1, "利剑·争锋", "破式", "施展破气诀等本门非红色攻击命中时，伤害提高约1.6%～8.4%，并额外获得3～17点破防；数值随真意重数和门派平衡系数成长。", "利剑问锋", "precision", ["dugujiujian/pojian", "dugujiujian/poqi"], "jz_edge"),
                zy(2, "软剑·回锋", "反击", "成功招架后获得10秒回锋标记；下一次本门非红色武学攻击伤害提高约4.6%～17.8%，触发后消耗标记。", "软剑回环", "counter", ["dugujiujian/wu", "kuangfengkuaijian/duoming"], "jz_counter"),
                zy(3, "重剑·崩岳", "破坚", "目标当前气血高于70%时，本门非红色武学伤害提高约2.1%～8.3%；不额外触发独立伤害。", "重剑负山", "burst", ["dugujiujian/poqi", "huashanjianfa/jiang"], "jz_heavy"),
                zy(4, "木剑·养意", "生息", "成功施展紫气东来后，立即回复最大气血约0.8%～3.6%，并获得8秒护意；护意期间受伤减免约2.9%～10.0%。", "木剑守拙", "endure", ["zixiashengong/xi"], "jz_wood"),
                zy(5, "无剑·无招", "剑势", "施展无招期间，本门非红色武学首轮攻击伤害提高约4.6%～17.8%；同一轮10秒内只触发一次。", "无剑胜有", "master", ["dugujiujian/wu"], "jz_formless")
            ]
        },
        WUDANG: {
            name: "太极真意", key: "zw", jd: 3, area: "真武秘境", balance: 1.00,
            trialRoom: "zw/yanwutai_trial", guide: "执符道人",
            guideNames: ["听劲道人", "抱元道者", "缠丝剑侍", "守缺真人", "真武道童"],
            list: [
                zy(1, "借力", "蓄劲", "成功招架2次后获得借力层数；12秒内下一次本门非红色武学伤害提高约6.8%～18.6%，触发后清空层数。", "听劲关", "counter", ["taijiquan/zhen", "taijijian/lian"], "zw_borrow"),
                zy(2, "化劲", "卸力", "受到伤害时，每8秒首次受击减伤约4.9%～11.7%；只减免该次伤害，不改变对方攻击效果。", "化劲关", "endure", ["taijishengong/tu"], "zw_yield"),
                zy(3, "粘劲", "缠势", "绕字诀命中后额外忙乱约0.6～1.2秒，10秒冷却；震字诀命中后封锁对方绝招约1.0～1.6秒。", "粘随关", "control", ["taijijian/rao", "taijiquan/zhen"], "zw_stick"),
                zy(4, "乱环", "守御", "气血越低减伤越高，最高约为当前损失气血比例×1.4%～10.4%，总减伤封顶25%。", "乱环关", "endure", ["taijijian/sui"], "zw_circle"),
                zy(5, "无极", "归元", "气血低于18%时每10分钟触发一次，回复最大气血约0.9%～11.7%并清除负面状态；真武除邪精力消耗降低约4%～7.8%，调息同幅缩短。", "无极关", "master", ["taijishengong/tu"], "zw_wuji")
            ]
        },
        SHAOLIN: {
            name: "禅武真意", key: "dmd", jd: 4, area: "达摩洞", balance: 1.00,
            trialRoom: "dmd/chanwutai_trial", guide: "守洞老僧",
            guideNames: ["金刚护法", "狮吼罗汉", "般若行者", "罗汉堂首座", "面壁老僧"],
            list: [
                zy(1, "金刚不坏", "不灭", "每10分钟最多抵挡一次致命伤害，将本次伤害压至1点；仅对自身生效。", "金刚试", "endure", ["yijinjing/zhao"], "sl_vajra"),
                zy(2, "狮子吼", "震慑", "狮子吼命中后额外施加约0.7～1.4秒忙乱，12秒冷却；原技能的内力差昏迷规则不变。", "狮吼试", "control", ["yijinjing/roar"], "sl_roar"),
                zy(3, "般若心", "封招", "惊魔一指或达摩三绝命中后，封锁目标绝招约1.0～1.6秒；仅影响绝招，不影响普通攻击。", "般若试", "resource", ["yizhichan/zhen", "damojian/jiang"], "sl_prajna"),
                zy(4, "罗汉阵", "镇守", "同时被2名以上敌人攻击时获得减伤，基础为4%，每多1名敌人增加2.5%，每重再增加0.3%，总减伤封顶18%；不附加反伤。", "罗汉试", "endure", ["ranmudao/hu"], "sl_arhat"),
                zy(5, "禅定", "清净", "佛光守护与一苇渡江的精力消耗降低约4%～10%，调息时间降低约3.5%～9%；不改变技能本身效果。", "禅定试", "master", ["yijinjing/foguang", "shaolinshenfa/lingbo"], "sl_meditate")
            ]
        },
        EMEI: {
            name: "金顶真意", key: "jdfg", jd: 5, area: "金顶佛光", balance: 1.16,
            trialRoom: "jdfg/wuxiangtai_trial", guide: "佛灯女尼",
            guideNames: ["慈航师太", "怒目师太", "双仪剑侍", "倚天剑师", "摄魄行者"],
            list: [
                zy(1, "慈航愿", "回春", "鹤翔庄或游龙庄成功生效后，立即回复最大气血约1.1%～6.0%；不改变原有队友治疗效果。", "慈航试", "endure", ["linjizhuang/xi", "linjizhuang/huifu", "linjizhuang2/xi", "linjizhuang2/huifu"], "em_mercy"),
                zy(2, "金顶怒目", "反震", "成功招架后获得6秒反震标记；下一次受击时反弹所受伤害约7.3%～18.1%，每8秒最多触发一次，且反伤不超过自身攻击力50%。", "怒目试", "counter", ["jindingzhang/po"], "em_wrath"),
                zy(3, "灭绝双仪", "剑契", "灭剑与绝剑成功交替后，12秒内下一次本门非红色武学伤害提高约8.0%～18.1%，触发后消耗。", "双剑试", "precision", ["huifengjian/mie", "huifengjian/jue"], "em_twin"),
                zy(4, "倚天破魔", "破邪", "施展倚天剑诀或号令天下时，伤害提高约2.5%～9.8%，并额外获得约3～17点破防；不强化任何grade6技能。", "倚天试", "burst", ["yitianjianfa/yi", "yitianjianfa/hao"], "em_yitian"),
                zy(5, "九阴摄魄", "夺魄", "目标当前气血高于80%时，本门非红色武学伤害提高约4.3%～18.1%；目标低于80%后不再触发。", "摄魄试", "master", ["jiuyinbaiguzhao/duo", "jiuyinbaiguzhao/juan", "jiuyinbaiguzhao2/po", "jiuyinbaiguzhao2/juan"], "em_nineyin")
            ]
        },
        GAIBANG: {
            name: "降龙真意", key: "js", jd: 6, area: "君山密录", balance: 0.92,
            trialRoom: "js/chuanwutang_trial", guide: "传功长老",
            guideNames: ["降龙长老", "飞龙舵主", "摆尾长老", "君山老帮众", "六龙传功使"],
            list: [
                zy(1, "亢龙有悔", "刚劲", "施展降龙时，本门非红色武学伤害提高约1.4%～8.0%，并额外获得约3～17点破防。", "亢龙试", "burst", ["xianglongzhang/qi"], "gb_kanglong"),
                zy(2, "飞龙在天", "连掌", "十八掌连续命中时获得掌势层数，最多5层，每层使后续本门非红色武学伤害提高约0.7%～1.4%；层数12秒未续则消失。", "飞龙试", "precision", ["xianglongzhang/shiba"], "gb_flying"),
                zy(3, "神龙摆尾", "制敌", "绊字诀命中后获得12秒摆尾标记；下一次本门非红色武学伤害提高约6.2%～19.7%，触发后消耗。", "摆尾试", "control", ["dagoubang/chan", "jiaohuabangfa/wu"], "gb_tail"),
                zy(4, "龙战于野", "血战", "自身气血低于40%时，本门非红色武学伤害提高约3.5%～14.4%；气血恢复至40%以上后停止。", "龙战试", "endure", ["huntianqigong/power"], "gb_field"),
                zy(5, "时乘六龙", "龙劲", "降龙或十八掌成功后获得12秒龙劲；下一次本门非红色武学伤害提高约5.0%～16.7%，触发后消耗。", "六龙试", "master", ["xianglongzhang/qi", "xianglongzhang/shiba"], "gb_six")
            ]
        },
        XIAOYAO: {
            name: "逍遥真意", key: "lhfd", jd: 7, area: "琅嬛福地", balance: 0.90,
            trialRoom: "lhfd/wendaotai_trial", guide: "玉像侍者",
            guideNames: ["北冥客", "凌波玉女", "白虹使", "生死符使", "琅嬛守卷人"],
            list: [
                zy(1, "北冥鲸吞", "纳气", "北冥相关绝招成功命中后，吸取目标最大内力约0.6%～1.5%，并转化为自身内力；自身最多获得最大内力的3%。", "北冥试", "resource", ["beimingshengong/huifu", "beimingshengong/power"], "xy_beiming"),
                zy(2, "凌波残影", "轻灵", "成功闪避后获得10秒残影；下一次本门非红色武学伤害提高约4.7%～15.5%，命中提高20%，触发后消耗。", "凌波试", "precision", ["lingboweibu/lingbo"], "xy_lingbo"),
                zy(3, "白虹贯日", "掌力", "当前内力高于80%时，白虹掌力命中伤害提高约5.0%～14.4%，并额外消耗最大内力1%。", "白虹试", "burst", ["liuyangzhang/po"], "xy_baihong"),
                zy(4, "生死符", "寒毒", "生死符命中后，额外造成目标最大内力约0.2%～0.6%的伤害，单次不超过目标本次所受伤害25%，8秒冷却。", "生死试", "control", ["liuyangzhang/zhong"], "xy_talisman"),
                zy(5, "无相御风", "化用", "小无相功的无相、无我释放已化用的非红色绝招时，精力消耗降低约5%～12%，调息降低约4.5%～11.7%，最低仍保留4秒调息。", "无相试", "master", ["xiaowuxianggong/duo", "xiaowuxianggong/wuwo"], "xy_formless")
            ]
        },
        SHASHOU: {
            name: "暗杀真意", key: "xl", jd: 8, area: "修罗暗殿", balance: 1.22,
            trialRoom: "xl/shengloutai_trial", guide: "暗殿司命",
            guideNames: ["无痕影使", "踏雪客", "穿心刺客", "血债判官", "修罗使"],
            list: [
                zy(1, "无声影遁", "先手", "无痕成功生效后，20秒内下一次本门非红色武学命中会封锁目标绝招约0.8～1.5秒；每20秒最多触发一次。", "匿影试", "precision", ["taxuexunmei/power"], "ss_shadow"),
                zy(2, "踏雪暗步", "追魂", "成功闪避后获得10秒残影；下一次本门非红色武学伤害提高约4.0%～15.0%，命中提高25%，触发后消耗。", "暗步试", "precision", ["taxuexunmei/power", "mantianhuayu/luo"], "ss_step"),
                zy(3, "穿心刺穴", "破绽", "目标当前气血高于80%时，本门非红色武学伤害提高约5.5%～17.8%，并额外获得10～20点破防。", "刺穴试", "burst", ["chuanxinzhang/chuan", "feidao/jiang"], "ss_puncture"),
                zy(4, "血债必偿", "追命", "击杀目标后获得120秒血债标记；下一次本门非红色武学伤害提高约7.5%～20.0%，触发后消耗。", "血债试", "master", ["shashengjue/power"], "ss_debt"),
                zy(5, "杀生修罗", "绝境", "自身气血低于30%时，本门非红色武学伤害提高约6.7%～20.8%，并额外获得8～18点破防；不强化任何grade6技能。", "修罗试", "endure", ["shashengjue/power", "shashengjue/tuoli", "mantianhuayu/wu"], "ss_asura")
            ]
        },
        SUNV: {
            name: "九天真意", key: "yc", jd: 9, area: "九天瑶池", balance: 1.26,
            trialRoom: "yc/jiutantai_trial", guide: "瑶池玉使",
            guideNames: ["神霄雷使", "玄女侍", "魅魂宫人", "紫电使", "守一仙子"],
            list: [
                zy(1, "神霄·雷贯", "雷霆", "天打五雷轰或阳雷荡邪秽造成伤害时叠加雷贯，最多5层、每层持续12秒；后续攻击按层数获得3、6、9、12、15点破防。", "神霄试", "precision", ["shenxiaojiumie/wulei", "shenxiaojiumie/yanglei", "shenxiaojiumie2/wulei", "shenxiaojiumie2/yanglei"], "sn_thunder"),
                zy(2, "玄女·法相", "法相", "玄女法相成功生效后获得15秒法相护持；期间受到伤害减免约4.6%～14.3%，不改变法相原有攻击和容貌加成。", "法相试", "endure", ["sunvxinjing/faxiang"], "sn_avatar"),
                zy(3, "天魔·魅魂", "摄心", "魅魂或极乐六性成功命中后获得12秒摄心标记；下一次本门非红色武学伤害提高约5.0%～15.6%，触发后消耗。", "魅魂试", "control", ["sunvxinjing/meihun", "jileliuxing/liuxing"], "sn_charm"),
                zy(4, "紫电·惊霆", "麻痹", "春雷暴殛或天打雷劈屠真龙施展期间，伤害提高约4.9%～15.5%；每9秒最多追加一次额外雷伤，伤害为攻击力约8%～18%且不超过本次伤害30%。", "紫电试", "resource", ["zidianjin/chunlei", "zidianjin/tianlei", "zidianjin2/jinglei", "zidianjin2/tianlei"], "sn_purple"),
                zy(5, "应身·守一", "转伤", "当前内力大于0时，每次受伤将伤害的约5.0%～15.6%转为内力消耗；累计减伤最高25%，内力耗尽后停止。", "应身试", "master", [], "sn_guard")
            ]
        }
    };

    function zy(id, name, mech, desc, trialName, mode, pfms, effect) {
        return { id: id, name: name, mech: mech, desc: desc, trial: trialName, mode: mode, pfms: pfms || [], effect: effect };
    }

    var UPGRADE_XJ = [0, 0, 100, 150, 220, 300, 400, 520, 660, 820, 1000];
    var UPGRADE_MAT = [0, 0, 5, 8, 12, 18, 25, 34, 45, 58, 75];
    var MAX_LEVEL = 10, DAILY_LIMIT = 10, ENERGY_COST = 20;

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
    function dailyKey(key, id) { return "zy_daily_" + token(key, id); }
    function hasTower100(me) { return me.query_temp("wd_level", 0) >= 100 || !!me.query_temp("wd100", 0); }
    function canUnlock(me, data) { return !!(me && data && familyId(me) === KEY_TO_FAMILY[data.key] && me.level >= 5 && hasTower100(me)); }

    function migrate(me) {
        var data = familyData(me);
        // 兼容更新前已经判师、但旧真意字段仍残留的角色。
        for (var oldFamilyId in DATA) {
            var old = DATA[oldFamilyId];
            if (data && oldFamilyId === familyId(me)) continue;
            for (var oldId = 1; oldId <= 7; oldId++) {
                me.remove_temp(acquiredKey(old.key, oldId)); me.remove_temp(levelKey(old.key, oldId));
                me.remove_temp(clearKey(old.key, oldId)); me.remove_temp(matKey(old.key, oldId)); me.remove_temp(dailyKey(old.key, oldId));
            }
            me.remove_temp("zy_active_" + old.key); me.set_bool("fb2", old.jd, false);
        }
        if (!data) { me.remove_temp("zy_active"); return; }
        for (var i = 0; i < data.list.length; i++) {
            var item = data.list[i];
            if (me.query_temp(acquiredKey(data.key, item.id), 0) && !me.query_temp(levelKey(data.key, item.id), 0)) {
                me.set_temp(levelKey(data.key, item.id), 1);
                me.set_temp(clearKey(data.key, item.id), 1);
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
        return { data: data, intent: intent, level: lv, scale: data.balance * (0.55 + lv * 0.075) };
    }
    function setActive(me, id) {
        if (me.is_fighting && me.is_fighting()) return me.notify("战斗中不可更易真意。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!canUnlock(me, data)) return me.notify("你尚未达到参悟门派真意的条件。"), false;
        if (!intent || !getLevel(me, data.key, intent.id)) return me.notify("你尚未领悟这道真意。"), false;
        var value = token(data.key, intent.id);
        if (me.query_temp("zy_active", "") === value) { me.remove_temp("zy_active"); me.notify("你收敛心神，不再催动任何真意。"); }
        else { me.set_temp("zy_active", value); me.notify("<hig>你开始催动【" + intent.name + "】。</hig>"); }
        clearCombatState(me);
        return true;
    }
    function clearCombatState(me) {
        var keys = ["zy_pfm", "zy_pfm_id", "zy_counter", "zy_borrow", "zy_lingbo", "zy_tail", "zy_twin", "zy_charm", "zy_six"];
        for (var i = 0; i < keys.length; i++) me.remove_temp(keys[i]);
    }
    function forgetFamily(me, oldFamilyId) {
        var data = DATA[oldFamilyId];
        if (!data) return;
        for (var i = 1; i <= 7; i++) {
            me.remove_temp(acquiredKey(data.key, i)); me.remove_temp(levelKey(data.key, i));
            me.remove_temp(clearKey(data.key, i)); me.remove_temp(matKey(data.key, i)); me.remove_temp(dailyKey(data.key, i));
        }
        var active = me.query_temp("zy_active", "");
        if (active && active.indexOf(data.key + "_") === 0) me.remove_temp("zy_active");
        me.remove_temp("zy_active_" + data.key); me.remove_temp("zy_trial_active");
        clearCombatState(me); me.set_bool("fb2", data.jd, false);
    }

    function currentAreaMatches(me, data) { return !!(me && me.environment && me.environment.parent && me.environment.parent.id === data.key); }
    function dailyCount(me, key, id) { return parseInt(me.query_temp(dailyKey(key, id), 0)) || 0; }
    function addDaily(me, key, id, count) { return me.add_temp(dailyKey(key, id), count, UTIL.diff_time()); }

    function startTrial(me, id) {
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这项试炼。"), false;
        if (!canEnterArea(me, data.key)) return false;
        if (!currentAreaMatches(me, data)) return me.notify("你须先进入【" + data.area + "】。"), false;
        if (me.is_fighting()) return me.notify("你尚在战斗，不能另启试炼。"), false;
        if (me.query_temp("zy_trial_active", "")) return me.notify("你已有一项真意试炼尚未结束。"), false;
        if (dailyCount(me, data.key, intent.id) >= DAILY_LIMIT) return me.notify("这项试炼今日已达十次。"), false;
        var baseRoom = ROOM.Get(data.trialRoom);
        if (!baseRoom) return me.notify("试炼场暂不可用，请联系管理员。"), false;
        var npc = null;
        try { npc = NPC.CLONE("pub/zhenyi_trial"); } catch (e) { return me.notify("试炼化身凝聚失败，请联系管理员。"), false; }
        if (!npc || !npc.init_trial) return me.notify("试炼化身凝聚失败。"), false;
        if (!me.expend_jingli(ENERGY_COST)) { npc.destroy(); return me.notify("参加试炼需要" + ENERGY_COST + "点精力。"), false; }
        var room = baseRoom.query_copy2(me);
        if (!room) room = baseRoom.create_copy2(me);
        if (!room || me.moveto(room, me.name + "步入试炼石门。", me.name + "踏入了试炼场。") === false) {
            npc.destroy(); return me.notify("试炼场暂时无法进入。"), false;
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

    function addXuanjing(me, count) { var obj = me.add_obj("st/xuanjing", count); return obj ? count : 0; }
    function reward(me, data, intent, count, isSweep) {
        var xj = 0, mat = 0, bonus = 0;
        for (var i = 0; i < count; i++) {
            xj += (isSweep ? 12 : 18) + me.random(isSweep ? 7 : 9);
            mat += (isSweep ? 1 : 2) + (me.random(100) < 25 ? 1 : 0);
            if (me.random(100) < 20) bonus++;
        }
        addXuanjing(me, xj); me.add_temp(matKey(data.key, intent.id), mat);
        var bonusName = "";
        if (bonus > 0) {
            var unlocked = [];
            for (var j = 0; j < data.list.length; j++) if (getLevel(me, data.key, data.list[j].id)) unlocked.push(data.list[j]);
            if (unlocked.length) { var b = unlocked[me.random(unlocked.length)]; me.add_temp(matKey(data.key, b.id), bonus); bonusName = "，另得" + b.name + "悟痕×" + bonus; }
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
        return true;
    }
    function failTrial(me, reason) { if (!me) return; me.remove_temp("zy_trial_active"); if (reason) me.notify("<hir>真意试炼失败：" + reason + "</hir>"); }
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
    function upgrade(me, id) {
        if (me.is_fighting()) return me.notify("战斗中不可参悟升级。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这道真意。"), false;
        var lv = getLevel(me, data.key, intent.id);
        if (!lv) return me.notify("你尚未领悟这道真意。"), false;
        if (lv >= MAX_LEVEL) return me.notify("这道真意已臻圆满。"), false;
        var next = lv + 1, xj = UPGRADE_XJ[next], mat = UPGRADE_MAT[next];
        if (xuanjingCount(me) < xj) return me.notify("玄晶不足，需要" + xj + "枚。"), false;
        if (me.query_temp(matKey(data.key, intent.id), 0) < mat) return me.notify(intent.name + "悟痕不足，需要" + mat + "份。"), false;
        var obj = me.find_obj_bypath("st/xuanjing");
        if (!obj || !me.remove_obj(obj, xj)) return me.notify("玄晶扣除失败。"), false;
        me.add_temp(matKey(data.key, intent.id), -mat); me.set_temp(levelKey(data.key, intent.id), next);
        me.notify("<him>【" + intent.name + "】提升至" + next + "重。</him>"); return true;
    }
    function serialize(me) {
        var data = familyData(me);
        if (!data || !canUnlock(me, data)) return null;
        checkUnlock(me, true);
        migrate(me);
        var active = me.query_temp("zy_active", ""), list = [];
        for (var i = 0; i < data.list.length; i++) {
            var item = data.list[i], lv = getLevel(me, data.key, item.id), next = Math.min(MAX_LEVEL, lv + 1);
            list.push({ id: item.id, name: item.name, mech: item.mech, desc: item.desc, trial: item.trial,
                acquired: lv > 0, active: active === token(data.key, item.id), level: lv,
                material: me.query_temp(matKey(data.key, item.id), 0) || 0,
                daily: dailyCount(me, data.key, item.id), daily_limit: DAILY_LIMIT,
                cleared: !!me.query_temp(clearKey(data.key, item.id), 0),
                cost_xj: lv > 0 && lv < MAX_LEVEL ? UPGRADE_XJ[next] : 0,
                cost_mat: lv > 0 && lv < MAX_LEVEL ? UPGRADE_MAT[next] : 0 });
        }
        return { name: data.name, key: data.key, area: data.area, xuanjing: xuanjingCount(me), energy_cost: ENERGY_COST, list: list };
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
        var effects = { sl_meditate: 8, xy_formless: 10, zw_wuji: 6, em_mercy: 6 }, pct = effects[active.intent.effect] || 0;
        return pct ? Math.max(0, parseInt(value * (100 - pct * active.scale) / 100)) : value;
    }
    function pfmCooldown(me, pfm, skill, value) {
        var active = getActive(me);
        if (!pfmMatches(active, pfm && pfm.id, skill)) return value;
        var effects = { sl_meditate: 7, xy_formless: 9, zw_wuji: 6, xy_lingbo: 7 }, pct = effects[active.intent.effect] || 0;
        return pct ? Math.max(4000, parseInt(value * (100 - pct * active.scale) / 100)) : value;
    }
    function endPfm(me, target, pfm, skill, success) {
        var active = getActive(me);
        if (!success || !pfmMatches(active, pfm && pfm.id, skill)) return;
        var lv = active.level, s = active.scale, effect = active.intent.effect;
        if (effect === "jz_wood") { me.do_recover(Math.floor(me.max_hp * (0.012 + lv * 0.002) * s)); me.set_temp("zy_wood_guard", 1, 8000); }
        else if (effect === "em_mercy") me.do_recover(Math.floor(me.max_hp * (0.015 + lv * 0.0025) * s));
        else if (effect === "xy_beiming" && target) { var drain = Math.min(Math.floor(target.max_mp * 0.01 * s), Math.floor(me.max_mp * 0.03)); if (drain > 0) { target.add_mp(-drain); me.add_mp(drain); } }
        else if (effect === "sl_roar" && target) addControl(target, "zy_roar", "狮吼震慑", 600 + lv * 80, 12000);
        else if (effect === "sl_prajna" && target) target.set_temp("sealed_pfm", 1, 900 + lv * 70);
        else if (effect === "zw_stick" && target) addControl(target, "zy_stick", "太极粘劲", 500 + lv * 70, 10000);
        else if (effect === "gb_tail") me.set_temp("zy_tail", 1, 12000);
        else if (effect === "gb_six") me.set_temp("zy_six", 1, 12000);
        else if (effect === "em_twin") { var last = me.query_temp("zy_twin_last", ""); if (last && last !== pfm.id) me.set_temp("zy_twin", 1, 12000); me.set_temp("zy_twin_last", pfm.id, 20000); }
        else if (effect === "ss_shadow" && target && !me.query_temp("zy_shadow_cd")) { target.set_temp("sealed_pfm", 1, 700 + lv * 80); me.set_temp("zy_shadow_cd", 1, 20000); }
        else if (effect === "sn_charm") me.set_temp("zy_charm", 1, 12000);
        else if (effect === "sn_avatar") me.set_temp("zy_avatar", 1, 15000);
    }
    function addControl(target, id, name, duration, cooldown) {
        if (!target || target.query_temp(id + "_cd")) return;
        target.set_temp(id + "_cd", 1, cooldown); target.add_status({ id: id, name: name, duration: duration, downside: true, prop: { is_busy: 1 } });
    }

    function modifyAttack(me, target, par, sh, skill) {
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me)) return sh;
        var e = active.intent.effect, lv = active.level, s = active.scale, bonus = 0, inPfm = me.query_temp("zy_pfm", "") === e;
        if (inPfm) bonus += (0.025 + lv * 0.004) * s;
        if ((e === "jz_edge" || e === "em_yitian" || e === "gb_kanglong") && inPfm) {
            par.diff_fy = Math.max(par.diff_fy || 0, Math.floor((5 + lv) * s));
        }
        if (e === "jz_counter" && me.query_temp("zy_counter")) { bonus += (0.08 + lv * 0.008) * s; me.remove_temp("zy_counter"); }
        else if (e === "jz_heavy" && target.max_hp && target.hp / target.max_hp > 0.7) bonus += (0.035 + lv * 0.004) * s;
        else if (e === "jz_formless" && inPfm && !me.query_temp("zy_formless_cd")) { bonus += (0.08 + lv * 0.006) * s; me.set_temp("zy_formless_cd", 1, 10000); }
        else if (e === "zw_borrow" && me.query_temp("zy_borrow", 0) >= 2) { bonus += (0.10 + lv * 0.008) * s; me.remove_temp("zy_borrow"); }
        else if (e === "gb_field" && me.max_hp && me.hp / me.max_hp < 0.4) bonus += (0.06 + lv * 0.006) * s;
        else if (e === "gb_flying" && inPfm) { var st = Math.min(5, me.add_temp("zy_flying", 1, 12000)); bonus += st * 0.012 * s; }
        else if (e === "gb_tail" && me.query_temp("zy_tail")) { bonus += (0.10 + lv * 0.007) * s; me.remove_temp("zy_tail"); }
        else if (e === "gb_six" && me.query_temp("zy_six")) { bonus += (0.08 + lv * 0.006) * s; me.remove_temp("zy_six"); }
        else if (e === "em_twin" && me.query_temp("zy_twin")) { bonus += (0.11 + lv * 0.008) * s; me.remove_temp("zy_twin"); }
        else if (e === "em_nineyin" && target.max_hp && target.hp / target.max_hp > 0.8) bonus += (0.06 + lv * 0.006) * s;
        else if ((e === "xy_lingbo" || e === "ss_step") && me.query_temp("zy_lingbo")) { bonus += (0.07 + lv * 0.006) * s; par.mz = (par.mz || me.mz) * (e === "ss_step" ? 1.25 : 1.2); me.remove_temp("zy_lingbo"); }
        else if (e === "xy_baihong" && inPfm && me.max_mp && me.mp / me.max_mp > 0.8) { bonus += (0.08 + lv * 0.006) * s; me.add_mp(-Math.floor(me.max_mp * 0.01)); }
        else if (e === "ss_puncture" && target.max_hp && target.hp / target.max_hp > 0.8) { bonus += (0.09 + lv * 0.007) * s; par.diff_fy = Math.max(par.diff_fy || 0, 10 + lv); }
        else if (e === "ss_debt" && me.query_temp("zy_debt")) { bonus += (0.13 + lv * 0.008) * s; me.remove_temp("zy_debt"); }
        else if (e === "ss_asura" && me.max_hp && me.hp / me.max_hp < 0.3) { bonus += (0.10 + lv * 0.008) * s; par.diff_fy = Math.max(par.diff_fy || 0, 8 + lv); }
        else if (e === "sn_charm" && me.query_temp("zy_charm")) { bonus += (0.08 + lv * 0.006) * s; me.remove_temp("zy_charm"); }
        else if (e === "sn_thunder" && inPfm) { var th = Math.min(5, me.add_temp("zy_thunder", 1, 12000)); par.diff_fy = Math.max(par.diff_fy || 0, th * 3); }
        else if (e === "sn_purple" && inPfm) bonus += (0.07 + lv * 0.006) * s;
        return sh * (1 + bonus);
    }
    function afterAttack(me, target, par, dealt, skill) {
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me) || !(dealt > 0)) return;
        var e = active.intent.effect, lv = active.level, s = active.scale;
        if (e === "xy_talisman" && me.query_temp("zy_pfm", "") === e && !target.query_temp("zy_talisman_cd")) {
            target.set_temp("zy_talisman_cd", 1, 8000); var extra = Math.min(Math.floor(me.max_mp * (0.003 + lv * 0.0004) * s), Math.floor(dealt * 0.25)); if (extra > 0) target.damage(extra, me, 100);
        } else if (e === "sn_purple" && me.query_temp("zy_pfm", "") === e && !target.query_temp("zy_purple_cd")) {
            target.set_temp("zy_purple_cd", 1, 9000); var burn = Math.min(Math.floor(me.gj * (0.08 + lv * 0.01) * s), Math.floor(dealt * 0.3)); if (burn > 0) target.damage(burn, me, 100);
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
        var e = active.intent.effect, lv = active.level, s = active.scale, reduction = 0;
        if (e === "jz_wood" && me.query_temp("zy_wood_guard")) reduction = (0.05 + lv * 0.004) * s;
        else if (e === "zw_yield" && !me.query_temp("zy_yield_cd")) { reduction = (0.07 + lv * 0.005) * s; me.set_temp("zy_yield_cd", 1, 8000); }
        else if (e === "zw_circle" && me.max_hp) reduction = Math.max(0, (1 - me.hp / me.max_hp) * (0.14 + lv * 0.008) * s);
        else if (e === "sl_arhat" && me.enemy && me.enemy.length > 1) reduction = Math.min(0.18, (0.04 + me.enemy.length * 0.025 + lv * 0.003) * s);
        else if (e === "sn_avatar" && me.query_temp("zy_avatar")) reduction = (0.06 + lv * 0.005) * s;
        else if (e === "sn_guard" && me.mp > 0) { var convert = Math.min(sh * (0.08 + lv * 0.006) * s, me.mp); me.add_mp(-Math.floor(convert)); sh -= convert; }
        sh *= (1 - Math.min(0.25, reduction));
        if (e === "sl_vajra" && sh >= me.hp && me.hp > 1 && !me.query_temp("zy_vajra_cd")) { sh = me.hp - 1; me.set_temp("zy_vajra_cd", 1, 600000); me.notify("<hiy>金刚不坏真意护住你最后一线生机！</hiy>"); }
        else if (e === "zw_wuji" && me.max_hp && me.hp / me.max_hp < 0.18 && !me.query_temp("zy_wuji_cd")) { me.set_temp("zy_wuji_cd", 1, 600000); me.do_recover(Math.floor(me.max_hp * (0.05 + lv * 0.004) * s)); me.clear_downside && me.clear_downside(); }
        if (e === "em_wrath" && me.query_temp("zy_wrath_ready") && from && from.hp > 0 && !me._zy_reflecting) {
            me.remove_temp("zy_wrath_ready"); me.set_temp("zy_wrath_cd", 1, 8000);
            var reflect = Math.min(Math.floor(sh * (0.10 + lv * 0.006) * s), Math.floor(me.gj * 0.5));
            if (reflect > 0) { me._zy_reflecting = true; from.damage(reflect, me, 100); me._zy_reflecting = false; }
        }
        return Math.max(0, sh);
    }
    function onKill(me) { var active = getActive(me); if (active && active.intent.effect === "ss_debt") me.set_temp("zy_debt", 1, 120000); }
    function onCombatEnd(me) { clearCombatState(me); me.remove_temp("zy_flying"); me.remove_temp("zy_thunder"); }

    WORLD.ZHENYI = {
        DATA: DATA, FAMILY_TO_KEY: FAMILY_TO_KEY, MAX_LEVEL: MAX_LEVEL, DAILY_LIMIT: DAILY_LIMIT, ENERGY_COST: ENERGY_COST,
        family_data: familyData, find_by_key: findDataByKey, find_intent: findIntent, migrate: migrate,
        check_unlock: checkUnlock, can_enter_area: canEnterArea, get_level: getLevel, get_active: getActive,
        set_active: setActive, forget_family: forgetFamily, serialize: serialize, start_trial: startTrial,
        complete_trial: completeTrial, fail_trial: failTrial, sweep: sweep, upgrade: upgrade,
        begin_pfm: beginPfm, pfm_cost: pfmCost, pfm_cooldown: pfmCooldown, end_pfm: endPfm,
        modify_attack: modifyAttack, after_attack: afterAttack, on_parry: onParry, on_dodge: onDodge,
        modify_damage: modifyDamage, on_kill: onKill, on_combat_end: onCombatEnd, is_allowed_skill: allowedSkill
    };
})();
