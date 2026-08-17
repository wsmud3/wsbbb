this.inherits(AREA);
this.set({
    id: "yc", name: "九天瑶池", jd_index: 9,
    desc: "素女道的圣地——九天瑶池，传说为九天玄女在人间的行宫。池水能洗筋伐髓、重塑根基。唯有素女道弟子踏入武帝之境、身经武道塔百层者，方能入内脱胎换骨。",
    first: "yc/yaochishanmen", room_path: "yc/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "瑶池山门",       id: "yc/yaochishanmen",     p: [0, 0],   exits: ["north"] },
    { n: "瑶池玉阶",       id: "yc/yaochiyujie",       p: [0, -1],  exits: ["north", "south"] },
    { n: "金行殿",         id: "yc/jinxingdian",       p: [0, -2],  exits: ["north", "south"] },
    { n: "水行殿",         id: "yc/shuixingdian",      p: [0, -3],  exits: ["north", "south"] },
    { n: "木行殿",         id: "yc/muxingdian",        p: [0, -4],  exits: ["north", "south"] },
    { n: "火行殿",         id: "yc/huoxingdian",       p: [0, -5],  exits: ["north", "south"] },
    { n: "土行殿",         id: "yc/tuxingdian",        p: [0, -6],  exits: ["north", "south"] },
    { n: "五行循环台",     id: "yc/wuxingxunhuantai",  p: [0, -7],  exits: ["north", "south"] },
    { n: "九天玄女殿",     id: "yc/jiutianxuannvdian", p: [0, -8],  exits: ["north", "south"] },
    { n: "瑶池圣水",       id: "yc/yaochishengshui",   p: [0, -9],  exits: ["north", "south"] },
    { n: "洗筋伐髓池",     id: "yc/xijinfasui",        p: [0, -10], exits: ["north", "south"] },
    { n: "真气重塑台",     id: "yc/zhenqichongsu",     p: [0, -11], exits: ["north", "south"] },
    { n: "金行秘境",       id: "yc/jinxingmijing",     p: [1, -2],  exits: ["west"] },
    { n: "水行秘境",       id: "yc/shuixingmijing",    p: [1, -3],  exits: ["west"] },
    { n: "木行秘境",       id: "yc/muxingmijing",      p: [1, -4],  exits: ["west"] },
    { n: "火行秘境",       id: "yc/huoxingmijing",     p: [1, -5],  exits: ["west"] },
    { n: "土行秘境",       id: "yc/tuxingmijing",      p: [1, -6],  exits: ["west"] },
    { n: "九天玄女化身台", id: "yc/xuannvhuashentai",  p: [0, -12], exits: ["north", "south", "west"] },
    { n: "素心问道台",     id: "yc/suxinwendao",       p: [-1, -12], exits: ["east"] },
    { n: "瑶池传承殿",     id: "yc/chuanchengdian",    p: [0, -13], exits: ["south"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    if (me.family !== FAMILIES.SUNV) return me.notify("只有素女道弟子才能进入九天瑶池。");
    if (me.level < 4) return me.notify("你境界未到武帝，无法承受瑶池中的九天之力。");
    if (me.query_temp("wd_level", 0) < 100) return me.notify("你尚未通过武道塔第一百层，瑶池之门不会为你开启。");
    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("yc/yaochishanmen");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("yc_progress"); me.remove_temp("yc_jt_active");
};
