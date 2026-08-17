this.inherits(AREA);
this.set({
    id: "xl", name: "修罗暗殿", jd_index: 8,
    desc: "杀手楼地下深处的秘境——修罗暗殿。历代杀手之王葬身之处。殿中只有绝对的黑暗和无声的杀意。唯有杀手楼弟子踏入武帝之境、身经武道塔百层者，方能入此暗殿。",
    first: "xl/andianrukou", room_path: "xl/", is_copy: true, not_fb: true,
    expend: 0, exp: 0, pot: 0, is_multi: false,
});
this.map = [
    { n: "暗殿入口",       id: "xl/andianrukou",       p: [0, 0],   exits: ["north"] },
    { n: "影之道",         id: "xl/yingzhidao",        p: [0, -1],  exits: ["north", "south"] },
    { n: "无声殿",         id: "xl/wushengdian",       p: [0, -2],  exits: ["north", "south"] },
    { n: "暗杀考验·匿",   id: "xl/anshakaoyan1",      p: [0, -3],  exits: ["north", "south"] },
    { n: "暗杀考验·速",   id: "xl/anshakaoyan2",      p: [0, -4],  exits: ["north", "south"] },
    { n: "暗杀考验·忍",   id: "xl/anshakaoyan3",      p: [0, -5],  exits: ["north", "south"] },
    { n: "暗杀考验·决",   id: "xl/anshakaoyan4",      p: [0, -6],  exits: ["north", "south"] },
    { n: "暗杀考验·隐",   id: "xl/anshakaoyan5",      p: [0, -7],  exits: ["north", "south"] },
    { n: "血刃堂",         id: "xl/xuerentang",        p: [0, -8],  exits: ["north", "south"] },
    { n: "暗影回廊",       id: "xl/anyinghuilang",     p: [0, -9],  exits: ["north", "south"] },
    { n: "杀手之王墓一",   id: "xl/shawangmu1",        p: [0, -10], exits: ["north", "south"] },
    { n: "杀手之王墓二",   id: "xl/shawangmu2",        p: [0, -11], exits: ["north", "south"] },
    { n: "杀手之王墓三",   id: "xl/shawangmu3",        p: [0, -12], exits: ["north", "south"] },
    { n: "修罗血池",       id: "xl/xiuluoxuechi",      p: [0, -13], exits: ["north", "south"] },
    { n: "阴影圣殿",       id: "xl/yinyingshengdian",  p: [0, -14], exits: ["north", "south"] },
    { n: "绝杀密室",       id: "xl/jueshamishi",       p: [1, -14], exits: ["west"] },
    { n: "暗影王座",       id: "xl/anyingwangzuo",     p: [0, -15], exits: ["north", "south"] },
    { n: "修罗真身台",     id: "xl/xiuluozhenshentai", p: [0, -16], exits: ["north", "south", "west"] },
    { n: "影之试炼场",     id: "xl/yingzhishilian",    p: [-1, -16], exits: ["east"] },
    { n: "暗杀传承殿",     id: "xl/chuanchengdian",    p: [0, -17], exits: ["south"] },
];
this.drops = [];
this.quick_drops = [{ obj: "money/silver", min: 1, max: 10 }];
this.on_enter = function (me) {
    // 杀手楼对应的 FAMILIES key
    if (me.family !== FAMILIES.SHASHOU) return me.notify("只有杀手楼弟子才能进入修罗暗殿。");
    if (me.level < 4) return me.notify("你境界未到武帝，无法承受暗殿中的修罗杀意。");
    if (me.query_temp("wd_level", 0) < 100) return me.notify("你尚未通过武道塔第一百层，暗殿之门不会为你开启。");
    me.set_bool('fb2', this.jd_index, true);
    var next_room = ROOM.Get("xl/andianrukou");
    var copy_room = next_room.query_copy2(me);
    if (!copy_room) copy_room = next_room.create_copy2(me);
};
this.on_leave = function (me) {
    var copy_room = this.rooms[0].query_copy2(me);
    if (copy_room) copy_room.clear_copy(me);
    me.remove_temp("xl_progress"); me.remove_temp("xl_as_active");
};
