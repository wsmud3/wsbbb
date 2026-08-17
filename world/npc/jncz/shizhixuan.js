this.inherits(NPC);
this.name = "石之轩残魂";
this.desc = "一道若有若无的身影，散发着霸道无匹的气息。这正是数百年前邪王石之轩的一缕残魂。他目光如电，扫视着来人：『和氏璧的气息……你想学我的不死印法？』";
this.no_fight = true;

// NPC自身动作：请教不死印法（正确格式：对象）
this.actions = {};
this.actions["learn_busiyinfa"] = { name: "请教不死印法" };

this.on_create = function() {
    this.actions = {};
    this.actions["learn_busiyinfa"] = { name: "请教不死印法" };
};
