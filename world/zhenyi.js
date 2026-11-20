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
            // v2 试点：只有一道纯机制真意「无剑·无招」，不分重数。领悟它的试炼由剑冢五关组成：
            // 一路解开五处机关，每解一处，对应境界的武意化身现身，击败后方可往深处走；五关全过即领悟。
            // 其余门派仍走旧公式（五道真意 + 十重修炼）。
            name: "剑道真意", key: "jz", jd: 2, area: "独孤剑冢", balance: 0.86,
            v2: true, trialHpScale: 0.8, no_level: true,
            // 首次通关奖励；通关后可在剑道传承殿「无名剑」处扫荡（每次消耗精力，得玄晶，30% 得残页），扫荡次数可在易直非处兑换残页
            first_clear_reward: { path: "book/bc#dugujianjue", count: 200 },
            sweep: { energy: 20, piece: "book/bc#dugujianjue", piece_rate: 30, exchange_cost: 20 },
            trialRoom: "jz/wuyitai_trial", guide: "守冢剑侍",
            guideNames: ["守剑老人", "回锋剑客", "负剑道人", "洗剑客", "无剑客"],
            // 首次挑战第 N 项试炼前，须先解开禁地中对应的机关（按玩家记录，公共地图互不影响）。
            puzzles: { 1: "jz/lijiange", 2: "jz/ruanjiange", 3: "jz/zhongjiandian", 4: "jz/mujiange", 5: "jz/wujianxukong" },
            // 真意 id 沿用 5，旧档已领悟无剑者原样保留。
            list: [
                zy(5, "无剑·无招", "剑境", "剑冢五关", "master", [], "jz_swordless")
            ],
            // 试炼关卡：id 与 puzzles 的机关编号一一对应，第 5 关通过即领悟真意。
            stages: [
                stage(1, "利剑问锋", "precision", "利剑"),
                stage(2, "软剑回环", "counter", "软剑"),
                stage(3, "重剑负山", "burst", "重剑"),
                // 木剑：考校悟性（先天悟性 × 后天悟性 ≥ 10 万），再接一剑（最大气血 100%，只受伤害减免影响）
                stage(4, "木剑守拙", "insight", "木剑"),
                // 第五关的化身就是剑魔本人，使独孤剑诀
                // 最终 boss 特殊处理：不套攻击 / 气血系数，面板直接给定；机制见 zhenyi_trial.js 的 jianmo 模式
                stage(5, "无剑胜有", "jianmo", "无剑", { avatar_name: "独孤求败", avatar_title: "<hir>剑魔</hir>", avatar_sword: "dugujianjue",
                    // 不设时限、被击倒不出场（原地站起再战），只能打过或在动作栏「完成副本」放弃（算失败，送到云湺山剑庐）
                    timeout: 0, no_death: true, quit_to: "jindi/huashan",
                    avatar_stats: { max_hp: 40000000, max_mp: 500000000, gj: 300000, bj: 70, add_sh_per: 80, diff_downside_per: 80 } })
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
    // 单真意门派的试炼关卡。字段与真意相同（试炼化身、试炼流程按同一形状读取），但不对应任何战斗效果。
    function stage(id, trialName, mode, mech, opts) {
        var st = { id: id, name: trialName, mech: mech, trial: trialName, mode: mode, pfms: [], effect: null, is_stage: true };
        for (var k in (opts || {})) st[k] = opts[k];
        return st;
    }

    var UPGRADE_XJ = [0, 0, 100, 150, 220, 300, 400, 520, 660, 820, 1000];
    var UPGRADE_MAT = [0, 0, 5, 8, 12, 18, 25, 34, 45, 58, 75];
    var MAX_LEVEL = 10, DAILY_LIMIT = 10, ENERGY_COST = 20;
    // 八派禁地合为一处「云湺山」（world/area/map/jindi.js，各大派祖师隐居之处），江湖地图禁地列表只占这一位。
    // 旧版各派各占一位（data.jd = 2～9），迁移时清掉 3～9。
    var HUB_JD = 2, HUB_AREA = "jindi", HUB_NAME = "云湺山";
    // 禁地列表位布局迁移（每个角色一次）：旧版 3～9 为各派独立禁地、10 为山外山；
    // 合并后 2 = 云湺山、3 = 山外山。清掉 3～10 后，两处都由各自的自动解锁按条件重新开启
    // （云湺山见 checkUnlock，山外山见 extends/char/user.js 的宗师自动解锁）。
    var JD_LAYOUT = 2;
    function migrateJdLayout(me) {
        if (!me || !me.query_temp || !me.set_bool) return;
        if ((parseInt(me.query_temp("jd_layout", 0)) || 0) >= JD_LAYOUT) return;
        for (var b = 3; b <= 10; b++) me.set_bool("fb2", b, false);
        me.set_temp("jd_layout", JD_LAYOUT);
    }
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
    // 试炼对象：单真意门派按关卡查，其余门派试炼即真意本身。
    function findTrial(data, id) {
        if (!data || !data.stages) return findIntent(data, id);
        id = parseInt(id);
        for (var i = 0; i < data.stages.length; i++) if (data.stages[i].id === id) return data.stages[i];
        return null;
    }
    function lastStageId(data) { return data.stages[data.stages.length - 1].id; }
    function hasAnyIntent(me, data) {
        for (var i = 0; i < data.list.length; i++) if (getLevel(me, data.key, data.list[i].id)) return true;
        return false;
    }
    // 关卡进度记在玩家 temp 上；已领悟真意的角色视为五关全过。
    function stageKey(key, id) { return "zy_stage_" + token(key, id); }
    // 重走（测试与回味用）：zy_replay_<key> = 起始关卡 n，n 之前的关视为已过，n 及之后须重新解机关、打化身；不影响已领悟的真意。
    function replayKey(key) { return "zy_replay_" + key; }
    function replayFrom(me, data) { return parseInt(me.query_temp(replayKey(data.key), 0)) || 0; }
    function stageCleared(me, data, id) {
        var rf = replayFrom(me, data);
        if (rf) return id < rf || !!me.query_temp(stageKey(data.key, id), 0);
        return !!me.query_temp(stageKey(data.key, id), 0) || hasAnyIntent(me, data);
    }
    // 开始 / 放弃重走。from = 1 从第一关重走；from = 最后一关 直达最后一关（如独孤求败处）。
    function startReplay(me, from) {
        var data = familyData(me);
        if (!data || !data.stages) return me.notify("此处没有可重走的试炼。"), false;
        if (from === "off") {
            if (!replayFrom(me, data)) return me.notify("你并未在重走剑冢。"), false;
            me.remove_temp(replayKey(data.key));
            return me.notify("你收住心神，不再重走【" + data.area + "】。"), true;
        }
        from = parseInt(from);
        if (!findTrial(data, from)) return me.notify("没有这一关。"), false;
        if (!hasAnyIntent(me, data)) return me.notify("你尚未闯过【" + data.area + "】，无从重走。"), false;
        if (me.is_fighting && me.is_fighting()) return me.notify("战斗中不能重走。"), false;
        if (me.query_temp("zy_trial_active", "")) return me.notify("你还有一项试炼尚未结束。"), false;
        if (!currentAreaMatches(me, data)) return me.notify("你须身在【" + data.area + "】中。"), false;
        me.set_temp(replayKey(data.key), from);
        for (var i = 0; i < data.stages.length; i++) {
            var sid = data.stages[i].id;
            if (sid < from) continue;
            me.remove_temp(stageKey(data.key, sid)); me.remove_temp(puzzleKey(data.key, sid)); me.remove_temp("zy_pzhp_" + token(data.key, sid));
        }
        var st = findTrial(data, from), room = puzzleRoom(data, from);
        me.notify("<him>剑意重聚，【" + st.trial + "】之后的关隘再度封闭。</him>");
        if (room && me.environment && me.environment.path !== room) me.moveto(room, me.name + "身形一晃，没入剑冢深处。", me.name + "走了过来。");
        return true;
    }
    function offerReplay(me) {
        var data = familyData(me);
        if (!data || !data.stages || !hasAnyIntent(me, data)) return me.notify("石壁上剑痕纵横，你看了半晌，并无所获。"), false;
        var last = lastStageId(data), lastSt = findTrial(data, last);
        var cmds = ["zhenyi replay 1", "从【" + data.stages[0].trial + "】重走五关", "zhenyi replay " + last, "直往【" + lastSt.trial + "】，再会独孤求败"];
        if (replayFrom(me, data)) cmds.push("zhenyi replay off", "放弃重走");
        cmds.push({ text: "剑冢五关你已闯过。是否重游剑冢，再试一番？" });
        me.send_commands.apply(me, cmds);
        return true;
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
        if (data.v2) {
            // v2：强度只由品质决定，同品质内第二重 +4%。基础值里不再含 level 斜率，
            // 避免旧公式中重数被计算两次（旧公式十重约为一重的 5 倍，v2 约 2 倍）。
            var first = LEVEL_GRADES.indexOf(grade);
            return data.balance * GRADE_SCALES[grade] * (1 + 0.04 * (level - first));
        }
        return data.balance * (0.85 + level * 0.05) * GRADE_SCALES[grade];
    }
    function publicOwner(key) { return "zhenyi_public:" + key; }
    function trialOwner(me, key) { return "zhenyi_trial:" + key + ":" + me.id; }
    // 真意面板只显示整数。正数统一向上取整，既避免小数描述，也符合真意数值偏慷慨的定位。
    function positiveInteger(value) { return value > 0 ? Math.max(1, Math.ceil(value)) : 0; }
    function percentValue(value) { return positiveInteger(value * 100); }
    function percentPointValue(value) { return positiveInteger(value); }
    function secondValue(value) { return positiveInteger(value / 1000); }
    function percentText(value) { return value + "%"; }
    function secondsText(value) { return value + "秒"; }
    function colorIntentName(intent, grade) {
        var tag = GRADE_TAGS[grade] || "wht";
        return "<" + tag + ">" + intent.name + "</" + tag + ">";
    }
    function hasTower100(me) { return me.query_temp("wd_level", 0) >= 100 || !!me.query_temp("wd100", 0); }
    // GM 测试旁路：仅 user_level >= 5 且手动开启 zytest bypass 时，视为已满足境界与武道塔条件（门派仍须匹配）。
    function gmBypass(me) { return !!(me && (me.user_level || 0) >= 5 && me.query_temp("zy_gm_bypass", 0)); }
    function realmReady(me) { return gmBypass(me) || me.level >= 5; }
    function towerReady(me) { return gmBypass(me) || hasTower100(me); }
    function canUnlock(me, data) { return !!(me && data && familyId(me) === KEY_TO_FAMILY[data.key] && realmReady(me) && towerReady(me)); }

    // 所有玩家可见数字和战斗结算都只读取这里生成的整数，避免描述与实装分叉。
    function valuesFor(data, intent, level) {
        level = Math.max(1, Math.min(MAX_LEVEL, parseInt(level) || 1));
        var s = scaleFor(data, level), e = intent.effect;
        switch (e) {
            // 无剑：纯机制（不拘兵器施展剑法绝招），没有随重数成长的数值。
            case "jz_swordless": return {};
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
        if (intent && intent.timeout !== undefined) { stats.timeout = intent.timeout; return stats; }   // 0 = 不设时限
        stats.timeout = intent && intent.mode === "burst" ? 120000 : (intent && intent.mode === "endure" ? 45000 : (intent && intent.mode === "insight" ? 60000 : 180000));
        return stats;
    }

    // —— 禁地机关（v2）——
    // 进度一律记在玩家 temp 上：公共禁地是同门共享实例，房间字段会被所有人共用。
    // 已领悟该真意的老角色视为已解，不会被新机关卡住。
    function puzzleKey(key, id) { return "zy_pz_" + token(key, id); }
    function puzzleRoom(data, id) { return data && data.puzzles && data.puzzles[id]; }
    function puzzleSolved(me, data, id) {
        if (!puzzleRoom(data, id)) return true;
        if (me.query_temp(puzzleKey(data.key, id), 0)) return true;
        return data.stages ? stageCleared(me, data, id) : getLevel(me, data.key, id) > 0;
    }
    function solvePuzzle(me, key, id, opts) {
        opts = opts || {};
        me.set_temp(puzzleKey(key, id), 1);
        if (opts.hp) me.set_temp("zy_pzhp_" + token(key, id), opts.hp); else me.remove_temp("zy_pzhp_" + token(key, id));
        if (opts.bonus) me.set_temp("zy_pzbonus_" + token(key, id), opts.bonus); else me.remove_temp("zy_pzbonus_" + token(key, id));
        var data = findDataByKey(key);
        if (data && data.stages) {
            var st = findTrial(data, id);
            if (st && !stageCleared(me, data, id) && !opts.no_offer) offerStage(me, st, "<him>机关已解。剑意自四下汇聚，凝成一道人影拦在前路——【" + st.trial + "】的武意化身现身了。</him>");
            return true;
        }
        var intent = findIntent(data, id);
        if (intent && !getLevel(me, key, id)) me.notify("<him>机关已解，【" + intent.trial + "】的试炼石门为你开启。</him>");
        return true;
    }
    // 房间 on_leave 调用：未解机关时拦住往深处走的出口（默认 north）。
    function puzzleGate(me, key, id, dir, gateDir) {
        if (!me || !me.is_player || dir !== (gateDir || "north")) return true;
        var data = findDataByKey(key);
        if (!data) return true;
        if (!puzzleSolved(me, data, id)) { me.notify("前路被一股剑意封住。你须先参透此处的机关。"); return false; }
        if (data.stages && !stageCleared(me, data, id)) {
            var st = findTrial(data, id);
            if (st) offerStage(me, st, "【" + st.trial + "】的武意化身仍拦在前路，不击败它便过不去。");
            return false;
        }
        return true;
    }
    // 机关解开（或回到关前）时询问是否开启该关的化身试炼。
    function offerStage(me, st, msg) {
        me.notify(msg);
        if (me.send_commands) me.send_commands("zhenyi challenge " + st.id, "开启试炼");
    }
    function puzzleCommand(me, arg) {
        var env = me && me.environment;
        if (!env || !env.zy_puzzle) return me.notify("此处没有可解的机关。"), false;
        return env.zy_puzzle(me, String(arg || "").trim());
    }
    function trialHpScale(me, data, intent) {
        var scale = data.trialHpScale || 1;
        var pct = parseInt(me && me.query_temp("zy_pzhp_" + token(data.key, intent.id), 0)) || 0;
        if (pct > 0) scale *= pct / 100;
        return scale;
    }

    // 八处真意禁地只保留正式试炼引导 NPC；旧敌人脚本留档但不再生成。
    function allowPublicNpc(roomPath, npcPath) {
        var key = String(roomPath || "").replace(/\\/g, "/").split("/")[0];
        if (!findDataByKey(key)) return true;
        if (String(npcPath || "") === "jz/dugu_qiubai" || String(npcPath || "") === "jz/wuming_jian") return true;   // 剑冢的对话 / 重温 NPC
        return String(npcPath || "").indexOf("pub/zhenyi_shiyantai#" + key + "_") === 0;
    }

    // 面板描述与实际结算共用 valuesFor；level 为 0 时显示第一重预览。
    function describeIntent(data, intent, level) {
        var v = valuesFor(data, intent, level), e = intent.effect;
        switch (e) {
            case "jz_swordless": return "灭烛见真火，忘剑得神兵。入无剑之境：无论手持何种兵器或空手，皆可施展已装备的剑法绝招。";
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
            case "em_wrath": return "成功招架后获得6秒反震；下一次受击反弹所受伤害的" + percentText(v.reflect) + "，8秒冷却，反伤不超过自身攻击力" + percentText(v.cap) + "，并按对方防御结算。";
            case "em_twin": return "灭剑与绝剑成功交替后，12秒内下一次技能伤害提高" + percentText(v.damage) + "。";
            case "em_yitian": return "倚天剑诀或号令天下命中时，伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "em_nineyin": return "目标当前气血高于80%时，技能伤害提高" + percentText(v.damage) + "。";
            case "gb_kanglong": return "施展降龙时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "gb_flying": return "十八掌连续命中叠加掌势，最多5层、持续12秒；每层使后续技能伤害提高" + percentText(v.damage) + "。";
            case "gb_tail": return "绊字诀命中后获得12秒摆尾；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "gb_field": return "自身气血低于40%时，技能伤害提高" + percentText(v.damage) + "。";
            case "gb_six": return "降龙或十八掌成功后获得12秒龙劲；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "xy_beiming": return "北冥绑定绝招成功施展后，吸取目标最大内力的" + percentText(v.drain) + "并转为自身内力；单次转化不超过自身最大内力" + percentText(v.cap) + "。";
            case "xy_lingbo": return "成功闪避后获得10秒残影；下一次技能伤害提高" + percentText(v.damage) + "，命中提高" + percentText(v.hit) + "。";
            case "xy_baihong": return "当前内力高于80%时，白虹掌力伤害提高" + percentText(v.damage) + "，并消耗最大内力" + percentText(v.cost) + "。";
            case "xy_talisman": return "生死符命中后追加自身最大内力的" + percentText(v.extra) + "作为伤害，单次不超过本次已造成伤害" + percentText(v.cap) + "，并按目标防御结算，8秒冷却。";
            case "xy_formless": return "无相、无我释放已化用的绝招时，精力消耗降低" + percentText(v.cost) + "，调息降低" + percentText(v.cooldown) + "，调息最低" + v.minimum + "秒。";
            case "ss_shadow": return "无痕成功后，20秒内下一次伤害技能命中会封锁目标绝招" + secondsText(v.seal) + "；20秒冷却。";
            case "ss_step": return "成功闪避后获得10秒残影；下一次技能伤害提高" + percentText(v.damage) + "，命中提高" + percentText(v.hit) + "。";
            case "ss_puncture": return "目标当前气血高于80%时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "ss_debt": return "击杀目标后获得120秒血债；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "ss_asura": return "自身气血低于30%时，技能伤害提高" + percentText(v.damage) + "，忽视防御提高" + percentText(v.ignore) + "。";
            case "sn_thunder": return "绑定雷法命中叠加雷贯，最多5层、持续12秒；每层忽视防御提高" + percentText(v.ignore) + "。";
            case "sn_avatar": return "玄女法相成功后获得15秒护持，期间受到伤害降低" + percentText(v.reduction) + "。";
            case "sn_charm": return "魅魂或极乐六性命中后获得12秒摄心；下一次技能伤害提高" + percentText(v.damage) + "。";
            case "sn_purple": return "春雷暴殛或天雷系绑定绝招伤害提高" + percentText(v.damage) + "；每9秒追加一次攻击力的" + percentText(v.extra) + "作为雷伤，且不超过本次已造成伤害" + percentText(v.cap) + "，雷伤按目标防御结算。";
            case "sn_guard": return "当前内力大于0时，将每次所受伤害的" + percentText(v.convert) + "转为等量内力消耗；最终减伤上限" + percentText(v.cap) + "。";
        }
        return "此真意当前没有可结算的数值效果。";
    }

    function clearTrialTemps(me) {
        me.remove_temp("zy_trial_active");
        me.remove_temp("zy_trial_npc_dead");
        me.remove_temp("zy_trial_completed");
        me.remove_temp("zy_trial_failed");
        me.remove_temp("zy_trial_owner");
        me.remove_temp("zy_trial_return");
        me.remove_temp("zy_trial_deadline");
        me.remove_temp("zy_trial_exiting");
        me.remove_temp("zy_trial_entering");
        me.remove_temp("zy_trial_control_cd");
        if (me.remove_status) me.remove_status("zy_trial_control", true);
    }

    function sameTrialPlayer(owner, me) {
        return !!(owner && me && (owner === me || (owner.id && me.id && owner.id === me.id)));
    }
    function isTrialOwner(owner, key) {
        var prefix = "zhenyi_trial:" + (key ? key + ":" : "");
        return typeof owner === "string" && owner.indexOf(prefix) === 0;
    }

    // 热更新或重启会销毁旧试炼 NPC，但角色 temp 会持久化；每次进入系统都主动自愈。
    function ensureTrialState(me, notify) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", "");
        if (!active) {
            // startTrial 先写 owner 再 moveto，而 moveto 进入禁地时会经 can_enter_area → migrate 回到这里；
            // 进场途中 active 尚未写入，不能把刚写的 owner 当作残留清掉，否则开打即被判失效送回。
            if (me.query_temp("zy_trial_entering", 0)) return false;
            if (me.query_temp("zy_trial_owner", "") || me.query_temp("zy_trial_return", "")) clearTrialTemps(me);
            return false;
        }
        var parts = active.split("_"), key = parts[0], trialId = parseInt(parts[1]), data = findDataByKey(key);
        var owner = me.query_temp("zy_trial_owner", ""), env = me.environment;
        var completed = me.query_temp("zy_trial_completed", "") === token(key, trialId);
        var liveNpc = false;
        if (env && env.items) {
            for (var i = 0; i < env.items.length; i++) {
                if (env.items[i] && env.items[i].is_zhenyi_trial && sameTrialPlayer(env.items[i].trial_owner, me)) { liveNpc = true; break; }
            }
        }
        var valid = !!(data && owner && owner === trialOwner(me, key) && env && env.owner === owner &&
            env.parent && env.parent.id === key && (liveNpc || completed));
        if (valid) return true;

        var oldOwner = owner;
        if (data && env && isTrialOwner(env.owner, key)) {
            me.set_temp("zy_trial_failed", 1);
            if (notify) me.notify("先前未结束的真意试炼已经失效，正在将你送回禁地。");
            returnFromTrial(me, key);
            return false;
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
        migrateJdLayout(me);
        ensureTrialState(me, false);
        var data = familyData(me);
        var migrationStamp = "20261119a:" + (familyId(me) || "NONE");
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
            me.remove_temp("zy_active_" + old.key);
        }
        if (!data) { me.remove_temp("zy_active"); me.set_bool("fb2", HUB_JD, false); me.set_temp("zy_migrate_version", migrationStamp); return; }
        if (data.stages) {
            // 单真意改版：旧档领悟过的其他真意折算为对应关卡已过，其数据与悟痕一并清除；启用中的旧真意卸下。
            var keep = {};
            for (var ki = 0; ki < data.list.length; ki++) keep[data.list[ki].id] = true;
            for (var sid = 1; sid <= 7; sid++) {
                if (!keep[sid]) {
                    if (me.query_temp(acquiredKey(data.key, sid), 0) && findTrial(data, sid)) me.set_temp(stageKey(data.key, sid), 1);
                    me.remove_temp(acquiredKey(data.key, sid)); me.remove_temp(levelKey(data.key, sid)); me.remove_temp(clearKey(data.key, sid));
                }
                me.remove_temp(matKey(data.key, sid)); me.remove_temp(dailyKey(data.key, sid)); me.remove_temp("zy_pzbonus_" + token(data.key, sid));
                removeAllMaterial(me, data.key, sid);
            }
            var act = me.query_temp("zy_active", "");
            if (act && act.indexOf(data.key + "_") === 0 && !keep[parseInt(act.split("_")[1])]) me.remove_temp("zy_active");
            if (data.key === "jz") me.remove_temp("jz_mark");   // 剑道印记与传承殿兑换已删除
        }
        for (var i = 0; i < data.list.length; i++) {
            var item = data.list[i];
            if (me.query_temp(acquiredKey(data.key, item.id), 0) && !me.query_temp(levelKey(data.key, item.id), 0)) {
                me.set_temp(levelKey(data.key, item.id), 1);
                me.set_temp(clearKey(data.key, item.id), 1);
            }
            // 一次性把旧版角色计数迁移为可在背包中查看的真实道具（不分重数的门派没有悟痕）。
            var oldMat = data.no_level ? 0 : parseInt(me.query_temp(matKey(data.key, item.id), 0)) || 0;
            if (oldMat > 0 && me.add_obj) {
                var migrated = me.add_obj(matPath(data.key, item.id), oldMat);
                if (migrated) me.remove_temp(matKey(data.key, item.id));
                else migrationComplete = false;
            }
        }
        if (!me.query_temp("zy_active", "")) {
            var mask = me.query_temp("zy_active_" + data.key, 0) || 0;
            for (var j = 0; j < data.list.length; j++) {
                var mid = data.list[j].id;   // 旧位掩码按真意编号记位（第 n 道 = 1 << (n-1)）
                if ((mask & (1 << (mid - 1))) && me.query_temp(acquiredKey(data.key, mid), 0)) {
                    me.set_temp("zy_active", token(data.key, mid));
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
        if (!me.query_bool("fb2", HUB_JD)) {
            me.set_bool("fb2", HUB_JD, true);
            if (!silent) {
                me.send("<him>你心有所感，已可前往【" + HUB_NAME + "】，寻访本门【" + data.area + "】参悟" + data.name + "。</him>");
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
        else if (!realmReady(me)) msg = "你境界未到武帝，尚不足以承受禁地真意。";
        else if (!towerReady(me)) msg = "你尚未通过武道塔第一百层，禁地不会为你开启。";
        if (msg) { if (notify !== false && me) me.notify(msg); return false; }
        checkUnlock(me, true);
        return true;
    }

    // 门派禁地总入口：任一门派弟子达到条件即可进入；各派禁地仍只接纳本门。
    function canEnterHub(me, notify) {
        var msg = "";
        if (!familyData(me)) msg = "你无门无派，寻不到通往云湺山的路。";
        else if (!realmReady(me)) msg = "你境界未到武帝，尚不足以承受禁地真意。";
        else if (!towerReady(me)) msg = "你尚未通过武道塔第一百层，禁地不会为你开启。";
        if (msg) { if (notify !== false && me) me.notify(msg); return false; }
        checkUnlock(me, true);
        return true;
    }
    // 从门派禁地的岔路踏入某派禁地：先走该区域的 on_enter（权限校验 + 建立公共实例），再进入其首个房间。
    function enterFromHub(me, key) {
        var data = findDataByKey(key);
        if (!me || !data) return false;
        if (familyId(me) !== KEY_TO_FAMILY[key]) return me.notify("前路云雾翻涌，你寻了半晌，始终找不到入口。"), false;
        var area = null, areas = WORLD.AREAS || [];
        for (var i = 0; i < areas.length; i++) if (areas[i] && areas[i].id === key) { area = areas[i]; break; }
        if (!area || !area.first) return me.notify("此路暂时不通。"), false;
        if (area.on_enter && area.on_enter(me) === false) return false;
        return me.moveto(area.first, me.name + "沿着小路走远了。", me.name + "走了过来。") !== false;
    }
    // 可存档的限时增益（如剑冢「参悟」）：到期时间记在会存档的 temp 上，状态只负责显示与属性；
    // 下线不会丢，登录 / 重连时按剩余时间重新挂上，到点自然消失。与门派鼓舞同理。
    var TIMED_BUFFS = {
        jz_canwu: { name: "参悟", desc: "剑魔点化，心有所悟：悟性+500，练习、学习、打坐效率提高100%",
            prop: { int: 500, lianxi_per: 100, study_per: 100, dazuo_per: 100 } }
    };
    function timedBuffKey(id) { return "zy_buff_" + id; }
    function applyTimedBuff(me, id, ms) {
        var def = TIMED_BUFFS[id];
        if (!def || !(ms > 0) || !me.add_status) return false;
        if (me.remove_status && me.query_status && me.query_status(id)) me.remove_status(id, true);
        var prop = {};
        for (var k in def.prop) prop[k] = def.prop[k];
        me.add_status({ id: id, name: def.name, desc: def.desc, prop: prop, duration: ms, no_clear: true, override: 2 });
        return true;
    }
    function grantTimedBuff(me, id, ms) {
        if (!TIMED_BUFFS[id]) return false;
        me.set_temp(timedBuffKey(id), 1, ms);
        return applyTimedBuff(me, id, ms);
    }
    function restoreTimedBuffs(me) {
        if (!me || !me.temp) return;
        for (var id in TIMED_BUFFS) {
            var rec = me.temp[timedBuffKey(id)];
            var left = rec && rec.e ? rec.e - Date.now() : 0;
            if (left > 0 && !(me.query_status && me.query_status(id))) applyTimedBuff(me, id, left);
        }
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
        // 真意可能改变可用绝招（如无剑·无招放开剑法），刷新绝招栏与自动出招列表
        me.auto_skills = null;
        if (me.on_skillchanged) me.on_skillchanged();
        return true;
    }
    function clearCombatState(me) {
        var keys = ["zy_pfm", "zy_pfm_id", "zy_counter", "zy_borrow", "zy_lingbo", "zy_tail",
            "zy_twin", "zy_twin_last", "zy_charm", "zy_six", "zy_shadow_ready", "zy_bind_ready"];
        for (var i = 0; i < keys.length; i++) me.remove_temp(keys[i]);
    }
    function forgetFamily(me, oldFamilyId) {
        var data = DATA[oldFamilyId];
        if (!data) return;
        var trialActive = me.query_temp("zy_trial_active", ""), trialKey = trialActive && trialActive.split("_")[0];
        if (trialActive) {
            me.set_temp("zy_trial_failed", 1);
            if (me.end_fight) me.end_fight();
            returnFromTrial(me, trialKey);
        }
        for (var i = 1; i <= 7; i++) {
            me.remove_temp(acquiredKey(data.key, i)); me.remove_temp(levelKey(data.key, i));
            me.remove_temp(clearKey(data.key, i)); me.remove_temp(matKey(data.key, i)); me.remove_temp(dailyKey(data.key, i));
            me.remove_temp(puzzleKey(data.key, i)); me.remove_temp("zy_pzhp_" + token(data.key, i)); me.remove_temp("zy_pzbonus_" + token(data.key, i));
            me.remove_temp(stageKey(data.key, i));
            removeAllMaterial(me, data.key, i);
        }
        var active = me.query_temp("zy_active", "");
        if (active && active.indexOf(data.key + "_") === 0) me.remove_temp("zy_active");
        me.remove_temp("zy_active_" + data.key);
        if (!trialActive) clearTrialTemps(me);
        me.remove_temp("zy_migrate_version");
        clearCombatState(me); me.set_bool("fb2", HUB_JD, false);   // 改投他派后由新门派的 check_unlock 重新开启
    }

    function currentAreaMatches(me, data) { return !!(me && me.environment && me.environment.parent && me.environment.parent.id === data.key); }
    function dailyCount(me, key, id) { return parseInt(me.query_temp(dailyKey(key, id), 0)) || 0; }
    function addDaily(me, key, id, count) { return me.add_temp(dailyKey(key, id), count, UTIL.diff_time()); }
    // 真意试炼副本不应继承公共试场出口；完成确认由动作栏提供。
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

    // 精力由两个带过期时间的 temp 字段共同组成。试炼建立失败时直接恢复
    // 原字段（含原过期时间），避免简单 add_temp 造成跨日精力或补充精力错账。
    function snapshotEnergy(me) {
        var temp = me && me.temp;
        return {
            exExists: !!(temp && Object.prototype.hasOwnProperty.call(temp, "ex_jl")),
            adExists: !!(temp && Object.prototype.hasOwnProperty.call(temp, "ad_jl")),
            ex: temp && temp.ex_jl,
            ad: temp && temp.ad_jl
        };
    }
    function restoreEnergy(me, snapshot) {
        if (!me || !snapshot) return;
        if (!me.temp) me.temp = {};
        if (snapshot.exExists) me.temp.ex_jl = snapshot.ex;
        else delete me.temp.ex_jl;
        if (snapshot.adExists) me.temp.ad_jl = snapshot.ad;
        else delete me.temp.ad_jl;
    }

    function isInTrial(me) {
        if (!me) return false;
        var env = me.environment, active = me.query_temp("zy_trial_active", "");
        return !!(active || (env && isTrialOwner(env.owner)));
    }

    // 房间脚本热更新会重建所有副本房间；真意副本需要恢复隔离标记和动态化身。
    function rehydrateTrialRoom(room, owner) {
        if (!room || !isTrialOwner(owner)) return false;
        configureTrialRoom(room);
        var parts = owner.split(":"), key = parts[1], data = findDataByKey(key), me = null;
        for (var i = 0; i < room.items.length; i++) {
            if (room.items[i] && room.items[i].is_player && trialOwner(room.items[i], key) === owner) {
                me = room.items[i]; break;
            }
        }
        if (!me || !data) return true;
        me.set_temp("zy_trial_owner", owner);
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_"), intent = findTrial(data, bits && bits[1]);
        if (!active || !intent || bits[0] !== key) {
            me.set_temp("zy_trial_failed", 1);
            returnFromTrial(me, key);
            return true;
        }
        if (me.query_temp("zy_trial_completed", "") === token(key, intent.id)) return true;
        if (!me.query_temp("zy_trial_deadline", 0) && trialStats(intent).timeout > 0) me.set_temp("zy_trial_deadline", Date.now() + trialStats(intent).timeout);
        if (me.end_fight) me.end_fight();
        var npc = null;
        try { npc = NPC.CLONE("pub/zhenyi_trial"); } catch (e) { npc = null; }
        if (!npc || !npc.init_trial) {
            if (npc && npc.destroy) npc.destroy();
            me.set_temp("zy_trial_failed", 1);
            me.notify("<hir>试炼场热更新后化身恢复失败，本次试炼已经结束。</hir>");
            returnFromTrial(me, key);
            return true;
        }
        try {
            npc.init_trial(me, data, intent); room.item_changed(npc, true);
        } catch (e) {
            if (npc && npc.destroy) npc.destroy();
            me.set_temp("zy_trial_failed", 1);
            me.notify("<hir>试炼场热更新后化身恢复失败，本次试炼已经结束。</hir>");
            returnFromTrial(me, key);
            return true;
        }
        me.notify("<hiy>试炼场更新完成，你的真意试炼已经续接。</hiy>");
        npc.do_kill(me);
        return true;
    }

    function startTrial(me, id) {
        var data = familyData(me), intent = findTrial(data, id);
        if (!data || !intent) return me.notify("没有这项试炼。"), false;
        if (!canEnterArea(me, data.key)) return false;
        if (!currentAreaMatches(me, data)) return me.notify("你须先进入【" + data.area + "】。"), false;
        if (me.is_fighting()) return me.notify("你尚在战斗，不能另启试炼。"), false;
        ensureTrialState(me, !!me.query_temp("zy_trial_active", ""));
        if (me.query_temp("zy_trial_active", "")) return me.notify("你已有一项真意试炼尚未结束。"), false;
        if (data.stages) {
            if (stageCleared(me, data, intent.id)) return me.notify("你已闯过【" + intent.trial + "】。"), false;
            var prev = findTrial(data, intent.id - 1);
            if (prev && !stageCleared(me, data, prev.id)) return me.notify("须先闯过【" + prev.trial + "】。"), false;
        } else if (getLevel(me, data.key, intent.id)) return me.notify("你已解锁【" + intent.name + "】，无法进入试炼。"), false;
        if (!puzzleSolved(me, data, intent.id)) {
            var pzRoom = typeof ROOM !== "undefined" && ROOM.Get(puzzleRoom(data, intent.id));
            return me.notify("【" + intent.trial + "】的试炼石门紧闭。你须先在【" + (pzRoom ? pzRoom.name : data.area) + "】中参透机关。"), false;
        }
        if (!data.stages && dailyCount(me, data.key, intent.id) >= DAILY_LIMIT) return me.notify("这项试炼今日已达十次。"), false;
        var baseRoom = ROOM.Get(data.trialRoom);
        if (!baseRoom) return me.notify("试炼场暂不可用，请联系管理员。"), false;
        var owner = trialOwner(me, data.key);
        var npc = null, room = null, oldRoom = me.environment, energyBefore = snapshotEnergy(me), energySpent = false;
        try {
            var staleRoom = baseRoom.query_copy(owner);
            if (staleRoom) staleRoom.clear_by_area(baseRoom.parent, owner);
            room = baseRoom.create_copy(owner);
            if (!room) throw new Error("trial room copy failed");
            configureTrialRoom(room);
            npc = NPC.CLONE("pub/zhenyi_trial");
            if (!npc || !npc.init_trial) throw new Error("trial npc clone failed");
            if (!me.expend_jingli(ENERGY_COST)) {
                if (npc && npc.destroy) npc.destroy();
                if (room) room.clear_by_area(baseRoom.parent, owner);
                return me.notify("参加试炼需要" + ENERGY_COST + "点精力。"), false;
            }
            energySpent = true;
            me.set_temp("zy_trial_owner", owner);
            me.set_temp("zy_trial_return", oldRoom.path);
            me.set_temp("zy_trial_entering", 1, 10000);
            if (me.moveto(room, me.name + "步入试炼石门。", me.name + "踏入了试炼场。") === false)
                throw new Error("trial move failed");
            for (var i = room.items.length - 1; i >= 0; i--) {
                var old = room.items[i];
                if (!old.is_player && old.is_zhenyi_trial) room.item_changed(old, false);
            }
            me.set_temp("zy_trial_active", token(data.key, intent.id));
            me.remove_temp("zy_trial_entering");
            if (trialStats(intent).timeout > 0) me.set_temp("zy_trial_deadline", Date.now() + trialStats(intent).timeout);
            npc.init_trial(me, data, intent);
            room.item_changed(npc, true);
        } catch (e) {
            if (npc && npc.destroy) npc.destroy();
            if (me.environment === room && oldRoom && me.moveto)
                me.moveto(oldRoom, me.name + "退出了未能建立的试炼。", me.name + "重新回到禁地。" );
            clearTrialTemps(me);
            if (room) room.clear_by_area(baseRoom.parent, owner);
            if (energySpent) restoreEnergy(me, energyBefore);
            return me.notify("试炼场暂时无法进入，精力未被消耗。"), false;
        }
        if (!data.stages) me.notify("<hiy>你消耗" + ENERGY_COST + "点精力，开始【" + intent.trial + "】。今日完成次数" + dailyCount(me, data.key, intent.id) + "/" + DAILY_LIMIT + "。</hiy>");
        npc.do_kill(me); return true;
    }

    function returnFromTrial(me, key) {
        if (!me) return;
        var envOwner = me.environment && me.environment.owner;
        var owner = me.query_temp("zy_trial_owner", "") || (isTrialOwner(envOwner, key) ? envOwner : "");
        var returnPath = me.query_temp("zy_trial_return", "");
        if (!key && owner) key = owner.split(":")[1];
        if (!owner) { clearTrialTemps(me); return true; }
        var finishReturn = function () {
            var data = findDataByKey(key), currentRoom = me.environment;
            var shouldReturn = currentRoom && (currentRoom.zhenyi_trial_room || isTrialOwner(currentRoom.owner, key));
            var moved = !shouldReturn;
            me.set_temp("zy_trial_exiting", 1);
            var quitTo = me.query_temp("zy_trial_quit_to", "");
            if (shouldReturn && quitTo) {
                me.remove_temp("zy_trial_quit_to");
                moved = me.moveto(quitTo, me.name + "离开了真意试炼。", me.name + "走了过来。") !== false;
            } else if (shouldReturn && data) {
                var trialBaseRoom = ROOM.Get(data.trialRoom);
                var baseReturn = ROOM.Get(returnPath) || (trialBaseRoom && trialBaseRoom.parent && trialBaseRoom.parent.rooms[0]);
                var publicRoom = baseReturn && (baseReturn.query_copy(publicOwner(key)) || baseReturn.create_copy(publicOwner(key)));
                moved = !!(publicRoom && me.moveto(publicRoom, me.name + "离开了真意试炼。", me.name + "自试炼石门中走出。") !== false);
                if (!moved && me.query_home) {
                    var home = me.query_home();
                    moved = !!(home && me.moveto(home, me.name + "离开了真意试炼。", me.name + "自试炼石门中走出。") !== false);
                }
            }
            me.remove_temp("zy_trial_exiting");
            if (!moved) {
                me.notify("试炼出口暂时无法开启，状态已保留；请稍后再次点击动作栏的完成副本。");
                return false;
            }
            clearTrialTemps(me);
            if (data) {
                var trialBase = ROOM.Get(data.trialRoom), trialRoom = trialBase && trialBase.query_copy(owner);
                if (trialRoom) trialRoom.clear_by_area(trialBase.parent, owner);
            }
            return true;
        };
        if (me.call_out) me.call_out(finishReturn, 0);
        else finishReturn();
        return true;
    }

    function addXuanjing(me, count) { return me.add_obj("st/xuanjing", count) || null; }
    function addMaterial(me, key, id, count) {
        if (!me || !(count > 0)) return null;
        // add_obj(path, count) 自身负责参数化克隆和堆叠；不要先创建一个无人持有的
        // 临时对象再尝试第二次发放，否则第一次合并失败会遗留游离对象。
        return me.add_obj(matPath(key, id), count) || null;
    }
    function matCount(me, key, id) { var obj = me.find_obj_bypath(matPath(key, id)); return obj ? (obj.count || 1) : 0; }
    function rollbackReward(me, granted) {
        if (!granted || !granted.items || !me.remove_obj) return;
        for (var i = granted.items.length - 1; i >= 0; i--) {
            var entry = granted.items[i];
            if (entry.obj && entry.count > 0) me.remove_obj(entry.obj, entry.count);
        }
    }
    function reward(me, data, intent, count, isSweep) {
        var xj = 0, mat = 0, bonus = 0;
        for (var i = 0; i < count; i++) {
            xj += (isSweep ? 12 : 18) + me.random(isSweep ? 7 : 9);
            mat += (isSweep ? 1 : 2) + (me.random(100) < 25 ? 1 : 0);
            if (me.random(100) < 20) bonus++;
        }
        var granted = { xj: xj, mat: mat, bonus: 0, bonusName: "", items: [] };
        var material = addMaterial(me, data.key, intent.id, mat);
        if (!material) return null;
        granted.items.push({ obj: material, count: mat });
        if (bonus > 0) {
            var unlockedSafe = [];
            for (var sj = 0; sj < data.list.length; sj++) if (getLevel(me, data.key, data.list[sj].id)) unlockedSafe.push(data.list[sj]);
            if (unlockedSafe.length) {
                var safeBonus = unlockedSafe[me.random(unlockedSafe.length)];
                var bonusMaterial = addMaterial(me, data.key, safeBonus.id, bonus);
                if (!bonusMaterial) { rollbackReward(me, granted); return null; }
                granted.items.push({ obj: bonusMaterial, count: bonus });
                granted.bonus = bonus; granted.bonusName = safeBonus.name;
            }
        }
        var xuanjing = addXuanjing(me, xj);
        if (!xuanjing) { rollbackReward(me, granted); return null; }
        granted.items.push({ obj: xuanjing, count: xj });
        return granted;
    }
    function announceReward(me, intent, granted) {
        var safeBonusName = granted.bonus > 0 ? "，另得" + granted.bonusName + "悟痕×" + granted.bonus : "";
        me.notify("<hig>获得玄晶×" + granted.xj + "、" + intent.name + "悟痕×" + granted.mat + safeBonusName + "。</hig>");
    }
    function completeTrial(me, key, id) {
        var data = findDataByKey(key), intent = findTrial(data, id);
        if (!me || !data || !intent || familyId(me) !== KEY_TO_FAMILY[key]) return false;
        var trialToken = token(key, intent.id);
        var active = me.query_temp("zy_trial_active", "");
        var completed = me.query_temp("zy_trial_completed", "");
        // 化身死亡回调发生在战斗对象清理期间，极少数情况下 active 会先被清理；
        // 由化身回调写入的一次性成功标记仍可完成本次解锁，避免“化身已死但未解锁”。
        if (active !== trialToken && me.query_temp("zy_trial_npc_dead", "") !== trialToken && completed !== trialToken) return false;
        if (completed === trialToken) return true;
        me.remove_temp("zy_trial_npc_dead");
        me.remove_temp("zy_trial_failed");
        me.remove_temp("zy_trial_deadline");
        // 保留 active 和副本，等待玩家通过动作栏“完成副本”确认离场。
        me.set_temp("zy_trial_completed", trialToken);
        if (data.stages) {
            me.set_temp(stageKey(key, intent.id), 1);
            if (intent.id === lastStageId(data)) {
                if (replayFrom(me, data)) { me.remove_temp(replayKey(key)); me.notify("<hig>剑冢重游已毕。</hig>"); }
                for (var li = 0; li < data.list.length; li++) {
                    var it = data.list[li];
                    if (getLevel(me, key, it.id)) continue;
                    me.set_temp(acquiredKey(key, it.id), 1); me.set_temp(levelKey(key, it.id), 1); me.set_temp(clearKey(key, it.id), 1);
                    me.notify("<him>五关既过，剑冢深处一片寂然。你忽有所悟——灭烛见真火，忘剑得神兵。你领悟了【" + it.name + "】！</him>");
                    // 首次通关奖励
                    grantFirstClearReward(me, data);
                }
            } else {
                me.notify("<him>化身散作点点剑光——【" + intent.trial + "】已过，剑冢深处的剑意为你让开了一条路。</him>");
            }
            me.notify("<hig>你已完成试炼。</hig>");
            if (me.end_fight) me.end_fight();
            returnFromTrial(me, key);   // 完成即离场，不再要求点击「完成副本」
            return true;
        }
        addDaily(me, key, intent.id, 1);
        if (!getLevel(me, key, intent.id)) {
            me.set_temp(acquiredKey(key, intent.id), 1); me.set_temp(levelKey(key, intent.id), 1); me.set_temp(clearKey(key, intent.id), 1);
            me.notify("<him>试炼石壁上道韵流转，你领悟了【" + intent.name + "】！</him>");
            var pzBonus = parseInt(me.query_temp("zy_pzbonus_" + trialToken, 0)) || 0;
            if (pzBonus > 0) {
                me.remove_temp("zy_pzbonus_" + trialToken);
                if (addMaterial(me, key, intent.id, pzBonus)) me.notify("<hig>你在机关中所做的抉择得到回应：另得" + intent.name + "悟痕×" + pzBonus + "。</hig>");
            }
        }
        me.notify("<hig>你已完成试炼。今日完成次数" + dailyCount(me, key, intent.id) + "/" + DAILY_LIMIT + "。</hig>");
        if (me.end_fight) me.end_fight();
        returnFromTrial(me, key);   // 完成即离场，不再要求点击「完成副本」
        return true;
    }
    function failTrial(me, reason) {
        if (!me) return;
        var active = me.query_temp("zy_trial_active", ""), key = active ? active.split("_")[0] : (me.environment && me.environment.parent && me.environment.parent.id);
        me.remove_temp("zy_trial_npc_dead");
        me.remove_temp("zy_trial_completed");
        me.set_temp("zy_trial_failed", 1);
        if (reason) me.notify("<hir>真意试炼失败：" + reason + "</hir>");
        if (key) returnFromTrial(me, key);
    }
    function finishTrialAction(me) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_"), key = bits && bits[0], id = bits && parseInt(bits[1]);
        if (!active || !key || !(id >= 0)) {
            return me.notify("你当前不在真意试炼副本中。"), false;
        }
        var data = findDataByKey(key), intent = findTrial(data, id);
        if (me.query_temp("zy_trial_completed", "") === token(key, intent && intent.id)) {
            me.notify("真意试炼已完成，是否确认完成副本并离开？");
            me.send_commands("zhenyi trial_confirm", "确认完成并离开", "zhenyi trial_cancel", "暂不离开");
            return true;
        }
        if (me.query_temp("zy_trial_failed", 0)) {
            me.notify("本次真意试炼已经结束，是否确认离开副本？");
            me.send_commands("zhenyi trial_confirm", "确认离开", "zhenyi trial_cancel", "暂不离开");
            return true;
        }
        if (intent && intent.quit_to) {
            me.notify("现在离开算作试炼失败，你将被送出" + data.area + "。是否放弃？");
            me.send_commands("zhenyi trial_quit", "放弃试炼并离开", "zhenyi trial_cancel", "继续挑战");
            return true;
        }
        if (intent && intent.mode === "endure") me.notify("请继续坚持至试炼计时结束；达成目标后会自动结算。");
        else me.notify("请先完成试炼目标；击败武意化身后会自动结算。");
        return false;
    }
    function confirmTrial(me) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_"), key = bits && bits[0], id = bits && parseInt(bits[1]);
        var data = findDataByKey(key), intent = findTrial(data, id);
        var completed = intent && me.query_temp("zy_trial_completed", "") === token(key, intent.id);
        var failed = !!me.query_temp("zy_trial_failed", 0);
        if (!active || !key || !(id >= 0) || !intent || (!completed && !failed)) {
            return me.notify("请先完成真意试炼目标。"), false;
        }
        if (me.end_fight) me.end_fight();
        returnFromTrial(me, key);
        return true;
    }
    // 主动放弃（仅允许放弃的关卡，如剑魔）：算失败，送到关卡指定的地点
    function quitTrial(me) {
        if (!me) return false;
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_"), key = bits && bits[0];
        var data = findDataByKey(key), intent = findTrial(data, bits && bits[1]);
        if (!intent || !intent.quit_to) return me.notify("这项试炼不能中途放弃。"), false;
        me.set_temp("zy_trial_failed", 1);
        me.set_temp("zy_trial_quit_to", intent.quit_to);
        // 放弃算整个剑冢试炼失败：五关进度清零，须从第一关重来（重游中则结束重游，不影响已领悟的真意）
        if (data.stages) {
            me.remove_temp(replayKey(data.key));
            for (var qi = 0; qi < data.stages.length; qi++) {
                var qid = data.stages[qi].id;
                me.remove_temp(stageKey(data.key, qid)); me.remove_temp(puzzleKey(data.key, qid)); me.remove_temp("zy_pzhp_" + token(data.key, qid));
            }
        }
        me.notify("<hir>你收剑而退，这一次终究没能胜过剑魔。" + (data.stages && !hasAnyIntent(me, data) ? "剑冢五关的进度已化为乌有。" : "") + "</hir>");
        if (me.end_fight) me.end_fight();
        returnFromTrial(me, key);
        return true;
    }
    // 不死关卡（如剑魔）：在试炼场内被击倒时原地站起，不出场、不算死亡
    function preventDeath(me) {
        if (!me || !me.is_player) return false;
        var active = me.query_temp("zy_trial_active", ""), bits = active && active.split("_");
        var data = findDataByKey(bits && bits[0]), intent = findTrial(data, bits && bits[1]);
        if (!intent || !intent.no_death || !me.environment || !me.environment.zhenyi_trial_room) return false;
        // 按比试落败处理：双方罢手，挑战者留 1 点气血、不出场；化身收剑回满气血，可再次出手重新挑战
        me.hp = 1;
        if (me.notify_hp) me.notify_hp();
        if (me.end_fight) me.end_fight();
        var items = me.environment.items || [];
        for (var i = 0; i < items.length; i++) {
            var npc = items[i];
            if (npc && npc.is_zhenyi_trial && npc.reset_after_win) npc.reset_after_win(me);
        }
        me.notify("<hir>你被剑魔一剑击倒，比试落败。养好伤势后，可再向他出手。</hir>");
        return true;
    }
    function cancelTrial(me) {
        if (!me) return false;
        if (me.query_temp("zy_trial_completed", "") || me.query_temp("zy_trial_failed", 0)) {
            me.notify("已取消离场，你仍在真意试炼副本中。");
            return true;
        }
        return me.notify("真意试炼尚未完成。"), false;
    }
    function sweep(me, id, count) {
        var data = familyData(me), intent = findIntent(data, id);
        if (data && data.stages) return sweepStages(me, data, count);
        if (!data || !intent) return me.notify("没有这项试炼。"), false;
        if (!canEnterArea(me, data.key)) return false;
        if (!currentAreaMatches(me, data)) return me.notify("你须身在【" + data.area + "】中方可扫荡。"), false;
        if (me.is_fighting()) return me.notify("战斗中不能扫荡试炼。"), false;
        if (!me.query_temp(clearKey(data.key, intent.id), 0)) return me.notify("亲自完成一次试炼后方可扫荡。"), false;
        var remain = DAILY_LIMIT - dailyCount(me, data.key, intent.id);
        if (remain <= 0) return me.notify("这项试炼今日已达十次。"), false;
        count = Math.max(1, Math.min(parseInt(count) || 1, remain));
        var energy = ENERGY_COST * count;
        if (me.query_jingli && me.query_jingli() < energy) return me.notify("扫荡" + count + "次需要" + energy + "点精力。"), false;
        var granted = reward(me, data, intent, count, true);
        if (!granted) return me.notify("<hir>奖励道具生成失败，本次未消耗精力和次数，请稍后重试。</hir>"), false;
        if (!me.expend_jingli(energy)) {
            rollbackReward(me, granted);
            return me.notify("精力状态已经变化，本次扫荡未生效。"), false;
        }
        addDaily(me, data.key, intent.id, count);
        me.notify("<hiy>你在" + data.area + "中重温【" + intent.trial + "】" + count + "次。</hiy>");
        announceReward(me, intent, granted); return true;
    }

    // 首次通关奖励（如独孤剑诀残页 ×200）：领过即记 zy_frw_<key>。更新前就已通关的老角色没有此标记，可在独孤求败处补领。
    function firstRewardKey(key) { return "zy_frw_" + key; }
    function grantFirstClearReward(me, data) {
        var fr = data && data.first_clear_reward;
        if (!fr || !me.add_obj || me.query_temp(firstRewardKey(data.key), 0)) return false;
        var got = me.add_obj(fr.path, fr.count);
        if (!got) return false;
        me.set_temp(firstRewardKey(data.key), 1);
        me.notify("<hig>你获得了" + (got.color_name || got.name) + "×" + fr.count + "。</hig>");
        return true;
    }
    function claimFirstClearReward(me) {
        var data = familyData(me);
        if (!data || !data.stages || !hasAnyIntent(me, data)) return false;
        return grantFirstClearReward(me, data);
    }
    // 剑冢等关卡式试炼的扫荡：须已通关（领悟真意）；每次消耗 sweep.energy 精力，得玄晶，sweep.piece_rate% 得一张残页；累计次数供易直非兑换
    function sweepCountKey(key) { return "zy_sweep_" + key; }
    function sweepStages(me, data, count) {
        var cfg = data.sweep;
        if (!cfg) return me.notify("这项试炼无从扫荡。"), false;
        if (!hasAnyIntent(me, data)) return me.notify("你须先亲自闯过【" + data.area + "】，方可重温。"), false;
        if (!currentAreaMatches(me, data)) return me.notify("你须身在【" + data.area + "】中方可重温。"), false;
        if (me.is_fighting && me.is_fighting()) return me.notify("战斗中不能重温试炼。"), false;
        count = Math.max(1, parseInt(count) || 1);
        var jl = me.query_jingli ? me.query_jingli() : 0;
        count = Math.min(count, Math.floor(jl / cfg.energy));
        if (count <= 0 || !me.expend_jingli(cfg.energy * count)) return offerSweep(me, "<hir>你的精力不够，重温一次需要" + cfg.energy + "点精力。</hir>"), false;
        var xj = 0, pieces = 0;
        for (var i = 0; i < count; i++) {
            xj += 12 + me.random(7);
            if (me.random(100) < cfg.piece_rate) pieces++;
        }
        if (xj > 0) addXuanjing(me, xj);
        var got = pieces > 0 ? me.add_obj(cfg.piece, pieces) : null;
        me.set_temp(sweepCountKey(data.key), (parseInt(me.query_temp(sweepCountKey(data.key), 0)) || 0) + count);
        var result = "<hig>重温" + count + "次，获得玄晶×" + xj + (got ? "、" + (got.color_name || got.name) + "×" + pieces : "") + "。</hig>";
        me.notify(result);
        offerSweep(me, result);   // 常驻浮窗刷新次数与精力，可继续扫荡
        return true;
    }
    // 重温（扫荡）浮窗：常驻，扫荡后原地刷新次数、精力与结果（feedback）
    function offerSweep(me, feedback) {
        var data = familyData(me);
        if (!data || !data.stages || !data.sweep) return me.notify("无名剑静静立着，并无回应。"), false;
        if (!hasAnyIntent(me, data)) return me.notify("一柄无名之剑静静插在石缝里。你还未闯过剑冢五关，它对你毫无反应。"), false;
        var done = parseInt(me.query_temp(sweepCountKey(data.key), 0)) || 0;
        me.send_commands("zhenyi sweep 0 1", "扫荡一次", "zhenyi sweep 0 10", "扫荡十次", {
            text: "重温试炼(" + data.area + ")：已重温" + done + "次，每次需要消耗" + data.sweep.energy + "点精力。<br>当前精力：" + (me.query_jingli ? me.query_jingli() : 0),
            feedback: feedback || "", persistent: true
        });
        return true;
    }
    function xuanjingCount(me) { var obj = me.find_obj_bypath("st/xuanjing"); return obj ? (obj.count || 1) : 0; }
    function requestUpgrade(me, id) {
        if (me.is_fighting()) return me.notify("战斗中不可参悟升级。"), false;
        var data = familyData(me), intent = findIntent(data, id);
        if (!data || !intent) return me.notify("没有这道真意。"), false;
        var lv = getLevel(me, data.key, intent.id);
        if (!lv) return me.notify("你尚未领悟这道真意。"), false;
        if (intent.effect === "sl_vajra" || data.no_level) return me.notify("【" + intent.name + "】是纯机制真意，无需也不能升级。"), false;
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
        if (intent.effect === "sl_vajra" || data.no_level || lv >= MAX_LEVEL) return me.notify("这道真意不能继续升级。"), false;
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
                mechanic_only: item.effect === "sl_vajra" || !!data.no_level, no_level: !!data.no_level, preview_level: lv || 1,
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
    function clearPfmContext(me, pfmId) {
        if (!me) return;
        var current = me.query_temp("zy_pfm_id", "");
        if (pfmId && current && current !== pfmId) return;
        me.remove_temp("zy_pfm"); me.remove_temp("zy_pfm_id");
    }
    function pfmContextMatches(me, active) {
        var pfmId = me && me.query_temp("zy_pfm_id", "");
        return !!(me && active && pfmId && me.query_temp("zy_pfm", "") === active.intent.effect &&
            active.intent.pfms.indexOf(pfmId) >= 0);
    }
    function beginPfm(me, target, pfm, skill) {
        // 兼容热更新期间仍按旧三参数签名调用的绝招链路。
        if (arguments.length === 3) { skill = pfm; pfm = target; target = null; }
        var active = getActive(me);
        if (!active || !pfmMatches(active, pfm.id, skill)) return null;
        clearPfmContext(me);
        me._zy_pfm_hit = false;
        me._zy_pfm_target = target || null;
        me._zy_pfm_target_hp = target && target.hp;
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
        try {
            if (!success || !pfmMatches(active, pfm && pfm.id, skill)) return false;
            var effect = active.intent.effect, v = active.values;
            var hit = !!me._zy_pfm_hit;
            if (!hit && target && me._zy_pfm_target === target && typeof me._zy_pfm_target_hp === "number")
                hit = target.hp < me._zy_pfm_target_hp;
            // 北冥两式是恢复/增益招式，本身不攻击目标；其真意按成功施展结算。
            if (effect === "xy_beiming") hit = true;
            // 魅魂在容貌高于目标时不走攻击公式，但属于原技能明示的条件必然命中。
            if (effect === "sn_charm" && target && me.per > target.per) hit = true;
            var needsHit = effect === "zw_stick" || effect === "sl_roar" || effect === "sl_prajna" ||
                effect === "gb_tail" || effect === "xy_beiming" || effect === "sn_charm";
            if (needsHit && !hit) return false;
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
            return true;
        } finally {
            delete me._zy_pfm_hit;
            delete me._zy_pfm_target;
            delete me._zy_pfm_target_hp;
            clearPfmContext(me, pfm && pfm.id);
        }
    }
    function addControl(target, id, name, duration, cooldown) {
        if (!target || target.query_temp(id + "_cd")) return;
        // is_busy is a runtime status flag, not a combat property.  The
        // status engine reads it from the top-level buff object; putting it in
        // prop only changes a queryable number and never blocks actions.
        target.set_temp(id + "_cd", 1, cooldown);
        var applied = target.add_status({ id: id, name: name, duration: duration, downside: true, is_busy: duration });
        if (applied === false) target.remove_temp(id + "_cd");
    }

    function addIgnore(par, value) {
        par.diff_fy = Math.min(100, (par.diff_fy || 0) + value);
    }
    function modifyAttack(me, target, par, sh, skill) {
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me)) return sh;
        var e = active.intent.effect, v = active.values, bonus = 0, inPfm = pfmContextMatches(me, active);
        if ((e === "jz_edge" || e === "em_yitian" || e === "gb_kanglong") && inPfm) bonus += v.damage / 100;
        if ((e === "jz_edge" || e === "em_yitian" || e === "gb_kanglong") && inPfm) {
            addIgnore(par, v.ignore);
        }
        if (e === "jz_counter" && me.query_temp("zy_counter")) { bonus += v.damage / 100; me.remove_temp("zy_counter"); }
        else if (e === "jz_heavy" && target.max_hp && target.hp / target.max_hp > 0.7) bonus += v.damage / 100;
        else if (e === "jz_formless" && inPfm && !me.query_temp("zy_formless_cd")) { bonus += v.damage / 100; me.set_temp("zy_formless_cd", 1, 10000); }
        else if (e === "zw_borrow" && me.query_temp("zy_borrow", 0) >= 2) { bonus += v.damage / 100; me.remove_temp("zy_borrow"); }
        else if (e === "gb_field" && me.max_hp && me.hp / me.max_hp < 0.4) bonus += v.damage / 100;
        else if (e === "gb_flying" && inPfm) { var st = Math.min(5, parseInt(me.query_temp("zy_flying", 0)) || 0); bonus += st * v.damage / 100; }
        else if (e === "gb_tail" && me.query_temp("zy_tail")) { bonus += v.damage / 100; me.remove_temp("zy_tail"); }
        else if (e === "gb_six" && me.query_temp("zy_six")) { bonus += v.damage / 100; me.remove_temp("zy_six"); }
        else if (e === "em_twin" && me.query_temp("zy_twin")) { bonus += v.damage / 100; me.remove_temp("zy_twin"); }
        else if (e === "em_nineyin" && target.max_hp && target.hp / target.max_hp > 0.8) bonus += v.damage / 100;
        else if ((e === "xy_lingbo" || e === "ss_step") && (par._zy_lingbo_ready || me.query_temp("zy_lingbo"))) {
            bonus += v.damage / 100;
            if (!par._zy_hit_prepared) {
                par.mz = (par.mz || me.mz) * (1 + v.hit / 100);
                me.remove_temp("zy_lingbo");
            }
            delete par._zy_lingbo_ready;
            delete par._zy_hit_prepared;
            if (par._zy_base_mz !== undefined) { par.mz = par._zy_base_mz; delete par._zy_base_mz; }
        }
        else if (e === "xy_baihong" && inPfm && me.max_mp && me.mp / me.max_mp > 0.8) { bonus += v.damage / 100; me.add_mp(-Math.floor(me.max_mp * v.cost / 100)); }
        else if (e === "ss_puncture" && target.max_hp && target.hp / target.max_hp > 0.8) { bonus += v.damage / 100; addIgnore(par, v.ignore); }
        else if (e === "ss_debt" && me.query_temp("zy_debt")) { bonus += v.damage / 100; me.remove_temp("zy_debt"); }
        else if (e === "ss_asura" && me.max_hp && me.hp / me.max_hp < 0.3) { bonus += v.damage / 100; addIgnore(par, v.ignore); }
        else if (e === "sn_charm" && me.query_temp("zy_charm")) { bonus += v.damage / 100; me.remove_temp("zy_charm"); }
        else if (e === "sn_thunder" && inPfm) { var th = Math.min(5, parseInt(me.query_temp("zy_thunder", 0)) || 0); addIgnore(par, th * v.ignore); }
        else if (e === "sn_purple" && inPfm) bonus += v.damage / 100;
        return sh * (1 + bonus);
    }
    function prepareAttack(me, target, par, skill) {
        if (par._zy_base_mz !== undefined) {
            par.mz = par._zy_base_mz;
            delete par._zy_base_mz;
            delete par._zy_lingbo_ready;
            delete par._zy_hit_prepared;
        }
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me)) return;
        var e = active.intent.effect, v = active.values;
        if ((e === "xy_lingbo" || e === "ss_step") && me.query_temp("zy_lingbo")) {
            // Hit/evasion is decided before damage hooks.  Consume the
            // one-shot marker at attempt time and leave a per-attack marker so
            // the damage hook can add its separate damage component.
            par._zy_base_mz = par.mz;
            par.mz = (par.mz || me.mz) * (1 + v.hit / 100);
            par._zy_lingbo_ready = true;
            par._zy_hit_prepared = true;
            me.remove_temp("zy_lingbo");
        }
    }
    function afterAttack(me, target, par, dealt, skill) {
        // 试炼化身需要感知玩家的每次命中（区分绝招/普攻），用于护体、破绽等考题。
        if (target && target.is_zhenyi_trial && target.trial_on_hit && dealt > 0)
            target.trial_on_hit(me, !!(me && me._zy_casting));
        var active = getActive(me);
        if (!active || !allowedSkill(skill, me) || !(dealt > 0)) return;
        var e = active.intent.effect, v = active.values, inPfm = pfmContextMatches(me, active);
        if (inPfm) me._zy_pfm_hit = true;
        if (e === "gb_flying" && inPfm) me.set_temp("zy_flying", Math.min(5, (parseInt(me.query_temp("zy_flying", 0)) || 0) + 1), 12000);
        else if (e === "sn_thunder" && inPfm) me.set_temp("zy_thunder", Math.min(5, (parseInt(me.query_temp("zy_thunder", 0)) || 0) + 1), 12000);
        if (e === "ss_shadow" && me.query_temp("zy_shadow_ready")) {
            me.remove_temp("zy_shadow_ready"); target.set_temp("sealed_pfm", 1, v.seal * 1000);
        }
        if (e === "xy_talisman" && inPfm && !target.query_temp("zy_talisman_cd")) {
            target.set_temp("zy_talisman_cd", 1, 8000); var extra = Math.min(Math.floor(me.max_mp * v.extra / 100), Math.floor(dealt * v.cap / 100)); if (extra > 0) target.damage(extra, me, 0);
        } else if (e === "sn_purple" && inPfm && !target.query_temp("zy_purple_cd")) {
            target.set_temp("zy_purple_cd", 1, 9000); var burn = Math.min(Math.floor(me.gj * v.extra / 100), Math.floor(dealt * v.cap / 100)); if (burn > 0) target.damage(burn, me, 0);
        }
    }
    // 由 pfm.js 与 auto_combat.js 在绝招成功后调用；目前没有真意使用（原重剑·崩岳的内伤已随华山改版移除）。
    function onUsePfm(caster) {}
    function onParry(me) {
        var active = getActive(me); if (!active) return;
        if (active.intent.effect === "jz_counter") me.set_temp("zy_counter", 1, 10000);
        else if (active.intent.effect === "zw_borrow") me.set_temp("zy_borrow", Math.min(2, me.query_temp("zy_borrow", 0) + 1), 12000);
        else if (active.intent.effect === "em_wrath" && !me.query_temp("zy_wrath_cd")) me.set_temp("zy_wrath_ready", 1, 6000);
    }
    function onDodge(me) { var active = getActive(me); if (active && (active.intent.effect === "xy_lingbo" || active.intent.effect === "ss_step")) me.set_temp("zy_lingbo", 1, 10000); }
    function modifyDamage(me, from, sh) {
        if (!(sh > 0)) return sh;
        // 试炼化身的机制（护体、破绽等）在真意结算前处理。
        if (me && me.is_zhenyi_trial && me.trial_on_damage) sh = me.trial_on_damage(from, sh);
        var active = getActive(me);
        if (!active || !(sh > 0)) return Math.max(0, sh);
        var e = active.intent.effect, v = active.values, reduction = 0;
        if (e === "jz_wood" && me.query_temp("zy_wood_guard")) reduction = v.reduction / 100;
        else if (e === "zw_yield" && !me.query_temp("zy_yield_cd")) { reduction = v.reduction / 100; me.set_temp("zy_yield_cd", 1, 8000); }
        else if (e === "zw_circle" && me.max_hp) reduction = Math.min(v.cap / 100, Math.max(0, (1 - me.hp / me.max_hp) * v.factor / 100));
        else if (e === "sl_arhat" && me.enemy && me.enemy.length > 1) reduction = Math.min(v.cap / 100, (v.reduction + (me.enemy.length - 2) * v.per_enemy) / 100);
        else if (e === "sn_avatar" && me.query_temp("zy_avatar")) reduction = v.reduction / 100;
        else if (e === "sn_guard" && me.mp > 0) { var convert = Math.min(sh * v.convert / 100, sh * v.cap / 100, me.mp); me.add_mp(-Math.floor(convert)); sh -= convert; }
        sh *= (1 - reduction);
        if (e === "sl_vajra" && sh >= me.hp && me.hp > 1 && !me.query_temp("zy_vajra_cd")) { sh = me.hp - 1; me.set_temp("zy_vajra_cd", 1, 600000); me.notify("<hiy>金刚不坏真意护住你最后一线生机！</hiy>"); }
        // clear_downside(type) 按 downside === type 匹配，不传参数时什么都不会清除。
        else if (e === "zw_wuji" && me.max_hp && (me.hp - sh) / me.max_hp < 0.18 && !me.query_temp("zy_wuji_cd")) { me.set_temp("zy_wuji_cd", 1, 600000); me.do_recover(Math.floor(me.max_hp * v.heal / 100)); me.clear_downside && me.clear_downside(true); }
        if (e === "em_wrath" && me.query_temp("zy_wrath_ready") && from && from.hp > 0 && !me._zy_reflecting) {
            me.remove_temp("zy_wrath_ready"); me.set_temp("zy_wrath_cd", 1, 8000);
            var reflect = Math.min(Math.floor(sh * v.reflect / 100), Math.floor(me.gj * v.cap / 100));
            if (reflect > 0) {
                me._zy_reflecting = true;
                try { from.damage(reflect, me, 0); } finally { me._zy_reflecting = false; }
            }
        }
        return Math.max(0, sh);
    }
    // 无剑·无招：启用期间，需要剑的绝招不再要求手中持剑（任何兵器或空手均可）。其他兵器的绝招不受影响。
    function weaponFree(me, need) {
        if (need !== "sword" || !me) return false;
        var active = getActive(me);
        return !!(active && active.intent.effect === "jz_swordless");
    }
    function onKill(me) { var active = getActive(me); if (active && active.intent.effect === "ss_debt") me.set_temp("zy_debt", 1, 120000); }
    function onCombatEnd(me) {
        clearCombatState(me); me.remove_temp("zy_flying"); me.remove_temp("zy_thunder");
        // 护体与各类运行时标记随战斗结束清理（旧版无剑之境的标记一并清掉）。
        delete me._zy_domain_used; delete me._zy_domain_until; delete me._zy_domain_last;
        delete me._zy_armor; delete me._zy_bind; delete me._zy_rupture; delete me._zy_seal_hits;
    }

    WORLD.ZHENYI = {
        DATA: DATA, FAMILY_TO_KEY: FAMILY_TO_KEY, MAX_LEVEL: MAX_LEVEL, DAILY_LIMIT: DAILY_LIMIT, ENERGY_COST: ENERGY_COST,
        family_data: familyData, find_by_key: findDataByKey, find_intent: findIntent, migrate: migrate,
        public_owner: publicOwner, is_public_owner: function (owner) { return typeof owner === "string" && owner.indexOf("zhenyi_public:") === 0; },
        allow_public_npc: allowPublicNpc, is_trial_owner: isTrialOwner, is_in_trial: isInTrial, trial_stats: trialStats,
        grade_for_level: gradeForLevel, values_for: valuesFor, describe: describeIntent, weapon_free: weaponFree,
        check_unlock: checkUnlock, can_enter_area: canEnterArea, can_enter_hub: canEnterHub, enter_from_hub: enterFromHub,
        HUB_JD: HUB_JD, HUB_AREA: HUB_AREA, migrate_jd_layout: migrateJdLayout,
        grant_timed_buff: grantTimedBuff, restore_timed_buffs: restoreTimedBuffs, get_level: getLevel, get_active: getActive,
        set_active: setActive, forget_family: forgetFamily, serialize: serialize, start_trial: startTrial, ensure_trial_state: ensureTrialState,
        complete_trial: completeTrial, fail_trial: failTrial, finish_trial_action: finishTrialAction,
        confirm_trial: confirmTrial, cancel_trial: cancelTrial, quit_trial: quitTrial, prevent_death: preventDeath,
        configure_trial_room: configureTrialRoom, rehydrate_trial_room: rehydrateTrialRoom, add_material: addMaterial, sweep: sweep,
        request_upgrade: requestUpgrade, confirm_upgrade: confirmUpgrade,
        begin_pfm: beginPfm, pfm_cost: pfmCost, pfm_cooldown: pfmCooldown, end_pfm: endPfm,
        prepare_attack: prepareAttack, modify_attack: modifyAttack, after_attack: afterAttack, on_parry: onParry, on_dodge: onDodge,
        modify_damage: modifyDamage, on_kill: onKill, on_combat_end: onCombatEnd, is_allowed_skill: allowedSkill,
        on_use_pfm: onUsePfm, family_of_key: function (key) { return KEY_TO_FAMILY[key]; },
        trial_hp_scale: trialHpScale,
        puzzle_solved: puzzleSolved, solve_puzzle: solvePuzzle, find_trial: findTrial, start_replay: startReplay, offer_replay: offerReplay,
        offer_sweep: offerSweep, sweep_count_key: sweepCountKey, claim_first_clear_reward: claimFirstClearReward,
        stage_cleared: function (me, key, id) { var d = findDataByKey(key); return !!(d && (d.stages ? stageCleared(me, d, id) : getLevel(me, key, id) > 0)); }, puzzle_gate: puzzleGate, puzzle_command: puzzleCommand,
        level_grades: LEVEL_GRADES, gm_bypass: gmBypass, clear_trial_temps: clearTrialTemps,
        keys: { acquired: acquiredKey, level: levelKey, clear: clearKey, daily: dailyKey, puzzle: puzzleKey }
    };
})();
