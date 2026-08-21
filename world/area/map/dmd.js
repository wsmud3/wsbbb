this.inherits(AREA);
this.set({
    id: "dmd", name: "达摩洞", jd_index: 4,
    desc: "少室山达摩洞深处，达摩祖师面壁九年之处。洞壁上留有身影入石，藏有「禅武九重」考验。唯有少林弟子踏入武帝之境、身经武道塔百层者，方能入洞参禅。",
    first: "dmd/shaoshishandao", room_path: "dmd/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "少室山道",       id: "dmd/shaoshishandao",   p: [0, 0],   exits: ["north"] },
    { n: "达摩洞口",       id: "dmd/dongkou",          p: [0, -1],  exits: ["north", "south"] },
    { n: "面壁石室",       id: "dmd/mianbishi",        p: [0, -2],  exits: ["north", "south"] },
    { n: "禅定密室一",     id: "dmd/chanding1",        p: [0, -3],  exits: ["north", "south"] },
    { n: "禅定密室二",     id: "dmd/chanding2",        p: [0, -4],  exits: ["north", "south"] },
    { n: "心魔幻境·贪",   id: "dmd/xinmo_tan",        p: [0, -5],  exits: ["north", "south"] },
    { n: "心魔幻境·嗔",   id: "dmd/xinmo_chen",       p: [0, -6],  exits: ["north", "south"] },
    { n: "心魔幻境·痴",   id: "dmd/xinmo_chi",        p: [0, -7],  exits: ["north", "south"] },
    { n: "铜人巷",         id: "dmd/tongrenxiang",     p: [0, -8],  exits: ["north", "south"] },
    { n: "木人巷",         id: "dmd/murenxiang",       p: [0, -9],  exits: ["north", "south"] },
    { n: "藏经阁密室",     id: "dmd/cangjingge",       p: [0, -10], exits: ["north", "south"] },
    { n: "罗汉堂秘境",     id: "dmd/luohantang",       p: [0, -11], exits: ["north", "south"] },
    { n: "般若堂",         id: "dmd/boretang",         p: [0, -12], exits: ["north", "south"] },
    { n: "金刚殿",         id: "dmd/jingangdian",      p: [0, -13], exits: ["north", "south"] },
    { n: "禅武石壁",       id: "dmd/chanwushibi",      p: [0, -14], exits: ["north", "south"] },
    { n: "达摩面壁处",     id: "dmd/damomianbi",       p: [0, -15], exits: ["north", "south"] },
    { n: "祖师殿",         id: "dmd/zushidian",        p: [0, -16], exits: ["north", "south"] },
    { n: "舍利塔林",       id: "dmd/shelitalin",       p: [0, -17], exits: ["north", "south"] },
    { n: "禅定密室三",     id: "dmd/chanding3",        p: [1, -17], exits: ["west"] },
    { n: "达摩武意殿",     id: "dmd/damowuyidian",     p: [0, -18], exits: ["north", "south"] },
    { n: "禅武传承殿",     id: "dmd/chuanchengdian",   p: [0, -19], exits: ["south"] },
    { n: "禅武印心台",     id: "dmd/chanwutai",        p: [-1, 0],  exits: ["east"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    if (!WORLD.ZHENYI || !WORLD.ZHENYI.can_enter_area(me, "dmd")) return false;
    var next_room = ROOM.Get("dmd/shaoshishandao");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    if (me.query_temp("zy_trial_active") && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, "你离开了达摩洞。");
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("dmd_progress"); me.remove_temp("dmd_cw_active");
};
