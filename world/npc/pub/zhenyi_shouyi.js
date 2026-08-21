this.inherits(NPC);
this.set({
    name: "守意人", title: "<hic>禁地引路</hic>", gender: 1, age: 70,
    desc: "此人守在试炼石壁之前，衣袍古旧，目光却清澈如初。历代门人留下的武意，都由其照看。",
    hp: 1000000, max_hp: 1000000, mp: 1000000, max_mp: 1000000,
    no_fight: true, no_refresh: true
});
this.on_create = function (path, par) {
    if (!par || !WORLD.ZHENYI) return;
    var key = par.substr(1), data = WORLD.ZHENYI.find_by_key(key);
    if (!data) return;
    this.name = data.guide;
    this.desc = "他是【" + data.area + "】的守意人，负责开启五道试炼并指点门人参悟" + data.name + "。禁地行走不耗精力，正式挑战与扫荡每次消耗二十点精力。";
};
this.add_action("zhenyi", "参悟真意", function (me) {
    if (WORLD.COMMANDS.zhenyi) WORLD.COMMANDS.zhenyi.send_panel(me);
    return true;
});
