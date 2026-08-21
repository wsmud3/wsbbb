this.inherits(AREA);
this.set({
    id: "jdfg", name: "金顶佛光", jd_index: 5,
    desc: "峨眉金顶之上，云海中偶尔可见佛光。郭襄创派时言——「佛光之中，藏有倚天剑的秘密」。唯有峨眉弟子踏入武帝之境、身经武道塔百层者，方能入内一探。",
    first: "jdfg/jindingyunti", room_path: "jdfg/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "金顶云梯",       id: "jdfg/jindingyunti",     p: [0, 0],   exits: ["north"] },
    { n: "佛光台",         id: "jdfg/foguangtai",       p: [0, -1],  exits: ["north", "south"] },
    { n: "倚天密洞",       id: "jdfg/yitianmidong",     p: [0, -2],  exits: ["north", "south"] },
    { n: "郭襄旧居",       id: "jdfg/guoxiangjiuju",    p: [0, -3],  exits: ["north", "south"] },
    { n: "风陵师太殿",     id: "jdfg/fenglingdian",     p: [0, -4],  exits: ["north", "south"] },
    { n: "灭绝殿",         id: "jdfg/miejuedian",       p: [0, -5],  exits: ["north", "south"] },
    { n: "因果轮回殿",     id: "jdfg/yinguolunhui",     p: [0, -6],  exits: ["north", "south"] },
    { n: "绝剑崖",         id: "jdfg/juejianya",        p: [0, -7],  exits: ["north", "south"] },
    { n: "灭剑峰",         id: "jdfg/miejianfeng",      p: [0, -8],  exits: ["north", "south"] },
    { n: "峨眉剑阵",       id: "jdfg/emeijianzhen",     p: [0, -9],  exits: ["north", "south"] },
    { n: "净光台",         id: "jdfg/jingguangtai",     p: [0, -10], exits: ["north", "south"] },
    { n: "菩提园",         id: "jdfg/putiyuan",         p: [0, -11], exits: ["north", "south"] },
    { n: "慈航殿",         id: "jdfg/cihangdian",       p: [0, -12], exits: ["north", "south"] },
    { n: "金刚怒目台",     id: "jdfg/jinggangnutai",    p: [0, -13], exits: ["north", "south"] },
    { n: "佛光普照台",     id: "jdfg/foguangpuzhaotai", p: [0, -14], exits: ["north", "south"] },
    { n: "倚天剑台",       id: "jdfg/yitianjiantai",    p: [0, -15], exits: ["north", "south"] },
    { n: "轮回秘境",       id: "jdfg/lunhuimijing",     p: [0, -16], exits: ["north", "south"] },
    { n: "涅槃台",         id: "jdfg/niepantai",        p: [1, -16], exits: ["west"] },
    { n: "倚天剑灵台",     id: "jdfg/yitianjianlingtai",p: [0, -17], exits: ["north", "south"] },
    { n: "佛光传承殿",     id: "jdfg/chuanchengdian",   p: [0, -18], exits: ["south"] },
    { n: "金顶无相台",     id: "jdfg/wuxiangtai",       p: [-1, 0],  exits: ["east"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    if (!WORLD.ZHENYI || !WORLD.ZHENYI.can_enter_area(me, "jdfg")) return false;
    var next_room = ROOM.Get("jdfg/jindingyunti");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    if (me.query_temp("zy_trial_active") && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, "你离开了金顶佛光。");
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("jdfg_progress"); me.remove_temp("jdfg_fg_active");
};
