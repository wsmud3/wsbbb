// 无限扫荡符：测试号专用（sktest fix 发放）。扫荡时代替普通扫荡符、不消耗，掉落与普通扫荡完全相同。
// 扫荡逻辑见 world/cmd/action/cr.js（sweep_ticket）；普通玩家持有也不会生效。
this.inherits(OBJ);
this.set({
    unit: "张",
    name: "无限扫荡符",
    desc: "测试号专用。扫荡副本时不消耗扫荡符，掉落与正常扫荡相同（仍需满足扫荡解锁条件并消耗精力）。",
    grade: 5,
    value: 0
});
this.transable = false;
