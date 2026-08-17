this.inherits(AREA);
this.set({
    id: "lhfd", name: "琅嬛福地", jd_index: 7,
    desc: "无崖子与李秋水隐居无量山时建造的武学宝库。珍珑棋局、玉像机关、北冥石刻——三重考验。唯有逍遥弟子踏入武帝之境、身经武道塔百层者，方能入内。",
    first: "lhfd/wuliangshandao", room_path: "lhfd/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "无量山道",       id: "lhfd/wuliangshandao",   p: [0, 0],   exits: ["north"] },
    { n: "琅嬛石阶",       id: "lhfd/langhuanshijie",   p: [0, -1],  exits: ["north", "south"] },
    { n: "玉像广场",       id: "lhfd/yuxiangguangchang",p: [0, -2],  exits: ["north", "south"] },
    { n: "珍珑棋局",       id: "lhfd/zhenlongqiju",     p: [0, -3],  exits: ["north", "south"] },
    { n: "琅嬛玉洞",       id: "lhfd/langhuanyudong",   p: [0, -4],  exits: ["north", "south"] },
    { n: "北冥石刻",       id: "lhfd/beimingzhuke",     p: [0, -5],  exits: ["north", "south"] },
    { n: "凌波微步廊",     id: "lhfd/lingboweilang",    p: [0, -6],  exits: ["north", "south"] },
    { n: "白虹殿",         id: "lhfd/baihongdian",      p: [0, -7],  exits: ["north", "south"] },
    { n: "无崖子旧居",     id: "lhfd/wuyazijiuju",      p: [0, -8],  exits: ["north", "south"] },
    { n: "秋水阁",         id: "lhfd/qiushuige",        p: [0, -9],  exits: ["north", "south"] },
    { n: "天山折梅台",     id: "lhfd/tianshanzhemeitai",p: [0, -10], exits: ["north", "south"] },
    { n: "六阳掌碑",       id: "lhfd/liuyangzhangbei",  p: [0, -11], exits: ["north", "south"] },
    { n: "缥缈峰回廊",     id: "lhfd/piaomiaolang",     p: [0, -12], exits: ["north", "south"] },
    { n: "以彼之道殿",     id: "lhfd/yibizhidao",       p: [0, -13], exits: ["north", "south"] },
    { n: "还施彼身殿",     id: "lhfd/huanshibishen",    p: [0, -14], exits: ["north", "south"] },
    { n: "生死符窟",       id: "lhfd/shengsifuku",      p: [1, -14], exits: ["west"] },
    { n: "逍遥秘境",       id: "lhfd/xiaoyaomijing",    p: [0, -15], exits: ["north", "south"] },
    { n: "星宿海幻境",     id: "lhfd/xingxiuhai",       p: [0, -16], exits: ["north", "south"] },
    { n: "无崖子残念台",   id: "lhfd/wuyazitai",        p: [0, -17], exits: ["north", "south"] },
    { n: "逍遥传承殿",     id: "lhfd/chuanchengdian",   p: [0, -18], exits: ["south"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    if (me.family !== FAMILIES.XIAOYAO) return me.notify("只有逍遥派弟子才能进入琅嬛福地。");
    if (me.level < 4) return me.notify("你境界未到武帝，无法承受福地中的北冥真气。");
    if (me.query_temp("wd_level", 0) < 100) return me.notify("你尚未通过武道塔第一百层，福地之门不会为你开启。");
    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("lhfd/wuliangshandao");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("lhfd_progress"); me.remove_temp("lhfd_bm_active");
};
