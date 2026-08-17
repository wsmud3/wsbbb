this.inherits(FAMILY_AREA);
this.set({
    id: "gaibang",
    name: "丐帮",
    desc: "墨门行者，人数众多，势力极广，号称「天下第一大帮」，由来已不得考证，帮众以裘褐为衣,以跂蹻为服,日夜不休,以自苦为极。",
    sp: "以拳脚棍法为主，攻击效果突出",
    is_area: true,
    first: "gaibang/shudong",
    room_path: "gaibang/",
    index: 6,
    family: "GAIBANG"
});
this.map = [
    { n: "树洞", id: "gaibang/shudong", p: [0, 0], exits: ["d"] },
    { n: "树洞下", id: "gaibang/shudongxia", p: [0, 1], exits: ["u", "e"] },
    { n: "暗道", id: "gaibang/andao1", p: [1, 1], exits: ["w", "e"] },
    { n: "暗道", id: "gaibang/andao2", p: [2, 1], exits: ["w", "e"] },
    { n: "破庙密室", id: "gaibang/mishi", p: [3, 1], exits: ["u", "w", "e"] },
    { n: "土地庙", id: "gaibang/pomiao", p: [3, 0], exits: ["d"] },
    { n: "暗道", id: "gaibang/andao3", p: [4, 1], exits: ["w", "e"] },
    { n: "暗道", id: "gaibang/andao4", p: [5, 1], exits: ["w", "u"] },
    { n: "林间小屋", id: "gaibang/xiaowu", p: [5, 0], exits: ["d"] }
];
