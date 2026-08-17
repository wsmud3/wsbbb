this.inherits(NPC);
this.set({
    name: "蚩尤残魂",
    desc: "一道暗红色的虚影悬浮在半空之中，虽无实体，却散发着毁天灭地的威压。他身披兽骨战甲，头生双角，铜铃般的双目中燃烧着不灭的战意。这便是上古战神蚩尤的残魂，历经万载岁月，依然守护着这座神殿。",
    title: "上古战神",
    gender: 1,
    age: 0,
    per: 100,
    mp: 100000000,
    max_mp: 100000000,
    hp: 80000000,
    max_hp: 80000000,
    level: 6,
    pfm_rate: 1,
    no_refresh: true,
    prop: {
        gjsd: 30000,
        add_sh_per: 150,
        diff_sh_per: 300,
        diff_sh_per2: 150,
        diff_downside_per: 200,
        gj: 200000,
        gj_per: 150,
        diff_fy_per: 150,
        distime_per: 80,
        ds: 250000,
        ds_per: 150,
        zj: 250000,
        zj_per: 150,
        mz: 250000,
        mz_per: 150
    }
});

this.skill_map(
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["sword", 5000],
    ["blade", 5000],
    ["staff", 5000],
    ["club", 5000],
    ["whip", 5000],
    ["throwing", 5000]);

this.set_objects(["eq/lv0/cloth", 1, 1]);

this.set_drop({
	obj: "money/silver",
	min: 10,
	max: 50
}, {
	obj: ["eq/lv5/wushen/mufeng_shoes"],
	odds: 1500
});

this.on_die = function (killer) {
    if (killer && killer.is_player) {
        this.send_message("\n<hiy>蚩尤残魂仰天大笑：万古岁月，终有人踏破九重天！</hiy>\n");
        this.send_message("<hiz>蚩尤残魂的身影渐渐消散：去吧，武神之位已为你而留……</hiz>\n");
        killer.set_temp("zhanshen_tapotian", 1);
        killer.remove_temp("zhanshen_wushen");

        var frag = Math.random() < 0.5 ?
            "eq/lv6/wushen/shenhunsuipian" :
            "eq/lv6/wushen/shenqisuipian";
        var obj = killer.add_obj(frag, 1);
        if (obj) {
            killer.notify("<hiy>蚩尤残魂消散之处，一块" + obj.color_name + "<hiy>缓缓坠落，你伸手将其接住。</hiy>");
        }

        killer.notify("<hiy>九重天已破，向北而行，武神殿的大门已为你敞开！</hiy>");
        killer.moveto("zhanshen/wushendian");
    }
    return true;
};
