// 炼药炼出的丹药：drug/dan#<丹方 id>，效果见 world/lianyao.js。
// 战斗 / 修炼类丹药的增益与喜宴同属「食物」（状态 id food），同一时间只保留一种，后吃的替换先吃的。
this.inherits(OBJ);
this.unit = "颗";
this.name = "丹药";
this.value = 1000;
this.combined = true;
this.action_msg = "吃";
this.allow_fight = true;
this.transable = true;
this.distime = 5000;

this.on_create = function (path, par) {
    var rec = par && WORLD.LIANYAO ? WORLD.LIANYAO.get(par.substr(1)) : null;
    if (!rec) return;
    this.recipe = rec.id;
    this.grade = rec.grade;
    this.name = rec.name;
    this.value = WORLD.LIANYAO.DAN_VALUE[rec.grade];
    this.desc = "一颗" + WORLD.LIANYAO.GRADE_TEXT[rec.grade] + "品质的" + rec.name + "，服下后" + WORLD.LIANYAO.effect_text(rec) + "。";
    // 冷却分组：回复类与喜宴的回血菜一样（distype hp、60 秒，和喜宴回血共用冷却；回内力另算一组），
    // 突破单独一组，增益类共用一组
    if (rec.prop === "heal_hp") { this.distype = "hp"; this.distime = 60000; }
    else if (rec.prop === "heal_mp") { this.distype = "mp"; this.distime = 60000; }
    else if (rec.prop === "breakthrough") { this.distype = "dan_tupo"; this.distime = 3000; this.allow_fight = false; }
    else this.distype = "dan_buff";
};

this.on_use = function (me) {
    var L = WORLD.LIANYAO, rec = L && L.get(this.recipe);
    if (!rec) return me.notify_fail("这颗丹药药性已失，吃不得了。");
    if (me.hp <= 0) return me.notify_fail("你现在是灵魂状态，不能那么做。");

    if (rec.prop === "heal_hp") {
        if (me.hp >= me.max_hp) return me.notify_fail("你目前气血充沛，用不着恢复。");
        var hp = me.add_hp(Math.floor(me.max_hp * rec.value / 100)) || 0;
        me.send_room("$N服下一颗" + this.color_name + "。");
        return me.notify("<hig>你恢复了" + hp + "点气血。</hig>");
    }
    if (rec.prop === "heal_mp") {
        if (me.mp >= me.max_mp) return me.notify_fail("你目前内力充沛，用不着恢复。");
        var before = me.mp;
        me.add_mp(Math.floor(me.max_mp * rec.value / 100));
        me.send_room("$N服下一颗" + this.color_name + "。");
        return me.notify("<hic>你恢复了" + (me.mp - before) + "点内力。</hic>");
    }
    if (rec.prop === "breakthrough") return use_breakthrough(me, rec, this);

    // 增益类：与喜宴同属食物，后吃的替换先吃的
    var prop = {};
    prop[rec.prop] = rec.value;
    me.remove_status("food", true);
    me.add_status({
        id: "food",
        name: rec.name,
        desc: L.effect_text(rec),
        prop: prop,
        duration: L.buff_minutes(rec) * 60000
    });
    me.send_room("$N服下一颗" + this.color_name + "。");
};

// 突破丹：在已学技能里随机挑一门品级不高于丹药品级、还没到等级上限的，提升 1～3 级
function use_breakthrough(me, rec, dan) {
    if (me.skill_fixed && me.skill_fixed()) return me.notify_fail("你的技能等级已被锁定，突破丹对你无效。");
    var limit = me.skill_limit ? me.skill_limit() : 9999, pool = [];
    for (var id in me.skills || {}) {
        var sk = SKILL.get(id), item = me.skills[id];
        if (!sk || !item || sk.is_custom) continue;
        if ((parseInt(sk.grade) || 0) > rec.grade) continue;
        if (item.level >= limit) continue;
        pool.push(id);
    }
    if (!pool.length) return me.notify_fail("你没有可以突破的技能（品级不高于" + WORLD.LIANYAO.GRADE_TEXT[rec.grade] + "、且未到等级上限）。");
    var pick = pool[Math.floor(Math.random() * pool.length)], cur = me.skills[pick].level;
    var to = Math.min(limit, cur + 1 + Math.floor(Math.random() * 3));
    me.set_skill(pick, to);
    var sk = SKILL.get(pick);
    me.notify('{type:"dialog",dialog:"skills",id:"' + pick + '",level:' + to + ',exp:' + (me.skills[pick].exp || 0) + '}');
    me.send_room("$N服下一颗" + dan.color_name + "。");
    me.notify("<hiy>药力化开，你的" + (sk.query_color_name ? sk.query_color_name(me) : sk.name) + "提升到了" + to + "级！</hiy>");
}
