// 炼药系统唯一数据源：丹方、丹药效果、学习丹方的条件与炼丹的材料。
// 数据来自《丹方（橙色齐）.xlsx》：5 个品级（绿 1 / 蓝 2 / 黄 3 / 紫 4 / 橙 5）各 23 种丹药，共 115 种。
// 表里写了材料的投放顺序，这里简化为「材料够、学会了丹方」就能炼，只记每种材料的数量。
// 物品路径：丹药 drug/dan#<id>，丹方 book/danfang#<id>。
(function () {
    // 每种效果对应的丹药名（同一效果各品级同名，靠颜色区分品级）
    var NAMES = {
        heal_hp: "大还丹", heal_mp: "无常丹", gj_per: "大力丸", mz_per: "凝神丹", zj_per: "归心散", fy_per: "石龟丹",
        ds_per: "风行散", bj_per: "风雷丹", add_bjsh_per: "赤火丹", add_sh_per: "赤血丹", diff_sh_per: "玄武丹",
        diff_fy_per: "破军丹", gjsd_per: "风神丹", expend_mp_per: "生机丸", releasetime_per: "玄冰丹", distime_per: "玄灵丹",
        busy_per: "归元散", diff_busy_per: "风行丹", diff_downside_per: "造化丹", study_per: "清心丹", lianxi_per: "冰心丹",
        dazuo_per: "蕴象丹", breakthrough: "突破丹"
    };
    var PROP_TEXT = {
        gj_per: "攻击", mz_per: "命中", zj_per: "招架", fy_per: "防御", ds_per: "躲闪", bj_per: "暴击",
        add_bjsh_per: "暴击伤害", add_sh_per: "最终伤害", diff_sh_per: "伤害减免", diff_fy_per: "忽视防御",
        gjsd_per: "攻击速度", expend_mp_per: "内力消耗降低", releasetime_per: "绝招释放速度", distime_per: "绝招冷却缩短",
        busy_per: "忙乱时间", diff_busy_per: "忽视忙乱", diff_downside_per: "负面状态抵抗",
        study_per: "学习效率", lianxi_per: "练习效率", dazuo_per: "打坐效率"
    };
    // 学会丹方需要的炼药术等级（grade 6 暂无丹药，先留好）
    var LEARN_LEVEL = [0, 300, 500, 800, 1500, 3000, 4000];
    // 战斗属性丹药的持续时间（分钟），按品级；学习、练习、打坐类一律 60 分钟
    var BUFF_MINUTES = [0, 3, 4, 5, 10, 15, 15];
    var STUDY_PROPS = { study_per: 1, lianxi_per: 1, dazuo_per: 1 };
    var GRADE_TEXT = ["", "绿色", "蓝色", "黄色", "紫色", "橙色", "红色"];
    // 每颗丹药的价值：不超过同品级药材的价值（res/cao、res/yu：绿 20 / 蓝 50 / 黄 100 / 紫 200 / 橙 500 / 红 1000）
    var DAN_VALUE = [0, 20, 50, 100, 200, 500, 1000];

    // [id, 品级, 效果, 数值(%), {材料路径: 数量}]
    // 风神丹（攻速）按表削弱：绿 5 / 蓝 10 / 黄 15 / 紫 20，橙 30 不变
    var RAW = [
        [1, 1, "heal_hp", 5, {"res/cao#4":1,"res/cao#3":3,"res/cao#0":1}],
        [2, 1, "gj_per", 3, {"res/cao#2":2,"res/cao#0":2,"res/cao#3":1}],
        [3, 1, "mz_per", 3, {"res/cao#0":1,"res/cao#5":3,"res/cao#1":1}],
        [4, 1, "zj_per", 3, {"res/cao#1":1,"res/cao#2":1,"res/cao#5":3}],
        [5, 1, "fy_per", 3, {"res/cao#2":2,"res/cao#1":1,"res/cao#5":1,"res/cao#4":1}],
        [6, 1, "ds_per", 3, {"res/cao#0":1,"res/cao#5":1,"res/cao#1":2,"res/cao#3":1}],
        [7, 1, "bj_per", 3, {"res/cao#4":2,"res/cao#1":1,"res/cao#5":1,"res/cao#3":1}],
        [8, 1, "add_bjsh_per", 5, {"res/cao#5":1,"res/cao#2":2,"res/cao#4":1,"res/cao#3":1}],
        [9, 1, "add_sh_per", 3, {"res/cao#4":1,"res/cao#5":1,"res/cao#2":3}],
        [10, 1, "diff_sh_per", 3, {"res/cao#4":3,"res/cao#1":1,"res/yu#0":1}],
        [11, 1, "diff_fy_per", 3, {"res/cao#3":2,"res/cao#5":1,"res/cao#0":1,"res/yu#1":1}],
        [12, 1, "gjsd_per", 5, {"res/cao#3":3,"res/cao#0":1,"res/cao#4":1}],
        [13, 1, "expend_mp_per", 3, {"res/cao#3":2,"res/cao#2":1,"res/cao#4":2}],
        [14, 1, "releasetime_per", 3, {"res/cao#2":1,"res/cao#0":1,"res/cao#5":1,"res/cao#1":1,"res/cao#4":1}],
        [15, 1, "distime_per", 3, {"res/cao#1":2,"res/cao#4":1,"res/cao#5":2}],
        [16, 1, "busy_per", 5, {"res/cao#5":3,"res/cao#4":2}],
        [17, 1, "diff_busy_per", 5, {"res/cao#0":1,"res/cao#1":1,"res/cao#2":1,"res/cao#3":2}],
        [18, 1, "diff_downside_per", 5, {"res/cao#2":3,"res/cao#0":1,"res/cao#1":1}],
        [19, 1, "heal_mp", 5, {"res/cao#1":2,"res/cao#4":1,"res/cao#3":2}],
        [20, 1, "study_per", 10, {"res/cao#2":2,"res/cao#4":1,"res/cao#5":1,"res/cao#1":1}],
        [21, 1, "lianxi_per", 10, {"res/cao#0":2,"res/cao#3":2,"res/cao#1":1}],
        [22, 1, "dazuo_per", 10, {"res/cao#0":1,"res/cao#4":1,"res/cao#5":1,"res/cao#2":1,"res/cao#3":1}],
        [23, 1, "breakthrough", 0, {"res/cao#0":1,"res/cao#1":1,"res/cao#2":1,"res/yu#2":1,"res/cao#3":1,"res/cao#4":1,"res/cao#5":1,"res/yu#14":1}],
        [24, 2, "heal_hp", 15, {"res/cao#5":2,"res/cao#6":1,"res/cao#4":2,"res/cao#8":1}],
        [25, 2, "gj_per", 5, {"res/cao#8":1,"res/yu#7":1,"res/cao#3":1,"res/cao#6":2,"res/cao#5":1}],
        [26, 2, "mz_per", 5, {"res/cao#7":1,"res/cao#6":2,"res/cao#3":2,"res/yu#7":1}],
        [27, 2, "zj_per", 5, {"res/cao#3":2,"res/cao#6":1,"res/cao#7":1,"res/cao#8":1,"res/cao#4":1}],
        [28, 2, "fy_per", 5, {"res/cao#5":1,"res/cao#3":1,"res/cao#7":1,"res/cao#8":2,"res/cao#6":1}],
        [29, 2, "ds_per", 5, {"res/cao#3":1,"res/cao#5":1,"res/cao#8":1,"res/cao#7":2,"res/cao#4":1}],
        [30, 2, "bj_per", 5, {"res/cao#7":2,"res/cao#6":2,"res/cao#5":1,"res/cao#4":1}],
        [31, 2, "add_bjsh_per", 10, {"res/cao#8":2,"res/cao#5":1,"res/cao#7":1,"res/cao#3":1,"res/cao#6":1}],
        [32, 2, "add_sh_per", 5, {"res/cao#8":2,"res/cao#3":1,"res/yu#7":1,"res/yu#3":1,"res/cao#5":1}],
        [33, 2, "diff_sh_per", 5, {"res/cao#4":2,"res/cao#7":2,"res/cao#5":1,"res/yu#5":1}],
        [34, 2, "diff_fy_per", 5, {"res/cao#4":1,"res/cao#8":1,"res/cao#6":1,"res/cao#5":1,"res/yu#6":1,"res/yu#4":1}],
        [35, 2, "gjsd_per", 10, {"res/cao#7":1,"res/cao#5":1,"res/cao#8":2,"res/cao#3":2}],
        [36, 2, "expend_mp_per", 5, {"res/cao#8":2,"res/cao#7":2,"res/cao#6":2}],
        [37, 2, "releasetime_per", 5, {"res/cao#5":2,"res/cao#6":1,"res/cao#4":1,"res/yu#6":1,"res/cao#8":1}],
        [38, 2, "distime_per", 5, {"res/cao#4":2,"res/cao#5":1,"res/cao#6":1,"res/cao#3":2}],
        [39, 2, "busy_per", 10, {"res/cao#5":3,"res/cao#8":1,"res/cao#3":1,"res/cao#6":1}],
        [40, 2, "diff_busy_per", 10, {"res/cao#3":1,"res/cao#4":3,"res/cao#8":1,"res/cao#7":1}],
        [41, 2, "diff_downside_per", 10, {"res/cao#7":1,"res/yu#7":1,"res/cao#8":2,"res/cao#6":1,"res/yu#8":1}],
        [42, 2, "heal_mp", 15, {"res/cao#3":3,"res/cao#8":1,"res/cao#4":2}],
        [43, 2, "study_per", 20, {"res/cao#5":2,"res/cao#8":1,"res/cao#6":1,"res/cao#4":1,"res/cao#3":1}],
        [44, 2, "lianxi_per", 20, {"res/cao#7":2,"res/cao#8":1,"res/cao#4":2,"res/cao#6":1}],
        [45, 2, "dazuo_per", 20, {"res/cao#5":1,"res/cao#3":2,"res/cao#7":2,"res/cao#6":1}],
        [46, 2, "breakthrough", 0, {"res/cao#4":2,"res/cao#8":2,"res/cao#7":2,"res/yu#12":1,"res/yu#5":1}],
        [47, 3, "heal_hp", 20, {"res/cao#10":1,"res/cao#6":2,"res/cao#11":2,"res/cao#8":1,"res/cao#9":1}],
        [48, 3, "gj_per", 10, {"res/cao#6":2,"res/cao#8":2,"res/cao#10":1,"res/cao#11":1,"res/yu#7":1}],
        [49, 3, "mz_per", 10, {"res/cao#7":1,"res/cao#11":1,"res/cao#9":3,"res/yu#8":1,"res/cao#6":1}],
        [50, 3, "zj_per", 10, {"res/cao#6":3,"res/cao#7":1,"res/cao#10":2,"res/cao#9":1}],
        [51, 3, "fy_per", 10, {"res/cao#7":1,"res/cao#8":1,"res/cao#6":1,"res/cao#11":2,"res/cao#10":2}],
        [52, 3, "ds_per", 10, {"res/cao#11":2,"res/cao#6":1,"res/cao#10":2,"res/cao#8":1,"res/cao#7":1}],
        [53, 3, "bj_per", 10, {"res/cao#11":3,"res/cao#9":1,"res/cao#8":1,"res/cao#7":2}],
        [54, 3, "add_bjsh_per", 20, {"res/cao#8":2,"res/cao#9":1,"res/cao#10":1,"res/cao#7":2,"res/cao#11":1}],
        [55, 3, "add_sh_per", 10, {"res/cao#6":1,"res/cao#10":1,"res/yu#9":1,"res/yu#10":1,"res/cao#7":1,"res/cao#9":1,"res/cao#11":1}],
        [56, 3, "diff_sh_per", 10, {"res/cao#9":3,"res/cao#10":1,"res/cao#11":1,"res/cao#6":2}],
        [57, 3, "diff_fy_per", 10, {"res/cao#8":2,"res/cao#6":1,"res/yu#8":1,"res/cao#9":1,"res/yu#10":1,"res/cao#7":1}],
        [58, 3, "gjsd_per", 15, {"res/cao#7":4,"res/cao#9":1,"res/cao#11":2}],
        [59, 3, "expend_mp_per", 10, {"res/cao#9":2,"res/cao#6":1,"res/cao#10":1,"res/cao#8":1,"res/cao#11":1,"res/cao#7":1}],
        [60, 3, "releasetime_per", 10, {"res/cao#8":2,"res/cao#6":2,"res/cao#10":1,"res/cao#9":1,"res/yu#7":1}],
        [61, 3, "distime_per", 10, {"res/cao#10":2,"res/cao#11":3,"res/cao#8":1,"res/cao#7":1}],
        [62, 3, "busy_per", 20, {"res/cao#7":2,"res/cao#10":2,"res/cao#8":2,"res/cao#6":1}],
        [63, 3, "diff_busy_per", 20, {"res/cao#8":1,"res/cao#11":1,"res/cao#6":3,"res/cao#10":1,"res/cao#9":1}],
        [64, 3, "diff_downside_per", 20, {"res/cao#11":1,"res/cao#7":1,"res/cao#6":1,"res/cao#8":1,"res/yu#6":1,"res/cao#9":1,"res/yu#8":1}],
        [65, 3, "heal_mp", 20, {"res/cao#7":3,"res/cao#11":1,"res/cao#10":1,"res/cao#8":2}],
        [66, 3, "study_per", 30, {"res/cao#8":1,"res/cao#6":1,"res/cao#9":1,"res/cao#10":1,"res/cao#7":2,"res/cao#11":1}],
        [67, 3, "lianxi_per", 30, {"res/cao#6":1,"res/cao#7":2,"res/cao#10":1,"res/cao#9":1,"res/cao#11":1,"res/cao#8":1}],
        [68, 3, "dazuo_per", 30, {"res/cao#7":2,"res/cao#10":2,"res/cao#6":1,"res/cao#9":1,"res/cao#8":1}],
        [69, 3, "breakthrough", 0, {"res/cao#6":3,"res/yu#8":1,"res/cao#11":1,"res/yu#11":1,"res/cao#9":1,"res/yu#13":1,"res/cao#10":1}],
        [70, 4, "heal_hp", 40, {"res/cao#9":3,"res/cao#14":1,"res/cao#11":1,"res/cao#12":2,"res/cao#10":1}],
        [71, 4, "gj_per", 15, {"res/cao#9":2,"res/cao#12":1,"res/cao#13":1,"res/yu#13":1,"res/cao#14":1,"res/cao#10":1,"res/yu#14":1}],
        [72, 4, "mz_per", 15, {"res/cao#13":1,"res/cao#12":3,"res/cao#9":1,"res/cao#14":1,"res/yu#12":1,"res/cao#11":1}],
        [73, 4, "zj_per", 15, {"res/cao#13":2,"res/cao#9":4,"res/cao#12":1,"res/cao#10":1}],
        [74, 4, "fy_per", 15, {"res/cao#12":2,"res/cao#9":1,"res/cao#13":2,"res/cao#11":1,"res/cao#14":2}],
        [75, 4, "ds_per", 15, {"res/cao#13":2,"res/cao#12":2,"res/cao#10":3,"res/cao#14":1}],
        [76, 4, "bj_per", 10, {"res/cao#12":2,"res/cao#10":1,"res/cao#11":2,"res/cao#14":1,"res/yu#14":1,"res/cao#13":1}],
        [77, 4, "add_bjsh_per", 20, {"res/cao#13":3,"res/cao#11":2,"res/cao#14":1,"res/yu#13":1,"res/cao#12":1}],
        [78, 4, "add_sh_per", 15, {"res/cao#14":1,"res/cao#9":1,"res/yu#14":1,"res/cao#10":2,"res/yu#10":1,"res/cao#11":1,"res/yu#11":1}],
        [79, 4, "diff_sh_per", 10, {"res/yu#12":1,"res/cao#9":5,"res/cao#11":1,"res/cao#10":1}],
        [80, 4, "diff_fy_per", 15, {"res/cao#12":1,"res/cao#14":1,"res/cao#9":2,"res/cao#11":1,"res/yu#9":1,"res/yu#12":1,"res/cao#13":1}],
        [81, 4, "gjsd_per", 20, {"res/cao#12":1,"res/cao#11":3,"res/cao#9":1,"res/cao#13":3}],
        [82, 4, "expend_mp_per", 15, {"res/cao#10":3,"res/cao#13":2,"res/cao#12":2,"res/cao#9":1}],
        [83, 4, "releasetime_per", 15, {"res/cao#10":2,"res/cao#12":2,"res/cao#9":2,"res/yu#9":1,"res/cao#11":1}],
        [84, 4, "distime_per", 15, {"res/cao#12":1,"res/cao#13":1,"res/yu#14":1,"res/cao#11":4,"res/yu#11":1}],
        [85, 4, "busy_per", 20, {"res/cao#12":1,"res/cao#9":1,"res/cao#11":2,"res/yu#12":1,"res/cao#10":2,"res/cao#14":1}],
        [86, 4, "diff_busy_per", 20, {"res/cao#14":3,"res/cao#13":1,"res/cao#10":2,"res/cao#9":1,"res/cao#12":1}],
        [87, 4, "diff_downside_per", 20, {"res/cao#9":1,"res/cao#10":2,"res/cao#11":2,"res/cao#13":1,"res/yu#9":1,"res/yu#11":1}],
        [88, 4, "heal_mp", 40, {"res/cao#14":4,"res/cao#11":2,"res/cao#10":1,"res/cao#9":1}],
        [89, 4, "study_per", 40, {"res/cao#10":1,"res/cao#9":2,"res/cao#11":1,"res/cao#12":2,"res/cao#13":1,"res/cao#14":1}],
        [90, 4, "lianxi_per", 40, {"res/cao#12":2,"res/cao#13":1,"res/cao#14":3,"res/cao#11":1,"res/cao#10":1}],
        [91, 4, "dazuo_per", 40, {"res/cao#12":2,"res/cao#14":1,"res/cao#10":2,"res/cao#13":2,"res/cao#9":1}],
        [92, 4, "breakthrough", 0, {"res/cao#10":2,"res/cao#9":1,"res/yu#10":2,"res/yu#11":1,"res/cao#11":1,"res/cao#13":1,"res/cao#14":1,"res/yu#14":1}],
        [93, 5, "heal_hp", 50, {"res/cao#13":2,"res/cao#15":2,"res/cao#16":2,"res/cao#14":2,"res/cao#12":1}],
        [94, 5, "heal_mp", 50, {"res/cao#15":4,"res/cao#14":2,"res/cao#17":1,"res/cao#12":1,"res/cao#13":1}],
        [95, 5, "gj_per", 20, {"res/cao#13":1,"res/cao#14":1,"res/cao#16":2,"res/yu#16":1,"res/cao#12":3,"res/cao#17":1}],
        [96, 5, "fy_per", 20, {"res/cao#17":1,"res/cao#12":3,"res/cao#14":1,"res/cao#13":2,"res/cao#16":2}],
        [97, 5, "mz_per", 20, {"res/cao#17":1,"res/cao#16":3,"res/cao#13":1,"res/cao#15":1,"res/cao#14":2,"res/yu#13":1}],
        [98, 5, "zj_per", 20, {"res/cao#17":3,"res/cao#15":1,"res/cao#14":3,"res/cao#16":1,"res/cao#13":1}],
        [99, 5, "ds_per", 20, {"res/cao#17":1,"res/cao#15":2,"res/cao#16":2,"res/cao#13":1,"res/cao#12":1,"res/cao#14":1,"res/yu#17":1}],
        [100, 5, "dazuo_per", 50, {"res/cao#15":1,"res/cao#12":1,"res/cao#13":2,"res/cao#16":2,"res/cao#14":2,"res/cao#17":1}],
        [101, 5, "study_per", 50, {"res/cao#13":3,"res/cao#14":2,"res/cao#17":2,"res/cao#16":1,"res/cao#12":1}],
        [102, 5, "lianxi_per", 50, {"res/cao#15":3,"res/cao#16":2,"res/cao#17":2,"res/cao#12":1,"res/cao#14":1}],
        [103, 5, "releasetime_per", 20, {"res/cao#15":2,"res/cao#17":3,"res/cao#14":1,"res/cao#13":2,"res/yu#14":1}],
        [104, 5, "distime_per", 30, {"res/cao#17":1,"res/cao#12":3,"res/yu#16":1,"res/cao#16":1,"res/cao#15":1,"res/cao#14":1,"res/yu#13":1}],
        [105, 5, "expend_mp_per", 35, {"res/cao#15":2,"res/cao#16":1,"res/cao#13":1,"res/cao#17":2,"res/cao#14":2,"res/cao#12":1}],
        [106, 5, "bj_per", 20, {"res/cao#14":1,"res/cao#13":3,"res/cao#17":2,"res/yu#14":1,"res/yu#16":1,"res/cao#12":1}],
        [107, 5, "gjsd_per", 30, {"res/cao#12":3,"res/cao#15":2,"res/cao#14":2,"res/cao#13":1,"res/cao#16":1}],
        [108, 5, "add_bjsh_per", 30, {"res/cao#13":2,"res/cao#16":3,"res/cao#14":2,"res/cao#12":1,"res/cao#17":1}],
        [109, 5, "add_sh_per", 20, {"res/cao#14":3,"res/yu#13":1,"res/yu#15":1,"res/cao#17":1,"res/cao#16":1,"res/cao#13":1,"res/yu#17":1}],
        [110, 5, "diff_fy_per", 30, {"res/cao#15":2,"res/yu#13":1,"res/cao#16":1,"res/cao#12":2,"res/yu#15":1,"res/cao#17":1,"res/yu#17":1}],
        [111, 5, "diff_sh_per", 20, {"res/cao#17":2,"res/cao#16":2,"res/yu#15":1,"res/yu#16":1,"res/cao#15":2,"res/yu#17":1}],
        [112, 5, "busy_per", 40, {"res/cao#15":3,"res/cao#17":1,"res/yu#12":1,"res/cao#13":2,"res/yu#13":1,"res/cao#16":1}],
        [113, 5, "diff_busy_per", 30, {"res/cao#13":2,"res/cao#15":2,"res/cao#17":2,"res/cao#12":1,"res/cao#16":1,"res/yu#12":1}],
        [114, 5, "diff_downside_per", 30, {"res/cao#16":2,"res/yu#15":1,"res/cao#14":1,"res/yu#14":1,"res/cao#17":2,"res/cao#12":1,"res/cao#15":1}],
        [115, 5, "breakthrough", 0, {"res/cao#15":1,"res/cao#16":1,"res/cao#17":1,"res/yu#15":1,"res/yu#16":1,"res/yu#17":1,"res/yu#12":1,"res/cao#13":1,"res/cao#14":1,"res/cao#12":1}]
    ];
    var RECIPES = {}, LIST = [];
    RAW.forEach(function (r) {
        var rec = { id: r[0], grade: r[1], prop: r[2], value: r[3], mats: r[4], name: NAMES[r[2]] };
        RECIPES[rec.id] = rec;
        LIST.push(rec);
    });

    function get(id) { return RECIPES[parseInt(id)] || null; }
    function buff_minutes(rec) { return STUDY_PROPS[rec.prop] ? 60 : BUFF_MINUTES[rec.grade]; }
    // 丹药效果的文字说明（只写实际数值）
    function effect_text(rec) {
        if (rec.prop === "heal_hp") return "立即恢复" + rec.value + "%最大气血";
        if (rec.prop === "heal_mp") return "立即恢复" + rec.value + "%最大内力";
        if (rec.prop === "breakthrough") return "随机一门品级不高于" + GRADE_TEXT[rec.grade] + "的已学技能提升1～3级";
        return buff_minutes(rec) + "分钟内" + PROP_TEXT[rec.prop] + "+" + rec.value + "%";
    }
    function material_text(rec) {
        var out = [];
        for (var p in rec.mats) {
            var o = OBJ.CREATE(p);
            out.push((o ? o.color_name : p) + "×" + rec.mats[p]);
        }
        return out.join("、");
    }

    // ===== 已学丹方（存在会存档的 temp 上）=====
    function known_list(me) { var v = me.query_temp && me.query_temp("lianyao_known"); return Array.isArray(v) ? v : []; }
    function knows(me, id) { return known_list(me).indexOf(parseInt(id)) >= 0; }
    function learn_level(grade) { return LEARN_LEVEL[grade] || 0; }
    // 学丹方：返回 null 表示成功，否则返回失败原因
    function learn(me, id) {
        var rec = get(id);
        if (!rec) return "这张丹方残缺不全，看不出炼的是什么。";
        if (knows(me, rec.id)) return "你已经会炼制" + GRADE_TEXT[rec.grade] + rec.name + "了。";
        var need = learn_level(rec.grade), lv = me.query_skill("lianyao", 0);
        if (lv < need) return "这张丹方太过深奥，需要炼药术" + need + "级才能看懂（你现在" + lv + "级）。";
        var list = known_list(me).slice();
        list.push(rec.id);
        list.sort(function (a, b) { return a - b; });
        me.set_temp("lianyao_known", list);
        return null;
    }

    // ===== 材料 =====
    function count_item(me, path) {
        var n = 0;
        for (var i = 0; me.items && i < me.items.length; i++) {
            var it = me.items[i];
            if (it && it.path === path) n += it.count || 1;
        }
        return n;
    }
    // 炼药的「主人」：玩家自己；随从代炼时是它的主人（丹方按主人学会的算）
    function owner_of(me) {
        if (!me) return null;
        if (me.is_player) return me;
        if (me.listener && me.listener.is_player) return me.listener;
        for (var i = 0; WORLD.USERS && i < WORLD.USERS.length; i++) if (WORLD.USERS[i] && WORLD.USERS[i].id === me.master) return WORLD.USERS[i];
        return null;
    }
    // 测试号（及测试号的随从）炼药不需要也不消耗材料
    function free_materials(owner) { return !!(owner && owner.is_test_char && owner.is_test_char()); }
    // 能炼几份（只看 me 背包里的材料）；free 为真时不需要材料
    function craftable(me, rec, free) {
        if (free) return Infinity;
        var n = Infinity;
        for (var p in rec.mats) n = Math.min(n, Math.floor(count_item(me, p) / rec.mats[p]));
        return n === Infinity ? 0 : n;
    }
    function consume(me, rec, free) {
        if (free) return true;
        if (craftable(me, rec) < 1) return false;
        for (var p in rec.mats) {
            var left = rec.mats[p];
            for (var i = me.items.length - 1; i >= 0 && left > 0; i--) {
                var it = me.items[i];
                if (!it || it.path !== p) continue;
                var take = Math.min(left, it.count || 1);
                me.remove_obj(it, take);
                left -= take;
            }
        }
        return true;
    }

    // 炼一颗丹的间隔（毫秒）：基础 10 秒，炼药效率每点加快 10%，最快 3 秒
    function craft_interval(me) {
        var eff = Math.max(0, me.query_prop ? me.query_prop("lianyao1") || 0 : 0);
        return Math.max(3000, Math.round(10000 / (1 + eff / 10)));
    }

    WORLD.LIANYAO = {
        RECIPES: RECIPES, LIST: LIST, GRADE_TEXT: GRADE_TEXT, DAN_VALUE: DAN_VALUE,
        get: get, effect_text: effect_text, material_text: material_text, buff_minutes: buff_minutes,
        known_list: known_list, knows: knows, learn: learn, learn_level: learn_level,
        count_item: count_item, craftable: craftable, consume: consume, free_materials: free_materials, owner_of: owner_of,
        craft_interval: craft_interval
    };
})();
