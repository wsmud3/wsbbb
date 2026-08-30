// 山外山·守山人：驻守山门（sws/start）的纪录查询 NPC。
// 可查询本人最高层数与全服最高层数（两者均持久化存储，服务器重启不丢失）。
// 玩家不可攻击（no_fight），且不会被刷新掉（no_refresh）。
this.inherits(NPC);
this.set({
    name: "守山人",
    desc: "一位白发苍苍的老者，倚着山门牌坊而立，目光越过云海，仿佛看尽了无数登山客的兴衰。他记得每一位登临者的足迹，也记得山外山如今的最高纪录。",
    title: "山外山守山人",
    gender: 1,
    age: 90,
    per: 60,
    mp: 5000000,
    max_mp: 5000000,
    hp: 80000000,
    max_hp: 80000000,
    level: 5,
    pfm_rate: 1,
    no_fight: true,
    no_refresh: true,
    prop: {
        gjsd: 20000,
        add_sh_per: 100,
        diff_sh_per: 270,
        diff_sh_per2: 100,
        diff_downside_per: 170,
        gj: 100000,
        gj_per: 100,
        diff_fy_per: 150,
        distime_per: 80,
        ds: 150000,
        ds_per: 100,
        zj: 150000,
        zj_per: 100,
        mz: 150000,
        mz_per: 100
    }
});

// 查询本人最高层数
this.add_action("sws_ask_self", "我的最高层", function (me) {
    var area = this.environment && this.environment.parent;
    if (area && area.sws_ask_self) return area.sws_ask_self(me);
    return me.notify("守山人望着你，沉默不语。");
});

// 查询全服最高层数
this.add_action("sws_ask_server", "全服最高层", function (me) {
    var area = this.environment && this.environment.parent;
    if (area && area.sws_ask_server) return area.sws_ask_server(me);
    return me.notify("守山人望着你，沉默不语。");
});
