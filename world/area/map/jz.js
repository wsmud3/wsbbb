this.inherits(AREA);
this.set({
    id: "jz",
    name: "独孤剑冢",
    desc: "剑魔独孤求败，纵横江湖三十余载，欲求一败而不可得。晚年隐于华山深谷，将其一生剑道感悟与四柄佩剑埋于此处。唯有华山弟子踏入武帝之境、身经武道塔百层者，方有资格一试。",
    first: "jz/houshan",
    room_path: "jz/",
    is_copy: true,
    not_fb: true,
    expend: 0,
    exp: 0,
    pot: 0,
    jd_index: 2,
    is_multi: false,
});

this.map = [
    { n: "后山小径",       id: "jz/houshan",         p: [0, 0],   exits: ["north"] },
    { n: "绝壁裂缝",       id: "jz/liefeng",         p: [0, -1],  exits: ["north", "south"] },
    { n: "剑冢外道",       id: "jz/waidao1",         p: [0, -2],  exits: ["north", "south"] },
    { n: "外道深处",       id: "jz/waidao2",         p: [0, -3],  exits: ["north", "south"] },
    { n: "剑器长廊",       id: "jz/changlang",       p: [0, -4],  exits: ["north", "south"] },
    { n: "利剑阁",         id: "jz/lijiange",        p: [0, -5],  exits: ["north", "south"] },
    { n: "利剑台",         id: "jz/lijiantai",       p: [0, -6],  exits: ["north", "south"] },
    { n: "剑痕甬道",       id: "jz/jianhen",         p: [0, -7],  exits: ["north", "south"] },
    { n: "软剑阁",         id: "jz/ruanjiange",      p: [0, -8],  exits: ["north", "south"] },
    { n: "软剑台",         id: "jz/ruanjiantai",     p: [0, -9],  exits: ["north", "south"] },
    { n: "剑渊崖畔",       id: "jz/jianyuanpan",     p: [0, -10], exits: ["north", "south", "east"] },
    { n: "剑渊谷底",       id: "jz/jianyuandi",      p: [1, -10], exits: ["west"] },
    { n: "弃剑坡",         id: "jz/qijianpo",        p: [0, -11], exits: ["north", "south"] },
    { n: "重剑前殿",       id: "jz/zhongjianqian",   p: [0, -12], exits: ["north", "south"] },
    { n: "重剑殿",         id: "jz/zhongjiandian",   p: [0, -13], exits: ["north", "south"] },
    { n: "玄铁甬道",       id: "jz/xuantie",         p: [0, -14], exits: ["north", "south"] },
    { n: "洗剑池",         id: "jz/xijianchi",       p: [0, -15], exits: ["north", "south"] },
    { n: "木剑阁",         id: "jz/mujiange",        p: [0, -16], exits: ["north", "south"] },
    { n: "悟剑石",         id: "jz/wujianshi",       p: [0, -17], exits: ["north", "south"] },
    { n: "无剑虚空",       id: "jz/wujianxukong",    p: [0, -18], exits: ["north", "south"] },
    { n: "终极剑台",       id: "jz/zhongjijiantai",  p: [0, -19], exits: ["north", "south"] },
    { n: "剑道传承殿",     id: "jz/chuanchengdian",  p: [0, -20], exits: ["south"] },
];

this.drops = [];

this.quick_drops = [
    { obj: "money/silver", min: 1, max: 10 },
];

this.on_enter = function (me) {
    // 门派限制
    if (me.family !== FAMILIES.HUASHAN)
        return me.notify("只有华山派弟子才能踏入剑冢。");

    // 境界限制：武帝 (level >= 4)
    if (me.level < 4)
        return me.notify("你境界未到武帝，无法承受剑冢中的剑意。");

    // 武道塔限制
    if (me.query_temp("wd_level", 0) < 100)
        return me.notify("你尚未通过武道塔第一百层，剑冢之门不会为你开启。");

    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("jz/houshan");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) {
        copy_room = next_room.create_copy2(me);
    }
};

this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) {
        copy_room.clear_copy(me);
    }
    me.remove_temp("jz_jianyi_active");
    me.remove_temp("jz_progress");
    me.remove_temp("jz_jianyuan_done");
    me.remove_temp("jz_meditate_done");
    me.remove_temp("jz_choice");
    me.remove_temp("jz_wujian_used");
};
