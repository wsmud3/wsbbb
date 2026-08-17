this.inherits(AREA);
this.set({
    id: "js", name: "君山密录", jd_index: 6,
    desc: "洞庭湖君山，丐帮总舵地下的隐秘石窟，以「降龙十八掌」十八式命名十八间密室。唯有丐帮弟子踏入武帝之境、身经武道塔百层者，方能入内修炼。",
    first: "js/junshandukou", room_path: "js/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "君山渡口",       id: "js/junshandukou",     p: [0, 0],   exits: ["north"] },
    { n: "总舵秘道",       id: "js/zongduomidao",     p: [0, -1],  exits: ["north", "south"] },
    { n: "亢龙室",         id: "js/kanglongshi",      p: [0, -2],  exits: ["north", "south"] },
    { n: "飞龙室",         id: "js/feilongshi",       p: [0, -3],  exits: ["north", "south"] },
    { n: "见龙室",         id: "js/jianlongshi",      p: [0, -4],  exits: ["north", "south"] },
    { n: "鸿渐室",         id: "js/hongjianshi",      p: [0, -5],  exits: ["north", "south"] },
    { n: "潜龙室",         id: "js/qianlongshi",      p: [0, -6],  exits: ["north", "south"] },
    { n: "利涉室",         id: "js/lisheshi",         p: [0, -7],  exits: ["north", "south"] },
    { n: "震惊室",         id: "js/zhenjingshi",      p: [0, -8],  exits: ["north", "south"] },
    { n: "腾蛇室",         id: "js/tengsheshi",       p: [0, -9],  exits: ["north", "south"] },
    { n: "龙战室",         id: "js/longzhanshi",      p: [0, -10], exits: ["north", "south"] },
    { n: "神龙室",         id: "js/shenlongshi",      p: [0, -11], exits: ["north", "south"] },
    { n: "履霜室",         id: "js/lvshuangshi",      p: [0, -12], exits: ["north", "south"] },
    { n: "双龙室",         id: "js/shuanglongshi",    p: [0, -13], exits: ["north", "south"] },
    { n: "鱼跃室",         id: "js/yuyueshi",         p: [0, -14], exits: ["north", "south"] },
    { n: "时乘室",         id: "js/shichengshi",      p: [0, -15], exits: ["north", "south"] },
    { n: "密云室",         id: "js/miyunshi",         p: [0, -16], exits: ["north", "south"] },
    { n: "损泽室",         id: "js/sunzeshi",         p: [0, -17], exits: ["north", "south"] },
    { n: "降龙幻影台",     id: "js/xianglongtai",     p: [0, -18], exits: ["north", "south"] },
    { n: "君山传承殿",     id: "js/chuanchengdian",   p: [0, -19], exits: ["south"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    if (me.family !== FAMILIES.GAIBANG) return me.notify("只有丐帮弟子才能进入君山密录。");
    if (me.level < 4) return me.notify("你境界未到武帝，无法承受降龙掌意。");
    if (me.query_temp("wd_level", 0) < 100) return me.notify("你尚未通过武道塔第一百层，密录之门不会为你开启。");
    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("js/junshandukou");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("js_progress"); me.remove_temp("js_xl_active");
};
