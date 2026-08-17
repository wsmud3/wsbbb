this.inherits(FAMILY_AREA);
this.set({
    id: "shashou",
    name: "杀手楼",
    desc: "一个游离在江湖外的神秘组织，法规森严，鲜少参与江湖争斗。",
    sp: "门下弟子多为杀手，一手暗器功夫出神入化",
    first: "shashou/damen",
    is_area: true,
    is_public: true,
    index: 7,
    room_path: "shashou/",
    family: "SHASHOU"
});
this.map = [
    { n: "大门", id: "shashou/damen", p: [0, 0], exits: ["n"] },
    { n: "大厅", id: "shashou/datang", p: [0, -1], exits: ["u", "s"] },
    { n: "暗阁", id: "shashou/ange1", p: [0, -2], exits: ["u", "d"] },
    { n: "铜楼", id: "shashou/tonglou", p: [0, -3], exits: ["u", "e", "d"] },
    { n: "暗阁", id: "shashou/ange2", p: [0, -4], exits: ["u", "d"] },
    { n: "银楼", id: "shashou/yinlou", p: [0, -5], exits: ["u", "e", "d"] },
    { n: "暗阁", id: "shashou/ange3", p: [0, -6], exits: ["u", "d"] },
    { n: "金楼", id: "shashou/jinlou", p: [0, -7], exits: ["u", "w", "d"] },
    { n: "平台", id: "shashou/pingtai", p: [0, -8], exits: ["d"] },
    { n: "书房", id: "shashou/shufang", p: [1, -7], exits: ["w"] },
    { n: "休息室", id: "shashou/xiuxi", p: [1, -3], exits: ["w"] },
    { n: "练功房", id: "shashou/liangong", p: [1, -5], exits: ["w"] }
];
