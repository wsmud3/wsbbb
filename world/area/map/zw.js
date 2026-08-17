this.inherits(AREA);
this.set({
    id: "zw",
    name: "真武秘境",
    desc: "张三丰百岁寿辰之际，于武当后山真武殿闭关时悟得「太极无疆」之境。秘境以太极八卦为基，分八门——休、生、伤、杜、景、死、惊、开。唯有武当弟子踏入武帝之境、身经武道塔百层者，方能入此秘境。",
    first: "zw/zhenwudian",
    room_path: "zw/",
    is_copy: true,
    not_fb: true,
    expend: 0,
    exp: 0,
    pot: 0,
    jd_index: 3,
    is_multi: false,
});

this.map = [
    { n: "真武殿",         id: "zw/zhenwudian",       p: [0, 0],   exits: ["north"] },
    { n: "八卦石阵",       id: "zw/baguazhen",        p: [0, -1],  exits: ["north", "south"] },
    { n: "休门",           id: "zw/xiumen",           p: [0, -2],  exits: ["north", "south"] },
    { n: "生门",           id: "zw/shengmen",         p: [0, -3],  exits: ["north", "south"] },
    { n: "伤门",           id: "zw/shangmen",         p: [0, -4],  exits: ["north", "south"] },
    { n: "杜门",           id: "zw/dumen",            p: [0, -5],  exits: ["north", "south"] },
    { n: "景门",           id: "zw/jingmen",          p: [0, -6],  exits: ["north", "south"] },
    { n: "死门",           id: "zw/simen",            p: [0, -7],  exits: ["north", "south"] },
    { n: "惊门",           id: "zw/jingmen2",         p: [0, -8],  exits: ["north", "south"] },
    { n: "开门",           id: "zw/kaimen",           p: [0, -9],  exits: ["north", "south"] },
    { n: "太极广场",       id: "zw/taijiguangchang",  p: [0, -10], exits: ["north", "south"] },
    { n: "两仪殿",         id: "zw/liangyidian",      p: [0, -11], exits: ["north", "south"] },
    { n: "真武剑台",       id: "zw/zhenwujiantai",    p: [0, -12], exits: ["north", "south"] },
    { n: "玄武池",         id: "zw/xuanwuchi",        p: [0, -13], exits: ["north", "south"] },
    { n: "炼丹房",         id: "zw/liandanfang",      p: [1, -13], exits: ["west"] },
    { n: "藏经密室",       id: "zw/cangjingmishi",    p: [-1, -13], exits: ["east"] },
    { n: "云海崖",         id: "zw/yunhaiya",         p: [0, -14], exits: ["north", "south"] },
    { n: "天柱峰",         id: "zw/tianzhufeng",      p: [0, -15], exits: ["north", "south"] },
    { n: "太极闭关洞",     id: "zw/biguandong",       p: [0, -16], exits: ["north", "south"] },
    { n: "太极化身台",     id: "zw/taijihuashentai",  p: [0, -17], exits: ["north", "south"] },
    { n: "真武传承殿",     id: "zw/chuanchengdian",   p: [0, -18], exits: ["south"] },
];

this.drops = [];
this.quick_drops = [
    { obj: "money/silver", min: 1, max: 10 },
];

this.on_enter = function (me) {
    if (me.family !== FAMILIES.WUDANG)
        return me.notify("只有武当派弟子才能进入真武秘境。");
    if (me.level < 4)
        return me.notify("你境界未到武帝，无法承受秘境中的太极之力。");
    if (me.query_temp("wd_level", 0) < 100)
        return me.notify("你尚未通过武道塔第一百层，秘境之门不会为你开启。");
    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("zw/zhenwudian");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) {
        copy_room = next_room.create_copy2(me);
    }
};

this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("zw_progress");
    me.remove_temp("zw_tj_active");
};
