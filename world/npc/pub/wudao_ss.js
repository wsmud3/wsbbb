this.inherits(NPC);
this.set({
    name: "",
    desc: "",
    title: "",
    gender: 1,
    age: 25,
    per: this.random(50) + 30,
    mp: 500,
    max_mp: 500,
    hp: 500,
    max_hp: 500,
    no_refresh: true,
    no_fight: true
});

const BEASTS = [
    {
        name: "青龙",
        desc: "它是一条青色的巨龙，周身萦绕着碧绿的龙气，双目如电，散发着令人窒息的威严。这便是传说中的东方守护神兽——青龙。",
        title: "东方青龙",
        color: "hig"
    },
    {
        name: "白虎",
        desc: "它是一头银白色的巨虎，黑色斑纹如墨，目光锐利如刀，浑身上下散发着凛冽的杀气。这便是传说中的西方守护神兽——白虎。",
        title: "西方白虎",
        color: "hiw"
    },
    {
        name: "玄武",
        desc: "它是一只巨大的龟蛇合体神兽，厚重的龟甲上布满古老的符文，沉稳而神秘。这便是传说中的北方守护神兽——玄武。",
        title: "北方玄武",
        color: "hib"
    },
    {
        name: "朱雀",
        desc: "它是一只火红的神鸟，周身的羽翼仿佛燃烧着不灭的烈焰，炽热的气息扑面而来。这便是传说中的南方守护神兽——朱雀。",
        title: "南方朱雀",
        color: "hir"
    }
];

this.init_from = function (player, beast_type) {
    var beast = BEASTS[beast_type];
    var level = Math.max(player.query_temp("wd_level", 0), 50);

    this.name = beast.name;
    this.desc = beast.desc;
    this.title = "<" + beast.color + ">" + beast.title + "</" + beast.color + ">";
    this._beast_type = beast_type;

    var scalar = 500 + Math.floor(level * 120);
    this.con = this.dex = this.int = this.str = scalar;

    this.skill_map(
        ["dodge", level * 15],
        ["parry", level * 15],
        ["force", level * 15],
        ["unarmed", level * 15]);

    this.hp = this.max_hp = 20000 + level * level * 600;
    this.mp = this.max_mp = parseInt(this.hp / 2);
    this.add_prop("fy", level * 700);
    this.add_prop("gj", level * 500);

    this.set_objects(['eq/lv0/cloth', 1, 1], ["eq/lv0/jian", 1, 1]);

    this.init();
    this.recount();
};

this.init_trial = function (player, beast_type) {
    var self = this;
    var beast = BEASTS[beast_type];

    // 标记试炼进行中（用于on_leave清理）
    player._trial_active = true;
    player.set_temp("ss_trial_beast", beast_type);

    // 驱散玩家所有增益buff（不可驱散和负面buff保留）
    if (player.status && player.status.length) {
        for (var i = player.status.length - 1; i >= 0; i--) {
            var st = player.status[i];
            if (!st.downside && !st.no_clear) {
                player.remove_status(st.id, true);
            }
        }
    }
    player.notify("<hib>神兽之力席卷而来，你身上的增益效果尽数消散！</hib>");

    // 重新计算面板属性
    player.recount();

    // 判定面板属性是否达标
    var stat_ok = false;
    var stat_name = "";
    var cur_val = 0;

    switch (beast_type) {
        case 0: // 青龙: 命中 >= 20万
            cur_val = player.mz || 0;
            stat_ok = cur_val >= 200000;
            stat_name = "命中";
            break;
        case 1: // 白虎: 躲闪 >= 20万
            cur_val = player.ds || 0;
            stat_ok = cur_val >= 200000;
            stat_name = "躲闪";
            break;
        case 2: // 玄武: 攻击 >= 20万（最终伤害每1%等效1000攻击）
            cur_val = (player.gj || 0) + (player.query_prop("add_sh_per") || 0) * 1000;
            stat_ok = cur_val >= 200000;
            stat_name = "攻击";
            break;
        case 3: // 朱雀: 防御 >= 20万（免伤每1%等效1000防御）
            cur_val = (player.fy || 0) + (player.query_prop("diff_sh_per") || 0) * 1000;
            stat_ok = cur_val >= 200000;
            stat_name = "防御";
            break;
    }

    player._trial_active = false;
    player.remove_temp("ss_trial_beast");

    if (stat_ok) {
        player.add_temp("fenpei", 1);
        player.set_temp("ss_trial_rwd_" + beast_type, 1);
        player.notify("<hir>恭喜你完成" + beast.name + "试炼！获得1点可分配先天属性，可在练功房使用分配属性来自行加点。</hir>");
        player.set_temp("ss_trial_done_" + beast_type, 1);

        self.destroy();
        player.die = USER.prototype.die;
        player.moveto("wudao/ding");
    } else {
        player.die = USER.prototype.die;
        player.hp = 1;
        player.notify("<hir>" + beast.name + "试炼失败！你的" + stat_name + "（" + cur_val + "）不足20万，无法承受" + beast.name + "的试炼之力！</hir>");
        self.destroy();
        player.moveto("wudao/men");
        player.notify("<hir>试炼失败，你被送回了武道塔入口。</hir>");
    }
};

this.on_die = function (killer) {
    if (killer && killer.is_player) {
        this.hp = this.max_hp;
        return false;
    }
};
