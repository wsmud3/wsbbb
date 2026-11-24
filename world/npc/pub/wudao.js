this.inherits(NPC);
this.set({
    name: "",
    desc: "他是武道塔的神秘守护者",
    title: "武道塔守护者",
    gender: 1,
    age: 25,
    per: this.random(44),
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    no_refresh: true,
    no_fight: true
});

// ==================== 武道塔守护者数值 ====================
// 原框架的武道塔公式没有和任何内容对过数（框架里没有副本），复原后远弱于官方服。这里按玩家进度标定
// （用户口述：武士打过前 10 层、武师前 30 层、宗师 60~70 层、武圣 89 层、接近武帝有血刀后 99 层），
// 并以仓库里按攻略标好的副本首领为参照：
//   30 层 ≈ 华山田伯光/嵩山左冷禅，65 层 ≈ 黄药师/欧阳锋/谢逊，89 层 ≈ 李秋水/枯荣，90~99 层 ≈ 杨过/王重阳。
// 标定点之间按几何插值（每层都比上一层强）；90 层起进入新阶段（数值跳一档，且免疫控制）。
// 五项战斗属性直接由曲线给出，技能（skills_def）只负责招式与绝招；防御 = 攻击 × 0.3。
//                    层   攻击     命中     闪避/招架   气血
var WD_ANCHORS = [
    [1,    260,     260,     300,       1250],
    [10,   1500,    1500,    1000,      30000],
    [30,   10000,   18000,   6000,      100000],
    [65,   35000,   33000,   20000,     700000],
    [89,   50000,   95000,   35000,     900000],
    [90,   60000,   100000,  40000,     1300000],
    [99,   60000,   120000,  50000,     1300000],
];
function wd_interp(level, col) {
    var a = WD_ANCHORS;
    if (level <= a[0][0]) return a[0][col];
    for (var i = 1; i < a.length; i++) {
        if (level <= a[i][0]) {
            var l0 = a[i - 1][0], l1 = a[i][0], v0 = a[i - 1][col], v1 = a[i][col];
            if (l1 === l0) return v1;
            return Math.round(v0 * Math.pow(v1 / v0, (level - l0) / (l1 - l0)));   // 几何插值
        }
    }
    return a[a.length - 1][col];
}
// 攻击系数：标定点里的攻击按「写死面板」的高气血玩家定的；按真实构造的玩家（模拟器 REALM 模式）复核后整体下调。
// 防御仍按下调前的攻击 ×0.3，不让守护者跟着变脆。第一百层/上五层（wudao_boss100）共用这个系数。
var WD_GJ_SCALE = 0.5;
this.WD_GJ_SCALE = WD_GJ_SCALE;
this.wd_stats = function (level) {
    var gj = wd_interp(level, 1);
    return { gj: Math.round(gj * WD_GJ_SCALE), mz: wd_interp(level, 2), ds: wd_interp(level, 3), zj: wd_interp(level, 3), fy: Math.round(gj * 0.3), hp: wd_interp(level, 4) };
};
this.init_from = function (player, level) {
    level = Math.max(1, Math.min(99, parseInt(level) || 1));   // 第一百层及以上由 wudao_boss100 负责
    this.con = this.dex = this.int = this.str = 20 + parseInt(level / 3);
    const grade1 = Math.floor(level / 10);
    this.name = UTIL.random_name(this.gender);
    this.skill_map.apply(this, this.skills_def[Math.min(grade1, this.skills_def.length - 1)]);
    var color = ["hig", "hic", "hiy", "hiz", "hio", "ord"][Math.min(parseInt(level / 20), 5)];
    this.title = "<" + color + ">武道塔守护者</" + color + ">";
    this.set_objects(['eq/lv0/cloth', 1, 1], ["eq/lv0/jian", 1, 1]);
    this.init();
    this.recount();

    var st = this.wd_stats(level);
    // 直接写五项战斗属性：NPC 重算时把它们当基础值，之后的增益/减益照常叠加
    this.gj = st.gj; this.mz = st.mz; this.ds = st.ds; this.zj = st.zj; this.fy = st.fy;
    this.hp = this.max_hp = st.hp;
    this.mp = this.max_mp = parseInt(this.hp / 2);
    if (level >= 90) this.add_prop("ig_control", 1);   // 90~99 层免疫控制（忙乱/昏迷/致盲/定身）
    this.recount();
}


this.skills_def = [
    [
        ["force", 100], ["unarmed", 100], ["sword", 100], ["parry", 100], ["dodge", 100],
        ["hunyuanyiqi", 100, "force"], ["wudangchangquan", 100, "unarmed"], ["huashanshenfa", 100, "dodge"],
        ["wudangjianfa", 100, "sword"], ["zhemeishou", 100, "parry"]
    ],
    [
        ["force", 300], ["unarmed", 300], ["sword", 300], ["parry", 300], ["dodge", 300],
        ["zixiashengong", 300, "force"], ["taizuchangquan", 300, "unarmed"],
        ["yunlongjian", 300, "sword"], ["taijiquan", 300, "parry"], ["sixiangbu", 300, "dodge"],
    ],
    [
        ["force", 500], ["unarmed", 500], ["sword", 500], ["parry", 500], ["dodge", 500],
        ["taijishengong", 500, "force"], ["qishangquan", 500, "unarmed"],
        ["kuangfengkuaijian", 500, "sword"], ["taijiquan", 500, "parry"], ["tiyunzong", 500, "dodge"],
    ],
    [
        ["force", 800], ["unarmed", 800], ["sword", 800], ["parry", 800], ["dodge", 800],
        ["yijinjing", 800, "force"], ["yiyangzhi", 800, "unarmed"],
        ["taijijian", 800, "sword"], ["dugujiujian", 800, "parry"], ["wuduyanluobu", 800, "dodge"],
    ],
    [
        ["force", 1100], ["unarmed", 1100], ["sword", 1100], ["parry", 1100], ["dodge", 1100],
        ["mingyugong", 1100, ["force", "dodge"]], ["yiyangzhi", 1100, "unarmed"],
        ["yitianjianfa", 1100, "sword"], ["yihuajiemu", 1100, "parry"]
    ],
        [
            ["force", 1400], ["unarmed", 1400], ["sword", 1400], ["parry", 1400], ["dodge", 1400],
            ["hamagong", 1400, "force"], ["tanzhishengong", 1400, "unarmed"],
            ["kuangfengkuaijian2", 1400, "sword"], ["taijiquan", 1400, "parry"], ["kuihuashengong", 1400, "dodge"],
        ],
        [
            ["force", 1700], ["unarmed", 1700], ["sword", 1700], ["parry", 1700], ["dodge", 1700],
            ["kuihuashengong", 1700, ["force", "dodge"]], ["cuixinzhang2", 1700, "unarmed"],
            ["bixiejianfa", 1700, ["sword", "parry"]]
        ],
        [
            ["force", 2000], ["unarmed", 2000], ["sword", 2000], ["parry", 2000], ["dodge", 2000],
            ["jiuyangshengong", 2000, "force"], ["chuanxinzhang2", 2000, "unarmed"],
            ["dugujiujian", 2000, "sword"], ["taijiquan", 2000, "parry"], ["kuihuashengong", 2000, "dodge"],
        ],
        [
            ["force", 2500], ["unarmed", 2500], ["sword", 2500], ["parry", 2500], ["dodge", 2500],
            ["taixuangong", 2500, "force"], ["xianglongzhang2", 2500, "unarmed"],
            ["qixianwuxingjian", 2500, "sword"], ["taijiquan", 2500, "parry"], ["xuanxubu", 2500, "dodge"],
        ],
        [
            ["force", 3000], ["unarmed", 3000], ["sword", 3000], ["parry", 3000], ["dodge", 3000],
            ["jiuyinshengong", 3000, "force"], ["jiuyinbaiguzhao2", 3000, "unarmed"],
            ["taijijian", 3000, "sword"], ["qiankundanuoyi", 3000, "parry"], ["lingboweibu2", 3000, "dodge"],
        ],
        [   // 100 层（原版）
            ["force", 4000], ["unarmed", 4000], ["sword", 4000], ["parry", 4000], ["dodge", 4000],
            ["jiuyangshengong", 5000, "force"], ["liumaishenjian", 5000, "unarmed"],
            ["xuantiejianfa", 5000, "sword"], ["qiankundanuoyi", 5000, "parry"], ["lingboweibu2", 5000, "dodge"],
        ]
    ];
