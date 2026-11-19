
require("./character.js");
CHARACTER.prototype.add_prop = function (p, v) {
    if (!p) return;
    if (!this.prop) {
        this.prop = {};
    }
    var v1 = this.prop[p] || 0;

    this.prop[p] = v1 + v;
    if (p === "max_hp") this.max_hp += v;
    if (p === "max_mp") this.max_mp += v;
}
CHARACTER.prototype.clear_prop = function () {
    this.prop = {};
}
CHARACTER.prototype.remove_prop = function (p) {
    if (this.prop) delete this.prop[p];
}
CHARACTER.prototype.query_prop = function (name) {
    if (this.prop)
        return this.prop[name] || 0;
    return 0;
}
CHARACTER.prototype.add_buff_prop = function (p, v) {
    if (!p) return;
    if (!this.buff_prop) this.buff_prop = {};
    this.buff_prop[p] = (this.buff_prop[p] || 0) + v;
}
// 免伤/破防/终伤软上限（与比武 biwu.js 同一条曲线）：技能与装备带来的部分超过 SOFT_CAP_START 后
// 按 start + 2·√(x-start) 递减，最高 SOFT_CAP_MAX（99.9999，即没有 buff 永远到不了 100）。
// 例：85→84.5，90→86.3，100→88.9，120→92.6，150→96.7，180 及以上→99.9999。
// 三项不分来源（技能、装备、buff、减益）全部套用此曲线。唯一例外是「特殊免伤」diff_sh_per2：
// 免伤类 buff 一律给 diff_sh_per2，它在软上限之后原样叠加（见 USER.recount），所以只有开 buff 才能超过 100。
// 破防的 diff_fy_per2 并入破防一起折算。只对玩家、随从和擂台镜像生效，NPC 不折算。
CHARACTER.SOFT_CAP_PROPS = { diff_sh_per: 1, diff_fy_per: 1, add_sh_per: 1 };
CHARACTER.SOFT_CAP_START = 80;
CHARACTER.SOFT_CAP_MAX = 99.9999;
CHARACTER.soft_cap = function (v) {
    var a = CHARACTER.SOFT_CAP_START;
    if (!(v > a)) return v;
    return Math.min(CHARACTER.SOFT_CAP_MAX, a + Math.sqrt((v - a) * 4));
};
CHARACTER.SOFT_CAP_EXTRA = { diff_fy_per: "diff_fy_per2" };
CHARACTER.prototype.query_soft_prop = function (name) {
    // 终伤的「硬减」（add_sh_hard，如长生诀·震慑）在软上限折算之后直接扣除，本身不参与折算
    if (name === "add_sh_per") return this._query_soft_prop(name) - (this.query_prop("add_sh_hard") || 0);
    return this._query_soft_prop(name);
};
CHARACTER.prototype._query_soft_prop = function (name) {
    var total = this.query_prop(name);
    if (!this.soft_cap_props || !CHARACTER.SOFT_CAP_PROPS[name]) return total;
    if (CHARACTER.SOFT_CAP_EXTRA[name]) total += this.query_prop(CHARACTER.SOFT_CAP_EXTRA[name]);
    // 兜底：通过 buff 获得的免伤都算特殊免伤——buff 带来的正值普通免伤不折算，原样加在后面
    var buff = name === "diff_sh_per" && this.buff_prop ? (this.buff_prop.diff_sh_per || 0) : 0;
    if (buff > 0) return CHARACTER.soft_cap(total - buff) + buff;
    return CHARACTER.soft_cap(total);
};
CHARACTER.prototype.query_prop_no_buff = function (name) {
    var total = this.query_prop(name);
    if (this.buff_prop)
        total -= (this.buff_prop[name] || 0);
    return total;
}
CHARACTER.prototype.query_force_rad = function () {
    if (this.force_skill && this.force_skill.force_rad)
        return this.force_skill.force_rad || 0.1;
    return 0.1;
}
CHARACTER.prototype.add_maxmp = function (count) {
    this.max_mp += count;
    this.recount();
    this.notify("<hig>你增加了" + count + "点内力。</hig>");
}
CHARACTER.prototype.query_temp = function (name, def) {
    if (!this.temp) return def;
    var item = this.temp[name];
    if (item && item.e) {
        if (Date.now() <= item.e) {
            return item.v;
        }
        this.temp[name] = null;
        return def;
    }
    return item ?? def;
}
CHARACTER.prototype.set_temp = function (name, value, time) {
    if (!this.temp) this.temp = {};
    if (time) {
        this.temp[name] = {
            v: value,
            e: Date.now() + time
        };
    } else {
        this.temp[name] = value;
    }
}
CHARACTER.prototype.remove_temp = function (name) {
    if (!this.temp) return;
    this.temp[name] = null;
}

CHARACTER.prototype.add_temp = function (name, value, time) {
    let val = this.query_temp(name, 0) + value;
    this.set_temp(name, val, time);
    return val;
}

CHARACTER.prototype.change_prop = function (prop, isadd) {
    if (!prop) return;
    for (var item in prop) {
        switch (item) {
            case "desc":
                break;
            case "skill":
                var sks = prop[item];
                for (var sk in sks) {
                    var lv = this.query_skill(sk, 0);
                    if (!lv) {
                        this.add_prop(sk, isadd ? sks[sk] : -sks[sk]);
                        continue;
                    }
                    var sk_base = SKILL.get(sk);
                    if (!sk_base) continue;
                    sk_base.release_prop(this, lv);

                    this.add_prop(sk, isadd ? sks[sk] : -sks[sk]);

                    lv = this.query_skill(sk, 0);

                    sk_base.attach_prop(this, lv);
                    if (this.is_player) {
                        this.notify('{type:"dialog",dialog:"skills",id:"' + sk + '",level:' + lv + '}');
                    }

                }
                break;
            default:
                this.add_prop(item, isadd ? prop[item] : -prop[item]);
                break;
        }
    }
}
CHARACTER.prototype.add_fbscore = function (v, max) {
    var fb = this.environment.query_fb_first(this.query_teamid());
    if (!fb) return;
    fb.score = (fb.score || 0) + v;
    if (max > 0 && fb.score > max) fb.score = max;
}
CHARACTER.prototype.query_fbscore = function (v) {
    var first_room = this.environment.query_fb_first(this.query_teamid());
    if (!first_room) return 0;
    return first_room.score || 0;
}

CHARACTER.prototype.add_score = function (val) {

}

CHARACTER.prototype.add_combat_prop = function (name, val) {
    this.add_prop(name, val);
    if (!this.combat_props) this.combat_props = [];
    this.combat_props.push([name, val]);
    if (name === 'max_hp') {
        this.max_hp += val;
    }
}

// ZC stacking passive: directly modify cached combat stats with stack cap
CHARACTER.prototype._apply_zc_stack = function (key, stat, pctChange, maxStacks) {
    if (!this._zc_stacks) this._zc_stacks = {};
    if (!this._zc_stack_order) this._zc_stack_order = [];
    if (!this._zc_base_stats) this._zc_base_stats = {};
    if (!Object.prototype.hasOwnProperty.call(this._zc_base_stats, stat))
        this._zc_base_stats[stat] = this[stat];
    if (!this._zc_stacks[key]) this._zc_stacks[key] = { count: 0, deltas: [] };
    var tracker = this._zc_stacks[key];
    if (tracker.count >= maxStacks) return false;

    var delta;
    if (stat === "diff_sh_per") {
        delta = pctChange;
    } else if (stat === "gjsd") {
        delta = -this[stat] * pctChange;
    } else {
        delta = this[stat] * pctChange;
    }
    this[stat] += delta;
    tracker.count += 1;
    // 第三个元素记为【施加前】的基准值（原为 this[stat]，即施加后的值，
    // 会让重算无法回到基准）。
    tracker.deltas.push([stat, delta, this[stat] - delta]);
    tracker.stat = stat;
    tracker.pctChange = pctChange;
    // 记下本层施加前的基准值：重算时必须以它为基准，
    // 否则会用"已放大的当前值"再放大一次（NPC 的 recount 不会重置基准）。
    this._zc_stack_order.push({ key: key, stat: stat, pctChange: pctChange, base: this[stat] - delta });
    if (!this._zc_applied_stats) this._zc_applied_stats = {};
    this._zc_applied_stats[stat] = this[stat];
    return true;
};

CHARACTER.prototype._reapply_zc_stacks = function () {
    var stacks = this._zc_stacks;
    if (!stacks) return;
    // 幂等重放（每次 recount 之后调用）：
    //   1. 确定基准：recount 若重新算出了该 stat（玩家总是重算），新值就是新基准，
    //      不能用缓存的旧基准把 buff 带来的变化冲掉；recount 若没动它（NPC 模板
    //      显式设定 gj>0 等单向棘轮），当前值仍是上次叠层后的值，回退到缓存基准。
    //   2. 每个 key 只重放 tracker.count 次（原实现按 _zc_stack_order 每条记录
    //      再重放 count 次，n 层被施加 n² 次）。
    var baseStats = this._zc_base_stats || (this._zc_base_stats = {});
    var applied = this._zc_applied_stats || (this._zc_applied_stats = {});
    for (var stat in baseStats) {
        if (Object.prototype.hasOwnProperty.call(applied, stat) && this[stat] === applied[stat]) {
            this[stat] = baseStats[stat];
        } else {
            baseStats[stat] = this[stat];
        }
    }
    for (var key in stacks) {
        var tracker = stacks[key];
        if (!tracker || !(tracker.count > 0) || !tracker.stat) continue;
        // 与 _apply_zc_stack 使用完全相同的公式（同 stat 多层为复利叠加）
        for (var n = 0; n < tracker.count; n++) {
            var cur = this[tracker.stat];
            var delta;
            if (tracker.stat === "diff_sh_per") delta = tracker.pctChange;
            else if (tracker.stat === "gjsd") delta = -cur * tracker.pctChange;
            else delta = cur * tracker.pctChange;
            this[tracker.stat] = cur + delta;
        }
    }
    for (var st in baseStats) applied[st] = this[st];
};

CHARACTER.prototype._clear_zc_stacks = function () {
    if (!this._zc_stacks) return;
    var baseStats = this._zc_base_stats || {};
    this._zc_stacks = {};
    this._zc_stack_order = [];
    // Rebuild all derived combat fields from source properties.  Reversing
    // cached deltas is not reliable when several effects share a stat.
    if (this.recount) this.recount();
    else for (var stat in baseStats) this[stat] = baseStats[stat];
    this._zc_base_stats = {};
    this._zc_applied_stats = {};
};

CHARACTER.prototype.clear_combat_prop = function (name, val) {
    if (this.combat_props) {
        for (let i = 0; i < this.combat_props.length; i++) {
            this.add_prop(this.combat_props[i][0], -this.combat_props[i][1]);
            if (this.combat_props[i][0] === 'max_hp') {
                this.max_hp -= this.combat_props[i][1];
                this.notify_hp();
            }
        }
        this.combat_props = null;
        this._clear_zc_stacks();
        this.recount();
    }
    this._clear_zc_stacks();
}

// 武器的「攻击结算后」钩子：world/extends/char/combat.js 在每次攻击结束时调用 this.on_attack_over(me, target, par, sh)，
// sh 是这一击实际造成的伤害。玩家/随从本身没有这个回调，这里转给武器的 on_attack_over。
// 用途：吸血类（按实际伤害）、拳套普攻（引擎只在 no_weapon 绝招时调用拳套的 do_attack）。
// NPC 文件自己定义的 on_attack_over 会覆盖本方法，不受影响。
CHARACTER.prototype.on_attack_over = function (me, target, par, sh) {
    var weapon = this.equipment && this.equipment[EQUIP_TYPE.WEAPON];
    if (!weapon || typeof weapon.on_attack_over !== "function") return;
    try {
        weapon.on_attack_over(this, target, par || {}, sh || 0);
    } catch (e) {
        console.error("weapon on_attack_over error:", weapon.path, e && e.stack || e);
    }
}
