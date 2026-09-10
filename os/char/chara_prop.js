
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
    tracker.deltas.push([stat, delta, this[stat]]);
    tracker.stat = stat;
    tracker.pctChange = pctChange;
    this._zc_stack_order.push({ key: key, stat: stat, pctChange: pctChange });
    return true;
};

CHARACTER.prototype._reapply_zc_stacks = function () {
    var order = this._zc_stack_order || [];
    for (var i = 0; i < order.length; i++) {
        var entry = order[i], tracker = this._zc_stacks && this._zc_stacks[entry.key];
        if (!tracker || tracker.count <= 0) continue;
        var delta;
        if (entry.stat === "diff_sh_per") delta = entry.pctChange;
        else if (entry.stat === "gjsd") delta = -this[entry.stat] * entry.pctChange;
        else delta = this[entry.stat] * entry.pctChange;
        this[entry.stat] += delta;
    }
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
