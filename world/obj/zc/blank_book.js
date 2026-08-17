this.inherits(OBJ);
this.set({
    unit: "本",
    name: "空白秘籍",
    desc: "一本空白的秘籍，可推演自创武学。",
    grade: 0,
    value: 100000,
});
this.otype = 1;

// 原型上仅声明默认值，实际可变属性在 on_clone 中初始化每个实例的独立副本
this.zc_state = "blank";
this.zc_name = null;
this.zc_positions = null;
this.zc_words = null;
this.zc_pfms = null;
this.zc_skill_id = null;
this.zc_word_levels = null;
this.is_locked = false;

// on_clone: 每个克隆实例获得独立的数组/对象，防止 Object.create 原型污染
this.on_clone = function() {
    this.zc_state = "blank";
    this.zc_name = null;
    this.zc_positions = [];
    this.zc_words = {};
    this.zc_pfms = {};
    this.zc_skill_id = null;
    this.zc_word_levels = {};
    this.is_locked = false;
    this.combined = false;
    // Ensure color_name is always set for visibility
    this.color_name = "<wht>空白秘籍</wht>";
};

// ===== 持久化: 自定义属性存入 temp 以便跨重启保留 =====
var grade_color = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];
var _sync_to_temp = function(book) {
    if (!book.temp) book.temp = {};
    book.temp.zc = JSON.stringify({
        s: book.zc_state,
        n: book.zc_name,
        nm: book.name,
        gd: book.grade,
        p: book.zc_positions,
        w: book.zc_words,
        f: book.zc_pfms,
        sid: book.zc_skill_id,
        wl: book.zc_word_levels,
        dp: book._deducing_position || null,
        cr: book.zc_creator || null
    });
};
this.on_reload = function(me) {
    this.count = 1; // ZC books never stack
    try {
        var raw = this.temp && this.temp.zc;
        if (!raw || typeof raw !== "string") {
            if (this.temp && !this.temp.zc) console.log("[ZC on_reload] " + me.name + " book has temp but no zc key:", JSON.stringify(this.temp));
            // Always set color_name for visibility even without saved state
            var cc0 = grade_color[Math.min(this.grade, 6)] || "wht";
            this.color_name = "<" + cc0 + ">" + this.name + "</" + cc0 + ">";
            return;
        }
        var d = JSON.parse(raw);
        if (!d) {
            var cc1 = grade_color[Math.min(this.grade, 6)] || "wht";
            this.color_name = "<" + cc1 + ">" + this.name + "</" + cc1 + ">";
            return;
        }
        if (d.s) this.zc_state = d.s;
        if (d.n) this.zc_name = d.n;
        if (d.nm) this.name = d.nm;
        if (d.gd !== undefined) this.grade = d.gd;
        if (d.p) this.zc_positions = d.p;
        if (d.w) this.zc_words = d.w;
        if (d.f) this.zc_pfms = d.f;
        if (d.sid) this.zc_skill_id = d.sid;
        if (d.wl) this.zc_word_levels = d.wl;
        // Repair: move word_levels from invalid position keys (e.g. "NaN") to correct ones
        if (this.zc_word_levels && this.zc_positions && this.zc_words) {
            var validPositions = {};
            for (var vpi = 0; vpi < this.zc_positions.length; vpi++)
            validPositions[this.zc_positions[vpi]] = true;
            for (var wlKey in this.zc_word_levels) {
                if (wlKey === "NaN" || (typeof this.zc_word_levels[wlKey] === "object" && !validPositions[wlKey])) {
                    var orphanLevels = this.zc_word_levels[wlKey];
                    // Try to move each word to the correct position
                    for (var orphanSlot in orphanLevels) {
                        var orphanIdx = parseInt(orphanSlot);
                        if (isNaN(orphanIdx)) continue;
                        var targetPos = null;
                        for (var pk in this.zc_words) {
                            var ws = this.zc_words[pk];
                            if (ws && ws.indexOf(orphanIdx) >= 0) { targetPos = pk; break; }
                        }
                        if (targetPos) {
                            if (!this.zc_word_levels[targetPos] || typeof this.zc_word_levels[targetPos] !== "object")
                            this.zc_word_levels[targetPos] = {};
                            if (!this.zc_word_levels[targetPos][orphanIdx] || this.zc_word_levels[targetPos][orphanIdx] < orphanLevels[orphanSlot])
                            this.zc_word_levels[targetPos][orphanIdx] = orphanLevels[orphanSlot];
                            console.log("[ZC repair] Moved word " + orphanIdx + " level=" + orphanLevels[orphanSlot] + " from \"" + wlKey + "\" to \"" + targetPos + "\"");
                        }
                    }
                    delete this.zc_word_levels[wlKey];
                    console.log("[ZC repair] Removed invalid position key \"" + wlKey + "\" from word_levels");
                }
            }
        }
        if (d.dp) this._deducing_position = d.dp;
        if (d.cr) this.zc_creator = d.cr;
        if (this.zc_creator && this.zc_state !== "blank")
        this.desc = "这是" + this.zc_creator + "的自创武学。";
        var cc = grade_color[Math.min(this.grade, 6)] || "wht";
        this.color_name = "<" + cc + ">" + this.name + "</" + cc + ">";

        // Always restore study-required fields and re-register skill
        // (handles both "completed" and "deducing" states to survive refresh while adding positions)
        if (this.zc_skill_id && (this.zc_state === "completed" || this.zc_state === "deducing")) {
            this.skill = this.zc_skill_id;
            this.max_level = 100;
            var skillInWorld = WORLD.SKILLS && WORLD.SKILLS[this.zc_skill_id];
            if (!skillInWorld) {
                var zcCmd = WORLD.COMMANDS && WORLD.COMMANDS["zc"];
                if (zcCmd && zcCmd.create_or_update_skill) {
                    zcCmd.create_or_update_skill(this, me);
                    console.log("[ZC on_reload] Re-registered skill " + this.zc_skill_id + " for " + me.name);
                }
                skillInWorld = WORLD.SKILLS && WORLD.SKILLS[this.zc_skill_id];
            }
            // Ensure mp_to_hp set for force skills created before this feature existed
            if (skillInWorld && this.zc_positions && this.zc_positions.indexOf && this.zc_positions.indexOf("内功") >= 0 && !skillInWorld.mp_to_hp) {
                skillInWorld.mp_to_hp = true;
                console.log("[ZC on_reload] Added mp_to_hp to existing skill " + this.zc_skill_id + " for " + me.name);
            }
            // Ensure force_rad set for force skills created before force_rad was introduced
            if (skillInWorld && skillInWorld.mp_to_hp && !skillInWorld.force_rad) {
                var wl506_fix = (this.zc_word_levels && this.zc_word_levels["内功"] && this.zc_word_levels["内功"][506]) || (this.zc_word_levels && this.zc_word_levels[506]) || 0;
                skillInWorld.force_rad = 0.1 + (29 + wl506_fix) / 100;
                console.log("[ZC on_reload] Set force_rad=" + skillInWorld.force_rad + " for existing skill " + this.zc_skill_id + " for " + me.name);
            }
        }
        console.log("[ZC on_reload] Restored book '" + this.name + "' (state=" + this.zc_state + ", grade=" + this.grade + ") for " + me.name);
        this.update_grade();
    } catch (e) {
        console.error("[ZC on_reload] Error reloading book for " + me.name + ":", e.message, "temp:", JSON.stringify(this.temp));
        this.update_grade();
    }
};
var _origSaveDb = this.save_db;
this.save_db = function(str) {
    _sync_to_temp(this);
    _origSaveDb.call(this, str);
};

// 完成后可通过 study 命令学习（和普通秘籍一样）
this.skill = null;
this.max_level = 100;
this.on_study = function(me, skill, lv) {
    if (this.zc_state !== "completed" || !this.zc_skill_id)
    return me.notify("这本秘籍尚未完成推演，无法学习。");
    if (!me.create_for(this.zc_skill_id))
    me.add_custom_skill(this.zc_skill_id);
    // Initialize addin and word_levels so properties show immediately
    if (lv === 0 && skill.addin_prototype && skill.addin_prototype.length > 0) {
        var sk_data = me.skills[skill.id];
        if (!sk_data) {
            sk_data = { level: 0, exp: 0 };
            me.skills[skill.id] = sk_data;
        }
        if (!sk_data.addin || sk_data.addin.length === 0)
        sk_data.addin = skill.addin_prototype.slice();
        if (!sk_data.word_levels)
        sk_data.word_levels = this.get_all_word_levels();
    }
    return true;
};

// 从玩家已有自创技能恢复秘籍数据
this.restore_from_skill = function(me) {
    console.log("[ZC restore] Attempting restore for " + me.name + " | custom_skills=" + JSON.stringify(me.custom_skills));
    if (!me.custom_skills || me.custom_skills.length === 0) {
        console.log("[ZC restore] No custom skills found for " + me.name);
        return false;
    }
    // Match by existing zc_skill_id first, then by name
    var csid = null;
    for (var ci = 0; ci < me.custom_skills.length; ci++) {
        var cid = me.custom_skills[ci];
        if (this.zc_skill_id && cid === this.zc_skill_id) {
            csid = cid; break;
        }
        var cskill = SKILL.get(cid);
        if (cskill && this.zc_name && cskill.name === this.zc_name) {
            csid = cid; break;
        }
    }
    // If no match, try all custom skills to find a restorable one
    if (!csid) {
        for (var ci2 = 0; ci2 < me.custom_skills.length; ci2++) {
            var cid2 = me.custom_skills[ci2];
            var cskill2 = SKILL.get(cid2);
            if (cskill2) { csid = cid2; break; }
            var skd = me.skills[cid2];
            if (skd && skd.addin && skd.addin.length > 0) { csid = cid2; break; }
        }
    }
    if (!csid) {
        console.log("[ZC restore] No restorable skill found for " + me.name);
        return false;
    }
    console.log("[ZC restore] Selected csid=" + csid + " for " + me.name);
    var skill = SKILL.get(csid);
    var sk_data = me.skills[csid];

    // If skill is missing from WORLD.SKILLS (server restart after book lost),
    // reconstruct from player's sk_data and ZC_WORDS definitions
    if (!skill && sk_data && sk_data.addin && sk_data.addin.length > 0) {
        console.log("[ZC restore] Skill " + csid + " not in WORLD.SKILLS, reconstructing from player data...");
        // Reconstruct positions and word mappings from addin word definitions
        var ZC_POS_RECONSTRUCT = {
            "内功": { base: "force" }, "剑法": { base: "sword" }, "刀法": { base: "blade" },
            "拳脚": { base: "unarmed" }, "棍法": { base: "club" }, "杖法": { base: "staff" },
            "鞭法": { base: "whip" }, "暗器": { base: "throwing" }, "轻功": { base: "dodge" },
            "招架": { base: "parry" }
        };
        var POS_KEY_RECONSTRUCT = {
            "force": ["force"], "sword": ["weapon"], "blade": ["weapon"],
            "unarmed": ["unarmed"], "club": ["weapon"], "staff": ["weapon"],
            "whip": ["weapon"], "throwing": ["weapon"], "dodge": ["dodge"], "parry": ["parry"]
        };

        this.zc_positions = [];
        this.zc_words = {};
        for (var ai = 0; ai < sk_data.addin.length; ai++) {
            var widx = sk_data.addin[ai];
            var wdef = SKILL.ZC_WORDS[widx - 500];
            if (!wdef) continue;
            for (var pzi = 0; pzi < wdef.positions.length; pzi++) {
                var wp = wdef.positions[pzi];
                for (var zk in ZC_POS_RECONSTRUCT) {
                    var zp = ZC_POS_RECONSTRUCT[zk];
                    var keys = POS_KEY_RECONSTRUCT[zp.base] || [zp.base];
                    if (keys.indexOf(wp) >= 0) {
                        if (this.zc_positions.indexOf(zk) < 0)
                        this.zc_positions.push(zk);
                        if (!this.zc_words[zk])
                        this.zc_words[zk] = [];
                        if (this.zc_words[zk].indexOf(widx) < 0)
                        this.zc_words[zk].push(widx);
                        break;
                    }
                }
            }
        }
        this.zc_name = "自创武学";
        this.zc_skill_id = csid;
        this.zc_word_levels = sk_data.word_levels || {};
        this.zc_state = "completed";
        this.grade = Math.min(this.get_total_words(), 6);
        this.zc_pfms = {};
        // Register the skill in WORLD.SKILLS
        var zcCmd = WORLD.COMMANDS["zc"];
        if (zcCmd && zcCmd.create_or_update_skill) {
            zcCmd.create_or_update_skill(this, me);
        }
        skill = SKILL.get(csid);
        console.log("[ZC restore] Reconstructed skill " + csid + " name=" + (skill ? skill.name : "FAILED"));
    }

    if (!skill) {
        console.log("[ZC restore] Skill not found for " + me.name + " csid=" + csid);
        return false;
    }
    // sk_data is optional — only exists if player has studied the book

    var ZC_POS = {
        "内功": { base: "force" }, "剑法": { base: "sword" }, "刀法": { base: "blade" },
        "拳脚": { base: "unarmed" }, "棍法": { base: "club" }, "杖法": { base: "staff" },
        "鞭法": { base: "whip" }, "暗器": { base: "throwing" }, "轻功": { base: "dodge" },
        "招架": { base: "parry" }
    };
    var POS_KEY = {
        "force": ["force"], "sword": ["weapon"], "blade": ["weapon"],
        "unarmed": ["unarmed"], "club": ["weapon"], "staff": ["weapon"],
        "whip": ["weapon"], "throwing": ["weapon"], "dodge": ["dodge"], "parry": ["parry"]
    };

    this.zc_state = "completed";
    this.zc_name = skill.name;
    this.name = skill.name + "秘籍";
    this.zc_skill_id = csid;
    this.skill = csid;
    this.zc_positions = skill.zc_position_keys ? skill.zc_position_keys.slice() : [];

    this.zc_words = {};
    if (skill.zc_words_by_position) {
        for (var pk in skill.zc_words_by_position)
        this.zc_words[pk] = skill.zc_words_by_position[pk].slice();
    } else {
        // 兼容旧数据
        for (var pi = 0; pi < this.zc_positions.length; pi++)
        this.zc_words[this.zc_positions[pi]] = [];
        var proto = skill.addin_prototype || [];
        for (var ai = 0; ai < proto.length; ai++) {
            var widx = proto[ai];
            var wdef = SKILL.ZC_WORDS[widx - 500];
            if (!wdef) continue;
            for (var pki = 0; pki < this.zc_positions.length; pki++) {
                var pk2 = this.zc_positions[pki];
                var pos = ZC_POS[pk2];
                if (!pos) continue;
                var keys = POS_KEY[pos.base] || [pos.base];
                var match = false;
                for (var j = 0; j < wdef.positions.length; j++) {
                    if (keys.indexOf(wdef.positions[j]) >= 0) { match = true; break; }
                }
                if (match && this.zc_words[pk2].indexOf(widx) < 0) {
                    this.zc_words[pk2].push(widx);
                    break;
                }
            }
        }
    }

    this.zc_word_levels = {};
    if (sk_data && sk_data.word_levels) {
        for (var wl_key in sk_data.word_levels)
        this.zc_word_levels[wl_key] = sk_data.word_levels[wl_key];
    }

    this.zc_pfms = {};
    if (skill.zc_position_keys && skill.pfm) {
        for (var pi2 = 0; pi2 < skill.zc_position_keys.length; pi2++)
        this.zc_pfms[skill.zc_position_keys[pi2]] = [];
        var pfm_keys = Object.keys(skill.pfm);
        for (var fi = 0; fi < pfm_keys.length; fi++) {
            var p = skill.pfm[pfm_keys[fi]];
            if (p.enable_skill) {
                for (var pi3 = 0; pi3 < skill.zc_position_keys.length; pi3++) {
                    var pk4 = skill.zc_position_keys[pi3];
                    var pos2 = ZC_POS[pk4];
                    if (pos2 && pos2.base === p.enable_skill) {
                        this.zc_pfms[pk4].push({
                            skill_id: p.source_skill || "",
                            pfm_key: p.source_pfm || ""
                        });
                        break;
                    }
                }
            }
        }
    }

    this.grade = Math.min(skill.grade || this.get_total_words(), 6);
    var cc = grade_color[this.grade] || "wht";
    this.color_name = "<" + cc + ">" + this.name + "</" + cc + ">";
    this.zc_creator = skill.creator_name || me.name;
    this.desc = "这是" + this.zc_creator + "的自创武学。";
    this.is_locked = false;
    console.log("[ZC restore] SUCCESS for " + me.name + " | book=" + this.name + " zc_creator=" + this.zc_creator + " positions=" + JSON.stringify(this.zc_positions));
    return true;
};

this.get_total_words = function () {
    var total = 0;
    if (!this.zc_words) return 0;
    for (var pos in this.zc_words) {
        total += this.zc_words[pos].length;
    }
    return total;
};

this.get_total_pfms = function () {
    var total = 0;
    for (var pos in this.zc_pfms) {
        total += this.zc_pfms[pos].length;
    }
    return total;
};

this.get_words = function (position) {
    return this.zc_words[position] || [];
};

this.get_pfms = function (position) {
    return this.zc_pfms[position] || [];
};

this.has_position = function (position) {
    return this.zc_positions.indexOf(position) >= 0;
};

this.get_current_position = function () {
    if (this.zc_state === "deducing" && this._deducing_position) {
        return this._deducing_position;
    }
    return null;
};

this.update_grade = function () {
    this.grade = this.get_total_words();
    var cc = grade_color[Math.min(this.grade, 6)] || "wht";
    this.color_name = "<" + cc + ">" + this.name + "</" + cc + ">";
};

this.generate_skill_id = function () {
    return "zc_" + this.create_uniq_id();
};

this.create_uniq_id = function () {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var id = "";
    for (var i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

this.get_all_word_levels = function () {
    var levels = {};
    for (var pos in this.zc_words) {
        if (!levels[pos]) levels[pos] = {};
        var words = this.zc_words[pos];
        for (var i = 0; i < words.length; i++) {
            var widx = words[i];
            var perPos = (this.zc_word_levels[pos] && this.zc_word_levels[pos][widx] !== undefined) ? this.zc_word_levels[pos][widx] : undefined;
            levels[pos][widx] = (perPos !== undefined) ? perPos : (this.zc_word_levels[widx] !== undefined ? this.zc_word_levels[widx] : 0);
        }
    }
    return levels;
};

this.get_word_def = function (word_index) {
    var local_idx = word_index - 500;
    return SKILL.ZC_WORDS[local_idx] || null;
};

var S = function(cmd) { return "onclick=\"window.SendCommand('" + cmd + "')\""; };
var BTN_STYLE = "color:gray;border:solid 1px gray;background:black;border-radius:0.25em;padding:0.25em 1em;margin:2px;cursor:pointer;display:inline-block;";
this.get_desc = function (me) {
    var desc = this.color_name + "\n";
    desc += this.desc + "\n";

    if (this.zc_state === "blank") {
        desc += '<div style="text-align:center;margin-top:4px;">';
        desc += '<span ' + S("zc name " + this.id) + ' style="' + BTN_STYLE + '">命名</span>';
        desc += '</div>';
    }
    if (this.zc_state === "named" || this.zc_state === "completed" || this.zc_state === "deducing") {
        desc += '<div style="text-align:center;margin-top:4px;">';
        desc += '<span ' + S("zc deduce " + this.id) + ' style="' + BTN_STYLE + '">推演</span> ';
        desc += '<span ' + S("zc rename " + this.id) + ' style="' + BTN_STYLE + '">重新命名</span>';
        desc += '</div>';
    }
    return desc;
};
