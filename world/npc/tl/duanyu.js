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

// 玩家进入时检查是否杀过僧人
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (me.query_temp('tl_killed_any')) {
        me.notify('段誉摇了摇头："你杀孽太重，我不能跟你走。"');
        this.actions = {};
        return;
    }
    this.actions = {};
    this.actions["carry_duanyu"] = { name: "背负段誉" };
};
