this.inherits(COMMAND);
this.command = 'carry_duanyu';
this.allow_busy = true;
this.allow_fight = true;   // 可在与枯荣交手时抓人（攻略打法）
// 规则见 world/area/fb1/fb28.js（tl_carry）
this.enter = function (me) {
    var area = me.environment && me.environment.parent;
    if (!area || !area.tl_carry) return me.notify('段誉不在这里。');
    area.tl_carry(me);
};
