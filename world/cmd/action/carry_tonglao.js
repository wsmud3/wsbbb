this.inherits(COMMAND);
this.command = 'carry_tonglao';
this.allow_busy = true;
this.allow_fight = true;   // 断魂崖可在刺客围攻时先背起童姥；李秋水死后在战斗描述里背起（攻略）
// 规则见 world/area/fb1/fb26.js（pm_carry）：进度存副本存储，童姥在仙愁门落地、闭关室送达
this.enter = function (me) {
    var area = me.environment && me.environment.parent;
    if (!area || !area.pm_carry) return me.notify('童姥不在这里。');
    area.pm_carry(me);
};
