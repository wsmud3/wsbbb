// 门派禁地公共地图中的试炼 NPC。
// 公共地图只负责展示与开启试炼，真正的战斗会进入独立副本。
this.inherits(NPC);
this.set({
    name: "试炼引路人",
    title: "<hic>真意试炼</hic>",
    gender: 1,
    age: 50,
    desc: "一道守在石台旁的武意化身。它只引门人入试，并非可以在此处挑战的活物。",
    hp: 1000000,
    max_hp: 1000000,
    mp: 1000000,
    max_mp: 1000000,
    no_fight: true,
    no_refresh: true,
    is_zhenyi_guide: true
});

this.on_create = function (path, par) {
    var token = (par || "").substr(1).split("_");
    var key = token[0], id = parseInt(token[1]);
    var data = WORLD.ZHENYI && WORLD.ZHENYI.find_by_key(key);
    var intent = data && WORLD.ZHENYI.find_intent(data, id);
    if (!data || !intent) return;
    this.zhenyi_key = key;
    this.zhenyi_id = intent.id;
    this.name = (data.guideNames && data.guideNames[intent.id - 1]) || data.guide;
    this.desc = "此人镇守【" + intent.trial + "】一脉试场。试炼须入独立副本，准确效果可在属性页的真意列表中查看；此处只可请教与开启，不可击杀。";
};

this.add_action("zhenyi_trial", "开启试炼", function (me) {
    if (!this.zhenyi_key || !WORLD.ZHENYI) return me.notify("这道试炼尚未准备好。"), false;
    var data = WORLD.ZHENYI.serialize(me), item = null;
    if (data && data.list) {
        for (var i = 0; i < data.list.length; i++) {
            if (data.list[i].id === this.zhenyi_id) { item = data.list[i]; break; }
        }
    }
    if (!item) return me.notify("你还没有资格参悟这道真意。"), false;
    if (item.daily >= item.daily_limit) return me.notify("这项试炼今日已达十次。"), false;
    if (item.cleared) {
        me.send_commands(
            "zhenyi challenge " + this.zhenyi_id, "进入试炼",
            "zhenyi sweep " + this.zhenyi_id + " 1", "扫荡一次",
            "zhenyi sweep " + this.zhenyi_id + " 10", "扫荡十次"
        );
    } else {
        me.send_commands("zhenyi challenge " + this.zhenyi_id, "进入试炼");
    }
    return true;
});

// 即使未来某个公共房间取消 no_fight，也不能直接攻击引路人。
this.on_before_fight = function () { return false; };
this.on_kill = function () { return false; };
