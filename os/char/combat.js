
require("./character.js");
CHARACTER.prototype.begin_attack = function (target, type) {

    if (!target || target === this) return;
    if (!this.attack_skill) {
        this.init_skill();
        if (!this.attack_skill) {
            return this.send("error  skill");
        }
    }
    this.add_enemy(target);
    this.fight_type = this.fight_type || 0;
    // 每次有新敌人进入战斗时施加debuff（无论是否首次进战）
    if (this.force_skill && this.force_skill.on_new_enemy) {
        this.force_skill.on_new_enemy(this, target);
    }
    if (this.attack_skill && this.attack_skill.on_new_enemy) {
        this.attack_skill.on_new_enemy(this, target);
    }
    // 进入战斗时的气血（血刀·血祭等「战斗中气血减少」类被动的基准）；只在内存，战斗结束清除
    if (!this.fight_type) this._combat_start_hp = this.hp;
    this.fight_type = type; //1fight hp<30% 2 kill 0 提前设置供回调使用
    if (type > (this._prev_fight_type || 0)) {
        this._prev_fight_type = type;
        if (this.force_skill && this.force_skill.on_beginfight) {
            this.force_skill.on_beginfight(this, target);
        }
        if (this.attack_skill && this.attack_skill.on_beginfight) {
            this.attack_skill.on_beginfight(this, target);
        }
    }
    // 每次进战重启攻击循环（不限于首次），auto_pfm仅控制技能是否自动释放
    // 普通攻击始终需要此循环，因此不检查auto_pfm标志
    if (this.fight_type) {
        if (this.attack_handler) clearTimeout(this.attack_handler);
        this.attack_handler = this.call_out(this.auto_attack, Math.random() * this.gjsd);
        this.send('{type:"combat",start:1}');
    }

}
CHARACTER.prototype.do_fight = function (target) {
    this.begin_attack(target, 1);
}
CHARACTER.prototype.do_kill = function (target) {
    // 唐诗剑法「躺尸」消除仇恨：NPC 对已放弃敌意的玩家不再主动叫杀（on_enter、助战等）。
    // 玩家自己用 kill 出手时，kill 命令会先解除该 NPC 的放弃标记，不受这里影响。
    // 门派战这类见人就打的 NPC 设 ignore_feign = true 豁免。
    if (!this.is_player && target && target.is_player && this._feign_forgive
        && this._feign_forgive[target.id] && !this.ignore_feign) return;
    if (this.fight_type == 2 && this.query_enemy() == target) return;
    this.begin_attack(target, 2);
    target.begin_attack(this, 2);
    target.notify("<hir>看起来" + this.name + "想杀死你！</hir>\n");
    this.notify("<hir>看起来" + target.name + "想杀死你！</hir>\n");
}
CHARACTER.prototype.add_enemy = function (target) {
    if (!this.enemy) {
        this.enemy = [];
    }
    // 检查重复：同一目标不重复加入
    for (var i = 0; i < this.enemy.length; i++) {
        if (this.enemy[i] === target) return;
    }
    this.enemy.push(target);
}
CHARACTER.prototype.notify_hp = function (type, val) {
    if (!this.environment) return;

    var items = this.environment.items;
    var str = null;
    if (type) {
        str = "{type:\"sc\",id:\"" + this.id + "\"," + type + ":" + val + "";
    } else {
        var ary = ["{type:\"sc\",id:\""];
        ary.push(this.id);
        ary.push("\",hp:");
        ary.push(this.hp);
        ary.push(",max_hp:");
        ary.push(this.max_hp);
        ary.push(",mp:");
        ary.push(this.mp);
        ary.push(",max_mp:");
        ary.push(this.max_mp);
        str = ary.join("");
    }
    var showdamage = type ? type === "hp" : false;
    for (var i = 0; i < items.length; i++) {
        var player = items[i];
        if (player.is_player) {
            if (showdamage && this.damages && player.query_setting('show_damage')) {
                player.send(str + ",damage:" + (this.damages[player.id] || 0) + "}");
            } else {
                player.send(str + "}");
            }
        }
    }
}
CHARACTER.prototype.add_hp = function (v) {

    if (v > this.max_hp - this.hp) v = this.max_hp - this.hp;
    else if (v < -this.hp) v = -this.hp;
    // min_hp：锁血。扣血最多扣到 min_hp，气血不会掉到 0（不触发死亡判定），
    // 这样同一招里随后的昏迷/忙乱等状态仍能挂上（add_status 对 hp<=0 的目标一律拒绝）。
    if (v < 0 && this.min_hp > 0 && this.hp + v < this.min_hp) v = Math.min(0, this.min_hp - this.hp);
    // 致命一击：这次扣血会让气血归零时，依次询问身上装备的 on_fatal(me, v)；
    // 任一件返回 true 表示已触发免死，本次最多扣到剩 1 点气血。
    // 比试（fight_type 1）本来就不会死——输方事后被置回 1 血——这里不触发，免得白白消耗冷却。
    // 比试中途若被人下杀手，fight_type 会升为 2，届时照常触发。
    if (v < 0 && this.hp > 0 && this.hp + v <= 0 && this.equipment && !this._in_on_fatal && this.fight_type !== 1) {
        this._in_on_fatal = true;
        try {
            for (var i = 0; i < this.equipment.length; i++) {
                var eq = this.equipment[i];
                if (eq && eq.on_fatal && eq.on_fatal(this, v)) { v = 1 - this.hp; break; }
            }
        } finally { this._in_on_fatal = false; }
    }
    if (!v) return 0;

    this.hp += v;
    this.notify_hp("hp", this.hp);
    return v;
}
CHARACTER.prototype.set_hp = function (v) {
    this.hp = Math.max(0, Math.min(v, this.max_hp));
    this.notify_hp("hp", this.hp);
};
CHARACTER.prototype.set_mp = function (v) {
    this.mp = Math.max(0, Math.min(v, this.max_mp));
    this.notify_hp("mp", this.mp);
};
CHARACTER.prototype.add_mp = function (v) {
    // 与 add_hp 一致挡住非法值：NaN 一旦写入，mp < cost 恒为 false = 无限内力
    v = Number(v);
    if (!v || isNaN(v)) return;
    if (isNaN(this.mp)) this.mp = 0;
    var mp = this.mp + v;
    if (mp > this.max_mp) mp = this.max_mp;
    if (mp < 0) mp = 0;
    if (mp === this.mp) return;
    this.mp = mp;
    this.notify_hp("mp", this.mp);
    return v;
}
CHARACTER.prototype.is_fighting = function (p) {
    if (!this.fight_type) return false;
    if (!this.enemy || !this.enemy.length) {
        this.fight_type = 0;
        this._prev_fight_type = 0;   // 与 end_fight 一致，否则下一场不触发 on_beginfight
        this._combat_start_hp = 0;
        this.is_busy = 0;
        if (this.attack_handler) clearTimeout(this.attack_handler);
        this.attack_handler = null;
        this.clear_combat_status();
        return false;
    }
    if (p) {
        if (p.environment !== this.environment) return false;
        return this.enemy.contain(p);
    }
    return true;
}
CHARACTER.prototype.end_fight = function () {
    if (this.enemy) this.enemy.length = 0;
    this.release_time = 0;
    if (!this.fight_type) return;

    this.send('{type:"combat",end:1}');
    this.fight_type = 0;
    this._prev_fight_type = 0;
    this._combat_start_hp = 0;
    this.is_busy = 0;
    this.is_faint = 0;
    this.is_rash = 0;
    this.is_miss = 0;
    if (this.attack_handler) clearTimeout(this.attack_handler);
    this.attack_handler = null;
    this.auto_skills = null;  // 重置自动技能列表，下次战斗重新初始化
    this.clear_combat_status();
    this.clear_combat_prop();
    if (WORLD.ZHENYI) WORLD.ZHENYI.on_combat_end(this);
    return false;
}
CHARACTER.prototype.query_enemy = function () {
    if (!this.enemy) return;
    for (var i = 0; i < this.enemy.length; i++) {
        if (this.enemy[i].hp <= 0) {
            if (this.enemy[i].die(this) !== false) {
                this.enemy.splice(i, 1);
                i--;
            }
        } else if (!this.is_here(this.enemy[i])
            || !this.enemy[i].fight_type) {
            this.enemy.splice(i, 1);
            i--;
        }
    }
    return this.enemy[0];
}
CHARACTER.prototype.can_attack = function () {
    return this.hp > 0 && this.fight_type > 0 && !this.is_faint && !this.is_busy;
}

CHARACTER.prototype.end_attack = function (target) {
    if (!target) return;
    if (!this.fight_type) return;
    if (this.attack_skill.on_end_attack) {
        if (CHARACTER.passive) CHARACTER.passive(() => this.attack_skill.on_end_attack(this, target));
        else this.attack_skill.on_end_attack(this, target);
    }

    if (this.fight_type === 1 && target.max_hp && target.hp / target.max_hp < 0.3) {
        if (target.hp <= 0) target.hp = 1;
        if (target.is_faint) {
            this.send_room(WINNER_MSG[this.random(4)], target);
        } else {
            this.send_room(WINNER_MSG.random(), target);
        }
        target.on_fight_over && target.on_fight_over(this, false);
        this.on_fight_over && this.on_fight_over(target, true);
        target.end_fight();
        return this.end_fight();
    } else if (target.hp <= 0 && target.die(this) !== false) {
        if (WORLD.ZHENYI) WORLD.ZHENYI.on_kill(this, target);
        target.end_fight();

        this.enemy.remove(target);

        if (!this.enemy.length) {
            if (this.hp <= 0) {
                this.hp = 1;
            }
            return this.end_fight();
        }
    }
    return true;//是否继续攻击
}
CHARACTER.prototype.query_part = function () {
    return CHARACTER_PARTS.random();
}


CHARACTER.prototype.full = function () {

    this.hp = this.max_hp;
    this.mp = this.max_mp;
    this.clear_distime();
    this.release_time = 0;
    this.notify_hp();
}

CHARACTER.prototype.clear_distime = function (pfmid) {
    if (this.auto_skills) {
        if (!pfmid) {
            for (let i = 0; i < this.auto_skills.length; i++) {
                let item = this.auto_skills[i];
                item.release_time = 0;
            }
        } else {
            for (let i = 0; i < this.auto_skills.length; i++) {
                let item = this.auto_skills[i];
                if (item.pfm.id === pfmid) {
                    item.release_time = 0;
                    break;
                }

            }
        }

    }
}
// 当前可群攻的目标：同房间、还活着的敌人（没有敌人时退回 fallback，一般是绝招的指定目标）
CHARACTER.prototype.query_attack_targets = function (fallback) {
    var me = this, list = [];
    if (this.enemy) {
        for (var i = 0; i < this.enemy.length; i++) {
            var e = this.enemy[i];
            if (e && e !== me && e.hp > 0 && e.environment === me.environment) list.push(e);
        }
    }
    if (!list.length && fallback && fallback !== me && fallback.hp > 0) list.push(fallback);
    return list;
};
// 群攻：对每个目标各打 times 次（默认 1），共用一套参数。群攻技能统一走这里，不要各自手写循环。
//   par 里除下面几项外，其余字段原样传给每一次 do_attack（gj、mz、diff_fy、no_parry 等）：
//   targets        目标列表；不给时取 query_attack_targets(par.target)
//   times          每个目标攻击次数
//   until_miss     true 时某个目标一次没打出伤害就停止对它的后续攻击
//   attack_msg     字符串：每次攻击都用（$n 为当前目标）；函数 (t, n) 返回每次的描述；
//                  不给时只在第一下发一次本技能的普通招式描述
//   filter(t)      返回 false 跳过该目标
//   on_target(t)   对每个目标开打前调用（命中与否都执行的附加效果，如群体减益）
//   on_hit(t, sh, n)  每次攻击打出伤害后调用
//   after_target(t, dealt)  对该目标打完后、结算死亡前调用（不论命中都执行的附加效果；dealt 为对它造成的总伤害）
//   返回本次群攻造成的总伤害。每个目标打完调用 end_attack 结算死亡；自己倒下或战斗结束就停。
CHARACTER.prototype.do_attacks = function (par) {
    par = par || {};
    var targets = (par.targets || this.query_attack_targets(par.target)).slice();
    if (par.filter) targets = targets.filter(par.filter);
    if (!targets.length) return 0;
    var times = par.times > 0 ? par.times : 1;
    var msg = par.attack_msg;
    if (msg === undefined) {
        var sk = par.no_weapon ? this.noweapon_skill : this.attack_skill;
        var first = sk && sk.query_attack_action ? sk.query_attack_action(this, targets[0]) : "";
        msg = function (t, n) { var m = first; first = ""; return m; };
    }
    var SKIP = { targets: 1, times: 1, until_miss: 1, attack_msg: 1, filter: 1, on_target: 1, on_hit: 1, after_target: 1, target: 1 };
    var total = 0;
    for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (this.hp <= 0 || !this.fight_type) break;
        if (!t || t.hp <= 0 || t.environment !== this.environment) continue;
        if (par.on_target) par.on_target(t);
        var dealt = 0;
        for (var n = 0; n < times; n++) {
            if (t.hp <= 0 || this.hp <= 0 || !this.fight_type) break;
            // 每次攻击用一份新参数，避免暴击、命中修正等状态在目标之间串用
            var p = { target: t, attack_msg: typeof msg === "function" ? msg(t, n) : msg };
            for (var k in par) if (!SKIP[k]) p[k] = par[k];
            var sh = this.do_attack(p);
            if (sh > 0) {
                total += sh; dealt += sh;
                if (par.on_hit) par.on_hit(t, sh, n);
            } else if (par.until_miss) break;
        }
        if (par.after_target && t.hp > 0 && this.hp > 0) par.after_target(t, dealt);
        this.end_attack(t);
    }
    return total;
}
var CHARACTER_PARTS = [
    { name: "左脚", hert: 0.8, crit: 0 },
    { name: "右脚", hert: 0.8, crit: 0 },
    { name: "左腿", hert: 0.85, crit: 0 },
    { name: "右腿", hert: 0.85, crit: 0 },
    { name: "小腹", hert: 0.91, crit: 3 },
    { name: "胸前", hert: 0.95, crit: 4 },
    { name: "后背", hert: 0.97, crit: 4 },
    { name: "头部", hert: 1.2, crit: 10 },
    { name: "颈部", hert: 1.1, crit: 5 },
    { name: "后心", hert: 1, crit: 4 },
    { name: "左肩", hert: 0.85, crit: 1 },
    { name: "右肩", hert: 0.89, crit: 1 },
    { name: "左手", hert: 0.85, crit: 0 },
    { name: "左手", hert: 0.85, crit: 0 },
    { name: "腰间", hert: 0.99, crit: 5 }
];

var WINNER_MSG = [
    "<CYN>$N哈哈大笑，愉快地说道：承让了！</CYN>",
    "<CYN>$N双手一拱，笑著说道：知道我的厉害了吧！</CYN>",
    "<CYN>$N哈哈大笑，双手一拱，笑著说道：承让！</CYN>",
    "<CYN>$N胜了这招，向后跃开三尺，笑道：承让！</CYN>",
    "<CYN>$n脸色微变，说道：佩服，佩服！</CYN>",
    "<CYN>$n向后退了几步，说道：这场比试算我输了，佩服，佩服！</CYN>",
    "<CYN>$n向后一纵，躬身做揖说道：阁下武艺不凡，果然高明！</CYN>",
];
