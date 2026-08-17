
this.inherits(COMMAND);
this.command = "lingwu";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.regex = /^(\w+)(?:\s(r?\d+|reset|up|ss|weapon|unarmed|force|dodge|parry)(?:\s(r?\d+))?)?$/;
this.enter = function (player, skid, arg1, arg2) {
    var skill_base = SKILL.get(skid);
    if (!skill_base) return player.send("没有这个技能。");

    var sk = player.skills[skid];
    if (!sk) return player.notify("你还没有学会" + skill_base.color_name + "。");

    // ZC custom skills cannot be advanced through the normal advancement system
    if (skill_base.is_custom)
        return player.notify("此技能无法进阶。");

    if (skill_base.type === SKILL_TYPES.KNOWLEDGE) {
        if (sk.level < 1000)
            return player.notify("你的" + skill_base.color_name + "等级不足1000级，无法进阶。");
        knowledge_flow(player, skid, skill_base, sk, arg1, arg2);
    } else {
        if (sk.level < 1000)
            return player.notify("你的" + skill_base.color_name + "等级不足1000级，无法进阶。");
        combat_flow(player, skid, skill_base, sk, arg1, arg2);
    }
};

// ==================== POSITION MAPPING ====================
var POSITION_GROUPS = {
    weapon: ["sword", "blade", "staff", "club", "whip", "throwing"],
    unarmed: ["unarmed"],
    force: ["force"],
    dodge: ["dodge"],
    parry: ["parry"]
};

var POSITION_NAMES = {
    weapon: "武器",
    unarmed: "拳脚",
    force: "内功",
    dodge: "轻功",
    parry: "招架"
};

var WEAPON_TYPES = ["sword", "blade", "staff", "club", "whip", "throwing"];

function get_position_name(ce) {
    if (WEAPON_TYPES.indexOf(ce) !== -1) return "weapon";
    return ce;
}

function get_positions(can_enables) {
    var seen = {};
    var result = [];
    for (var i = 0; i < can_enables.length; i++) {
        var pname = get_position_name(can_enables[i]);
        if (!seen[pname]) {
            seen[pname] = true;
            result.push(pname);
        }
    }
    return result;
}

function get_slots_for_position(position) {
    var slots = SKILL.PROPERTIES;
    var result = [];
    for (var i = 0; i < slots.length; i++) {
        if (slots[i].positions.indexOf(position) !== -1) {
            result.push({ index: i, def: slots[i] });
        }
    }
    return result;
}

// ==================== LEVEL RECALCULATION ====================
function recalc_level(me, skill_base, sk, old_grd) {
    if (sk.level <= 100) return;
    var new_grd = skill_base.query_grade(me);
    if (new_grd === old_grd) return;

    var total_exp = 0;
    total_exp = (100 + sk.level) * (sk.level - 100) / 2 * (old_grd + 1) * 5;
    total_exp += sk.exp / 100 * (sk.level + 1) * (old_grd + 1) * 5;

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
}

// ==================== KNOWLEDGE SKILL FLOW ====================
function knowledge_flow(player, skid, skill_base, sk, arg1, arg2) {
    var grd = skill_base.query_grade(player);
    if (!skill_base.slots || !skill_base.slots.length)
        return player.notify("此技能没有可用的进阶分支。");

    if (!sk.addin) sk.addin = [];

    // REPLACE EXECUTION
    if (arg1 !== undefined && !isNaN(parseInt(arg1))) {
        var r_new_idx, r_old_val;

        if (arg2 !== undefined && arg2.charAt(0) === 'r') {
            r_new_idx = parseInt(arg1);
            r_old_val = parseInt(arg2.substr(1));
        } else if (arg1.charAt(0) === 'r') {
            r_old_val = parseInt(arg1.substr(1));
            r_new_idx = arg2 !== undefined ? parseInt(arg2) : NaN;
        }

        if (r_old_val !== undefined && !isNaN(r_new_idx) && !isNaN(r_old_val)) {
            if (r_new_idx < 0 || r_new_idx >= skill_base.slots.length)
                return player.notify("无效的进阶分支。");

            var r_new_def = skill_base.slots[r_new_idx];
            if (!r_new_def) return player.notify("此进阶不存在。");

            var r_old_def = get_slot_def(skill_base, r_old_val);
            if (!r_old_def) return player.notify("无效的替换目标。");
            if (sk.addin.indexOf(r_old_val) === -1)
                return player.notify("你没有" + r_old_def.name + "进阶词条。");

            var r_new_si = 500 + r_new_idx;
            if ((r_new_def.count === 1 || !r_new_def.count) && sk.addin.indexOf(r_new_si) !== -1) {
                return player.notify("你已经拥有了" + r_new_def.name + "进阶。");
            }

            var r_needs = r_new_def.query_needs(grd);
            if (!r_needs || !r_needs.length)
                return player.notify("此进阶没有所需物品。");
            var r_need = r_needs[0];
            var r_frag = player.find_obj_bypath(r_need.path);
            if (!r_frag)
                return player.notify("你需要" + r_need.path + "才能替换为" + r_new_def.name + "，请到门派后勤处购买。");

            if (r_frag.replace_addin) {
                var result = r_frag.replace_addin(player, r_old_val);
                if (!result) return;
            } else {
                // IMPORTANT: release old props BEFORE modifying addin
                skill_base.release_prop(player, player.query_skill(skid));
                var r_idx = sk.addin.indexOf(r_old_val);
                sk.addin.splice(r_idx, 1);
                sk.addin.push(r_new_si);
                skill_base.attach_prop(player, sk.level);
                player.recount();
            }
            player.remove_obj(r_frag, 1);

            var new_grd = skill_base.query_grade(player);
            player.notify("<hig>你将读书写字的" + r_old_def.name + "替换为" + r_new_def.name + "。</hig>");
            player.notify('{type:"dialog",dialog:"skills",id:"' + skid + '",name:"' + skill_base.query_color_name(player) + '",level:' + sk.level + ',exp:' + (sk.exp || 0) + ',grade:' + new_grd + '}');
            return;
        }
    }

    // RESET FLOW
    if (arg1 === "reset") {
        if (!sk.addin.length) return player.notify("你没有已进阶的词条可以重置。");

        if (arg2 !== undefined) {
            var old_sv = parseInt(arg2);
            if (isNaN(old_sv)) return player.notify("无效的进阶词条。");
            if (sk.addin.indexOf(old_sv) === -1)
                return player.notify("你没有该进阶词条。");

            var old_d = get_slot_def(skill_base, old_sv);
            var old_nm = old_d ? old_d.name : "未知进阶";

            player.send("将<hic>" + old_nm + "</hic>替换为：\n");
            var has_any = false;

            for (var i = 0; i < skill_base.slots.length; i++) {
                var slot = skill_base.slots[i];
                var si = 500 + i;
                var cnt = 0;
                for (var j = 0; j < sk.addin.length; j++) {
                    if (sk.addin[j] === si) cnt++;
                }
                if ((slot.count === 1 || !slot.count) && (si === old_sv || sk.addin.indexOf(si) !== -1)) continue;
                if (slot.count > 1 && cnt >= slot.count) continue;

                var need_path = get_need_path(slot, grd);
                var has_frag = !!player.find_obj_bypath(need_path);
                var label = (has_frag ? "<hig>◆" : "<red>◆") + slot.name + "</" + (has_frag ? "hig" : "red") + ">";
                label += " " + slot.format(parseInt(slot.value(sk.level, grd)));
                if (!has_frag) label += " (需购买残页)";

                player.send_commands("lingwu " + skid + " " + i + " r" + old_sv, label);
                has_any = true;
            }

            if (!has_any) player.send("没有可用的替换进阶。\n");
            return;
        }

        // Phase 1: show current addins
        player.send("请选择要<red>替换</red>的进阶词条：\n");

        for (var k = 0; k < sk.addin.length; k++) {
            var sv = sk.addin[k];
            var def = get_slot_def(skill_base, sv);
            var nm = def ? def.name : "未知";
            player.send_commands("lingwu " + skid + " reset " + sv, "<hic>◆" + nm + "</hic>");
        }
        return;
    }

    // NORMAL ADVANCEMENT
    if (arg1 !== undefined && !isNaN(parseInt(arg1))) {
        var idx = parseInt(arg1);
        if (idx < 0 || idx >= skill_base.slots.length)
            return player.notify("无效的进阶分支。");

        var slot_def = skill_base.slots[idx];
        var slot_index = 500 + idx;

        if (grd >= 5)
            return player.notify("你的" + skill_base.color_name + "已达到最高进阶等级，请使用\"重置进阶\"替换已有词条。");

        if (slot_def.count === 1 || !slot_def.count) {
            if (sk.addin.indexOf(slot_index) !== -1)
                return player.notify("你已经拥有了" + slot_def.name + "进阶，不可重复获取。");
        }

        var count = 0;
        for (var i = 0; i < sk.addin.length; i++) {
            if (sk.addin[i] === slot_index) count++;
        }
        if (slot_def.count > 1 && count >= slot_def.count)
            return player.notify(slot_def.name + "已达到最大进阶次数（" + slot_def.count + "次）。");

        var needs = slot_def.query_needs(grd);
        if (!needs || !needs.length)
            return player.notify("此进阶没有所需物品。");

        var need = needs[0];
        var frag = player.find_obj_bypath(need.path);
        if (!frag)
            return player.notify("你需要" + need.path + "才能进阶" + slot_def.name + "，请到门派后勤处购买。");

        player.do_command("use", frag.id);
        return;
    }

    // SHOW BRANCHES
    show_knowledge_branches(player, skid, skill_base, sk);
}

// ==================== COMBAT SKILL FLOW ====================
function combat_flow(player, skid, skill_base, sk, arg1, arg2) {
    var grd = skill_base.query_grade(player);

    if (!sk.addin) sk.addin = [];
    sk.exp = sk.exp || 0;

    var has_specific = skill_base.slots && skill_base.slots.length > 0;
    var is_faction = skill_base.family && skill_base.family !== FAMILIES.MONSTER && skill_base.family !== FAMILIES.NONE;
    var positions = get_positions(skill_base.can_enables || []);

    // ==================== RESET FLOW ====================
    if (arg1 === "reset") {
        combat_reset_flow(player, skid, skill_base, sk, arg2);
        return;
    }

    // ==================== SKILL-SPECIFIC SLOTS DISPLAY ====================
    if (arg1 === "ss" && arg2 === undefined) {
        if (is_faction) {
            if (has_specific) {
                show_specific_slots(player, skid, skill_base, sk);
            } else {
                show_faction_upgrade_confirm(player, skid, skill_base, sk);
            }
        } else if (has_specific) {
            return player.notify("此技能暂无特殊进阶。");
        } else {
            return player.notify("此技能没有可用的进阶。");
        }
        return;
    }

    // ==================== SKILL-SPECIFIC SLOT EXECUTION ====================
    if (arg1 === "ss" && arg2 !== undefined && !isNaN(parseInt(arg2))) {
        if (is_faction) {
            if (has_specific) {
                execute_specific_slot(player, skid, skill_base, sk, parseInt(arg2));
            } else if (parseInt(arg2) === 0) {
                execute_faction_upgrade(player, skid, skill_base, sk);
            }
        } else if (has_specific) {
            return player.notify("此技能暂无特殊进阶。");
        } else {
            return player.notify("此技能没有可用的进阶。");
        }
        return;
    }

    // ==================== GLOBAL SLOT EXECUTION ====================
    if (arg1 !== undefined && POSITION_NAMES[arg1] && arg2 !== undefined && !isNaN(parseInt(arg2))) {
        execute_global_slot(player, skid, skill_base, sk, arg1, parseInt(arg2));
        return;
    }

    // ==================== POSITION SELECTED (show slots) ====================
    if (arg1 !== undefined && POSITION_NAMES[arg1]) {
        if (grd >= 5)
            return player.notify("你的" + skill_base.color_name + "等阶已达到橙色以上，无法继续进阶。");
        show_combat_slots(player, skid, skill_base, sk, arg1);
        return;
    }

    // ==================== SHOW POSITIONS ====================
    show_combat_positions(player, skid, skill_base, sk, positions);
}

// ==================== EXECUTE: GLOBAL POOL SLOT (uses 武道) ====================
function execute_global_slot(player, skid, skill_base, sk, position, slot_idx) {
    var grd = skill_base.query_grade(player);

    if (grd >= 5)
        return player.notify("你的" + skill_base.color_name + "等阶已达到橙色以上，无法继续进阶。");
    if (slot_idx < 0 || slot_idx >= SKILL.PROPERTIES.length)
        return player.notify("无效的进阶分支。");

    var slot_def = SKILL.PROPERTIES[slot_idx];
    if (!slot_def) return player.notify("此进阶不存在。");
    if (slot_def.positions.indexOf(position) === -1)
        return player.notify("此进阶不适用于该部位。");

    // Check non-repeatable
    if (slot_def.count === 1 || !slot_def.count) {
        if (sk.addin.indexOf(slot_idx) !== -1)
            return player.notify("你已经拥有了" + slot_def.name + "进阶，不可重复获取。");
    }
    // Check count limit
    var cnt = 0;
    for (var i = 0; i < sk.addin.length; i++) {
        if (sk.addin[i] === slot_idx) cnt++;
    }
    if (slot_def.count > 1 && cnt >= slot_def.count)
        return player.notify(slot_def.name + "已达到最大进阶次数。");

    var cost = grd + 1;
    var item = player.find_obj_bypath("book/wudao");
    if (!item)
        return player.notify("<red>你的武道书不够！需要" + cost + "本武道。</red>");
    if (item.count !== undefined && item.count < cost)
        return player.notify("<red>你的武道书不够！需要" + cost + "本武道（当前拥有" + item.count + "本）。</red>");

    var old_grd = grd;
    // IMPORTANT: release old props BEFORE modifying addin, otherwise
    // release_prop computes props from the NEW addin (including the new slot)
    // and removes props that were never added, canceling out the new slot's effect.
    skill_base.release_prop(player, player.query_skill(skid));
    sk.addin.push(slot_idx);
    recalc_level(player, skill_base, sk, old_grd);
    skill_base.attach_prop(player, sk.level);
    player.recount();
    player.remove_obj(item, cost);

    var new_grd = skill_base.query_grade(player);
    var gc = GRADE_COLORS[new_grd] || "wht";
    player.notify("<hig>你的" + skill_base.name + "进阶了" + slot_def.name + "！</hig>");
    player.notify("消耗" + cost + "本武道，等阶<" + GRADE_COLORS[old_grd] + ">" + old_grd + "级</" + GRADE_COLORS[old_grd] + ">→<" + gc + ">" + new_grd + "级</" + gc + ">。");
    player.notify('{type:"dialog",dialog:"skills",id:"' + skid + '",name:"' + skill_base.query_color_name(player) + '",level:' + sk.level + ',exp:' + (sk.exp || 0) + ',grade:' + new_grd + '}');
}

// ==================== EXECUTE: SKILL-SPECIFIC SLOT (uses up book) ====================
function execute_specific_slot(player, skid, skill_base, sk, slot_idx) {
    var grd = skill_base.query_grade(player);

    if (grd >= 5)
        return player.notify("你的" + skill_base.color_name + "已达到最高进阶等级。");
    if (slot_idx < 0 || slot_idx >= skill_base.slots.length)
        return player.notify("无效的进阶分支。");

    var slot_def = skill_base.slots[slot_idx];
    var si = 500 + slot_idx;

    // Check non-repeatable
    if (slot_def.count === 1 || !slot_def.count) {
        if (sk.addin.indexOf(si) !== -1)
            return player.notify("你已经拥有了" + slot_def.name + "进阶，不可重复获取。");
    }

	    // 无门派玩家不能使用门派进阶残页
	    if (player.family === FAMILIES.NONE) {
	        return player.notify("你没有门派，无法使用门派进阶残页。");
	    }
    // Cost: below purple → orange = 100, otherwise = 50
    var cost = get_up_cost(grd, grd + 1);

    var upbook = player.find_obj_bypath("book/up");
    if (!upbook)
        return player.notify("<red>你需要" + cost + "份门派进阶残页才能进阶" + slot_def.name + "。</red>");
    if (upbook.count !== undefined && upbook.count < cost)
        return player.notify("<red>你的门派进阶残页不够！需要" + cost + "份（当前拥有" + upbook.count + "份）。</red>");

    player.remove_obj(upbook, cost);

    var old_grd = grd;
    // IMPORTANT: release old props BEFORE modifying addin (same fix as execute_global_slot)
    skill_base.release_prop(player, player.query_skill(skid));
    sk.addin.push(si);
    recalc_level(player, skill_base, sk, old_grd);
    skill_base.attach_prop(player, sk.level);
    player.recount();

    var new_grd = skill_base.query_grade(player);
    var gc = GRADE_COLORS[new_grd] || "wht";
    player.notify("<hig>你的" + skill_base.name + "进阶了" + slot_def.name + "！消耗" + cost + "份门派进阶残页。</hig>");
    player.notify('{type:"dialog",dialog:"skills",id:"' + skid + '",name:"' + skill_base.query_color_name(player) + '",level:' + sk.level + ',exp:' + (sk.exp || 0) + ',grade:' + new_grd + '}');
}

// ==================== EXECUTE: FACTION SKILL UPGRADE (transform to skills2, uses up book) ====================

function find_advanced_skill(skill_base) {
    var fam = skill_base.family;
    if (!fam || !fam.skills2) return null;
    for (var i = 0; i < fam.skills2.length; i++) {
        if (fam.skills2[i].source_skill === skill_base.id) {
            return fam.skills2[i];
        }
    }
    return null;
}

function get_up_cost(current_grade, target_grade) {
    // Below purple → orange: 100, everything else: 50
    if (target_grade >= 5 && current_grade < 4) return 100;
    return 50;
}

function show_faction_upgrade_confirm(player, skid, skill_base, sk) {
    var grd = skill_base.query_grade(player);

    if (grd >= 5)
        return player.notify("你的" + skill_base.color_name + "已达到最高进阶等级。");

    var adv_skill = find_advanced_skill(skill_base);

    if (adv_skill) {
        if (player.skills[adv_skill.id])
            return player.notify("你已经学会了" + adv_skill.color_name + "。");

        if (sk.level < 1000)
            return player.notify("你的" + skill_base.color_name + "等级不足1000级，无法进阶。");

        var cost = get_up_cost(grd, adv_skill.grade);
        player.send(skill_base.query_color_name(player) + " 门派进阶：将【" + skill_base.color_name + "】进阶为【" + adv_skill.color_name + "】，消耗<hic>门派进阶残页" + cost + "份</hic>：");
        player.send_commands("lingwu " + skid + " ss 0", "确认进阶（" + cost + "份残页）");
    } else if (skill_base.source_skill) {
        // Already an advanced form with no further skills2, block to prevent non-rollbackable markers
        return player.notify("你的" + skill_base.color_name + "已经没有后续门派进阶了。");
    } else {
        // No skills2 counterpart — increase grade via marker
        var target_grade = grd + 1;
        var cost = get_up_cost(grd, target_grade);
        var gc = GRADE_COLORS[grd] || "wht";
        var next_gc = GRADE_COLORS[target_grade] || "hio";

        player.send(skill_base.query_color_name(player) + " 门派进阶（当前<" + gc + ">" + grd + "级</" + gc + ">→<" + next_gc + ">" + target_grade + "级</" + next_gc + ">，消耗<hic>门派进阶残页" + cost + "份</hic>）：");
        player.send_commands("lingwu " + skid + " ss 0", "确认进阶（" + cost + "份残页）");
    }
}

function execute_faction_upgrade(player, skid, skill_base, sk) {
    var grd = skill_base.query_grade(player);

    if (grd >= 5)
        return player.notify("你的" + skill_base.color_name + "已达到最高进阶等级。");

    // 无门派玩家不能使用门派进阶残页
    if (player.family === FAMILIES.NONE) {
        return player.notify("你没有门派，无法使用门派进阶残页。");
    }

    var adv_skill = find_advanced_skill(skill_base);

    if (adv_skill) {
        // Transform base skill → advanced skill via grade_up
        if (player.skills[adv_skill.id])
            return player.notify("你已经学会了" + adv_skill.color_name + "。");

        if (sk.level < 1000)
            return player.notify("你的" + skill_base.color_name + "等级不足1000级，无法进阶。");

        var cost = get_up_cost(grd, adv_skill.grade);

        var upbook = player.find_obj_bypath("book/up");
        if (!upbook || (upbook.count !== undefined && upbook.count < cost))
            return player.notify("<red>你的门派进阶残页不够！需要" + cost + "份（当前拥有" + (upbook ? upbook.count : 0) + "份）。</red>");

        player.remove_obj(upbook, cost);

        if (skill_base.grade_up(player, adv_skill)) {
            player.notify("<hig>你的" + skill_base.name + "成功进阶为" + adv_skill.color_name + "！消耗" + cost + "份门派进阶残页。</hig>");
        } else {
            // Refund on failure
            var refund = OBJ.CREATE("book/up");
            if (refund) {
                refund.count = cost;
                player.add_obj(refund);
            }
            return player.notify("进阶失败。");
        }
    } else if (skill_base.source_skill) {
        // Already an advanced form with no further skills2
        return player.notify("你的" + skill_base.color_name + "已经没有后续门派进阶了。");
    } else {
        // No skills2 counterpart — fallback to marker-based grade increase
        var target_grade = grd + 1;
        var cost = get_up_cost(grd, target_grade);

        var upbook = player.find_obj_bypath("book/up");
        if (!upbook || (upbook.count !== undefined && upbook.count < cost))
            return player.notify("<red>你的门派进阶残页不够！需要" + cost + "份（当前拥有" + (upbook ? upbook.count : 0) + "份）。</red>");

        player.remove_obj(upbook, cost);

        var old_grd = grd;
        var marker = 500;
        while (sk.addin.indexOf(marker) !== -1) marker++;
        // IMPORTANT: release old props BEFORE modifying addin
        skill_base.release_prop(player, player.query_skill(skid));
        sk.addin.push(marker);
        recalc_level(player, skill_base, sk, old_grd);
        skill_base.attach_prop(player, sk.level);
        player.recount();

        var new_grd = skill_base.query_grade(player);
        var gc = GRADE_COLORS[new_grd] || "wht";
        var old_gc = GRADE_COLORS[old_grd] || "wht";
        player.notify("<hig>你的" + skill_base.name + "门派进阶成功！消耗" + cost + "份门派进阶残页，等阶<" + old_gc + ">" + old_grd + "级</" + old_gc + ">→<" + gc + ">" + new_grd + "级</" + gc + ">。</hig>");
        player.notify('{type:"dialog",dialog:"skills",id:"' + skid + '",name:"' + skill_base.query_color_name(player) + '",level:' + sk.level + ',exp:' + (sk.exp || 0) + ',grade:' + new_grd + '}');
    }
}

// ==================== RESET FLOW ====================
function combat_reset_flow(player, skid, skill_base, sk, arg2) {
    if (!sk.addin.length) return player.notify("你没有已进阶的词条可以重置。");

    if (arg2 !== undefined) {
        var slot_idx = parseInt(arg2);
        if (isNaN(slot_idx)) return player.notify("无效的进阶词条。");

        var pos = sk.addin.indexOf(slot_idx);
        if (pos === -1) return player.notify("你没有该进阶词条。");

        var slot_def = query_any_slot(skill_base, slot_idx);
        var is_specific = slot_idx >= 500;
        // Allow faction upgrade markers (>=500 with no matching slot_def) to be reset
        if (!slot_def && !is_specific) return player.notify("此进阶不存在。");

        var item_path = is_specific ? "book/up" : "book/wudao";
        var item_name = is_specific ? "门派进阶残页" : "武道";

        var old_total_grd = skill_base.grade + sk.addin.length + (sk.ref ? 1 : 0);
        var new_total_grd = skill_base.grade + (sk.addin.length - 1) + (sk.ref ? 1 : 0);
        var item_refund = old_total_grd;

        // Pot refund: exp difference from grade decrease
        var pot_refund = 0;
        if (sk.level > 100) {
            var old_exp_val = (100 + sk.level) * (sk.level - 100) / 2 * (old_total_grd + 1) * 5;
            var new_exp_val = (100 + sk.level) * (sk.level - 100) / 2 * (new_total_grd + 1) * 5;
            pot_refund = Math.max(0, old_exp_val - new_exp_val);
        }

        // IMPORTANT: release old props BEFORE removing the slot, otherwise
        // the removed slot's props are never cleaned up (leaked).
        skill_base.release_prop(player, player.query_skill(skid));
        sk.addin.splice(pos, 1);
        skill_base.attach_prop(player, sk.level);
        player.recount();

        player.pot += pot_refund;
        for (var r = 0; r < item_refund; r++) {
            var ref_item = OBJ.CREATE(item_path);
            if (ref_item) player.add_obj(ref_item);
        }

        var reset_grd = skill_base.query_grade(player);
        var display_name = slot_def ? slot_def.name : "门派进阶";
        player.notify("<hig>你重置了" + skill_base.name + "的" + display_name + "进阶。</hig>");
        if (pot_refund > 0)
            player.notify("返还" + item_refund + "份" + item_name + "和" + pot_refund + "点潜能。");
        else
            player.notify("返还" + item_refund + "份" + item_name + "。");

        player.notify('{type:"dialog",dialog:"skills",id:"' + skid + '",name:"' + skill_base.query_color_name(player) + '",level:' + sk.level + ',exp:' + (sk.exp || 0) + ',grade:' + reset_grd + '}');
        return;
    }

    // Show current addins for reset
    show_combat_reset(player, skid, skill_base, sk);
}

// ==================== COMBAT DISPLAY FUNCTIONS ====================

function show_specific_slots(player, skid, skill_base, sk) {
    var lv = sk.level;
    var grd = skill_base.query_grade(player);
    var str = [];
    var cmds = [];

    var target_grade = grd + 1;
    var cost = get_up_cost(grd, target_grade);
    var gc = GRADE_COLORS[grd] || "wht";
    str.push(skill_base.query_color_name(player) + " 门派进阶（当前<" + gc + ">" + grd + "级</" + gc + ">，消耗<hic>门派进阶残页" + cost + "份</hic>）：");

    for (var i = 0; i < skill_base.slots.length; i++) {
        var slot = skill_base.slots[i];
        var si = 500 + i;
        var owned = sk.addin.indexOf(si) !== -1;
        var maxed = (slot.count === 1 || !slot.count) ? owned : false;
        var sgc = maxed ? "blk" : (GRADE_COLORS[grd + 1] || "hio");

        var label = "<" + sgc + ">◆ " + slot.name + "  " + slot.format(parseInt(slot.value(lv, grd))) + "</" + sgc + ">";

        if (!maxed && grd < 5) {
            cmds.push("lingwu " + skid + " ss " + i);
            cmds.push(label);
        } else {
            str.push("\n" + label);
        }
    }

    player.send(str.join("") + "\n");
    if (cmds.length)
        player.send_commands.apply(player, cmds);
}

function show_combat_positions(player, skid, skill_base, sk, positions) {
    var grd = skill_base.query_grade(player);
    var cost = grd + 1;
    var str = [];
    var cmds = [];

    str.push(skill_base.query_color_name(player) + " 请选择进阶部位（当前" + grd + "级，消耗<hic>武道" + cost + "本</hic>）：");

    for (var i = 0; i < positions.length; i++) {
        var pname = positions[i];
        var display = POSITION_NAMES[pname] || pname;

        if (grd < 5) {
            cmds.push("lingwu " + skid + " " + pname);
            cmds.push("<hic>◆ " + display + "部位</hic>");
        } else {
            str.push("\n<hic>◆ " + display + "部位</hic>");
        }
    }

    if (sk.addin.length > 0) {
        cmds.push("lingwu " + skid + " reset");
        cmds.push("—— 重置进阶 ——");
    }

    var has_specific = skill_base.slots && skill_base.slots.length > 0;
    var is_faction = skill_base.family && skill_base.family !== FAMILIES.MONSTER && skill_base.family !== FAMILIES.NONE;
    if (is_faction) {
        cmds.push("lingwu " + skid + " ss");
        cmds.push("<hir>◆ 门派进阶（消耗门派进阶残页）</hir>");
    } else if (has_specific) {
        cmds.push("lingwu " + skid + " ss");
        cmds.push("<hic>◆ 特殊进阶</hic>");
    }

    player.send(str.join("") + "\n");
    if (cmds.length)
        player.send_commands.apply(player, cmds);
}

function show_combat_slots(player, skid, skill_base, sk, position) {
    var lv = sk.level;
    var grd = skill_base.query_grade(player);
    var cost = grd + 1;
    var pos_display = POSITION_NAMES[position] || position;
    var next_gc = GRADE_COLORS[grd + 1] || "hio";
    var has_item = !!player.find_obj_bypath("book/wudao");
    var item_count = has_item ? (player.find_obj_bypath("book/wudao").count || 1) : 0;
    var enough = has_item && item_count >= cost;
    var str = [];
    var cmds = [];

    str.push(skill_base.query_color_name(player) + " — " + pos_display + "部位（当前" + grd + "级→<" + next_gc + ">" + (grd + 1) + "级</" + next_gc + ">，消耗武道" + cost + "本）：");

    var slots = get_slots_for_position(position);
    for (var i = 0; i < slots.length; i++) {
        var si = slots[i].index;
        var slot = slots[i].def;

        if (slot.condition && !slot.condition(grd)) continue;

        var owned = sk.addin.indexOf(si) !== -1;
        var maxed = (slot.count === 1 || !slot.count) ? owned : false;
        var sc = maxed ? "blk" : next_gc;

        var label = "<" + sc + ">◆ " + slot.name + "  " + slot.format(parseInt(slot.value(lv, grd))) + "</" + sc + "> <hio>消耗武道" + cost + "本</hio>";
        if (maxed)
            label += " <blk>已拥有</blk>";
        else if (!enough)
            label += " <red>武道不足</red>";

        if (!maxed && grd < 5) {
            cmds.push("lingwu " + skid + " " + position + " " + si);
            cmds.push(label);
        } else {
            str.push("\n" + label);
        }
    }

    // Skill-specific slots
    if (skill_base.slots && skill_base.slots.length > 0) {
        str.push("\n<hir>—— 门派进阶（消耗门派进阶残页）——</hir>");
        for (var i = 0; i < skill_base.slots.length; i++) {
            var slot = skill_base.slots[i];
            var si = 500 + i;
            var owned = sk.addin.indexOf(si) !== -1;
            var maxed = (slot.count === 1 || !slot.count) ? owned : false;
            var sgc = maxed ? "blk" : (GRADE_COLORS[grd + 1] || "hio");

            var slot_cost = get_up_cost(grd, grd + 1);
            var cost_label = "门派进阶残页" + slot_cost + "份";
            var label2 = "<" + sgc + ">◆ " + slot.name + "  " + slot.format(parseInt(slot.value(sk.level, grd))) + "</" + sgc + "> <hio>" + cost_label + "</hio>";

            if (!maxed) {
                cmds.push("lingwu " + skid + " ss " + i);
                cmds.push(label2);
            } else {
                str.push("\n" + label2);
            }
        }
    }

    player.send(str.join("") + "\n");
    if (cmds.length)
        player.send_commands.apply(player, cmds);
}

function show_combat_reset(player, skid, skill_base, sk) {
    var grd = skill_base.query_grade(player);
    var cmds = [];

    player.send("请选择要<red>重置</red>的进阶词条（将返还对应物品和潜能）：\n");

    for (var k = 0; k < sk.addin.length; k++) {
        var slot_idx = sk.addin[k];
        var slot_def = query_any_slot(skill_base, slot_idx);
        var is_specific = slot_idx >= 500;
        var nm, val;
        if (slot_def) {
            nm = slot_def.name;
            val = slot_def.format(parseInt(slot_def.value(sk.level, grd)));
        } else if (is_specific) {
            nm = "门派进阶";
            val = "";
        } else {
            nm = "未知进阶";
            val = "";
        }

        cmds.push("lingwu " + skid + " reset " + slot_idx);
        cmds.push("<hic>◆ " + nm + "</hic> " + val + " <blk>(" + (is_specific ? "门派进阶残页" : "武道") + ")</blk>");
    }

    if (cmds.length)
        player.send_commands.apply(player, cmds);
}

// ==================== KNOWLEDGE DISPLAY FUNCTIONS ====================

function show_knowledge_branches(player, skid, skill_base, sk) {
    var lv = sk.level;
    var grd = skill_base.query_grade(player);
    var str = [];
    var cmds = [];

    var gc = GRADE_COLORS[grd] || "wht";
    str.push(skill_base.query_color_name(player) + " 可进阶分支（当前<" + gc + ">" + grd + "级</" + gc + ">）：");

    for (var i = 0; i < skill_base.slots.length; i++) {
        var slot = skill_base.slots[i];
        var si = 500 + i;
        var cnt = 0;
        for (var j = 0; j < sk.addin.length; j++) {
            if (sk.addin[j] === si) cnt++;
        }
        var maxed = (slot.count === 1 || !slot.count) ? cnt >= 1 : cnt >= (slot.count || 1);
        var cc = maxed ? "blk" : "hic";

        var label = "<" + cc + ">◆" + slot.name;
        if (slot.count > 1 && cnt > 0)
            label += "(" + cnt + "/" + slot.count + ")";
        else if (slot.count === 1 && cnt > 0)
            label += "(已拥有)";
        label += "</" + cc + ">";
        label += " " + slot.format(parseInt(slot.value(lv, grd)));

        if (!maxed && grd < 5) {
            var need_path = get_need_path(slot, grd);
            var has_frag = !!player.find_obj_bypath(need_path);
            label += has_frag ? " <hig>[有残页]</hig>" : " <red>[无残页]</red>";
            cmds.push("lingwu " + skid + " " + i);
            cmds.push(label);
        } else {
            str.push("\n" + label);
        }
    }

    if (sk.addin.length > 0) {
        cmds.push("lingwu " + skid + " reset");
        cmds.push("<hir>—— 重置进阶 ——</hir>");
    }

    player.send(str.join("") + "\n");
    if (cmds.length)
        player.send_commands.apply(player, cmds);
}

// ==================== HELPERS ====================

function get_slot_def(skill_base, slot_value) {
    var li = slot_value - 500;
    if (li >= 0 && li < skill_base.slots.length)
        return skill_base.slots[li];
    return null;
}

function query_any_slot(skill_base, slot_idx) {
    if (slot_idx < 500)
        return SKILL.PROPERTIES[slot_idx];
    var li = slot_idx - 500;
    if (skill_base.slots && li >= 0 && li < skill_base.slots.length)
        return skill_base.slots[li];
    return null;
}

function get_need_path(slot, grd) {
    var needs = slot.query_needs(grd);
    return needs && needs.length ? needs[0].path : "";
}

var GRADE_COLORS = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];
