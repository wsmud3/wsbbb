// 云湺山：八派真意禁地的总入口，各大派祖师隐居之处。江湖地图「禁地」里只列这一处；
// 自山脚沿白云石阶上山，迎客坪、松风岭、山心石坪三处各分岔路通往各派祖师隐居的居所（共 22 个房间），
// 走到本门居所即可踏入本门禁地。
// 各派禁地本身仍是独立区域（jz/zw/dmd/...），只接纳本门弟子，进入时经 WORLD.ZHENYI.can_enter_area 校验。
this.inherits(AREA);
this.set({
    id: "jindi",
    name: "云湺山",
    desc: "各大派高手隐居之处。\n贾岛《寻隐者不遇》有云：「松下问童子，言师采药去。只在此山中，云深不知处。」云湺山便是这样一座山——终年云海不散，樵子入山三日，往往只见白云不见人。相传江湖各大门派的祖师与绝顶高手，功成之后多不恋声名，悄然归隐于此，结庐而居，互不相扰；山中八处居所，各藏着一派武学的源头。后世弟子唯有踏入武帝之境、身经武道塔百层，方能循着祖师留下的路，寻到本门封存武意的禁地。",
    first: "jindi/shanjiao",
    room_path: "jindi/",
    not_fb: true,
    expend: 0,
    exp: 0,
    pot: 0,
    jd_index: 2,
    is_multi: false,
});

this.map = [
    { n: "云湺山脚", id: "jindi/shanjiao", p: [0, 4], exits: ["north"] },
    { n: "白云石阶", id: "jindi/shijie", p: [0, 3], exits: ["north", "south"] },
    { n: "迎客坪", id: "jindi/yingke", p: [0, 2], exits: ["north", "south", "west", "east"] },
    { n: "松风岭", id: "jindi/songfeng", p: [0, 1], exits: ["north", "south", "west", "east"] },
    { n: "山心石坪", id: "jindi/shiping", p: [0, 0], exits: ["south", "west", "east", "north", "northwest", "northeast"] },
    { n: "观云台", id: "jindi/guanyun", p: [1, -1], exits: ["southwest"] },
    { n: "云径", id: "jindi/em_lu", p: [-1, 2], exits: ["west", "east"] },
    { n: "白梅庵", id: "jindi/emei", p: [-2, 2], exits: ["east"] },
    { n: "山涧小路", id: "jindi/gb_lu", p: [1, 2], exits: ["east", "west"] },
    { n: "竹棚", id: "jindi/dongting", p: [2, 2], exits: ["west"] },
    { n: "幽谷密林", id: "jindi/xy_lu", p: [-1, 1], exits: ["west", "east"] },
    { n: "琴台", id: "jindi/wuliang", p: [-2, 1], exits: ["east"] },
    { n: "血雾小径", id: "jindi/xl_lu", p: [1, 1], exits: ["east", "west"] },
    { n: "暗楼", id: "jindi/xuewu", p: [2, 1], exits: ["west"] },
    { n: "雪径", id: "jindi/sn_lu", p: [-1, 0], exits: ["west", "east"] },
    { n: "玉阁", id: "jindi/kunlun", p: [-2, 0], exits: ["east"] },
    { n: "回环竹林", id: "jindi/wd_lu", p: [1, 0], exits: ["east", "west"] },
    { n: "静室", id: "jindi/wudang", p: [2, 0], exits: ["west"] },
    { n: "松柏古道", id: "jindi/sl_lu", p: [0, -1], exits: ["north", "south"] },
    { n: "禅舍", id: "jindi/songshan", p: [0, -2], exits: ["south"] },
    { n: "樵径", id: "jindi/hs_lu", p: [-1, -1], exits: ["west", "southeast"] },
    { n: "剑庐", id: "jindi/huashan", p: [-2, -1], exits: ["east"] },
];

this.drops = [];
this.quick_drops = [];

this.on_enter = function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.can_enter_hub(me) : false;
};
