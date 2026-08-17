this.inherits(NPC);
this.set({
    name: "",
    desc: "他是武道塔第一百层的终极守护者，周身环绕着浩瀚的武道气息，举手投足间天地为之变色。",
    title: "武道守护者",
    gender: 1,
    age: 30,
    per: this.random(50) + 30,
    mp: 500000,
    max_mp: 500000,
    hp: 500000,
    max_hp: 500000,
    no_refresh: true,
    no_fight: true
});

this.init_from = function (player) {
    // 15万四维
    this.con = this.dex = this.int = this.str = 15000;
    this.name = UTIL.random_name(this.gender);
    this.skill_map(
        ["force", 5000], ["unarmed", 5000], ["sword", 5000], ["parry", 5000], ["dodge", 5000], ["blade", 5000],
        ["jiuyinshengong", 5000, "force"], ["jiuyinbaiguzhao", 5000, "unarmed"],
        ["xuantiejianfa", 5000, "sword"], ["xuantiejianfa", 5000, "parry"], ["lingboweibu", 5000, "dodge"],
        ["xuedao", 5000, "blade"]
    );
    this.title = "<ord>武道守护者</ord>";

    this.hp = this.max_hp = 20000000;
    this.mp = this.max_mp = 100000000;
    this.add_prop("fy", 75000);
    this.add_prop("gj", 120000);
    this.add_prop("str", 120000);
    this.add_prop("zj", 120000);
    this.add_prop("mz", 120000);
    this.init();
    this.recount();
}
