// 山外山守护者：按挑战者进本时的基准属性（sws_base）乘层数系数缩放，
// 层数没有上限；技能组沿用武道塔守护者的分级表，等级随层数缓升。
this.inherits(NPC);
this.set({
    name: "",
    desc: "山外山的守护者，身形隐在山岚之中，唯有一双眼睛亮如寒星。",
    title: "山外山守护者",
    gender: 1,
    age: 30,
    per: this.random(44),
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    no_refresh: true,
    no_fight: true
});

var SWS_COLORS = ["hig", "hic", "hiy", "hiz", "hio", "ord", "hir"];

this.init_from = function (player, layer) {
    var base = player.query_temp("sws_base");
    if (!base || !base.hp) {
        base = {
            hp: player.max_hp, gj: player.gj, fy: player.fy,
            mz: player.mz, ds: player.ds, zj: player.zj
        };
    }
    this.con = this.dex = this.int = this.str = 100 + layer * 20;
    this.name = UTIL.random_name(this.gender);
    var tier = parseInt((layer - 1) / 5);
    if (tier > SWS_COLORS.length - 1) tier = SWS_COLORS.length - 1;
    var color = SWS_COLORS[tier];
    this.title = "<" + color + ">山外山·第" + UTIL.to_c(layer) + "层守护者</" + color + ">";

    var grade = parseInt((layer - 1) / 3);
    if (grade > this.skills_def.length - 1) grade = this.skills_def.length - 1;
    var sklv = 500 + layer * 50;
    if (sklv > 5000) sklv = 5000;
    this.skill_map.apply(this, this.skills_def[grade]);
    this.set_objects(['eq/lv0/cloth', 1, 1], ["eq/lv0/jian", 1, 1]);

    this.init();
    this.recount();

    // 以挑战者进本基准值缩放（层数无上限），并压低暴击成长
    this.max_hp = this.hp = parseInt(base.hp * (2.2 + layer * 0.4));
    this.max_mp = this.mp = parseInt(this.max_hp / 2);
    this.gj = parseInt(base.gj * (1.05 + layer * 0.12));
    this.fy = parseInt(base.fy * (0.5 + layer * 0.12));
    this.mz = parseInt(base.mz * (0.9 + layer * 0.08));
    this.ds = parseInt(base.ds * (0.4 + layer * 0.08));
    this.zj = parseInt(base.zj * (0.4 + layer * 0.08));
    this.bj = parseInt(layer / 4);
    if (this.bj > 45) this.bj = 45;
};

this.skills_def = [
    [
        ["force", 100], ["unarmed", 100], ["sword", 100], ["parry", 100], ["dodge", 100],
        ["hunyuanyiqi", 100, "force"], ["wudangchangquan", 100, "unarmed"], ["huashanshenfa", 100, "dodge"],
        ["wudangjianfa", 100, "sword"], ["zhemeishou", 100, "parry"]
    ],
    [
        ["force", 300], ["unarmed", 300], ["sword", 300], ["parry", 300], ["dodge", 300],
        ["zixiashengong", 300, "force"], ["changquan", 300, "unarmed"],
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
        ["kuihuashengong", 1700, ["force", "dodge"]], ["cuixinzhang", 1700, "unarmed"],
        ["pixiejianfa", 1700, ["sword", "parry"]]
    ],
    [
        ["force", 2000], ["unarmed", 2000], ["sword", 2000], ["parry", 2000], ["dodge", 2000],
        ["jiuyangshengong", 2000, "force"], ["chuanxinzhang", 2000, "unarmed"],
        ["dugujiujian", 2000, "sword"], ["taijiquan", 2000, "parry"], ["kuihuashengong", 2000, "dodge"],
    ],
    [
        ["force", 2500], ["unarmed", 2500], ["sword", 2500], ["parry", 2500], ["dodge", 2500],
        ["taixuangong", 2500, "force"], ["xianglongzhang2", 2500, "unarmed"],
        ["qixianwuxingjian", 2500, "sword"], ["taijiquan", 2500, "parry"], ["xuanxubu", 2500, "dodge"],
    ],
    [
        ["force", 3000], ["unarmed", 3000], ["sword", 3000], ["parry", 3000], ["dodge", 3000],
        ["jiuyinshengong", 3000, "force"], ["jiuyinbaiguzhao", 3000, "unarmed"],
        ["taijijian", 3000, "sword"], ["qiankundanuoyi", 3000, "parry"], ["lingboweibu2", 3000, "dodge"],
    ]
];
