
require("./character.js");
CHARACTER.prototype.query_skill = function (name, def) {
    if (!this.skills || !this.skills[name]) return def || 0;
    return this.skills[name].level + this.query_prop(name);
}
// 技能改 id 后迁移角色身上的记录：技能本身、基本技能上的装备关系、技能组（见 SKILL.RENAMED）
CHARACTER.prototype.migrate_renamed_skills = function () {
    var map = SKILL.RENAMED || {};
    for (var oldId in map) {
        var newId = map[oldId];
        if (this.skills[oldId]) {
            if (!this.skills[newId]) this.skills[newId] = this.skills[oldId];
            else if ((this.skills[oldId].level || 0) > (this.skills[newId].level || 0)) this.skills[newId] = this.skills[oldId];
            delete this.skills[oldId];
        }
        for (var k in this.skills) {
            var it = this.skills[k];
            if (it && it.enable_skill === oldId) it.enable_skill = newId;
            // 改 id 时连同可装备部位一起变了（如天地同寿拳法→火舞旋风剑法）：装在新技能不支持的部位上的解除
            if (it && it.enable_skill === newId) { var nb = SKILL.get(newId); if (nb && nb.can_enables && nb.can_enables.indexOf(k) < 0) { it.enable_skill = null; if (this.skills[newId]) delete this.skills[newId][k]; } }
            if (it && it[oldId] !== undefined) { if (it[newId] === undefined) it[newId] = it[oldId]; delete it[oldId]; }
        }
        if (this.sk_groups) for (var g = 0; g < this.sk_groups.length; g++) {
            var grp = this.sk_groups[g];
            if (Array.isArray(grp)) for (var j = 0; j < grp.length; j++) if (grp[j] === oldId) grp[j] = newId;
        }
    }
};
CHARACTER.prototype.skill_map = function () {
    //给NPC初始化技能用的，不做任何判断
    this.skills = this.skills || {};
    for (var i = 0; i < arguments.length; i++) {
        var item = arguments[i];
        if (!item) continue;
        var skill_base = SKILL.get(item[0]);
        if (!skill_base) {
            console.log(item[0] + " not exits")
            continue;
        }
        var skill = {
            level: item[1] || 1,
            exp: 0
        };
        this.skills[skill_base.id] = skill;
        if (item[2]) {
            var enables = item[2];
            if (typeof enables == "string") enables = [enables];
            for (var j = 0; j < enables.length; j++) {

                skill[enables[j]] = true;
                if (!this.skills[enables[j]]) this.skills[enables[j]] = { level: skill.level, exp: 0 };
                this.skills[enables[j]].enable_skill = item[0];
            }
        }
    }
}
CHARACTER.prototype.remove_skill = function (skillid) {
    var skill = this.skills[skillid];
    if (!skill) return;
    var baseskill = SKILL.get(skillid);
    if (!baseskill) return false;

    if (baseskill.type == SKILL_TYPES.BASE) {
        if (skill.enable_skill) {
            var old_skill = SKILL.get(skill.enable_skill);
            if (!old_skill || !this.skills[skill.enable_skill]) {
                return false;
            }
            // 先清启用标志再 disenable（与 enable_skill 的顺序一致）：disenable 依据
            // is_enable 判断是否撤销进阶属性，标志未清时会漏撤。
            this.skills[skill.enable_skill][skillid] = false;
            old_skill.disenable(this, skillid);
        }
    } else {
        for (var key in this.skills) {
            if (this.skills[key].enable_skill == skillid) {
                this.skills[skillid][key] = false;
                baseskill.disenable(this, key);
                this.skills[key].enable_skill = null;
            }
        }
    }
    baseskill.release_prop(this, this.query_skill(skillid));
    delete this.skills[skillid];
    this.init_skill();
    this.recount();
    this.add_score(-baseskill.query_score(skill.level, this));
    baseskill.on_remove && baseskill.on_remove(this);
    return true;
}
// 技能等级固定（GM 测试号，见 world/cmd/admin/sktest.js）：存档标记 temp.skill_fixed = 固定等级。
// 固定后任何途径都不能改变技能等级（学习/练习/读书/残页/领悟/放弃/set_skill）。
CHARACTER.SKILL_FIXED_MSG = "你的技能等级已被固定，无法再改变。";
CHARACTER.prototype.skill_fixed = function () {
    return (this.query_temp && parseInt(this.query_temp("skill_fixed"))) || 0;
}
// 测试号（GM 用 sktest fix 设置）：叛师无限制、可找金古易自由调整境界
CHARACTER.prototype.is_test_char = function () {
    return !!(this.is_player && this.query_temp && this.query_temp("test_char"));
}
//增加技能
CHARACTER.prototype.set_skill = function (skid, level) {
    if (this.skill_fixed() && !this._skill_fix_bypass) return;
    if (!this.skills) this.skills = {};
    var item = this.skills[skid];
    var skill_base = SKILL.get(skid);
    if (!skill_base) return;
    if (!item) {
        item = {
            //id: skid,
            level: level,
            exp: 0
        };
        this.skills[skid] = item;
        skill_base.attach_prop(this, level);
    } else {
        skill_base.release_prop(this, this.query_skill(skid));
        item.level = level;
        skill_base.attach_prop(this, this.query_skill(skid));
    }
    this.init_skill();
    this.recount();
}
CHARACTER.prototype.skill_limit = function () {
    if (this.exp < 100) return 10;
    switch (this.level) {
        case 1: return Math.round(Math.pow(this.exp * 20, 1 / 3));
        case 2: return Math.round(Math.pow(this.exp * 30, 1 / 3));
        case 3: return Math.round(Math.pow(this.exp * 40, 1 / 3));
        case 4: return Math.round(Math.pow(this.exp * 50, 1 / 3));
        case 5: return Math.round(Math.pow(this.exp * 60, 1 / 3));
        case 6: return Math.round(Math.pow(this.exp * 60, 1 / 3));
        default:
            return Math.round(Math.pow(this.exp * 10, 1 / 3));
    }
}

CHARACTER.prototype.query_ref_skill = function (skill) {
    if (!skill || !skill.ref) return;
    var refs = skill.ref.split("/");
    var sp_skill = SKILL.get(refs[0]);
    if (sp_skill) {
        return sp_skill.get_pfm(refs[1]);
    }
}
//判断某个技能是否装备到某个基本技能上
CHARACTER.prototype.is_enable_skill = function (skid, type) {
    if (!this.skills) return;
    var item = this.skills[skid];
    if (!item) return;
    return item[type];
}
//装备技能到基本技能
CHARACTER.prototype.enable_skill = function (base, skill) {
    if (!this.skills) return;
    var baseskill = this.skills[base];
    if (!baseskill) return;
    if (baseskill.enable_skill) {
        var old_skill = this.skills[baseskill.enable_skill];
        if (!old_skill) {
            // Stale reference: skill was deleted but enable_skill wasn't cleared
            baseskill.enable_skill = null;
        } else {
            old_skill[base] = false;
            old_skill = SKILL.get(baseskill.enable_skill);
            if (old_skill) {
                old_skill.disenable(this, base);
            }
        }
    }
    if (skill) {
        var sp_skill = this.skills[skill];

        if (baseskill && sp_skill) {
            var sp_skill_base = SKILL.get(skill);
            if (!sp_skill_base || sp_skill_base.enable(this, base) !== true)
                return false;
            baseskill.enable_skill = skill;
            sp_skill[base] = true;
        }
    } else {
        baseskill.enable_skill = null;
    }
    this.init_skill();
    this.recount();

    return true;
}
//初始化人物使用的技能
CHARACTER.prototype.init_skill = function () {
    this.attack_skill = this.query_used_skill(this.query_weapon_type());
    this.noweapon_skill = this.query_used_skill(WEAPON_TYPE.NONE);
    this.dodge_skill = this.query_used_skill(BASE_SKILLS.DODGE);
    this.parry_skill = this.query_used_skill(BASE_SKILLS.PARRY);
    this.force_skill = this.query_used_skill(BASE_SKILLS.FORCE);
    this.on_skillchanged && this.on_skillchanged();
    this.auto_skills = null;
}

CHARACTER.prototype.query_used_skill = function (skname) {
    if (!this.skills) {
        return WORLD.DEFAULT_SKILLS[skname];
    }
    var skill = this.skills[skname];
    if (skill) {

        var skill_base = SKILL.get(skill.enable_skill || skname);
        if (skill_base) return skill_base;
        // 自创武学暂未注册（秘籍不在身上等）时保留装备关系，注册后自动恢复；其余失效技能照旧解除
        if (!(skill.enable_skill && /^zc_/.test(skill.enable_skill))) skill.enable_skill = null;
    }
    return WORLD.DEFAULT_SKILLS[skname];
}
// 战斗中的短期记录（如「上一个绝招」）：只放在内存里，带过期时间，不进存档。
// temp 即使带过期时间也会随存档写盘，这类记录不应持久化（小无相功的 copy_pfm_* 除外，那是有意存档的）。
// 临时属性：在 fn 执行期间给自己挂一个承载 prop 的临时状态（经 recount 生效，玩家/NPC 通用），结束即移除。
// 用来替代「直接改写 gj/fy 等字段再改回」的写法——那种写法在执行中途发生 recount 时会把临时值固化成 NPC 的基础值。
CHARACTER.prototype.with_temp_prop = function (key, prop, fn) {
    var sid = "_tmp_" + key;
    this.add_status({ id: sid, name: "", desc: "", duration: 60000, no_diff: true, override: 2, prop: prop });
    try { return fn(); }
    finally { this.remove_status(sid, true); }
};
CHARACTER.prototype.set_mem = function (name, value, time) {
    if (!this._mem) Object.defineProperty(this, "_mem", { value: {}, writable: true, enumerable: false });
    this._mem[name] = { v: value, e: time ? Date.now() + time : 0 };
};
CHARACTER.prototype.query_mem = function (name, def) {
    var item = this._mem && this._mem[name];
    if (!item) return def;
    if (item.e && Date.now() > item.e) { delete this._mem[name]; return def; }
    return item.v;
};
CHARACTER.prototype.remove_mem = function (name) {
    if (this._mem) delete this._mem[name];
};
// 空明拳·左右互搏（上一个自己用的绝招）/ 斗转星移·斗转（上一个打自己的绝招）的记录有效期
CHARACTER.PFM_MEM_TIME = 10000;
// 清掉上述记录；旧版本曾把 sk/last_pfm_id、sk/last_pfm_lv 写进存档 temp，登录时一并清除
CHARACTER.prototype.clear_pfm_memory = function () {
    this.remove_mem("sk/last_pfm_id"); this.remove_mem("sk/last_pfm_lv"); this.remove_mem("sk/last_hit_pfm");
    if (this.temp) { delete this.temp["sk/last_pfm_id"]; delete this.temp["sk/last_pfm_lv"]; delete this.temp["sk/last_hit_pfm"]; }
};
CHARACTER.prototype.query_status = function (sid) {
    if (!this.status) return 0;
    for (var i = 0; i < this.status.length; i++) {
        if (this.status[i].id == sid) {
            return this.status[i].count;
        }
    }
    return 0;
}
CHARACTER.prototype.add_status = function (buff, from) {
    if (this.hp <= 0) return false;
    if (!this.status) this.status = [];
    var sid = buff.id;
    buff.override = buff.override || 0;
    buff.count = buff.count || 1;
    buff.max_count = buff.max_count || 10;

    buff.start_time = Date.now();
    if (buff.on_interval) {
        buff.over_count = buff.over_count || 0;
    }
    if ((this.ig_control || this.query_prop('ig_control')) && !buff.no_diff) {
        if (buff.is_busy || buff.is_faint || buff.is_miss || buff.is_rash) {
            return false;
        }
    }
    if (buff.downside && buff.duration && !buff.no_diff) {
        //buff.duration = buff.duration - this.query_prop("diff_downside");
        buff.duration = Math.round(buff.duration * (100 - this.query_prop("diff_downside_per")) / 100);
        if (buff.duration <= 0) {
            return false;
        }
    }
    if (buff.is_busy && !buff.no_diff) {
        if (from) {
            buff.duration = buff.duration + from.query_prop("busy");
            buff.duration = buff.duration * (100 + from.query_prop("busy_per")) / 100;
        }
        buff.duration = buff.duration - this.query_prop("diff_busy");
        buff.duration = Math.round(buff.duration * (100 - this.query_prop("diff_busy_per")) / 100);
        if (buff.duration <= 0) {
            return false;
        }
    }
    for (var i = 0; i < this.status.length; i++) {

        if (this.status[i].id == sid) {
            var item = this.status[i];
            if (item.override != buff.override) return false;
            if (item.override == 0) {
                //0不覆盖 1叠加 2覆盖替换

                return false;
            }
            if (item.override == 1) {
                if (item.max_count <= item.count) {
                    return false;
                }
                item.count += buff.count;
                clearTimeout(item.handler);
                if (item.duration)
                    item.handler = this.call_out(this.remove_status, item.duration, sid);
                this.change_buff(item, true, buff.count);
                item.start_time = buff.start_time;
                this.status_changed(item, "refresh");
            } else {
                // 覆盖替换：先通知客户端移除旧buff，再添加新buff
                if (buff.downside && item.downside) return false;
                // 先发送remove确保客户端清除旧buff
                this.status_changed(item, "remove");
                // 防呆处理，先清除旧定时器
                item.handler && clearTimeout(item.handler);
                // 撤销旧prop（与 change_buff 记账一致：change_prop 与 add_buff_prop 成对）
                if (item.prop) {
                    for (var j = 0; j < item.count; j++) {
                        this.change_prop(item.prop, false);
                        for (var pk in item.prop) {
                            if (pk !== "desc" && pk !== "skill") this.add_buff_prop(pk, -item.prop[pk]);
                        }
                    }
                }
                // 更新属性（包含控制标志、消息、回调等）
                item.name = buff.name;
                item.desc = buff.desc;
                item.duration = buff.duration;
                item.prop = buff.prop;
                item.count = buff.count;
                item.downside = buff.downside;
                item.override = buff.override;
                if (buff.max_count) item.max_count = buff.max_count;
                // 控制标志
                item.is_busy = buff.is_busy;
                item.is_faint = buff.is_faint;
                item.is_miss = buff.is_miss;
                item.is_rash = buff.is_rash;
                item.is_shadow = buff.is_shadow;
                item.ig_control = buff.ig_control || (buff.prop && buff.prop.ig_control);
                item.start_msg = buff.start_msg;
                item.finish_msg = buff.finish_msg;
                item.only_combat = buff.only_combat;
                item.no_clear = buff.no_clear;
                item.no_diff = buff.no_diff;
                if (buff.on_attach) { item.on_attach = buff.on_attach; buff.on_attach(this); }
                if (buff.on_expire) item.on_expire = buff.on_expire;
                // on_interval 重置
                if (buff.on_interval) { item.on_interval = buff.on_interval; item.over_count = 0; }
                // 应用新prop
                if (item.prop) {
                    for (var k = 0; k < item.count; k++) {
                        this.change_prop(item.prop, true);
                        for (var nk in item.prop) {
                            if (nk !== "desc" && nk !== "skill") this.add_buff_prop(nk, item.prop[nk]);
                        }
                    }
                }
                this.recount();
                this.notify_hp();
                // 旧 buff 的控制标志（如 is_busy）可能新 buff 没有：按当前 status 重算后再叠加新标志
                this._recalc_ctrl_flags();
                // 应用新控制标志
                if (buff.is_busy) this.is_busy = buff.duration;
                if (buff.is_miss) this.is_miss = buff.duration;
                if (buff.is_rash) this.is_rash = buff.duration;
                if (buff.is_shadow) this.is_shadow = buff.duration;
                if (buff.is_faint) this.is_faint = buff.duration;
                if (buff.ig_control || (buff.prop && buff.prop.ig_control)) this.ig_control = buff.duration;
                // 发送新消息
                if (buff.start_msg) this.send_room(buff.start_msg);
                // 重设定时器：on_interval同样走remove_status路径，确保周期性触发
                if (buff.on_interval && buff.duration)
                    item.handler = this.call_out(this.remove_status, buff.duration, sid);
                else if (item.duration)
                    item.handler = this.call_out(this.remove_status, item.duration, sid);
                item.start_time = Date.now();
                // 用add通知客户端新buff的完整信息（名称、持续时间等）
                this.status_changed(item, "add");
                return;
            }
            return;
        }
    }
    if (buff.duration)
        buff.handler = this.call_out(this.remove_status, buff.duration, sid);
    this.status.push(buff);

    this.change_buff(buff, true, buff.count);
    this.status_changed(buff, "add");
}

CHARACTER.prototype.clear_downside = function (type) {
    if (!this.status) return;
    var removed = "0";
    var count = 0;
    for (var i = 0; i < this.status.length; i++) {
        var item = this.status[i];
        if ((item.downside || false) == type && !item.no_clear) {

            this.change_buff(item, false, item.count);
            item.handler && clearTimeout(item.handler);
            this.status.splice(i, 1);
            i--;
            removed += ',"' + item.id + '"';
            count++;
        }
    }
    // 批量移除时 change_buff 在 splice 之前调用，其中的 _recalc_ctrl_flags 仍会看到被删的控制状态；
    // 移除完再统一重算一次，否则忙乱 / 昏迷等标志会残留到战斗结束（技能被判「手忙脚乱」、普攻停摆）。
    this._recalc_ctrl_flags();
    if (removed.length == 1 || !this.environment) return;
    var items = this.environment.items;
    var msg = '{type:"status",id:"' + this.id + '",sid:[' + removed + '],action:"remove"}';
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            player.send(msg);
        }
    }
    return count;

}


CHARACTER.prototype.clear_combat_status = function () {
    if (!this.status || !this.status.length) return;
    var removed = "0";
    for (var i = this.status.length - 1; i >= 0; i--) {
        var item = this.status[i];
        if (item.only_combat) {
            this.change_buff(item, false, item.count);
            item.handler && clearTimeout(item.handler);
            this.status.splice(i, 1);
            removed += ',"' + item.id + '"';
        }
    }
    // 批量移除时 change_buff 在 splice 之前调用，其中的 _recalc_ctrl_flags 仍会看到被删的控制状态；
    // 移除完再统一重算一次，否则忙乱 / 昏迷等标志会残留到战斗结束（技能被判「手忙脚乱」、普攻停摆）。
    this._recalc_ctrl_flags();
    if (removed.length == 1 || !this.environment) return;
    var items = this.environment.items;
    var msg = '{type:"status",id:"' + this.id + '",sid:[' + removed + '],action:"remove"}';
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            player.send(msg);
        }
    }
}
CHARACTER.prototype.remvoe_statuses = function (func) {
    if (!this.status || !this.status.length) return;
    var removed = "0";
    for (var i = this.status.length - 1; i >= 0; i--) {
        var item = this.status[i];
        if (func(item)) {
            this.change_buff(item, false, item.count);
            item.handler && clearTimeout(item.handler);
            this.status.splice(i, 1);
            removed += ',"' + item.id + '"';
        }
    }
    // 批量移除时 change_buff 在 splice 之前调用，其中的 _recalc_ctrl_flags 仍会看到被删的控制状态；
    // 移除完再统一重算一次，否则忙乱 / 昏迷等标志会残留到战斗结束（技能被判「手忙脚乱」、普攻停摆）。
    this._recalc_ctrl_flags();
    if (removed.length == 1 || !this.environment) return;
    var items = this.environment.items;
    var msg = '{type:"status",id:"' + this.id + '",sid:[' + removed + '],action:"remove"}';
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            player.send(msg);
        }
    }
}
CHARACTER.prototype.clear_status = function () {
    if (!this.status || !this.status.length) return;
    for (var i = 0; i < this.status.length; i++) {
        var item = this.status[i];
        this.change_buff(item, false, item.count);
        item.handler && clearTimeout(item.handler);
    }
    this.status.length = 0;
    // 批量移除时 change_buff 在 splice 之前调用，其中的 _recalc_ctrl_flags 仍会看到被删的控制状态；
    // 移除完再统一重算一次，否则忙乱 / 昏迷等标志会残留到战斗结束（技能被判「手忙脚乱」、普攻停摆）。
    this._recalc_ctrl_flags();
    if (!this.environment) return;
    var msg = '{type:"status",id:"' + this.id + '",action:"clear"}';
    var items = this.environment.items;
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            player.send(msg);
        }
    }
}
CHARACTER.prototype.change_buff = function (buff, isadd, buff_count) {
    if (isadd) {
        if (buff.prop) {
            for (var i = 0; i < buff_count; i++) {
                this.change_prop(buff.prop, true);
                for (var k in buff.prop) {
                    if (k !== "desc" && k !== "skill") {
                        this.add_buff_prop(k, buff.prop[k]);
                    }
                }
            }
            this.recount();
            this.notify_hp();
        }
        if (buff.on_attach) buff.on_attach(this);
        if (buff.ig_control || (buff.prop && buff.prop.ig_control)) this.ig_control = buff.duration;

        if (buff.start_msg) {
            this.send_room(buff.start_msg);
        }
        if (buff.is_busy) this.is_busy = buff.duration;
        if (buff.is_miss) this.is_miss = buff.duration;
        if (buff.is_rash) this.is_rash = buff.duration;
        if (buff.is_shadow) this.is_shadow = buff.duration;
        if (buff.is_faint) {
            this.is_faint = buff.duration;
        }
    } else {
        if (buff.prop) {
            for (var i = 0; i < buff_count; i++) {
                this.change_prop(buff.prop, false);
                for (var k in buff.prop) {
                    if (k !== "desc" && k !== "skill") {
                        this.add_buff_prop(k, -buff.prop[k]);
                    }
                }
            }
            this.recount();
            this.notify_hp();
        }
        if (buff.on_expire) buff.on_expire(this);
        if (buff.is_busy || buff.is_faint || buff.is_miss || buff.is_rash || buff.is_shadow
            || buff.ig_control || (buff.prop && buff.prop.ig_control)) {
            this._recalc_ctrl_flags();
        }
        if (this.hp > 0 && buff.finish_msg) {
            this.send_room(buff.finish_msg);
        }
        this.remove_temp(buff.id);
    }

}

// 重新计算控制标志：扫描所有status，无活跃buff时清零
CHARACTER.prototype._recalc_ctrl_flags = function () {
    var has_igctrl = false, has_busy = false, has_faint = false;
    var has_miss = false, has_rash = false, has_shadow = false;
    if (this.status) {
        for (var i = 0; i < this.status.length; i++) {
            var st = this.status[i];
            if (st.ig_control || (st.prop && st.prop.ig_control)) has_igctrl = true;
            if (st.is_busy) has_busy = true;
            if (st.is_faint) has_faint = true;
            if (st.is_miss) has_miss = true;
            if (st.is_rash) has_rash = true;
            if (st.is_shadow) has_shadow = true;
        }
    }
    if (!has_igctrl) this.ig_control = 0;
    if (!has_busy) this.is_busy = 0;
    if (!has_faint) this.is_faint = 0;
    if (!has_miss) this.is_miss = 0;
    if (!has_rash) this.is_rash = 0;
    if (!has_shadow) this.is_shadow = 0;
};
CHARACTER.prototype.appdend_status = function (str) {
    if (!this.status) return;
    var now = Date.now();
    str.push(",status:[");
    for (var i = 0; i < this.status.length; i++) {
        if (i > 0) str.push(",");
        var item = this.status[i];
        str.push('{sid:"');
str.push(item.id);
str.push('",name:"');
str.push(item.name);
str.push('",duration:');
        if (item.on_interval) {
            str.push(item.duration * item.duration_count);
        } else {
            str.push(item.duration);
        }
        str.push(',overtime:');
        str.push(now - item.start_time);
        if (item.override === 1) {
            str.push(',"count":');
            str.push(item.count);
        }
        if (item.downside) {
            str.push(',downside:');
            str.push(true);
        }
        str.push('}');
    }
    str.push("]");
}
CHARACTER.prototype.notify_status = function () {
    if (!this.status) return;
    var str = ['{type:"status",id:\"'];
str.push(this.id);
str.push("\",action:'load',items:[");
    var now = Date.now();
    for (var i = 0; i < this.status.length; i++) {
        if (i > 0) str.push(",");
        var item = this.status[i];
        str.push('{sid:"');
str.push(item.id);
str.push('",name:"');
str.push(item.name);
str.push('",duration:');
        if (item.on_interval) {
            str.push(item.duration * item.duration_count);
        } else {
            str.push(item.duration);
        }

        str.push(',overtime:');
        str.push(now - item.start_time);
        if (item.override === 1) {
            str.push(',"count":');
            str.push(item.count);
        }
        if (item.downside) {
            str.push(',downside:');
            str.push(true);
        }
        str.push('}');
    }
    str.push("]}");
    this.send(str.join(""));
}
CHARACTER.prototype.status_changed = function (item, type) {
    var str = [];
    str.push('{type:"status","action":"');
str.push(type);
str.push('",id:"');
str.push(this.id);
str.push('",sid:"');
str.push(item.id);
str.push('"');
    if (type === "add") {
        str.push(',"name":"');
str.push(item.name);
str.push('","duration":');
        if (item.on_interval) {
            str.push(item.duration * item.duration_count);
        } else {
            str.push(item.duration);

        }
        if (item.override === 1) {
            str.push(',"count":');
            str.push(item.count);
        }
        if (item.downside) {
            str.push(',downside:');
            str.push(true);
        }
    } else if (type === "refresh") {
        str.push(',"name":"');
        str.push(item.name);
        str.push('",count:');
        str.push(item.count);
    }
    str.push('}');
    if (!this.environment) return;
    var msg = str.join("");
    var items = this.environment.items;
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            player.send(msg);
        }
    }
}
CHARACTER.prototype.remove_status = function (sid, isall) {
    if (!this.status) return;
    for (var i = this.status.length - 1; i >= 0; i--) {
        if (this.status[i].id === sid) {
            var item = this.status[i];
            if (item.handler) clearTimeout(item.handler);
            item.handler = null;


            if (item.on_interval && !isall) {
                item.over_count++;
                if (item.on_interval) {
                    if (item.on_interval(this, item.over_count) === false) {
                        item.duration_count = item.duration_count || 2;
                        item.over_count = item.duration_count;
                    }
                }
                if (item.duration_count === 0 || (item.duration_count > 1 && item.duration_count > item.over_count)) {
                    if (item.duration)
                        item.handler = this.call_out(this.remove_status, item.duration, sid);
                    // item.start_time = Date.now();
                    return;
                }
            }

            if (item.override === 1) {
                item.count--;
                if (item.count === 0 || isall) {
                    // 一次性移除所有层数，避免 change_buff 重复调用
                    var totalCount = isall ? (item.count + 1) : 1;
                    this.change_buff(item, false, totalCount);
                    this.status_changed(item, "remove");
                    this._splice_status(i, item);
                    this._recalc_ctrl_flags();  // splice后重算，确保控制标志正确清除
                } else {
                    // 仅移除一层
                    this.change_buff(item, false, 1);
                    if (item.duration)
                        item.handler = this.call_out(this.remove_status, item.duration, sid);
                    item.start_time = Date.now();
                    this.status_changed(item, "refresh");
                }
            } else {
                //覆盖和不覆盖的都直接移除
                this.change_buff(item, false, 1);
                this.status_changed(item, "remove");
                this._splice_status(i, item);
                this._recalc_ctrl_flags();  // splice后重算，确保控制标志正确清除
            }

            return;
        }
    }
}
CHARACTER.prototype._splice_status = function (index, item) {
    if (this.status[index] === item) {
        return this.status.splice(index, 1);
    }
    for (var i = 0; i < this.status.length; i++) {
        if (this.status[i] === item) {
            return this.status.splice(i, 1);
        }
    }
}
