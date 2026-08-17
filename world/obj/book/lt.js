
this.inherits(OBJ);
this.set({
    unit: "张",
    name: "知识进阶残页",
    desc: "一张记载了知识进阶之法的残页",
    value: 500,
    grade: 1
});

const LT_MAP = {
    "GAIBANG": { slot: 0, name: "机关术残页", desc: "记载了机关术进阶之法的残页" },
    "guanqi": { slot: 1, name: "观气术残页", desc: "记载了观气术进阶之法的残页，可以观察他人的武功路数" },
    "HUASHAN": { slot: 2, name: "浩然气残页", desc: "记载了浩然气进阶之法的残页" },
    "EMEI": { slot: 3, name: "普渡残页", desc: "记载了普渡进阶之法的残页" },
    "SHASHOU": { slot: 4, name: "赏罚论残页", desc: "记载了赏罚论进阶之法的残页" },
    "jianchan": { slot: 5, name: "见禅心残页", desc: "记载了见禅心进阶之法的残页，打坐时心无旁骛，效率渐增" },
    "qixiaoyao": { slot: 6, name: "齐逍遥残页", desc: "记载了齐逍遥进阶之法的残页，双修之术更上一层楼" },
};

const GRADE_COLOR = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];

this.on_create = function (path, par) {
    if (!par) return;
    par = par.substr(1);
    var info = LT_MAP[par];
    if (!info) return;
    this.slot_index = 500 + info.slot;
    this.slot_info = info;
    this.name = info.name;
    this.desc = info.desc;
    this.grade = 1;
    var cc = this.query_grade_color();
    this.color_name = "<" + cc + ">" + this.name + "</" + cc + ">";
};

// Recalculate skill level when grade changes to maintain total exp consistency
this.recalc_level = function (me, skill_base, sk, old_grd) {
    if (sk.level <= 100) return;
    var new_grd = skill_base.query_grade(me);
    if (new_grd === old_grd) return;

    // total_exp at old grade
    var total_exp = 0;
    var temp_grd = old_grd;
    // Temporarily compute with old grade
    if (sk.level > 100) {
        total_exp = (100 + sk.level) * (sk.level - 100) / 2 * (temp_grd + 1) * 5;
        total_exp += sk.exp / 100 * (sk.level + 1) * (temp_grd + 1) * 5;
    }

    // Binary search for new level at new grade
    var lo = 100, hi = sk.level + 200;
    while (lo < hi) {
        var mid = Math.floor((lo + hi + 1) / 2);
        var need = (100 + mid) * (mid - 100) / 2 * (new_grd + 1) * 5;
        if (need <= total_exp) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }
    var new_level = lo;
    var base_exp = (100 + new_level) * (new_level - 100) / 2 * (new_grd + 1) * 5;
    var remaining = total_exp - base_exp;
    var per_exp = (new_level + 1) * (new_grd + 1) * 5;
    var new_exp = per_exp > 0 ? Math.floor(remaining / per_exp * 100) : 0;

    if (new_level !== sk.level) {
        sk.level = new_level;
        sk.exp = new_exp;
    }
};

this.on_use = function (me) {
    var skill_base = SKILL.get("literate");
    if (!skill_base) return me.notify("无法找到读书写字技能。");
    var sk = me.skills["literate"];
    if (!sk || sk.level < 1000)
    return me.notify("你的读书写字等级不足1000级，无法使用此残页。");

    var grd = skill_base.query_grade(me);

    if (!sk.addin) sk.addin = [];

    var localIndex = this.slot_index - 500;
    var slot_def = skill_base.slots[localIndex];
    if (!slot_def) return me.notify("此进阶不存在。");

    // grade >= 5: must use replacement flow via lingwu command
    if (grd >= 5)
    return me.notify("你的读书写字已达到最高进阶等级（" + grd + "级），请使用进阶界面的重置进阶功能来替换已有词条。");

    // non-repeatable check
    if (slot_def.count === 1 || !slot_def.count) {
        if (sk.addin.indexOf(this.slot_index) !== -1)
        return me.notify("你已经拥有了" + slot_def.name + "进阶，不可重复获取。");
    }

    // count limit
    var count = 0;
    for (var i = 0; i < sk.addin.length; i++) {
        if (sk.addin[i] === this.slot_index) count++;
    }
    if (slot_def.count > 1 && count >= slot_def.count)
    return me.notify(slot_def.name + "已达到最大进阶次数（" + slot_def.count + "次）。");

    var old_grd = grd;

    // Add the addin
    sk.addin.push(this.slot_index);

    // Recalculate level if grade changed
    this.recalc_level(me, skill_base, sk, old_grd);

    var new_grd = skill_base.query_grade(me);
    skill_base.release_prop(me, me.query_skill("literate"));
    skill_base.attach_prop(me, sk.level);
    me.recount();

    var lv_color = GRADE_COLOR[new_grd] || "wht";
    me.notify("<hig>你的读书写字进阶了" + slot_def.name + "！</hig>");
    me.notify("你使用了" + this.color_name + "，领悟了" + slot_def.name + "，" +
    skill_base.color_name + "进阶为<" + lv_color + ">" + new_grd + "级</" + lv_color + ">。");
    me.notify('{type:"dialog",dialog:"skills",id:"literate",level:' + sk.level + ',exp:' + sk.exp + ',grade:' + new_grd + '}');
};

// Called by lingwu command for replacement
this.replace_addin = function (me, old_slot_value) {
    var skill_base = SKILL.get("literate");
    if (!skill_base) return me.notify("无法找到读书写字技能。");
    var sk = me.skills["literate"];
    if (!sk || !sk.addin) return false;

    var idx = sk.addin.indexOf(old_slot_value);
    if (idx === -1) return me.notify("你没有对应的进阶词条可以替换。");

    var old_local = old_slot_value - 500;
    var old_def = skill_base.slots[old_local];
    var old_name = old_def ? old_def.name : "未知进阶";

    var new_local = this.slot_index - 500;
    var new_def = skill_base.slots[new_local];
    if (!new_def) return me.notify("此进阶不存在。");

    // non-repeatable check (can't replace with same unique)
    if ((new_def.count === 1 || !new_def.count) && new_local === old_local)
    return me.notify("你已经拥有了" + new_def.name + "进阶，不可重复获取。");

    // Replace
    sk.addin.splice(idx, 1);
    sk.addin.push(this.slot_index);

    skill_base.release_prop(me, me.query_skill("literate"));
    skill_base.attach_prop(me, sk.level);
    me.recount();

    var grd = skill_base.query_grade(me);
    me.notify("<hig>你将读书写字的" + old_name + "替换为" + new_def.name + "。</hig>");
    me.notify('{type:"dialog",dialog:"skills",id:"literate",level:' + sk.level + ',exp:' + sk.exp + ',grade:' + grd + '}');
    return true;
};
