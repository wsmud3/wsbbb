this.inherits(COMMAND);
this.command = "zc";
this.regex = /^(\w+)(?:\s(\w+))?(?:\s(.+))?$/;

var ZC_POSITIONS = {
    "内功":  { base: "force",     label: "内功" },
    "剑法":  { base: "sword",     label: "剑法" },
    "刀法":  { base: "blade",     label: "刀法" },
    "拳脚":  { base: "unarmed",   label: "拳脚" },
    "棍法":  { base: "club",      label: "棍法" },
    "杖法":  { base: "staff",     label: "杖法" },
    "鞭法":  { base: "whip",      label: "鞭法" },
    "暗器":  { base: "throwing",  label: "暗器" },
    "轻功":  { base: "dodge",     label: "轻功" },
    "招架":  { base: "parry",     label: "招架" },
};
SKILL.ZC_POSITIONS = ZC_POSITIONS;

var POSITION_TO_KEY = {
    "force":    ["force"],
    "sword":    ["weapon"],
    "blade":    ["weapon"],
    "unarmed":  ["unarmed"],
    "club":     ["weapon"],
    "staff":    ["weapon"],
    "whip":     ["weapon"],
    "throwing": ["weapon"],
    "dodge":    ["dodge"],
    "parry":    ["parry"],
};

var PFM_COST = {1:1, 2:2, 3:3, 4:5, 5:8, 6:12, 7:20};
function potStr(val) {
    if (!val) return "0";
    if (val >= 100000000) return (val / 100000000).toFixed(2) + "亿";
    if (val >= 10000) return (val / 10000).toFixed(2) + "万";
    return val.toString();
}

// Use same color array as os/skill/skill.js level_color for consistency
var ZC_COLORS = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];

// === Per-position word_levels helpers ===
// Build slot-to-position map on skill for fast word_level lookups.
// Each slot maps to an array of positions to support words shared across positions.
function build_slot_position_map(skill, book) {
    var map = {};
    if (skill.zc_words_by_position) {
        for (var pk in skill.zc_words_by_position) {
            var ws = skill.zc_words_by_position[pk];
            for (var i = 0; i < ws.length; i++) {
                if (!map[ws[i]]) map[ws[i]] = [];
                if (map[ws[i]].indexOf(pk) < 0) map[ws[i]].push(pk);
            }
        }
    } else if (book && book.zc_words) {
        for (var pk in book.zc_words) {
            var ws = book.zc_words[pk];
            for (var i = 0; i < ws.length; i++) {
                if (!map[ws[i]]) map[ws[i]] = [];
                if (map[ws[i]].indexOf(pk) < 0) map[ws[i]].push(pk);
            }
        }
    }
    return map;
}

// Get the first position key for a slot (for get_wl position_key parameter).
// Handles both old single-value and new array format.
function get_slot_position(slot_to_position, slot) {
    var val = slot_to_position[slot];
    if (!val) return undefined;
    if (Array.isArray(val)) return val[0];
    return val;
}

// Check if a slot belongs to a position matching the given base type.
function slot_matches_base(slot_to_position, slot, base_type) {
    var val = slot_to_position[slot];
    if (!val) return true; // no position info, include by default (backward compat)
    var posList = Array.isArray(val) ? val : [val];
    for (var pi = 0; pi < posList.length; pi++) {
        var zpos = ZC_POSITIONS[posList[pi]];
        if (zpos && zpos.base === base_type) return true;
    }
    return false;
}

// Get word level from per-position structure, with old-format compatibility.
// When position_key is given, return that position's level first.
// Otherwise scan all positions for max (backward compat when no position known).
function get_wl(word_levels, slot, position_key) {
    if (!word_levels) return 0;
    // Specific position: return its value directly — no cross-position sharing
    if (position_key && word_levels[position_key] && typeof word_levels[position_key] === "object"
        && word_levels[position_key][slot] !== undefined) {
        return word_levels[position_key][slot];
    }
    if (position_key) {
        // Per-position entry not found; check old flat key for backward compatibility
        if (typeof word_levels[slot] === "number") return word_levels[slot];
        return 0;
    }
    // Fallback: scan all positions for max (for callers without position info)
    var maxLevel = 0;
    var found = false;
    if (typeof word_levels[slot] === "number") {
        maxLevel = word_levels[slot];
        found = true;
    }
    for (var pk in word_levels) {
        if (typeof word_levels[pk] === "object" && word_levels[pk][slot] !== undefined) {
            if (word_levels[pk][slot] > maxLevel) maxLevel = word_levels[pk][slot];
            found = true;
        }
    }
    if (found) return maxLevel;
    return 0;
}

// Set word level in per-position structure
function set_wl(word_levels, slot, level, position_key) {
    if (!position_key || !ZC_POSITIONS[position_key]) return;
    if (!word_levels[position_key] || typeof word_levels[position_key] !== "object")
        word_levels[position_key] = {};
    word_levels[position_key][slot] = level;
    // Clean up old flat key if present
    if (typeof word_levels[slot] === "number") delete word_levels[slot];
}

// Delete word level from per-position structure
function del_wl(word_levels, slot, position_key) {
    if (word_levels[position_key] && typeof word_levels[position_key] === "object") {
        delete word_levels[position_key][slot];
        if (Object.keys(word_levels[position_key]).length === 0)
            delete word_levels[position_key];
    }
    delete word_levels[slot];
}

// Export helpers to SKILL for access from skill.js
SKILL.get_wl = get_wl;
SKILL.set_wl = set_wl;
SKILL.del_wl = del_wl;

// Send client notification to refresh skill display after ZC word changes
function notify_skill_update(me, skill_id) {
    if (!me || !skill_id) return;
    var skill = SKILL.get(skill_id);
    if (!skill) return;
    var sk_data = me.skills[skill_id];
    if (!sk_data) return;
    var str = ['{type:"dialog",dialog:"skills",item:'];
    skill.item_to_json(str, sk_data, me);
    str.push("}");
    me.notify(str.join(""));
}

function find_book(me, book_id) {
    if (!book_id) {
        var items = me.items;
        if (!items) return null;
        for (var i = 0; i < items.length; i++) {
            if (items[i] && items[i].path && items[i].path.indexOf("zc/blank_book") >= 0)
                return items[i];
        }
        return null;
    }
    return me.find_obj(book_id);
}

function get_available_words(position_key) {
    var words = [];
    var pos_keys = POSITION_TO_KEY[position_key] || [position_key];
    for (var i = 0; i < SKILL.ZC_WORDS.length; i++) {
        var word = SKILL.ZC_WORDS[i];
        for (var j = 0; j < word.positions.length; j++) {
            if (pos_keys.indexOf(word.positions[j]) >= 0) {
                words.push({ index: 500 + i, name: word.name, category: word.category });
                break;
            }
        }
    }
    return words;
}

function get_available_pfms(me, position_key) {
    var pfms = [];
    if (!me.skills) return pfms;
    var pos = ZC_POSITIONS[position_key];
    var base = pos ? pos.base : null;
    for (var sk_id in me.skills) {
        var sk_data = me.skills[sk_id];
        if (sk_data.level < 3000) continue;
        var skill = SKILL.get(sk_id);
        if (!skill || !skill.pfm) continue;
        if (skill.type !== SKILL_TYPES.SKILL) continue;
        if (skill.is_custom) continue;
        for (var pfm_key in skill.pfm) {
            var pfm = skill.pfm[pfm_key];
            if (!pfm.name) continue;
            // Filter by PFM's enable_skill matching the position's base skill type
            // This prevents blade skill PFMs from appearing in force position selection
            if (base) {
                if (pfm.enable_skill && pfm.enable_skill !== base) continue;
                if (!pfm.enable_skill && skill.can_enables && skill.can_enables[0] !== base) continue;
            }
            pfms.push({
                skill_id: sk_id,
                skill_name: skill.name,
                skill_grade: skill.grade,
                pfm_key: pfm_key,
                pfm_name: pfm.name,
                cost: PFM_COST[skill.grade] || skill.grade + 1,
            });
        }
    }
    return pfms;
}

function query_wudao_count(me) {
    var obj = me.find_obj_bypath("book/wudao");
    return obj ? obj.count : 0;
}

function sync_skill_grade(book, me) {
    if (!book.zc_skill_id || !me || !me.skills) return;
    var sk_data = me.skills[book.zc_skill_id];
    if (!sk_data) return;
    var skill = SKILL.get(book.zc_skill_id);
    if (skill) {
        var new_grade = book.get_total_words();
        skill.grade = Math.min(new_grade, 6);
        var cc = ZC_COLORS[skill.grade] || "wht";
        skill.color_name = "<" + cc + ">" + skill.name + "</" + cc + ">";
        me.on_skillchanged();
    }
}

// ===== 主入口 =====
var self = this;
this.enter = function (me, cmd, arg1, arg2) {
    switch (cmd) {
        case "name":   return self.cmd_name(me, arg1);
        case "rename": return self.cmd_rename(me, arg1);
        case "deduce": return self.cmd_deduce(me, arg1);
        case "posmenu":return self.cmd_posmenu(me, arg1, arg2);
        case "select": return self.cmd_select(me, arg1, arg2);
        case "addword":return self.cmd_addword(me, arg1, arg2);
        case "addword_done": return self.cmd_addword_done(me, arg1);
        case "confirm": return self.cmd_confirm(me, arg1, arg2);
        case "addpfm": return self.cmd_addpfm(me, arg1, arg2);
        case "addpfm_ok": return self.cmd_addpfm_ok(me, arg1, arg2);
        case "study":  return self.cmd_study(me, arg1);
        case "wordselect":return self.cmd_wordselect(me, arg1, arg2);
        case "words":  return self.cmd_words(me, arg1, arg2);
        case "levelset":return self.cmd_levelset(me, arg1, arg2);
        case "lvlask": return self.cmd_lvlask(me, arg1, arg2);
        case "lvlno":  return self.cmd_lvlno(me);
        case "lvl":     return self.cmd_lvl(me, arg1, arg2);
        case "wordadd":return self.cmd_wordadd(me, arg1, arg2);
        case "replaceword":return self.cmd_replaceword(me, arg1, arg2);
        case "pfms":    return self.cmd_pfms(me, arg1, arg2);
        case "removepfm":return self.cmd_removepfm(me, arg1, arg2);
        case "replacepfm":return self.cmd_replacepfm(me, arg1, arg2);
        case "removepos":return self.cmd_removepos(me, arg1, arg2);
        case "abandon":return self.cmd_abandon(me, arg1);
        case "reset": return self.cmd_reset(me, arg1);
        default:
            if (!cmd) {
                var book = find_book(me, null);
                if (book) {
                    me.notify(book.color_name + "\n" + book.desc + "\n使用 <hic>zc deduce " + book.id + "</hic> 推演此秘籍。");
                    return;
                }
                return me.notify("你身上没有自创秘籍。可以在朱熹处购买空白秘籍。");
            }
            return self.cmd_skill_info(me, cmd);
    }
};

// ===== name: 命名 =====
this.cmd_name = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (book.zc_state !== "blank")
        return me.notify("这本秘籍已经命名过了。");

    me.notify("请输入你想创立的武功名称（2-5个汉字）：");
    var hold = this;
    me.wait_input = function (me, input) {
        if (hold.handle_name_input(me, input, book_id) !== false)
            me.wait_input = null;
    };
};

this.handle_name_input = function (me, input, book_id) {
    var book = me.find_obj(book_id);
    if (!book) return me.notify("秘籍已经不在你身上了。");

    // 去掉前端频道前缀
    var parts = input.split(" ");
    var name = (parts.length > 1) ? parts.slice(1).join(" ") : parts[0];
    name = name.trim();

    if (name.length < 2 || name.length > 5) {
        me.notify("武功名称必须是2-5个汉字。请重新输入：");
        return false;
    }
    for (var i = 0; i < name.length; i++) {
        var code = name.charCodeAt(i);
        if (code < 0x4E00 || code > 0x9FFF) {
            me.notify("武功名称必须是2-5个汉字。请重新输入：");
            return false;
        }
    }

    for (var sk_id in WORLD.SKILLS) {
        if (WORLD.SKILLS[sk_id].name === name) {
            me.notify("已有同名武功'" + name + "'存在，请换一个名字：");
            return false;
        }
    }

    if (!book.zc_creator) book.zc_creator = me.name;
    book.zc_name = name;
    book.name = name + "秘籍";
    book.desc = "这是" + book.zc_creator + "的自创武学。";
    var cc = ZC_COLORS[book.grade] || "wht";
    book.color_name = "<" + cc + ">" + book.name + "</" + cc + ">";
    book.zc_state = "named";
    me.notify("你将空白秘籍命名为《" + book.color_name + "》。现在可以进行推演了。");
    me.items_changed(book);
    return true;
};

// ===== rename: 重新命名（已命名/已完成也可改） =====
this.cmd_rename = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (book.zc_state === "blank")
        return me.notify("请先使用 zc name 命名。");

    me.notify("当前武功名称：《" + (book.zc_name || "未命名") + "》");
    me.notify("请输入新的武功名称（2-5个汉字）：");
    var hold = this;
    me.wait_input = function (me, input) {
        if (hold.handle_name_input(me, input, book_id) !== false) {
            me.wait_input = null;
            // 改名后更新技能
            var book2 = me.find_obj(book_id);
            if (book2 && book2.zc_skill_id) {
                var zcCmd = WORLD.COMMANDS["zc"];
                if (zcCmd && zcCmd.create_or_update_skill)
                    zcCmd.create_or_update_skill(book2, me);
            }
        }
    };
};

// ===== deduce: 推演主页 =====
this.cmd_deduce = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (book.zc_state === "blank")
        return me.notify("请先为秘籍命名。");
    if (book._deducing_position) {
        var dp = book._deducing_position;
        var dpLabel = ZC_POSITIONS[dp] ? ZC_POSITIONS[dp].label : dp;
        if (book.zc_state === "deducing") {
            me.notify("<hiy>你正在推演" + dpLabel + "部位，当前状态：</hiy>");
            me.send_commands("zc select " + book.id + " " + dp, "继续推演", "zc abandon " + book.id, "放弃推演");
            return;
        }
        if (book.zc_state === "completed")
            return self.cmd_select(me, book.id, dp);
    }

    var remaining = [];
    for (var key in ZC_POSITIONS) {
        if (!book.has_position(key))
            remaining.push(key);
    }

    var _S = function(cmd) { return "onclick=\"window.SendCommand('" + cmd + "')\""; };
    var _BTN = "color:gray;border:solid 1px gray;background:black;border-radius:0.25em;padding:0.25em 1em;margin:2px;cursor:pointer;display:inline-block;";

    var desc = '<div style="text-align:left;">';

    // 已推演部位 — 位置按钮（点击进入词条/技能子菜单）
    if (book.zc_positions.length > 0) {
        desc += "<hiy>已推演部位：</hiy><br>";
        for (var i = 0; i < book.zc_positions.length; i++) {
            var pk = book.zc_positions[i];
            var label = ZC_POSITIONS[pk].label;
            desc += '<span ' + _S("zc posmenu " + book.id + " " + pk) + ' style="' + _BTN + '">' + label + '</span> ';
        }
        if (book.get_total_pfms() > 0) {
            desc += '<span ' + _S("zc pfms " + book.id) + ' style="' + _BTN + '">管理技能</span>';
        }
        desc += "<br>";
    }

    // 推演新部位
    if (remaining.length > 0) {
        desc += "<hiy>推演新部位：</hiy><br>";
        for (var r = 0; r < remaining.length; r++) {
            desc += '<span ' + _S("zc select " + book.id + " " + remaining[r]) + ' style="' + _BTN + '">' + ZC_POSITIONS[remaining[r]].label + '</span> ';
        }
        desc += "<br>";
    } else {
        desc += "<hic>所有部位已推演完毕。</hic><br>";
    }

    desc += '</div>';

    me.notify(desc);
};

// ===== posmenu: 已推演部位子菜单 → 词条/技能 =====
this.cmd_posmenu = function (me, book_id, position_key) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演。");
    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var _S = function(cmd) { return "onclick=\"window.SendCommand('" + cmd + "')\""; };
    var _BTN = "color:gray;border:solid 1px gray;background:black;border-radius:0.25em;padding:0.25em 1em;margin:2px;cursor:pointer;display:inline-block;";
    var _DIV = "text-align:left;margin-top:4px;";

    var desc = "<hiy>" + book.color_name + "</hiy> · " + pos.label + "部位\n";
    desc += '<div style="' + _DIV + '">';
    desc += '<span ' + _S("zc wordselect " + book.id + " " + position_key) + ' style="' + _BTN + '">词条推演</span> ';
    if (book.zc_skill_id && (book.zc_words[position_key] || []).length > 0) {
        desc += '<span ' + _S("zc words " + book.zc_skill_id + " " + book.id + " " + position_key) + ' style="' + _BTN + '">词条升级</span> ';
    }
    desc += '<span ' + _S("zc addpfm " + book.id + " " + position_key) + ' style="' + _BTN + '">技能</span> ';
    desc += '<span ' + _S("zc removepos " + book.id + " " + position_key) + ' style="' + _BTN + '">移除部位</span> ';
    desc += '<span ' + _S("zc abandon " + book.id) + ' style="' + _BTN + '">放弃推演</span> ';
    desc += '<span ' + _S("zc deduce " + book.id) + ' style="' + _BTN + '">返回</span>';
    desc += '</div>';

    me.notify(desc);
};

// ===== select: 选择部位 → 词条选择 =====
this.cmd_select = function (me, book_id, position_key) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (book.zc_state === "blank")
        return me.notify("请先为秘籍命名。");
    if (book.has_position(position_key))
        return me.notify("该部位已经推演过了。");

    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    // 内功部位：预选内力上限(506)，进入词条选择流程
    if (position_key === "内功") {
        if (!book.zc_words[position_key]) book.zc_words[position_key] = [];
        // Avoid duplicate word 506 on re-entry
        if (book.zc_words[position_key].indexOf(506) < 0) {
            book.zc_words[position_key].push(506);
            set_wl(book.zc_word_levels, 506, 0, "内功");
        }
        // 保存原始状态，供 addword_done 判断是否需要增量更新
        book._was_completed = (book.zc_state === "completed");
        // 先不加入zc_positions，等addword_done统一处理
        book.zc_state = "deducing";
        book._deducing_position = position_key;
        var forceWords = get_available_words(pos.base);
        me.notify("<hiy>为内功选择词条（内力上限已自动添加，每个词条消耗1本武道书，最多6个）：</hiy>");
        me.notify("<hic>内功特性：内力上限" + (39 + 0) + "%转化为气血上限（随内力词条升级成长）</hic>");
        // Group words by category
        var fByCat = {};
        for (var fi = 0; fi < forceWords.length; fi++) {
            var fw = forceWords[fi];
            if (fw.index === 506) continue;
            var fck = fw.category;
            if (!fByCat[fck]) fByCat[fck] = [];
            fByCat[fck].push(fw);
        }
        var fCatOrder = [0, 1, 2, 3, 4, "passive"];
        for (var fci = 0; fci < fCatOrder.length; fci++) {
            var fck2 = fCatOrder[fci];
            var fcws = fByCat[fck2];
            if (!fcws || fcws.length === 0) continue;
            var fcArgs = [];
            for (var fwi = 0; fwi < fcws.length; fwi++) {
                var fw2 = fcws[fwi];
                var flabel = fw2.name;
                if (fck2 === "passive") {
                    var fpdef = SKILL.ZC_WORDS[fw2.index - 500];
                    if (fpdef) flabel = fpdef.format(fpdef.value(1, 0, 1));
                }
                fcArgs.push("zc addword " + book.id + " " + position_key + " " + fw2.index);
                fcArgs.push(flabel);
            }
            if (fcArgs.length > 0) me.send_commands.apply(me, fcArgs);
        }
        me.notify("<hiy>选择完成后点击：</hiy>");
        me.send_commands("zc addword_done " + book.id, "完成推演", "zc abandon " + book.id, "放弃推演");
        return;
    }

    // 其他部位：显示词条选择
    // 清理该部位旧数据（如重新选择）
    var oldWords = book.zc_words[position_key] || [];
    for (var oi = 0; oi < oldWords.length; oi++) {
        del_wl(book.zc_word_levels, oldWords[oi], position_key);
    }
    // 保存原始状态，供 addword_done 判断是否需要增量更新已学习技能
    book._was_completed = (book.zc_state === "completed");
    book.zc_state = "deducing";
    book._deducing_position = position_key;
    delete book.zc_words[position_key];
    var words = get_available_words(pos.base);

    me.notify("<hiy>为" + pos.label + "选择词条（每词条1本武道书，最多6个）：</hiy>");
    // Group words by category
    var gByCat = {};
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var gck = w.category;
        if (!gByCat[gck]) gByCat[gck] = [];
        gByCat[gck].push(w);
    }
    var gCatOrder = [0, 1, 2, 3, 4, "passive"];
    for (var gci = 0; gci < gCatOrder.length; gci++) {
        var gck2 = gCatOrder[gci];
        var gcws = gByCat[gck2];
        if (!gcws || gcws.length === 0) continue;
        var gcArgs = [];
        for (var gwi = 0; gwi < gcws.length; gwi++) {
            var gw = gcws[gwi];
            var glabel = gw.name;
            if (gck2 === "passive") {
                var gpdef = SKILL.ZC_WORDS[gw.index - 500];
                if (gpdef) glabel = gpdef.format(gpdef.value(1, 0, 1));
            }
            gcArgs.push("zc addword " + book.id + " " + position_key + " " + gw.index);
            gcArgs.push(glabel);
        }
        if (gcArgs.length > 0) me.send_commands.apply(me, gcArgs);
    }

    me.notify("<hiy>选择完成后点击：</hiy>");
    me.send_commands("zc addword_done " + book.id, "完成推演", "zc abandon " + book.id, "放弃推演");
};

// ===== addword: 添加单个词条 =====
this.cmd_addword = function (me, book_id, position_key_and_word) {
    // arg2 format: "position_key word_index"
    var parts = (position_key_and_word || "").split(" ");
    var position_key = parts[0];
    var word_index = parseInt(parts[1]);

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (!position_key || isNaN(word_index))
        return me.notify("参数错误。格式: zc addword <物品ID> <部位> <词条index>");

    if (book.zc_state !== "deducing")
        return me.notify("秘籍不在推演状态。");

    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    // Check word exists and matches position
    var wdef = book.get_word_def(word_index);
    if (!wdef) return me.notify("词条" + word_index + "不存在。");

    var pos_keys = POSITION_TO_KEY[pos.base] || [pos.base];
    var supported = false;
    for (var j = 0; j < wdef.positions.length; j++) {
        if (pos_keys.indexOf(wdef.positions[j]) >= 0) { supported = true; break; }
    }
    if (!supported) return me.notify("词条'" + wdef.name + "'不支持该部位。");

    // Check duplicates
    var existing = book.zc_words[position_key] || [];
    if (existing.indexOf(word_index) >= 0)
        return me.notify("该部位已选择过此词条。");

    // Check count limit
    if (existing.length >= 6)
        return me.notify("该部位最多选择6个词条。");

    // Passive limit: one passive per position, and no duplicate passive across positions
    if (wdef.category === "passive") {
        // Check same passive word not already on another position
        for (var passPk in book.zc_words) {
            if (passPk === position_key) continue;
            if ((book.zc_words[passPk] || []).indexOf(word_index) >= 0)
                return me.notify("该被动词条已在其他部位存在，不可重复选择。");
        }
        // Check one passive per position
        for (var ei = 0; ei < existing.length; ei++) {
            var ew = book.get_word_def(existing[ei]);
            if (ew && ew.category === "passive")
                return me.notify("每个部位只能选择一个被动词条。");
        }
    }

    // Check wudao book availability
    var wudaoCount = query_wudao_count(me);
    if (wudaoCount < existing.length + 1)
        return me.notify("<red>武道书不足！需要至少" + (existing.length + 1) + "本，当前" + wudaoCount + "本。</red>");

    // Add word
    if (!book.zc_words[position_key]) book.zc_words[position_key] = [];
    book.zc_words[position_key].push(word_index);
    set_wl(book.zc_word_levels, word_index, 0, position_key);
    book.update_grade();
    sync_skill_grade(book, me);
    me.items_changed(book);

    var current = book.zc_words[position_key];
    me.notify("已添加词条：" + wdef.name + " [" + word_index + "]（当前" + current.length + "/6个）。<hiy>可继续选择或点击完成：</hiy>");
    me.send_commands("zc addword_done " + book.id, "完成推演");
};

// ===== addword_done: 完成词条选择 =====
this.cmd_addword_done = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    var position_key = book._deducing_position;
    if (!position_key) return me.notify("推演状态异常。");

    var words = book.zc_words[position_key] || [];
    if (words.length === 0)
        return me.notify("请至少选择一个词条。");

    var wasCompleted = book._was_completed === true;
    delete book._was_completed;

    // Deduct wudao books
    var wudao = me.find_obj_bypath("book/wudao");
    if (!wudao) return me.notify("<red>你的武道书不够！</red>");
    if (wudao.count < words.length)
        return me.notify("<red>武道书不足！需要" + words.length + "本，当前" + wudao.count + "本。</red>");

    me.remove_obj(wudao, words.length);

    // Confirm position (may already be added for 内功 which pre-adds in cmd_select)
    if (book.zc_positions.indexOf(position_key) < 0)
        book.zc_positions.push(position_key);
    book.zc_state = "completed";
    book._deducing_position = null;
    book.zc_skill_id = book.zc_skill_id || book.generate_skill_id();
    book.update_grade();
    // Only create skill now if this is the first position (not wasCompleted).
    // For wasCompleted, defer until after release_prop so old passives are properly cleaned up.
    if (!wasCompleted) {
        self.create_or_update_skill(book, me);
    }
    book.skill = book.zc_skill_id;
    sync_skill_grade(book, me);

    // If adding position to already-completed book, update player's skill data and refresh props
    if (wasCompleted && book.zc_skill_id) {
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            // Release old props BEFORE create_or_update_skill rebuilds zc_words_by_position
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) {
                skill.release_prop(me, sk_data.level || 0);
            }
            if (!sk_data.addin) sk_data.addin = [];
            for (var wi = 0; wi < words.length; wi++) {
                if (sk_data.addin.indexOf(words[wi]) < 0)
                    sk_data.addin.push(words[wi]);
            }
            if (!sk_data.word_levels) sk_data.word_levels = {};
            for (var wi2 = 0; wi2 < words.length; wi2++) {
                set_wl(sk_data.word_levels, words[wi2], 0, position_key);
            }
            self.create_or_update_skill(book, me);
            var skill2 = SKILL.get(book.zc_skill_id);
            if (skill2) {
                skill2.attach_prop(me, sk_data.level || 0);
                if (skill2.mp_to_hp) me.recount();
            }
        }
    }

    me.notify("<hic>" + book.color_name + "</hic> " + ZC_POSITIONS[position_key].label + "部位推演完成！消耗" + words.length + "本武道书。秘籍当前品质：grade " + book.grade);
    me.items_changed(book);
    notify_skill_update(me, book.zc_skill_id);
    return self.cmd_deduce(me, book_id);
};

// ===== confirm: 对话框确认推演（前端dialog/zc.js调用） =====
this.cmd_confirm = function (me, book_id, arg2) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    var position_key = book._deducing_position;
    if (!position_key) return me.notify("推演状态异常，请先选择部位。");

    // 解析: word1,word2,word3|pfmref1,pfmref2
    var wordStr = arg2 || "";
    var pfmStr = "";
    var pipe = wordStr.indexOf("|");
    if (pipe >= 0) {
        pfmStr = wordStr.substring(pipe + 1);
        wordStr = wordStr.substring(0, pipe);
    }

    var wordIndices = wordStr ? wordStr.split(",").map(function(w) { return parseInt(w); }) : [];
    var pfmRefs = pfmStr ? pfmStr.split(",") : [];

    // 校验词条
    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var seenWords = {};
    for (var i = 0; i < wordIndices.length; i++) {
        var widx = wordIndices[i];
        if (isNaN(widx) || widx < 500) return me.notify("无效词条index: " + widx);
        if (seenWords[widx]) return me.notify("词条" + widx + "重复选择，每个词条只能选一次。");
        seenWords[widx] = true;
        var wdef = book.get_word_def(widx);
        if (!wdef) return me.notify("词条" + widx + "不存在。");

        var pos_keys = POSITION_TO_KEY[pos.base] || [pos.base];
        var supported = false;
        for (var j = 0; j < wdef.positions.length; j++) {
            if (pos_keys.indexOf(wdef.positions[j]) >= 0) { supported = true; break; }
        }
        if (!supported) return me.notify("词条'" + wdef.name + "'不支持该部位。");
    }

    if (wordIndices.length === 0 || wordIndices.length > 6)
        return me.notify("词条数需在1-6之间。");

    // Passive limit: one passive per position
    var passiveCount = 0;
    for (var ci2 = 0; ci2 < wordIndices.length; ci2++) {
        var wdefCheck2 = book.get_word_def(wordIndices[ci2]);
        if (wdefCheck2 && wdefCheck2.category === "passive") passiveCount++;
    }
    if (passiveCount > 1)
        return me.notify("每个部位只能选择一个被动词条。");

    // Check passive words are not already on other positions
    for (var passCi = 0; passCi < wordIndices.length; passCi++) {
        var passWi = wordIndices[passCi];
        var passWd = book.get_word_def(passWi);
        if (passWd && passWd.category === "passive") {
            for (var passPk in book.zc_words) {
                if (passPk === position_key) continue;
                if ((book.zc_words[passPk] || []).indexOf(passWi) >= 0)
                    return me.notify("该被动词条已在其他部位存在，不可重复选择。");
            }
        }
    }

    // 计算总消耗
    // 计算总消耗
    var wudaoCount = query_wudao_count(me);
    var totalCost = wordIndices.length;

    // PFM消耗
    var pfmSelections = [];
    for (var pi = 0; pi < pfmRefs.length; pi++) {
        var ref = pfmRefs[pi].trim();
        if (!ref) continue;
        var dot = ref.indexOf(".");
        if (dot < 0) continue;
        var skid = ref.substring(0, dot);
        var pfmk = ref.substring(dot + 1);
        var src = SKILL.get(skid);
        if (!src || !src.pfm || !src.pfm[pfmk]) continue;
        totalCost += PFM_COST[src.grade] || src.grade + 1;
        pfmSelections.push({ skill_id: skid, pfm_key: pfmk });
    }

    if (totalCost > wudaoCount)
        return me.notify("<red>武道书不足！需要" + totalCost + "本，当前" + wudaoCount + "本。</red>");

    // 扣除武道书
    var wudao = me.find_obj_bypath("book/wudao");
    if (totalCost > 0 && wudao) me.remove_obj(wudao, totalCost);

    // 更新秘籍
    book.zc_words[position_key] = wordIndices;
    for (var wi = 0; wi < wordIndices.length; wi++) {
        set_wl(book.zc_word_levels, wordIndices[wi], 0, position_key);
    }
    book.zc_pfms[position_key] = pfmSelections;

    var wasCompleted = book._was_completed === true;
    delete book._was_completed;

    if (book.zc_positions.indexOf(position_key) < 0)
        book.zc_positions.push(position_key);
    book.zc_state = "completed";
    book._deducing_position = null;
    book.zc_skill_id = book.zc_skill_id || book.generate_skill_id();
    book.update_grade();
    // Only create skill now if this is the first position.
    // For wasCompleted, defer until after release_prop so old passives are properly cleaned up.
    if (!wasCompleted) {
        self.create_or_update_skill(book, me);
    }
    book.skill = book.zc_skill_id;
    sync_skill_grade(book, me);

    if (wasCompleted && book.zc_skill_id) {
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            // Release old props BEFORE create_or_update_skill rebuilds zc_words_by_position
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) {
                skill.release_prop(me, sk_data.level || 0);
            }
            if (!sk_data.addin) sk_data.addin = [];
            for (var wi2 = 0; wi2 < wordIndices.length; wi2++) {
                if (sk_data.addin.indexOf(wordIndices[wi2]) < 0)
                    sk_data.addin.push(wordIndices[wi2]);
            }
            if (!sk_data.word_levels) sk_data.word_levels = {};
            for (var wi3 = 0; wi3 < wordIndices.length; wi3++) {
                set_wl(sk_data.word_levels, wordIndices[wi3], 0, position_key);
            }
            self.create_or_update_skill(book, me);
            var skill2 = SKILL.get(book.zc_skill_id);
            if (skill2) {
                skill2.attach_prop(me, sk_data.level || 0);
                if (skill2.mp_to_hp) me.recount();
            }
        }
    }

    me.notify("<hic>" + book.color_name + "</hic> " + ZC_POSITIONS[position_key].label + "部位推演完成！消耗" + totalCost + "本武道书。");
    me.items_changed(book);
    return self.cmd_deduce(me, book_id);
};

// ===== addpfm: 显示PFM选择按钮 =====
this.cmd_addpfm = function (me, book_id, position_key) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演，请先推演。");

    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var pfms = get_available_pfms(me, position_key);
    if (pfms.length === 0) {
        me.notify("你没有满足条件的技能（需3000级以上且有" + pos.label + "绝招）。");
        return self.cmd_deduce(me, book_id);
    }

    var existing = book.zc_pfms[position_key] || [];
    if (existing.length >= 3)
        return me.notify("该部位已有3个PFM，无法再添加。");

    me.notify("<hiy>为" + pos.label + "选择PFM（武道书消耗见标注）：</hiy>");
    var args = [];
    for (var i = 0; i < pfms.length; i++) {
        var p = pfms[i];
        args.push("zc addpfm_ok " + book.id + " " + position_key + " " + p.skill_id + "." + p.pfm_key);
        args.push(p.pfm_name + "(" + p.skill_name + ") 消耗" + p.cost + "本");
    }
    if (args.length > 0) me.send_commands.apply(me, args);

    me.notify("<hiy>返回：</hiy>");
    me.send_commands("zc deduce " + book.id, "返回推演主页", "zc abandon " + book.id, "放弃推演");
};

// ===== addpfm_ok: 确认添加PFM =====
this.cmd_addpfm_ok = function (me, book_id, arg2) {
    var parts = (arg2 || "").split(" ");
    var position_key = parts[0];
    var pfm_ref = parts[1] || "";
    var dot = pfm_ref.indexOf(".");
    if (dot < 0) return me.notify("PFM格式错误。");

    var skill_id = pfm_ref.substring(0, dot);
    var pfm_key = pfm_ref.substring(dot + 1);

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演。");

    var src_skill = SKILL.get(skill_id);
    if (!src_skill || !src_skill.pfm || !src_skill.pfm[pfm_key])
        return me.notify("PFM不存在。");

    var sk_data = me.query_skill(skill_id, 0);
    if (sk_data < 3000)
        return me.notify("你的" + src_skill.name + "等级不足3000。");

    var existing = book.zc_pfms[position_key] || [];
    if (existing.length >= 3)
        return me.notify("该部位已有3个PFM。");

    // Check duplicate
    for (var i = 0; i < existing.length; i++) {
        if (existing[i].skill_id === skill_id && existing[i].pfm_key === pfm_key)
            return me.notify("已选择过此PFM。");
    }

    // 门派PFM限制：整个自创技能最多融合1个门派PFM
    if (src_skill.family) {
        for (var bpk in book.zc_pfms) {
            var bpfms = book.zc_pfms[bpk];
            for (var bi = 0; bi < bpfms.length; bi++) {
                var bsrc = SKILL.get(bpfms[bi].skill_id);
                if (bsrc && bsrc.family) {
                    return me.notify("整个自创技能最多融合1个门派PFM，已有" + bsrc.family + "的PFM。");
                }
            }
        }
    }

    var cost = PFM_COST[src_skill.grade] || src_skill.grade + 1;
    var wudao = me.find_obj_bypath("book/wudao");
    if (!wudao || wudao.count < cost)
        return me.notify("<red>武道书不足！需要" + cost + "本。</red>");

    me.remove_obj(wudao, cost);

    if (!book.zc_pfms[position_key]) book.zc_pfms[position_key] = [];
    book.zc_pfms[position_key].push({ skill_id: skill_id, pfm_key: pfm_key });

    if (book.zc_skill_id)
        self.create_or_update_skill(book, me);

    me.notify("已添加PFM：" + src_skill.pfm[pfm_key].name + "（源自" + src_skill.name + "），消耗" + cost + "本武道书。");
    return self.cmd_deduce(me, book_id);
};

// ===== study: 学习自创技能（委托给标准study命令） =====
this.cmd_study = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (book.zc_state !== "completed" || !book.zc_skill_id)
        return me.notify("该秘籍尚未完成推演，无法学习。");

    var skill_id = book.zc_skill_id;
    var skill = SKILL.get(skill_id);
    if (!skill) return me.notify("自创技能不存在，请联系管理员。");

    // Pre-initialize addin and word_levels so add_exp picks them up
    var sk_data = me.skills[skill_id];
    if (!sk_data) {
        sk_data = { level: 0, exp: 0 };
        me.skills[skill_id] = sk_data;
    }
    if (skill.addin_prototype && !sk_data.addin)
        sk_data.addin = skill.addin_prototype.slice();
    if (!sk_data.word_levels)
        sk_data.word_levels = book.get_all_word_levels();

    var studyCmd = WORLD.COMMANDS["study"];
    if (studyCmd) {
        var result = studyCmd.enter(me, book.id);
        // Push score update so the skill appears in the panel without refresh
        var scoreStudyCmd = WORLD.COMMANDS["score"];
        if (scoreStudyCmd) scoreStudyCmd.enter(me, "");
        return result;
    }
};


// ===== 创建/更新技能 =====
this.create_or_update_skill = function (book, me) {
    var skill_id = book.zc_skill_id || book.generate_skill_id();
    book.zc_skill_id = skill_id;

    var can_enables = [];
    for (var i = 0; i < book.zc_positions.length; i++) {
        var pk = book.zc_positions[i];
        var pos = ZC_POSITIONS[pk];
        if (pos && can_enables.indexOf(pos.base) < 0)
            can_enables.push(pos.base);
    }

    var custom_skill;
    if (WORLD.SKILLS[skill_id]) {
        custom_skill = WORLD.SKILLS[skill_id];
    } else {
        custom_skill = new SKILL();
        custom_skill.__proto__ = SKILL.prototype;
        custom_skill.id = skill_id;
        custom_skill.type = SKILL_TYPES.SKILL;
        custom_skill.is_custom = true;
        custom_skill.creator = me.id;
        custom_skill.creator_name = me.name;
        custom_skill.desc = me.name + "所创造的武功";
        WORLD.SKILLS[skill_id] = custom_skill;
    }
    me.add_custom_skill(skill_id);

    custom_skill.name = book.zc_name || book.name.replace("秘籍", "");
    custom_skill.grade = Math.min(book.get_total_words(), 6);
    custom_skill.can_enables = can_enables;
    // 内功始终排在第一位，其余保持原顺序
    var sortedKeys = book.zc_positions.slice();
    var forceIdx = sortedKeys.indexOf("内功");
    if (forceIdx > 0) {
        sortedKeys.splice(forceIdx, 1);
        sortedKeys.unshift("内功");
    }
    custom_skill.zc_position_keys = sortedKeys;
    custom_skill.zc_words_by_position = {};
    for (var pk in book.zc_words) {
        custom_skill.zc_words_by_position[pk] = book.zc_words[pk].slice();
    }
    custom_skill.slots = SKILL.ZC_WORDS;
    custom_skill.source_skill = null;

    var all_addins = [];
    // No dedup: the same word added to multiple positions (e.g. attack+3% in both
    // 剑法 and 刀法) should stack, since the player spent resources on each position.
    for (var pk in book.zc_words) {
        var ws = book.zc_words[pk];
        for (var ai = 0; ai < ws.length; ai++) {
            all_addins.push(ws[ai]);
        }
    }
    custom_skill.addin_prototype = all_addins;

    // Initialize me.skills[skill_id] for reconstruction resilience after server restart.
    // Without this, restore_from_skill cannot reconstruct the skill if the player
    // never studied (no sk_data) and WORLD.SKILLS was cleared by a restart.
    if (!me.skills) me.skills = {};
    if (!me.skills[skill_id])
        me.skills[skill_id] = { level: 0, exp: 0 };
    var zc_skd = me.skills[skill_id];
    zc_skd.addin = all_addins.slice();
    // Merge: book provides default word levels for new words, but preserve existing
    // player levels (which may be higher from upgrades that weren't persisted to book)
    var bookLevels = book.get_all_word_levels();
    if (!zc_skd.word_levels) {
        zc_skd.word_levels = bookLevels;
    } else {
        // For each position in book, copy missing word levels from book to player data
        for (var bpos in bookLevels) {
            if (typeof bookLevels[bpos] === "object") {
                if (!zc_skd.word_levels[bpos] || typeof zc_skd.word_levels[bpos] !== "object") {
                    zc_skd.word_levels[bpos] = {};
                }
                for (var bslot in bookLevels[bpos]) {
                    if (!(bslot in zc_skd.word_levels[bpos])) {
                        zc_skd.word_levels[bpos][bslot] = bookLevels[bpos][bslot];
                    }
                }
            }
        }
        // Clean up stale positions / word slots no longer present in the book
        for (var oldPos in zc_skd.word_levels) {
            if (typeof zc_skd.word_levels[oldPos] === "object") {
                if (!bookLevels[oldPos]) {
                    delete zc_skd.word_levels[oldPos];
                } else {
                    for (var oldSlot in zc_skd.word_levels[oldPos]) {
                        if (!(oldSlot in bookLevels[oldPos])) {
                            delete zc_skd.word_levels[oldPos][oldSlot];
                        }
                    }
                }
            }
        }
    }

    // Build slot-to-position map for per-position word_level lookups
    custom_skill.slot_to_position = build_slot_position_map(custom_skill, book);

    // Build PFMs with proper prototype chain
    custom_skill.pfm = {};
    var pfm_index = 0;
    for (var pk in book.zc_pfms) {
        var pfms = book.zc_pfms[pk];
        for (var i = 0; i < pfms.length; i++) {
            var sel = pfms[i];
            var src = SKILL.get(sel.skill_id);
            if (!src || !src.pfm || !src.pfm[sel.pfm_key]) continue;
            var src_pfm = src.pfm[sel.pfm_key];
            var copied = {};
            for (var k in src_pfm) {
                if (src_pfm.hasOwnProperty(k)) copied[k] = src_pfm[k];
            }
            copied.source_skill = sel.skill_id;
            copied.source_pfm = sel.pfm_key;
            copied.enable_skill = ZC_POSITIONS[pk] ? ZC_POSITIONS[pk].base : null;
            copied.id = skill_id + "/zc_pfm" + (pfm_index + 1);
            copied.pid = "zc_pfm" + (pfm_index + 1);
            // Set PERFORM prototype for proper PFM display
            if (typeof PERFORM !== "undefined" && PERFORM.prototype)
                copied.__proto__ = PERFORM.prototype;
            custom_skill.pfm["zc_pfm" + (pfm_index + 1)] = copied;
            pfm_index++;
        }
    }

    // Override query_addin_prop for ZC skill word properties.
    // Used by attach_prop/release_prop during word level upgrades.
    // Per-position enable/disable is handled by _compute_zc_props in skill.js.
    // No dedup: the same word in multiple positions will stack (addin may have duplicates).
    custom_skill.query_addin_prop = function (me, lv) {
        var sk = me.skills[this.id];
        var addin = (sk && sk.addin) ? sk.addin : [];
        if (addin.length === 0 && !this.mp_to_hp)
            return null;

        var prop = {};
        var grd = this.is_custom ? this.grade : (this.grade + addin.length);
        // Track per-occurrence position for duplicate words across positions
        var occurCount = {};
        for (var si = 0; si < addin.length; si++) {
            var slot = addin[si];
            var item = this.query_slot(slot);
            if (!item) continue;
            if (item.prop) {
                var slotPos;
                var positions = this.slot_to_position && this.slot_to_position[slot];
                if (Array.isArray(positions) && positions.length > 1) {
                    var idx = occurCount[slot] || 0;
                    slotPos = positions[idx] || positions[0];
                    occurCount[slot] = idx + 1;
                } else {
                    slotPos = get_slot_position(this.slot_to_position, slot);
                }
                var rawVal = item.value(lv, grd, get_wl(sk.word_levels, slot, slotPos));
                if (item.value_type === "passive") {
                    prop[item.prop] = rawVal;
                } else {
                    prop[item.prop] = (prop[item.prop] || 0) + parseInt(rawVal);
                }
            }
        }
        if (this.mp_to_hp) {
            var slotPos506 = get_slot_position(this.slot_to_position, 506);
            var wl506 = get_wl((sk && sk.word_levels), 506, slotPos506);
            var convRate = 39 + wl506;
            console.log("[ZC mp_to_hp] skill=" + this.id + " player=" + me.name + " convRate=" + convRate + "% (via force_rad=" + (this.force_rad || "unset") + ")");
        }
        return Object.keys(prop).length > 0 ? prop : null;
    };

    // Override query_enable_prop for ALL ZC skills (not just 内功 ones)
    // So the display code shows the enable sections with position-filtered words
    var _hasForce = book.zc_positions.indexOf("内功") >= 0;
    custom_skill.query_enable_prop = function (lv, me) {
        var result = {};
        for (var pi = 0; pi < this.zc_position_keys.length; pi++) {
            var pk = this.zc_position_keys[pi];
            var pos = ZC_POSITIONS[pk];
            if (!pos) continue;
            if (!result[pos.base]) {
                result[pos.base] = {};
            }
            if (pos.base === "force") {
                var wl506 = 0;
                if (me && me.skills && me.skills[this.id] && me.skills[this.id].word_levels)
                    wl506 = get_wl(me.skills[this.id].word_levels, 506, get_slot_position(this.slot_to_position, 506));
                var convRate = 39 + wl506;
                var hpGain = (me && me.max_mp) ? Math.floor(me.max_mp * convRate / 100) : 0;
                result.force.desc = "唯一：将你内力的" + convRate + "%转化为气血（+" + hpGain + "点）";
            }
        }
        return result;
    };

	custom_skill.mp_to_hp = _hasForce;
	if (_hasForce) {
		var wl506_skill = get_wl(book.zc_word_levels, 506, "内功");
		var convRateSkill = 29 + wl506_skill;
		// Set force_rad so recount() handles HP conversion correctly (base 0.1 + mp_to_hp rate)
		custom_skill.force_rad = 0.1 + convRateSkill / 100;
		if (custom_skill.desc.indexOf("内力转化为气血") < 0)
			custom_skill.desc = me.name + "所创造的武功，修炼后可激发内力转化为气血";
	} else {
		delete custom_skill.force_rad;
	}

    var cc = ZC_COLORS[custom_skill.grade] || "wht";
    custom_skill.color_name = "<" + cc + ">" + custom_skill.name + "</" + cc + ">";
    return custom_skill;
};

// ===== wordselect: 词条推演（仅选择新词条，按类别分组） =====
this.cmd_wordselect = function (me, book_id, position_key) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演。");
    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var existing = book.zc_words[position_key] || [];
    if (existing.length >= 6)
        return me.notify("该部位已满（6/6个词条），无法继续添加。");

    if (!book.zc_skill_id) {
        self.create_or_update_skill(book, me);
    }

    var wudaoCount = query_wudao_count(me);
    me.notify("<hiy>══ 词条推演 · " + book.color_name + "</hiy> · " + pos.label + " (" + existing.length + "/6) ══");
    me.notify("武道书: " + wudaoCount + "本 | 每添加1个词条消耗1本武道书");

    // 部位切换
    if (book.zc_positions.length > 1) {
        var tabArgs = [];
        for (var ti = 0; ti < book.zc_positions.length; ti++) {
            var tpk = book.zc_positions[ti];
            var tlabel = (ZC_POSITIONS[tpk] && ZC_POSITIONS[tpk].label) || tpk;
            tabArgs.push("zc wordselect " + book.id + " " + tpk);
            tabArgs.push(position_key === tpk ? "<HIG>" + tlabel + "</HIG>" : tlabel);
        }
        me.send_commands.apply(me, tabArgs);
    }

    // 同部位已用词条（同部位不可重复）
    var globalExisting = {};
    var ws = book.zc_words[position_key] || [];
    for (var ei = 0; ei < ws.length; ei++) globalExisting[ws[ei]] = true;

    // 获取可选词条
    var words = get_available_words(pos.base);
    var unaddedByCat = {};
    for (var ui = 0; ui < words.length; ui++) {
        var uw = words[ui];
        if (!globalExisting[uw.index]) {
            var uck = uw.category;
            if (!unaddedByCat[uck]) unaddedByCat[uck] = [];
            unaddedByCat[uck].push(uw);
        }
    }

    var hasAny = false;
    var catOrder = [0, 1, 2, 3, 4, "passive"];
    for (var ci = 0; ci < catOrder.length; ci++) {
        var ck = catOrder[ci];
        var cws = unaddedByCat[ck];
        if (!cws || cws.length === 0) continue;
        hasAny = true;
        var cArgs = [];
        for (var wi = 0; wi < cws.length; wi++) {
            var cw = cws[wi];
            var clabel = cw.name;
            if (ck === "passive") {
                var cpdef = SKILL.ZC_WORDS[cw.index - 500];
                if (cpdef) clabel = cpdef.format(cpdef.value(1, 0, 1));
            }
            cArgs.push("zc wordadd " + book.id + " " + position_key + " " + cw.index + " select");
            cArgs.push(clabel);
        }
        if (cArgs.length > 0) me.send_commands.apply(me, cArgs);
    }
    if (!hasAny) me.notify("(没有更多可选词条)");

    me.send_commands("zc posmenu " + book.id + " " + position_key, "返回部位管理", "zc abandon " + book.id, "放弃推演");
};

// ===== words: 查看/推演词条 (部位筛选 + 紧凑一行一词条) =====
var _S = function(cmd) { return "onclick=\"window.SendCommand('" + cmd + "')\""; };
var _BTN = "color:gray;border:solid 1px gray;background:black;border-radius:0.25em;padding:0.15em 0.5em;margin:0 2px;cursor:pointer;font-size:13px;";
var _BTN_HIG = "color:#00FF00;border:solid 1px #00FF00;background:black;border-radius:0.25em;padding:0.15em 0.5em;margin:0 2px;cursor:pointer;font-size:13px;";

this.cmd_words = function (me, skill_id, book_id_and_pos) {
    var parts = (book_id_and_pos || "").split(" ");
    var book_id = parts[0];
    var filter_pos = parts[1] || null;

    var skill = SKILL.get(skill_id);
    if (!skill || !skill.is_custom)
        return me.notify("这不是一个自创技能。");

    var book = null;
    if (book_id) book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("找不到对应的自创秘籍。");

    // 未指定部位 → 先选部位
    if (!filter_pos) {
        if (!book.zc_positions || book.zc_positions.length === 0)
            return me.notify("请先推演至少一个部位。");
        me.notify("<hiy>选择要管理词条的部位：</hiy>");
        var tabArgs = [];
        for (var ti = 0; ti < book.zc_positions.length; ti++) {
            var tpk = book.zc_positions[ti];
            var tlabel = (ZC_POSITIONS[tpk] && ZC_POSITIONS[tpk].label) || tpk;
            tabArgs.push("zc words " + skill_id + " " + book.id + " " + tpk);
            tabArgs.push(tlabel);
        }
        me.send_commands.apply(me, tabArgs);
        return;
    }

    if (book.zc_positions.indexOf(filter_pos) < 0)
        return me.notify("该部位尚未推演。");

    var pos = ZC_POSITIONS[filter_pos];
    if (!pos) return me.notify("无效部位。");
    var posLabel = pos.label;

    var sk_data = me.skills[skill_id];
    // Merge per-position word_levels from both sk_data (player) and book
    var word_levels = {};
    if (sk_data && sk_data.word_levels) {
        for (var wlpos in sk_data.word_levels) {
            if (typeof sk_data.word_levels[wlpos] === "object") {
                if (!word_levels[wlpos]) word_levels[wlpos] = {};
                for (var wlk in sk_data.word_levels[wlpos])
                    word_levels[wlpos][wlk] = sk_data.word_levels[wlpos][wlk];
            }
        }
    }
    if (book.zc_word_levels) {
        for (var wlpos2 in book.zc_word_levels) {
            if (typeof book.zc_word_levels[wlpos2] === "object") {
                if (!word_levels[wlpos2]) word_levels[wlpos2] = {};
                for (var wlk2 in book.zc_word_levels[wlpos2])
                    if (word_levels[wlpos2][wlk2] === undefined)
                        word_levels[wlpos2][wlk2] = book.zc_word_levels[wlpos2][wlk2];
            }
        }
    }


    var wudaoCount = query_wudao_count(me);
    me.notify("<hiy>════ 词条管理 · " + skill.name + " · " + posLabel + " ════</hiy>");
    me.notify("武道书: " + wudaoCount + "本");

    // 部位切换（多部位时）
    if (book.zc_positions.length > 1) {
        var tabArgs2 = [];
        for (var ti2 = 0; ti2 < book.zc_positions.length; ti2++) {
            var tpk2 = book.zc_positions[ti2];
            var tlabel2 = (ZC_POSITIONS[tpk2] && ZC_POSITIONS[tpk2].label) || tpk2;
            tabArgs2.push("zc words " + skill_id + " " + book.id + " " + tpk2);
            tabArgs2.push(filter_pos === tpk2 ? "<HIG>" + tlabel2 + "</HIG>" : tlabel2);
        }
        me.send_commands.apply(me, tabArgs2);
    }

    var pwords = book.zc_words[filter_pos] || [];

    // 已添加词条 — 一行一个
    if (pwords.length > 0) {
        for (var wi = 0; wi < pwords.length; wi++) {
            var widx = pwords[wi];
            var wdef = SKILL.ZC_WORDS[widx - 500];
            var wl = get_wl(word_levels, widx, filter_pos);
            if (!wdef) continue;

            var cost1 = wdef.upgrade_cost(wl + 1);
            var sk_lv = (sk_data && sk_data.level) || 0;
            var wordVal = wdef.value(sk_lv, book.grade, wl);
            var valFmt = wdef.format(wordVal);
            var colonIdx = valFmt.indexOf("：");
            var valStr = colonIdx >= 0 ? valFmt.substring(colonIdx + 1) : valFmt;
            var extra = "";
            if (skill.mp_to_hp && widx === 506)
                extra = " <HIC>（内力" + (39 + wl) + "%→气血）</HIC>";

            // 计算可升到的最大等级（防呆：不超过潜能上限，剑心额外攻击上限9次）
            var max_affordable = wl;
            var cum_cost = 0;
            var hard_cap = (widx === 541) ? 269 : 9999;
            for (var test_lv = wl + 1; test_lv <= hard_cap; test_lv++) {
                cum_cost += wdef.upgrade_cost(test_lv);
                if (cum_cost > me.pot) break;
                max_affordable = test_lv;
            }

            var line = wdef.name + " <HIG>(Lv." + wl + ")</HIG> <HIG>" + valStr + "</HIG>" + extra;
            me.notify(line);
            me.set_temp("zc_lvl_position", filter_pos);
            me.send_commands(
                "_confirm lvlset " + skill_id + " " + book.id + " " + widx + " " + wl + " " + max_affordable, "升级",
                "zc replaceword " + book.id + " " + filter_pos + " " + widx, "替换"
            );
        }
    } else {
        me.notify("(暂无词条)");
    }

    // 返回部位管理
    me.send_commands("zc posmenu " + book.id + " " + filter_pos, "返回部位管理", "zc abandon " + book.id, "放弃该部位");
};
// ===== levelset: 设置词条等级(提示输入目标等级) =====
this.cmd_levelset = function (me, skill_id, arg2) {
	    var parts = (arg2 || "").split(" ");
	    var book_id = parts[0];
	    // New format (from cmd_words): book_id position_key word_index ...
	    // Old format (manual): book_id word_index ...
	    var position_key = null;
	    var word_index;
	    if (parts[1] && isNaN(parseInt(parts[1]))) {
	        // New format with position
	        position_key = parts[1];
	        word_index = parseInt(parts[2]);
	    } else {
	        word_index = parseInt(parts[1]);
	    }
	    if (!book_id || isNaN(word_index) || word_index < 500)
	        return me.notify("用法: zc levelset <技能ID> <秘籍ID> [部位] <词条index>");
	
	    var book = find_book(me, book_id);
	    if (!book || book.path.indexOf("zc/blank_book") < 0)
	        return me.notify("找不到对应的自创秘籍。");
	
	    var skill = SKILL.get(skill_id);
	    if (!skill || !skill.is_custom)
	        return me.notify("这不是一个自创技能。");
	
	    var wdef = SKILL.ZC_WORDS[word_index - 500];
	    if (!wdef) return me.notify("词条" + word_index + "不存在。");
	
	    var has_word = false;
	    for (var pk in book.zc_words) {
	        var ws = book.zc_words[pk];
	        for (var i = 0; i < ws.length; i++) {
	            if (ws[i] === word_index) { has_word = true; if (!position_key) position_key = pk; break; }
	        }
	        if (has_word && position_key) break;
	    }
	    if (!has_word) return me.notify("该秘籍不包含此词条。");
	
	    if (!book.zc_word_levels) book.zc_word_levels = {};
	    var cur_level = get_wl(book.zc_word_levels, word_index, position_key);
	
	    // Store context so cmd_lvl can retrieve it when called from the dialog
	    me.set_temp("zc_lvl_skill", skill_id);
	    me.set_temp("zc_lvl_book", book_id);
	    me.set_temp("zc_lvl_word", word_index);
	    me.set_temp("zc_lvl_position", position_key);

    // Send dialog to show level input popup
    me.notify('{type:"dialog",dialog:"zc",step:"levelset",word_name:"' + wdef.name + '",cur_level:' + cur_level + ',book_id:"' + book_id + '",skill_id:"' + skill_id + '",word_index:' + word_index + '}');
    return;
};

// ===== lvlask: 计算词条升级消耗并弹出二次确认(主界面内联按钮) =====
this.cmd_lvlask = function (me, target_str, rest) {
    var target = parseInt(target_str);
    if (isNaN(target) || target < 0)
        return me.notify("请输入有效的目标等级。");

    var restParts = (rest || "").split(" ");
    var skill_id = restParts[0] || me.query_temp("zc_lvl_skill");
    var book_id = restParts[1] || me.query_temp("zc_lvl_book");
    var position_key;
    var word_index;
    if (restParts[2] && isNaN(parseInt(restParts[2]))) {
        position_key = restParts[2];
        word_index = restParts[3] ? parseInt(restParts[3]) : null;
    } else {
        word_index = restParts[2] ? parseInt(restParts[2]) : null;
        position_key = me.query_temp("zc_lvl_position");
    }
    if (!word_index || isNaN(word_index))
        word_index = me.query_temp("zc_lvl_word");
    if (!position_key)
        position_key = me.query_temp("zc_lvl_position");
    if (position_key && !ZC_POSITIONS[position_key])
        position_key = null;
    if (!skill_id || !book_id || isNaN(word_index) || !word_index)
        return me.notify("请先在词条管理中点击\"升级\"按钮。");

    var book = find_book(me, book_id);
    if (!position_key && book && book.zc_words && word_index) {
        for (var pk in book.zc_words) {
            var ws = book.zc_words[pk];
            if (ws && ws.indexOf(word_index) >= 0) { position_key = pk; break; }
        }
    }
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("找不到对应的自创秘籍。");

    var skill = SKILL.get(skill_id);
    if (!skill || !skill.is_custom)
        return me.notify("这不是一个自创技能。");

    var wdef = SKILL.ZC_WORDS[word_index - 500];
    if (!wdef) return me.notify("词条" + word_index + "不存在。");

    if (!book.zc_word_levels) book.zc_word_levels = {};
    var cur_level = get_wl(book.zc_word_levels, word_index, position_key);

    if (target === cur_level) {
        me.notify(wdef.name + " 已是 (Lv." + cur_level + ")，无需调整。");
        return;
    }

    // 剑心额外攻击次数上限
    if (target > cur_level && word_index === 541 && (1 + Math.floor(target / 30)) > 9)
        return me.notify("剑心额外攻击次数最多9次。");

    // Build the actual zc lvl command
    var lvlCmd = "zc lvl " + target + " " + skill_id + " " + book_id;
    if (position_key) lvlCmd += " " + position_key;
    lvlCmd += " " + word_index;

    if (target > cur_level) {
        var levels = target - cur_level;
        var total_cost = 0;
        for (var lv = 1; lv <= levels; lv++)
            total_cost += wdef.upgrade_cost(cur_level + lv);

        if (me.pot < total_cost) {
            me.notify("潜能不足！升级到(Lv." + target + ")需要" + potStr(total_cost) + "潜能，当前" + potStr(me.pot) + "点潜能。");
            return;
        }

        me.set_temp("zc_lvl_skill", skill_id);
        me.set_temp("zc_lvl_book", book_id);
        me.set_temp("zc_lvl_word", word_index);
        me.set_temp("zc_lvl_position", position_key);

        me.notify('<span style="color:#FFAA00;">将词条 </span><b>"' + wdef.name + '"</b><span style="color:#FFAA00;"> 从 Lv.' + cur_level + ' 升级到 Lv.' + target + '，消耗 </span><b style="color:#FF6600;">' + potStr(total_cost) + '</b><span style="color:#FFAA00;"> 潜能</span>');
        me.send_commands(lvlCmd, "确认升级", "zc lvlno", "取消");
    } else {
        // 降级
        if (target < 0) return me.notify("词条最低为0级。");
        var levels = cur_level - target;
        var refund = 0;
        for (var lv = 0; lv < levels; lv++)
            refund += wdef.upgrade_cost(cur_level - lv);

        me.set_temp("zc_lvl_skill", skill_id);
        me.set_temp("zc_lvl_book", book_id);
        me.set_temp("zc_lvl_word", word_index);
        me.set_temp("zc_lvl_position", position_key);

        me.notify('<span style="color:#FFAA00;">将词条 </span><b>"' + wdef.name + '"</b><span style="color:#FFAA00;"> 从 Lv.' + cur_level + ' 降级到 Lv.' + target + '，返还 </span><b style="color:#00FF00;">' + potStr(refund) + '</b><span style="color:#FFAA00;"> 潜能</span>');
        me.send_commands(lvlCmd, "确认降级", "zc lvlno", "取消");
    }
};

// ===== lvlno: 取消升级操作(空操作) =====
this.cmd_lvlno = function (me) {
    me.notify("已取消等级调整。");
};

// ===== lvl: 执行词条等级调整(升级或降级) =====
this.cmd_lvl = function (me, target_str, rest) {
    // target_str: 目标等级数字
    // rest: "skill_id book_id word_index" (来自客户端 _confirm popup)
    // 兼容手动输入: zc lvl <target> (fallback to temp)
    var target = parseInt(target_str);
    if (isNaN(target) || target < 0)
        return me.notify("请输入有效的目标等级: zc lvl <等级>");

	    var restParts = (rest || "").split(" ");
	    var skill_id = restParts[0] || me.query_temp("zc_lvl_skill");
	    var book_id = restParts[1] || me.query_temp("zc_lvl_book");
	    // New format (from cmd_words _confirm): ... book_id position_key word_index wl max
	    // Old format (manual/fallback): ... book_id word_index
	    var position_key;
	    var word_index;
	    if (restParts[2] && isNaN(parseInt(restParts[2]))) {
	        position_key = restParts[2];
	        word_index = restParts[3] ? parseInt(restParts[3]) : null;
	    } else {
	        word_index = restParts[2] ? parseInt(restParts[2]) : null;
	        position_key = me.query_temp("zc_lvl_position");
	    }
	    if (!word_index || isNaN(word_index))
	        word_index = me.query_temp("zc_lvl_word");
	    if (!position_key)
	        position_key = me.query_temp("zc_lvl_position");
	    // Validate position_key: if it's not a real ZC position, discard it
	    if (position_key && !ZC_POSITIONS[position_key])
	        position_key = null;
	    if (!skill_id || !book_id || isNaN(word_index) || !word_index)
	        return me.notify("请先在词条管理中点击\"升级\"按钮。");

    var book = find_book(me, book_id);
    // Fallback: find position_key from book's zc_words if still missing
    if (!position_key && book && book.zc_words && word_index) {
        for (var pk in book.zc_words) {
            var ws = book.zc_words[pk];
            if (ws && ws.indexOf(word_index) >= 0) { position_key = pk; break; }
        }
    }
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("找不到对应的自创秘籍。");

    var skill = SKILL.get(skill_id);
    if (!skill || !skill.is_custom)
        return me.notify("这不是一个自创技能。");

    var wdef = SKILL.ZC_WORDS[word_index - 500];
    if (!wdef) return me.notify("词条" + word_index + "不存在。");

    if (!book.zc_word_levels) book.zc_word_levels = {};
    var cur_level = get_wl(book.zc_word_levels, word_index, position_key);

    if (target === cur_level) {
        me.notify(wdef.name + " 已是 (Lv." + cur_level + ")，无需调整。");
        return;
    }

    if (target > cur_level) {
        // 剑心额外攻击次数上限9次（value = 1 + floor(word_level/30) <= 9）
        if (word_index === 541 && (1 + Math.floor(target / 30)) > 9)
            return me.notify("剑心额外攻击次数最多9次。");

        // 升级
        var levels = target - cur_level;
        var total_cost = 0;
        for (var lv = 1; lv <= levels; lv++)
            total_cost += wdef.upgrade_cost(cur_level + lv);

        if (me.pot < total_cost)
            return me.notify("潜能不足！升级到(Lv." + target + ")需要" + potStr(total_cost) + "潜能，当前" + potStr(me.pot) + "点潜能。");

        me.pot -= total_cost;
        set_wl(book.zc_word_levels, word_index, target, position_key);

        if (skill.mp_to_hp && word_index === 506) {
            skill.force_rad = 0.1 + (29 + target) / 100;
        }

        var sk_data = me.skills[skill_id];
        if (sk_data) {
            if (!sk_data.word_levels) sk_data.word_levels = {};
            var old_lv = sk_data.level;
            skill.release_prop(me, old_lv);
            set_wl(sk_data.word_levels, word_index, target, position_key);
            skill.attach_prop(me, old_lv);
            if (skill.mp_to_hp && word_index === 506) me.recount();
        }

        me.items_changed(book);
        me.notify("词条'" + wdef.name + "'升级到 <HIG>(Lv." + target + ")</HIG>！消耗" + potStr(total_cost) + "潜能。");
    } else {
        // 降级
        if (target < 0) return me.notify("词条最低为0级。");
        var levels = cur_level - target;
        var refund = 0;
        for (var lv = 0; lv < levels; lv++)
            refund += wdef.upgrade_cost(cur_level - lv);

        set_wl(book.zc_word_levels, word_index, target, position_key);
        me.pot += refund;

        if (skill.mp_to_hp && word_index === 506) {
            skill.force_rad = 0.1 + (29 + target) / 100;
        }

        var sk_data = me.skills[skill_id];
        if (sk_data) {
            if (!sk_data.word_levels) sk_data.word_levels = {};
            var old_lv = sk_data.level;
            skill.release_prop(me, old_lv);
            set_wl(sk_data.word_levels, word_index, target, position_key);
            skill.attach_prop(me, old_lv);
            if (skill.mp_to_hp && word_index === 506) me.recount();
        }

        me.items_changed(book);
        me.notify("词条'" + wdef.name + "'降级到 <HIG>(Lv." + target + ")</HIG>，返还" + potStr(refund) + "潜能。");
    }

    notify_skill_update(me, skill_id);
    return;
};

// ===== wordadd: 添加词条到已有部位 =====
this.cmd_wordadd = function (me, book_id, arg2) {
    var parts = (arg2 || "").split(" ");
    var position_key = parts[0];
    var word_index = parseInt(parts[1]);
    var mode = parts[2] || "";

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (!book.has_position(position_key))
        return me.notify("请先推演该部位。");
    if (isNaN(word_index) || word_index < 500)
        return me.notify("词条index无效。");

    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var wdef = book.get_word_def(word_index);
    if (!wdef) return me.notify("词条" + word_index + "不存在。");

    // Check word supports this position
    var pos_keys = POSITION_TO_KEY[pos.base] || [pos.base];
    var supported = false;
    for (var j = 0; j < wdef.positions.length; j++) {
        if (pos_keys.indexOf(wdef.positions[j]) >= 0) { supported = true; break; }
    }
    if (!supported) return me.notify("词条'" + wdef.name + "'不支持该部位。");

    // Check duplicates
    var existing = book.zc_words[position_key] || [];
    if (existing.indexOf(word_index) >= 0)
        return me.notify("该部位已选择过此词条。");
    if (existing.length >= 6)
        return me.notify("该部位最多选择6个词条。");

    // Passive limit: one passive per position, and no duplicate passive across positions
    if (wdef.category === "passive") {
        // Check same passive word not already on another position
        for (var passPk in book.zc_words) {
            if (passPk === position_key) continue;
            if ((book.zc_words[passPk] || []).indexOf(word_index) >= 0)
                return me.notify("该被动词条已在其他部位存在，不可重复选择。");
        }
        // Check one passive per position
        for (var ei = 0; ei < existing.length; ei++) {
            var ew = book.get_word_def(existing[ei]);
            if (ew && ew.category === "passive")
                return me.notify("每个部位只能选择一个被动词条。");
        }
    }

    // Check wudao books
    var wudao = me.find_obj_bypath("book/wudao");
    if (!wudao || wudao.count < 1)
        return me.notify("<red>武道书不足！需要1本。</red>");

    // Add word and deduct wudao
    me.remove_obj(wudao, 1);
    if (!book.zc_words[position_key]) book.zc_words[position_key] = [];
    book.zc_words[position_key].push(word_index);
    set_wl(book.zc_word_levels, word_index, 0, position_key);
    book.update_grade();
    sync_skill_grade(book, me);
    me.items_changed(book);

    // Update skill addin in WORLD.SKILLS and player data
    var skill_id = book.zc_skill_id;
    if (skill_id) {
        // Release old props BEFORE create_or_update_skill rebuilds skill word list
        var sk_data = me.skills[skill_id];
        if (sk_data) {
            var skill_ref = SKILL.get(skill_id);
            if (skill_ref) {
                skill_ref.release_prop(me, sk_data.level || 0);
                if (skill_ref.mp_to_hp && word_index === 506) {
                    skill_ref.force_rad = 0.1 + (29 + 0) / 100;
                }
            }
            if (!sk_data.addin) sk_data.addin = [];
            if (sk_data.addin.indexOf(word_index) < 0)
                sk_data.addin.push(word_index);
            if (!sk_data.word_levels) sk_data.word_levels = {};
            set_wl(sk_data.word_levels, word_index, 0, position_key);
        }
        self.create_or_update_skill(book, me);
        if (sk_data) {
            var skill_ref2 = SKILL.get(skill_id);
            if (skill_ref2) {
                skill_ref2.attach_prop(me, sk_data.level || 0);
                if (skill_ref2.mp_to_hp && word_index === 506) {
                    me.recount();
                }
            }
        }
    }

    me.notify("已添加词条：" + wdef.name + " [" + word_index + "]（当前" + (existing.length + 1) + "/6个）。消耗1本武道书。");
    notify_skill_update(me, skill_id);
    if (mode === "select")
        return self.cmd_wordselect(me, book_id, position_key);
    return self.cmd_words(me, skill_id, book_id + " " + position_key);
};

// ===== replaceword: 替换词条 =====
this.cmd_replaceword = function (me, book_id, arg2) {
    var parts = (arg2 || "").split(" ");
    var position_key = parts[0];
    var old_word_index = parseInt(parts[1]);
    var new_word_index = parseInt(parts[2]);
    var confirmed = (parts[3] === "ok");

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (!position_key || isNaN(old_word_index))
        return me.notify("用法: zc replaceword <秘籍ID> <部位> <旧词条index> [新词条index]");

    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演。");

    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    var existing = book.zc_words[position_key] || [];
    var old_idx_in_pos = existing.indexOf(old_word_index);
    if (old_idx_in_pos < 0)
        return me.notify("该部位没有词条 " + old_word_index + "。");

    var old_wdef = book.get_word_def(old_word_index);

    // 如果没有指定新词条，显示可选替换列表
    if (isNaN(new_word_index)) {
        var words = get_available_words(pos.base);
        var existingSet = {};
        for (var i = 0; i < existing.length; i++)
            existingSet[existing[i]] = true;

        var candidates = [];
        for (var wi = 0; wi < words.length; wi++) {
            if (words[wi].index !== old_word_index && !existingSet[words[wi].index])
                candidates.push(words[wi]);
        }

        if (candidates.length === 0) {
            me.notify("没有可替换的词条。（该部位所有词条已添加）");
            return;
        }

        // 内功部位特殊词条也可选
        me.notify("<hiy>替换词条 '" + (old_wdef ? old_wdef.name : "#" + old_word_index) + "' — 选择新词条：</hiy>");
        var rByCat = {};
        for (var ri = 0; ri < candidates.length; ri++) {
            var rc = candidates[ri];
            var rck = rc.category;
            if (!rByCat[rck]) rByCat[rck] = [];
            rByCat[rck].push(rc);
        }
        var rCatOrder = [0, 1, 2, 3, 4, "passive"];
        for (var rci = 0; rci < rCatOrder.length; rci++) {
            var rck2 = rCatOrder[rci];
            var rcws = rByCat[rck2];
            if (!rcws || rcws.length === 0) continue;
            var rArgs = [];
            for (var rwi = 0; rwi < rcws.length; rwi++) {
                var rw = rcws[rwi];
                var rlabel = rw.name;
                if (rck2 === "passive") {
                    var rpdef = SKILL.ZC_WORDS[rw.index - 500];
                    if (rpdef) rlabel = rpdef.format(rpdef.value(1, 0, 1));
                }
                rArgs.push("zc replaceword " + book.id + " " + position_key + " " + old_word_index + " " + rw.index);
                rArgs.push(rlabel);
            }
            if (rArgs.length > 0) me.send_commands.apply(me, rArgs);
        }
        return;
    }

    // 执行替换
    var new_wdef = book.get_word_def(new_word_index);
    if (!new_wdef) return me.notify("新词条" + new_word_index + "不存在。");

    // 确认步骤
    if (!confirmed) {
        me.notify("<hiy>确认用 '" + new_wdef.name + "' 替换 '" + (old_wdef ? old_wdef.name : "#" + old_word_index) + "'？（原等级 <HIG>(Lv." + get_wl(book.zc_word_levels, old_word_index, position_key) + ")</HIG> 将转移给新词条）</hiy>");
        me.send_commands("zc replaceword " + book.id + " " + position_key + " " + old_word_index + " " + new_word_index + " ok", "确认替换");
        me.send_commands("zc words " + book.zc_skill_id + " " + book.id + " " + position_key, "取消");
        return;
    }

    // 验证新词条支持该部位
    var pos_keys = POSITION_TO_KEY[pos.base] || [pos.base];
    var supported = false;
    for (var j = 0; j < new_wdef.positions.length; j++) {
        if (pos_keys.indexOf(new_wdef.positions[j]) >= 0) { supported = true; break; }
    }
    if (!supported) return me.notify("词条'" + new_wdef.name + "'不支持该部位。");

    // 同一部位不能重复选择同一词条
    if (existing.indexOf(new_word_index) >= 0 && existing.indexOf(new_word_index) !== old_idx_in_pos)
        return me.notify("该部位已选择过此词条。");


    // Passive limit: one passive per position, and no duplicate passive across positions
    if (new_wdef.category === "passive") {
        // Check same passive word not already on another position
        for (var passPk in book.zc_words) {
            if (passPk === position_key) continue;
            if ((book.zc_words[passPk] || []).indexOf(new_word_index) >= 0)
                return me.notify("该被动词条已在其他部位存在，不可重复选择。");
        }
        // Check one passive per position
        for (var ei = 0; ei < existing.length; ei++) {
            if (ei === old_idx_in_pos) continue;
            var ew = book.get_word_def(existing[ei]);
            if (ew && ew.category === "passive")
                return me.notify("每个部位只能选择一个被动词条。");
        }
    }

    // 内功部位首词条限制
    if (position_key === "内功" && old_idx_in_pos === 0 && new_word_index !== 506)
        return me.notify("内功部位第一个词条必须为'内力上限'(index 506)，不可替换。");

    // 保留旧词条等级给新词条（同等级转移）
    var old_level = get_wl(book.zc_word_levels, old_word_index, position_key);
    del_wl(book.zc_word_levels, old_word_index, position_key);

    // 替换
    book.zc_words[position_key][old_idx_in_pos] = new_word_index;
    set_wl(book.zc_word_levels, new_word_index, old_level, position_key);

    book.update_grade();
    sync_skill_grade(book, me);

    // 更新技能数据
    var skill_id = book.zc_skill_id;
    if (skill_id) {
        // Release old props BEFORE create_or_update_skill rebuilds skill word list,
        // otherwise old passives (zc_focus, zc_counter_*, etc.) become ghost properties
        // that are never removed and cause incorrect stat calculations.
        var sk_data = me.skills[skill_id];
        if (sk_data) {
            var skill_ref = SKILL.get(skill_id);
            if (skill_ref) {
                skill_ref.release_prop(me, sk_data.level || 0);
            }
            // 更新 addin
            if (sk_data.addin) {
                var addin_idx = sk_data.addin.indexOf(old_word_index);
                if (addin_idx >= 0) sk_data.addin[addin_idx] = new_word_index;
            }
            if (!sk_data.word_levels) sk_data.word_levels = {};
            del_wl(sk_data.word_levels, old_word_index, position_key);
            set_wl(sk_data.word_levels, new_word_index, old_level, position_key);
        }
        self.create_or_update_skill(book, me);
        if (sk_data) {
            var skill_ref2 = SKILL.get(skill_id);
            if (skill_ref2) {
                skill_ref2.attach_prop(me, sk_data.level || 0);
                if (skill_ref2.mp_to_hp && (old_word_index === 506 || new_word_index === 506)) {
                    if (new_word_index === 506) {
                        skill_ref2.force_rad = 0.1 + (29 + old_level) / 100;
                    } else {
                        skill_ref2.force_rad = 0.1 + 29 / 100;
                    }
                    me.recount();
                }
            }
        }
    }

    me.items_changed(book);
    me.notify("词条已替换：" + (old_wdef ? old_wdef.name : "#" + old_word_index) + " → " + new_wdef.name + " <HIG>(Lv." + old_level + ")</HIG>。");
    notify_skill_update(me, skill_id);
    return self.cmd_words(me, skill_id, book_id + " " + position_key);
};

// ===== pfms: 查看/管理PFM =====
this.cmd_pfms = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    var total = book.get_total_pfms();
    me.notify("<hiy>════ 管理技能 · " + (book.zc_name || book.name) + " ════</hiy>");

    if (total === 0) {
        me.notify("(暂无PFM)");
        return;
    }

    for (var pi = 0; pi < book.zc_positions.length; pi++) {
        var pk = book.zc_positions[pi];
        var pfms = book.zc_pfms[pk] || [];
        if (pfms.length === 0) continue;
        var posLabel = (ZC_POSITIONS[pk] && ZC_POSITIONS[pk].label) || pk;
        me.notify(" <hic>" + posLabel + "：</hic>");
        for (var fi = 0; fi < pfms.length; fi++) {
            var sel = pfms[fi];
            var src = SKILL.get(sel.skill_id);
            var pfmName = "?";
            var srcName = "";
            if (src && src.pfm && src.pfm[sel.pfm_key]) {
                pfmName = src.pfm[sel.pfm_key].name;
                srcName = src.name;
            }
            me.notify("   【" + pfmName + "】（源自" + srcName + "）");
            me.send_commands(
                "zc removepfm " + book.id + " " + pk + " " + fi,
                "移除" + pfmName,
                "zc replacepfm " + book.id + " " + pk + " " + fi,
                "替换" + pfmName
            );
        }
    }
    me.notify("<hiy>返回：</hiy>");
    me.send_commands("zc deduce " + book.id, "返回推演主页");
};

// ===== removepfm: 移除PFM =====
this.cmd_removepfm = function (me, book_id, arg2) {
    var parts = (arg2 || "").split(" ");
    var position_key = parts[0];
    var pfm_index = parseInt(parts[1]);

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (!position_key || isNaN(pfm_index))
        return me.notify("用法: zc removepfm <秘籍ID> <部位> <PFM序号>");

    var pfms = book.zc_pfms[position_key] || [];
    if (pfm_index < 0 || pfm_index >= pfms.length)
        return me.notify("无效的PFM序号。");

    var removed = pfms.splice(pfm_index, 1)[0];
    var src = SKILL.get(removed.skill_id);
    var pfmName = (src && src.pfm && src.pfm[removed.pfm_key]) ? src.pfm[removed.pfm_key].name : "?";

    // 更新技能
    if (book.zc_skill_id) {
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) {
                skill.release_prop(me, sk_data.level || 0);
            }
        }
        self.create_or_update_skill(book, me);
        sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill2 = SKILL.get(book.zc_skill_id);
            if (skill2) {
                skill2.attach_prop(me, sk_data.level || 0);
            }
        }
    }

    me.items_changed(book);
    me.notify("已移除PFM：" + pfmName + "。");
    return self.cmd_pfms(me, book_id);
};

// ===== replacepfm: 替换PFM =====
this.cmd_replacepfm = function (me, book_id, arg2) {
    var parts = (arg2 || "").split(" ");
    var position_key = parts[0];
    var pfm_index = parseInt(parts[1]);
    var new_pfm_ref = parts[2] || "";
    var confirmed = (parts[3] === "ok");

    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (!position_key || isNaN(pfm_index))
        return me.notify("用法: zc replacepfm <秘籍ID> <部位> <PFM序号> [技能.pfm]");

    var pfms = book.zc_pfms[position_key] || [];
    if (pfm_index < 0 || pfm_index >= pfms.length)
        return me.notify("无效的PFM序号。");

    var old_pfm = pfms[pfm_index];
    var old_src = SKILL.get(old_pfm.skill_id);
    var old_name = (old_src && old_src.pfm && old_src.pfm[old_pfm.pfm_key]) ? old_src.pfm[old_pfm.pfm_key].name : "?";

    // 如果没有指定新PFM，显示可选替换列表
    if (!new_pfm_ref) {
        var pfms_available = get_available_pfms(me, position_key);
        var candidates = [];
        for (var i = 0; i < pfms_available.length; i++) {
            var p = pfms_available[i];
            // 排除自身和已选择的
            var isSelf = (p.skill_id === old_pfm.skill_id && p.pfm_key === old_pfm.pfm_key);
            var isDup = false;
            for (var j = 0; j < pfms.length; j++) {
                if (j !== pfm_index && pfms[j].skill_id === p.skill_id && pfms[j].pfm_key === p.pfm_key) {
                    isDup = true; break;
                }
            }
            if (!isSelf && !isDup)
                candidates.push(p);
        }

        if (candidates.length === 0) {
            me.notify("没有可替换的PFM。");
            return self.cmd_pfms(me, book_id);
        }

        me.notify("<hiy>替换PFM '" + old_name + "' — 选择新PFM：</hiy>");
        var args = [];
        for (var ci = 0; ci < candidates.length; ci++) {
            var c = candidates[ci];
            args.push("zc replacepfm " + book.id + " " + position_key + " " + pfm_index + " " + c.skill_id + "." + c.pfm_key);
            args.push(c.pfm_name + "(" + c.skill_name + ")");
        }
        if (args.length > 0) me.send_commands.apply(me, args);
        return;
    }

    // 解析新PFM引用
    var dot = new_pfm_ref.indexOf(".");
    if (dot < 0) return me.notify("PFM格式错误，应为 技能ID.pfmKey。");
    var new_skill_id = new_pfm_ref.substring(0, dot);
    var new_pfm_key = new_pfm_ref.substring(dot + 1);

    var new_src = SKILL.get(new_skill_id);
    if (!new_src || !new_src.pfm || !new_src.pfm[new_pfm_key])
        return me.notify("PFM不存在。");

    var new_name = new_src.pfm[new_pfm_key].name;

    // 门派PFM限制检查
    if (new_src.family) {
        for (var bpk in book.zc_pfms) {
            var bpfms = book.zc_pfms[bpk];
            for (var bi = 0; bi < bpfms.length; bi++) {
                if (bpk === position_key && bi === pfm_index) continue; // 跳过被替换的
                var bsrc = SKILL.get(bpfms[bi].skill_id);
                if (bsrc && bsrc.family) {
                    return me.notify("整个自创技能最多融合1个门派PFM，已有" + bsrc.family + "的PFM。");
                }
            }
        }
    }

    // 确认
    if (!confirmed) {
        me.notify("<hiy>确认用 '" + new_name + "'（" + new_src.name + "）替换 '" + old_name + "'？</hiy>");
        me.send_commands("zc replacepfm " + book.id + " " + position_key + " " + pfm_index + " " + new_skill_id + "." + new_pfm_key + " ok", "确认替换");
        me.send_commands("zc pfms " + book.id, "取消");
        return;
    }

    // 执行替换
    pfms[pfm_index] = { skill_id: new_skill_id, pfm_key: new_pfm_key };

    if (book.zc_skill_id) {
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) {
                skill.release_prop(me, sk_data.level || 0);
            }
        }
        self.create_or_update_skill(book, me);
        sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill2 = SKILL.get(book.zc_skill_id);
            if (skill2) {
                skill2.attach_prop(me, sk_data.level || 0);
            }
        }
    }

    me.items_changed(book);
    me.notify("PFM已替换：" + old_name + " → " + new_name + "。");
    return self.cmd_pfms(me, book_id);
};

// ===== abandon: 放弃推演 =====
this.cmd_abandon = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");

    if (book.zc_state !== "deducing") {
        return self.cmd_deduce(me, book_id);
    }

    var pos = book._deducing_position;
    if (pos) {
        var words = book.zc_words[pos] || [];
        for (var i = 0; i < words.length; i++) {
            var usedElsewhere = false;
            for (var pk in book.zc_words) {
                if (pk === pos) continue;
                var ws = book.zc_words[pk] || [];
                if (ws.indexOf(words[i]) >= 0) { usedElsewhere = true; break; }
            }
            if (!usedElsewhere) del_wl(book.zc_word_levels, words[i], pos);
        }
        delete book.zc_words[pos];
    }

    book.zc_state = book.zc_positions.length > 0 ? "completed" : "named";
    book._deducing_position = null;
    delete book._was_completed;

    me.notify("<hiy>已放弃" + (pos ? ZC_POSITIONS[pos].label : "") + "部位的推演。</hiy>");
    return self.cmd_deduce(me, book_id);
};

// ===== removepos: 移除已推演部位 =====
this.cmd_removepos = function (me, book_id, position_key) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf("zc/blank_book") < 0)
        return me.notify("你身上没有自创秘籍。");
    if (!book.has_position(position_key))
        return me.notify("该部位尚未推演。");
    var pos = ZC_POSITIONS[position_key];
    if (!pos) return me.notify("无效部位。");

    // Calculate refund
    var refundWudao = 0;
    var refundPot = 0;
    var words = book.zc_words[position_key] || [];

    // Refund all words in this position (levels are per-position)
    for (var wi = 0; wi < words.length; wi++) {
        var widx = words[wi];
        refundWudao++;
        var wl = get_wl(book.zc_word_levels, widx, position_key);
        var wdef = book.get_word_def(widx);
        if (wdef && wl > 0) {
            refundPot += wdef.base_pot_cost * wl * (wl + 1) / 2;
        }
    }

    // Refund PFMs in this position
    var pfms = book.zc_pfms[position_key] || [];
    for (var pi = 0; pi < pfms.length; pi++) {
        var pfm = pfms[pi];
        var srcSkill = SKILL.get(pfm.skill_id);
        refundWudao += srcSkill ? (PFM_COST[srcSkill.grade] || srcSkill.grade + 1) : 1;
    }

    // If skill exists and is equipped on this position's base, unequip first
    if (book.zc_skill_id) {
        var baseType = pos.base;
        if (me.skills[baseType] && me.skills[baseType].enable_skill === book.zc_skill_id) {
            me.enable_skill(baseType, null);
        }
    }

    // Remove position from book
    var idx = book.zc_positions.indexOf(position_key);
    if (idx >= 0) book.zc_positions.splice(idx, 1);

    // Clean per-position word_levels for this position
    for (var wi2 = 0; wi2 < words.length; wi2++) {
        del_wl(book.zc_word_levels, words[wi2], position_key);
    }

    // Remove words and PFMs for this position
    delete book.zc_words[position_key];
    delete book.zc_pfms[position_key];

    // If no positions left, clear mp_to_hp (内功 is required for this)
    if (book.zc_positions.length === 0) {
        book.zc_state = "named";
    }

    // Rebuild the skill
    if (book.zc_skill_id && book.zc_positions.length > 0) {
        // Release props using old zc_words_by_position, then rebuild and re-attach
        var sk_data_rp = me.skills[book.zc_skill_id];
        if (sk_data_rp) {
            var skill_rp = SKILL.get(book.zc_skill_id);
            if (skill_rp) {
                skill_rp.release_prop(me, sk_data_rp.level || 0);
            }
            // Clean up sk_data.word_levels for the removed position
            if (sk_data_rp.word_levels && sk_data_rp.word_levels[position_key]) {
                delete sk_data_rp.word_levels[position_key];
            }
            // Clean up sk_data.addin for words in the removed position
            var removedWords = book.zc_words[position_key] || [];
            if (sk_data_rp.addin && removedWords.length > 0) {
                for (var rwi = 0; rwi < removedWords.length; rwi++) {
                    var rwIdx = sk_data_rp.addin.indexOf(removedWords[rwi]);
                    if (rwIdx >= 0) sk_data_rp.addin.splice(rwIdx, 1);
                }
            }
        }
        var zcCmd = WORLD.COMMANDS["zc"];
        if (zcCmd && zcCmd.create_or_update_skill)
            zcCmd.create_or_update_skill(book, me);
        // Re-attach props with updated skill for remaining enabled bases
        sk_data_rp = me.skills[book.zc_skill_id];
        if (sk_data_rp) {
            // Disable the skill if it was equipped on the removed position's base
            if (me.skills[book.zc_skill_id])
                me.skills[book.zc_skill_id][baseType] = false;
            var skill_rp2 = SKILL.get(book.zc_skill_id);
            if (skill_rp2) {
                skill_rp2.attach_prop(me, sk_data_rp.level || 0);
            }
        }
    } else if (book.zc_positions.length === 0 && book.zc_skill_id) {
        // All positions removed, clean up the skill
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) skill.release_prop(me, sk_data.level || 0);
            delete me.skills[book.zc_skill_id];
        }
        if (me.custom_skills) {
            var csIdx = me.custom_skills.indexOf(book.zc_skill_id);
            if (csIdx >= 0) me.custom_skills.splice(csIdx, 1);
        }
        delete WORLD.SKILLS[book.zc_skill_id];
        me.notify('{type:"dialog",dialog:"skills",remove:"' + book.zc_skill_id + '"}');
        book.zc_skill_id = null;
    }

    // Apply refund
    if (refundWudao > 0) {
        var wdObj = me.find_obj("wudao book");
        if (wdObj) {
            wdObj.count = (wdObj.count || 0) + refundWudao;
            me.notify("<hiy>返还" + refundWudao + "本武道书。</hiy>");
        }
    }
    if (refundPot > 0) {
        if (!me.pot || isNaN(me.pot)) me.pot = 0;
        me.pot += refundPot;
        me.notify("<hiy>返还" + refundPot + "点潜能。</hiy>");
    }

    me.recount();
    me.notify("<hiy>已移除" + pos.label + "部位，属性已更新。</hiy>");
    return self.cmd_deduce(me, book_id);
};

// ===== reset: 重置秘籍 =====
this.cmd_reset = function (me, book_id) {
    var book = find_book(me, book_id);
    if (!book || book.path.indexOf('zc/blank_book') < 0)
        return me.notify('你身上没有自创秘籍。');

    // Calculate refund before clearing data
    var totalWudao = 0;
    var totalPot = 0;
    for (var pk in book.zc_words) {
        var ws = book.zc_words[pk];
        totalWudao += ws.length;
        for (var wi = 0; wi < ws.length; wi++) {
            var widx = ws[wi];
            var wl = get_wl(book.zc_word_levels, widx, pk);
            var wdef = book.get_word_def(widx);
            if (wdef && wl > 0) {
                totalPot += wdef.base_pot_cost * wl * (wl + 1) / 2;
            }
        }
    }
    for (var pk2 in book.zc_pfms) {
        var pfms = book.zc_pfms[pk2];
        for (var pi = 0; pi < pfms.length; pi++) {
            var pfm = pfms[pi];
            var srcSkill = SKILL.get(pfm.skill_id);
            var cost = srcSkill ? (PFM_COST[srcSkill.grade] || srcSkill.grade + 1) : 1;
            totalWudao += cost;
        }
    }

    if (book.zc_skill_id) {
        var sk_data = me.skills[book.zc_skill_id];
        if (sk_data) {
            var skill = SKILL.get(book.zc_skill_id);
            if (skill) {
                // Disenable from all base types before reset (prevents stale references, negative HP)
                if (skill.can_enables) {
                    for (var di = 0; di < skill.can_enables.length; di++) {
                        var baseType = skill.can_enables[di];
                        if (me.skills[baseType] && me.skills[baseType].enable_skill === book.zc_skill_id) {
                            me.enable_skill(baseType, null);
                        }
                    }
                }
                skill.release_prop(me, sk_data.level || 0);
                // Clean up SKILL[enable_type][grade] arrays
                if (skill.can_enables) {
                    for (var i = 0; i < skill.can_enables.length; i++) {
                        var et = skill.can_enables[i];
                        if (SKILL[et] && SKILL[et][skill.grade]) {
                            var arr = SKILL[et][skill.grade];
                            var sidx = arr.indexOf(skill);
                            if (sidx >= 0) arr.splice(sidx, 1);
                        }
                    }
                }
                // Notify client to remove skill from panel in real-time
                me.notify('{type:"dialog",dialog:"skills",remove:"' + book.zc_skill_id + '"}');
                delete WORLD.SKILLS[book.zc_skill_id];
            }
            delete me.skills[book.zc_skill_id];
        }
        if (me.custom_skills) {
            var idx = me.custom_skills.indexOf(book.zc_skill_id);
            if (idx >= 0) me.custom_skills.splice(idx, 1);
        }
    }
    book.zc_state = 'blank';
    book.zc_name = null;
    book.name = '空白秘籍';
    book.zc_positions = [];
    book.zc_words = {};
    book.zc_pfms = {};
    book.zc_skill_id = null;
    book.zc_word_levels = {};
    book.skill = null;
    book.grade = 0;
    book.color_name = '<wht>空白秘籍</wht>';
    delete book._deducing_position;

    // Refund wudao books
    if (totalWudao > 0) {
        var wudaoRefund = me.find_obj_bypath("book/wudao");
        if (wudaoRefund) {
            wudaoRefund.count += totalWudao;
            me.items_changed(wudaoRefund);
        } else {
            // 背包中没有武道书，创建新的
            wudaoRefund = WORLD.create_obj("book/wudao");
            wudaoRefund.count = totalWudao;
            me.push_item(wudaoRefund);
        }
    }
    // Refund potential
    if (totalPot > 0) {
        me.pot += totalPot;
    }

    me.items_changed(book);
    // Push real-time updates
    me.on_skillchanged();
    var scoreCmd = WORLD.COMMANDS["score"];
    if (scoreCmd) scoreCmd.enter(me, "");

    var refundMsg = '秘籍已重置为空白状态。';
    if (totalPot > 0 || totalWudao > 0) {
        refundMsg += '\n<hiy>返还：</hiy>';
        if (totalWudao > 0) refundMsg += '\n  武道书：' + totalWudao + '本';
        if (totalPot > 0) refundMsg += '\n  潜能：' + potStr(totalPot) + '点';
    }
    me.notify(refundMsg);
};

// ===== skill_info: 查看自创技能详情 =====
this.cmd_skill_info = function (me, skill_id) {
    var skill = SKILL.get(skill_id);
    if (!skill || !skill.is_custom)
        return me.notify("这不是一个自创技能。使用 zc deduce <物品ID> 推演你的自创秘籍。");

    var sk_data = me.skills[skill_id];
    if (!sk_data) return me.notify("你还没有学会这个技能。");

    var lines = [];
    lines.push("<hiy>" + skill.name + "</hiy> (Grade " + (skill.grade || 0) + ")");
    lines.push("词条:");

    var addin = sk_data.addin || [];
    var word_levels = sk_data.word_levels || {};
    // Group words by position for clarity
    if (skill.zc_position_keys && skill.zc_position_keys.length > 0) {
        for (var pi = 0; pi < skill.zc_position_keys.length; pi++) {
            var pk = skill.zc_position_keys[pi];
            var pwords = skill.zc_words_by_position ? (skill.zc_words_by_position[pk] || []) : [];
            if (pwords.length === 0) continue;
            var posLabel = (ZC_POSITIONS[pk] && ZC_POSITIONS[pk].label) || pk;
            lines.push(" <hic>" + posLabel + "：</hic>");
            for (var wi = 0; wi < pwords.length; wi++) {
                var widx = pwords[wi];
                var wdef = skill.slots ? skill.slots[widx - 500] : null;
                var wl = get_wl(word_levels, widx, pk);
                if (wdef) {
                    var next_cost = wdef.upgrade_cost(wl + 1);
                    var extra = "";
                    if (skill.mp_to_hp && widx === 506) {
                        extra = "（转血量" + (29 + wl) + "%）";
                    }
                    lines.push("   [" + widx + "] " + wdef.name + " <HIG>(Lv." + wl + ")</HIG>" + extra + " (升级需" + potStr(next_cost) + "潜能)");
                }
            }
        }
    } else {
        // Fallback: no position info, display flat
        for (var i = 0; i < addin.length; i++) {
            var widx2 = addin[i];
            var wdef2 = skill.slots ? skill.slots[widx2 - 500] : null;
            var wl2 = get_wl(word_levels, widx2, get_slot_position(skill.slot_to_position, widx2));
            if (wdef2) {
                var next_cost2 = wdef2.upgrade_cost(wl2 + 1);
                lines.push("  [" + widx2 + "] " + wdef2.name + " <HIG>(Lv." + wl2 + ")</HIG> (升级需" + potStr(next_cost2) + "潜能)");
            } else {
                lines.push("  [" + widx2 + "] Lv." + wl2);
            }
        }
        if (addin.length === 0) lines.push("  (无)");
    }

    // PFM info
    if (skill.pfm) {
        var pfmCount = 0;
        for (var pk in skill.pfm) {
            if (skill.pfm[pk] && skill.pfm[pk].name) pfmCount++;
        }
        if (pfmCount > 0) {
            lines.push("绝招:");
            for (var pk2 in skill.pfm) {
                var p_item = skill.pfm[pk2];
                if (!p_item || !p_item.name) continue;
                var srcName = p_item.source_skill ? "（源自" + (SKILL.get(p_item.source_skill) ? SKILL.get(p_item.source_skill).name : p_item.source_skill) + "）" : "";
                lines.push("  【" + p_item.name + "】" + srcName);
                if (p_item.desc) lines.push("    " + p_item.desc);
            }
        }
    }

    me.notify(lines.join("\n"));
};
