this.inherits(NPC);
this.name = "心魔";
this.desc = "它与你形貌别无二致，却周身缠绕着黑红色的煞气。双目空洞而冰冷，嘴角挂着一丝诡异的笑意——这正是你内心深处所有恐惧、执念与阴暗所化的心魔。";
this.title = "<hir>心魔</hir>";
this.gender = 1;
this.age = 0;
this.per = 50;
this.no_refresh = true;
this.score = 0;  // 不计入副本评分

this.str = 3000; this.con = 3000; this.dex = 3000; this.int = 3000;
this.hp = 25000000; this.max_hp = 25000000;
this.mp = 50000000; this.max_mp = 50000000;
this.gj = 200000; this.fy = 150000; this.mz = 200000; this.ds = 180000; this.zj = 180000;
this.prop = {
    gjsd: 3000,
    add_sh_per: 70,
    diff_sh_per: 100,
    diff_downside_per: 80,
};

this.skill_map(
    ["dodge", 4000],
    ["parry", 4000],
    ["force", 4000],
    ["unarmed", 4000],
    ["changshengjue", 4000, "force"],
    ["lingboweibu2", 4000, "dodge"],
    ["rulaishenzhang", 4000, "unarmed"],
    ["qiankundanuoyi", 4000, "parry"],
);

// 创建时：复制玩家的武器类型技能，施加心魔侵蚀debuff
this.on_create = function () {
    var me = null;
    if (this.environment) {
        for (var i = 0; i < this.environment.items.length; i++) {
            if (this.environment.items[i].is_player) { me = this.environment.items[i]; break; }
        }
    }

    // 复制玩家武器类技能
    if (me) {
        var types = ["sword", "blade", "club", "staff", "whip", "throwing"];
        var foundSkill = null;
        for (var t = 0; t < types.length; t++) {
            var sk = me.query_skill_of_type(types[t]);
            if (sk && sk.level > 0) {
                foundSkill = { type: types[t], level: Math.floor(sk.level * 0.8), id: sk.id };
                break;
            }
        }
        if (foundSkill) {
            this.skill_map(
                ["dodge", 5000],
                ["parry", 5000],
                ["force", 5000],
                ["unarmed", 5000],
                [foundSkill.type, 5000],
                [foundSkill.id, Math.min(foundSkill.level, 5000), foundSkill.type],
                ["changshengjue", 5000, "force"],
                ["busiyinfa", 5000, "force"],
                ["rulaishenzhang", 5000, "unarmed"],
                ["zhenyanshouyin", 5000, "unarmed"],
            );
        }
    }
    this.init();
    this.recount();
};

// 战斗开始时：给玩家施加心魔侵蚀
this.on_beginfight = function (me, target) {
    if (target && target.is_player && !target.query_status("xinmo_erosion")) {
        target.add_status({
            id: "xinmo_erosion",
            name: "<hir>心魔侵蚀</hir>",
            desc: "被心魔侵蚀心神，全属性下降15%",
            duration: 86400000,
            downside: true,
            no_clear: true,
            override: 2,
            only_combat: true,
            prop: {
                gj_per: -15,
                fy_per: -15,
                mz_per: -15,
                ds_per: -15,
                zj_per: -15,
            },
            start_msg: "<hir>$N的心神被心魔侵蚀，周身黑气缭绕，实力大减！</hir>",
            finish_msg: "$N身上的心魔侵蚀消散了。",
        }, this);
    }
};

// 每10秒，心魔使用一次生死印（附加伤害+自我回复）
this.on_heart_beat = function () {
    if (this.hp <= 0) return;
    if (!this.is_fighting()) return;

    this._beat_count = (this._beat_count || 0) + 1;
    if (this._beat_count % 3 === 0) {
        var target = this.query_enemy();
        if (target && target.hp > 0) {
            // 生死印：消耗目标内力造成伤害，并回复自身
            var dmg = Math.floor(target.mp * 0.05);
            if (dmg > 500000) dmg = 500000;
            target.mp = Math.max(0, target.mp - dmg);
            target.damage(dmg, this);
            this.hp = Math.min(this.max_hp, this.hp + Math.floor(dmg * 0.5));
            target.send_combat("<hiz>心魔施展出生死印！阴冷的死气自你体内涌出，造成了" + dmg + "点伤害，同时心魔汲取了部分生命力！</hiz>", this);
        }
    }
};

this.on_die = function (killer) {
    if (killer && killer.is_player) {
        killer.notify("<hig>心魔发出一声凄厉的尖啸，化作一缕黑烟消散在铜镜之中！</hig>");
        killer.notify("<hio>镜面恢复了平静，映出你坚定的面容——你已战胜了内心最大的敌人。</hio>");
        killer.notify("<hiy>问心台上八面古篆逐一黯淡，通往生门的道路已为你敞开。向东前行吧。</hiy>");
        // 清除心魔侵蚀debuff
        killer.remove_status("xinmo_erosion", true);
    }
};
