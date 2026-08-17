this.inherits(ROOM);
this.name = "九重天";
this.desc = "踏入青铜巨门，眼前豁然开朗——九层巨大的环形平台悬浮于虚空之中，层层而上，直入云霄。每一层都铭刻着不同的远古符文，散发着各色光芒：第一层赤红如火，第二层湛蓝如海，第三层碧绿如翠，第四层金黄如日，第五层紫气氤氲，第六层白芒如电，第七层漆黑如墨，第八层银辉如月，第九层金光万丈，令人无法直视。\n\n这便是传说中「九重天」——唯有通过全部九重考验，方能登临武神之境。最底层平台的中央立着一块古碑，碑上刻着八个大字：「九重天上，武神为尊。」碑旁有一道直通顶层的天梯虚影，忽明忽暗，似乎随时可能消散。";
this.exits = { "south": "zhanshen/qiandian", "north": "zhanshen/wushendian" };
this.set_npc([]);
this.no_relive = true;
this.is_shadow = true;

this.add_action("tapotian", "踏破九重天", function (me) {
    if (me.query_temp("zhanshen_wushen")) {
        return me.notify("你已成武神，九重天之路已在你身后。武神殿中一片宁静。");
    }
    if (me.query_temp("zhanshen_tapotian")) {
        return me.notify("你已踏破九重天，速速前往北方武神殿登临武神之位！");
    }

    var npc = this.find_by_path("zhanshen/chiyou");
    if (npc) {
        me.notify("<hir>蚩尤残魂尚在，击败他方可踏破九重天！</hir>");
        return true;
    }

    // 第一重：四方试炼——青龙
    if (!me.query_temp("ss_trial_done_0")) {
        return me.notify("<hir>第一重天·青龙关</hir>：你尚未通过四方试炼之青龙试炼。前往武道塔东面青龙台，命中达20万即可通过。");
    }
    me.notify("<hig>第一重天·青龙关</hig>——已通过。");

    // 第二重：四方试炼——白虎
    if (!me.query_temp("ss_trial_done_1")) {
        return me.notify("<hir>第二重天·白虎关</hir>：你尚未通过四方试炼之白虎试炼。前往武道塔西面白虎台，躲闪达20万即可通过。");
    }
    me.notify("<hig>第二重天·白虎关</hig>——已通过。");

    // 第三重：四方试炼——玄武
    if (!me.query_temp("ss_trial_done_2")) {
        return me.notify("<hir>第三重天·玄武关</hir>：你尚未通过四方试炼之玄武试炼。前往武道塔北面玄武台，攻击达20万（最终伤害每1%等效1000攻击）即可通过。");
    }
    me.notify("<hig>第三重天·玄武关</hig>——已通过。");

    // 第四重：四方试炼——朱雀
    if (!me.query_temp("ss_trial_done_3")) {
        return me.notify("<hir>第四重天·朱雀关</hir>：你尚未通过四方试炼之朱雀试炼。前往武道塔南面朱雀台，防御达20万（免伤每1%等效1000防御）即可通过。");
    }
    me.notify("<hig>第四重天·朱雀关</hig>——已通过。");

    // 第五重：生死门——生门
    if (!me.query_temp("jncz_shengmen")) {
        return me.notify("<hir>第五重天·生门关</hir>：你尚未通过静念禅宗之生门试炼。前往静念禅宗生门完成试炼后再来。");
    }
    me.notify("<hig>第五重天·生门关</hig>——已通过。");

    // 第五重（续）：生死门——死关
    if (!me.query_temp("cihang_siguan")) {
        return me.notify("<hir>第五重天·死关</hir>：你尚未通过慈航静斋之死关试炼。前往慈航静斋死关密室完成试炼后再来。");
    }
    me.notify("<hig>第五重天·死关</hig>——已通过。");

    // 第六重：拳脚
    var found_unarmed = false;
    for (var key in me.skills) {
        var sk = SKILL.get(key);
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (!sk.can_enables || sk.can_enables.indexOf("unarmed") === -1) continue;
        if (me.skills[key].level >= 4000 && sk.query_grade(me) >= 6) {
            found_unarmed = true;
            break;
        }
    }
    if (!found_unarmed) {
        return me.notify("<hir>第六重天·拳脚关</hir>：你尚未将一门拳脚绝学修炼至四千级以上六阶。");
    }
    me.notify("<hig>第六重天·拳脚关</hig>——已通过。");

    // 第七重：内功
    var found_force = false;
    for (var key in me.skills) {
        var sk = SKILL.get(key);
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (!sk.can_enables || sk.can_enables.indexOf("force") === -1) continue;
        if (me.skills[key].level >= 4000 && sk.query_grade(me) >= 6) {
            found_force = true;
            break;
        }
    }
    if (!found_force) {
        return me.notify("<hir>第七重天·内功关</hir>：你尚未将一门内功绝学修炼至四千级以上六阶。");
    }
    me.notify("<hig>第七重天·内功关</hig>——已通过。");

    // 第七重（续）：轻功
    var found_dodge = false;
    for (var key in me.skills) {
        var sk = SKILL.get(key);
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (!sk.can_enables || sk.can_enables.indexOf("dodge") === -1) continue;
        if (me.skills[key].level >= 4000 && sk.query_grade(me) >= 6) {
            found_dodge = true;
            break;
        }
    }
    if (!found_dodge) {
        return me.notify("<hir>第七重天·轻功关</hir>：你尚未将一门轻功绝学修炼至四千级以上六阶。");
    }
    me.notify("<hig>第七重天·轻功关</hig>——已通过。");

    // 第七重（续）：招架
    var found_parry = false;
    for (var key in me.skills) {
        var sk = SKILL.get(key);
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (!sk.can_enables || sk.can_enables.indexOf("parry") === -1) continue;
        if (me.skills[key].level >= 4000 && sk.query_grade(me) >= 6) {
            found_parry = true;
            break;
        }
    }
    if (!found_parry) {
        return me.notify("<hir>第七重天·招架关</hir>：你尚未将一门招架绝学修炼至四千级以上六阶。");
    }
    me.notify("<hig>第七重天·招架关</hig>——已通过。");

    // 第八重：兵器
    var weapon_types = ["sword", "blade", "staff", "club", "whip", "throwing"];
    var found_weapon = false;
    for (var key in me.skills) {
        var sk = SKILL.get(key);
        if (!sk || sk.type !== SKILL_TYPES.SKILL) continue;
        if (!sk.can_enables || !sk.can_enables.some(function(t) { return weapon_types.indexOf(t) !== -1; })) continue;
        if (me.skills[key].level >= 4000 && sk.query_grade(me) >= 6) {
            found_weapon = true;
            break;
        }
    }
    if (!found_weapon) {
        return me.notify("<hir>第八重天·兵器关</hir>：你尚未将一门兵器绝学修炼至四千级以上六阶。");
    }
    me.notify("<hig>第八重天·兵器关</hig>——已通过。");

    // 第九重：内力修为
    if (me.max_mp < 40000000) {
        return me.notify("<hir>第九重天·内力关</hir>：你的内力修为不足四千万，无法承受九重天的威压。（当前：" + me.max_mp + "）");
    }
    me.notify("<hig>第九重天·内力关</hig>——已通过。");

    // 全部通过，召唤蚩尤
    me.notify("\n<hir>九重天碑文骤然亮起，一道古老而威严的声音在虚空中响起：</hir>");
    me.notify("<hiy>「万载岁月，终有来人。九关已过，且让本座看看——你是否有资格成为武神！」</hiy>");
    me.notify("<hir>九重天顶的金光凝聚成一尊巨大的魔神虚影——上古战神蚩尤的残魂降临了！</hir>\n");

    var boss = NPC.CLONE("zhanshen/chiyou");
    boss.environment = this;
    for (var i = this.items.length - 1; i >= 0; i--) {
        if (!this.items[i].is_player) {
            this.items.splice(i, 1);
        }
    }
    this.items.push(boss);
    this.item_changed(boss, true);
    this.refresh();
    boss.do_kill(me);

    return true;
});
