this.inherits(NPC);
this.name = "段誉";
this.desc = "大理镇南王世子，生性善良，不谙世事。他因误食莽牯朱蛤而百毒不侵，又机缘巧合习得了六脉神剑，只是时灵时不灵。他焦急地看着你：『兄台，能不能背我离开这里？那些僧人想抓我回去！』";
this.no_fight = true;
this.hp = 100;
this.max_hp = 100;

// NPC自身动作
this.actions = {};
this.actions["carry_duanyu"] = { name: "背负段誉" };

this.on_create = function() {
    this.actions = {};
    this.actions["carry_duanyu"] = { name: "背负段誉" };
};
// 能否背走（杀人数、是否已背、是否已失败）统一在 world/area/fb1/fb28.js 的 tl_carry 里判定
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("段誉焦急地看着你：「兄台，能不能背我离开这里？」");
};
