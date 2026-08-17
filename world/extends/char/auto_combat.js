CHARACTER.prototype.reauto_attack = function () {
    if (this.fight_type) {
        if (this.attack_handler) clearTimeout(this.attack_handler);
        this.auto_attack();
    }
}
CHARACTER.prototype.auto_attack = function () {
    var target = this.query_enemy();
    if (this.hp <= 0) {
        if (this.fight_type && target) {
            return target.end_attack(this);
        }
        return this.end_fight();
    }
    if (!target) {
        return this.end_fight();
    }

    if (this.is_faint) {
        this.attack_handler = this.call_out(this.auto_attack, this.is_faint);
        return;
    }
    if (this.release_time) {
        var diff_time = this.release_time - Date.now();
        if (diff_time > 0) {
            this.attack_handler = this.call_out(this.auto_attack, diff_time);
            return;
        }
        this.release_time = 0;
    }
    var sh = 0;

    if (this.is_busy) {
        if (this.auto_pfm && this.busy_pfm) {
            // 循环释放所有出招时间为0的忙时可放技能
            while (this.check_pfms(target) && this.release_time <= 0 && target.hp > 0) {
            }
        }
        this.attack_handler = this.call_out(this.auto_attack, this.is_busy);
        return;
    } else {
        if (this.auto_pfm) {
            // 循环释放所有出招时间为0的技能（一次性全部释放）
            while (this.check_pfms(target) && this.release_time <= 0 && target.hp > 0) {
            }
        }
        // 如果不在技能释放动画中，则进行普通攻击
        if (!this.release_time && target.hp > 0 && target.fight_type) {
            sh = this.do_attack({
                target: target,
                gj: this.gj,
                mz: this.mz
            });
        }
    }
    // Bug修复: 始终调用end_attack确保die()和end_fight()正确触发，避免短路导致状态残留
    var endResult = this.end_attack(target, sh);
    if (!sh || endResult) {
        this.attack_handler = this.call_out(this.auto_attack, this.gjsd);
    }
}



CHARACTER.prototype.use_pfm = function (target, pfm, level, sktype) {
    if (!pfm) return false;
    var isrelease = false;
    if (this.query_temp("sealed_pfm")) {
        this.send_room("<hir>$N被天地之力封印，技能" + pfm.name + "无法施展！</hir>\n");
        return false;
    }
    if (this.query_prop('no_pfm')) {

        this.send_room("<red>$N释放技能" + pfm.name + "，但是没有产生任何效果。</red>\n");

        this.remove_status('bikou');
        isrelease = true;
    } else if (sktype === "force" && this.query_prop("no_force")) {

        this.send_room("<red>$N释放技能" + pfm.name + "，但是内功被种魔之力压制，无法使用！</red>\n");
        isrelease = true;
    } else if (target && target.parry_skill && target.parry_skill.on_parry_pfm) {
        isrelease = target.parry_skill.on_parry_pfm(target, this, pfm, level);
    } else {
        isrelease = pfm.use(this, target, level, sktype) !== false;
    }
    if (isrelease !== false) {
        this.add_mp(-pfm.query_mp(this, level) || 0);

        this.set_temp("used_pfm", pfm.id, 20000);
        return true;
    }
    return false;
}
CHARACTER.prototype.check_pfms = function (target) {
    if (!this.auto_skills) this.init_pfms();
    if (!this.auto_skills) return false;
    if (this.query_temp("sealed_pfm")) return false;
    var now = Date.now();
    // 解析玩家排除列表（每轮动态读取，确保即时生效）
    var excludeList = null;
    var config = null;
    var pfmOrder = null;
    if (this.is_player) {
        var excludeStr = this.query_setting("auto_pfm_exclude");
        if (excludeStr) excludeList = excludeStr.split(";");
        // 解析auto_pfm_config JSON配置（模式、冷却等）
        var configStr = this.query_setting("auto_pfm_config");
        if (configStr) {
            try { config = JSON.parse(configStr); } catch (e) { }
        }
        // 获取玩家自定义的技能优先级列表
        var pfmStr = this.query_setting("auto_pfm");
        if (pfmStr) pfmOrder = pfmStr.split(",");
        // 用户已通过面板保存配置，但技能列表为空：视为禁用所有自动出招
        if (config && !pfmOrder) return false;
    }
    var mode = (config && config.mode) || (pfmOrder ? "sequence" : "random");
    var cooldowns = (config && config.cooldowns) || {};

    var canuser = [];
    for (var i = 0; i < this.auto_skills.length; i++) {
        var item = this.auto_skills[i];
        var skillId = item.type + "." + item.pfm.pid;
        if (item.ban_use) {
            continue;
        }
        // 玩家自定义排除（使用.格式与perform命令保持一致）
        if (excludeList && excludeList.indexOf(skillId) >= 0) {
            continue;
        }
        // 如果玩家设置了优先级列表，只允许列表中的技能
        if (pfmOrder && pfmOrder.indexOf(skillId) < 0) {
            continue;
        }
        if (this.is_busy && !item.pfm.allow_busy) {
            continue;
        }
        if (item.release_time) {
            if (item.release_time > now) {
                continue;
            }
            item.release_time = 0;
        }
        // Also check manual CD temp (set by perform command)
        var tempKey2 = "pfm/" + item.type + "/" + item.pfm.pid;
        if (this.query_temp(tempKey2)) {
            continue;
        }
        // 检查玩家自定义的每技能冷却时间
        var customCD = cooldowns[skillId] || 0;
        if (customCD > 0 && this.query_temp("auto_cd/" + skillId)) {
            continue;
        }
        if (item.pfm.query_mp(this, item.level) <= this.mp)
            canuser.push(item);
    }
    if (!canuser.length) return false;

    var skill;
    if (mode === "sequence") {
        // 按优先级列表排序，选择第一个可用的技能
        if (pfmOrder) {
            canuser.sort(function (a, b) {
                var idA = a.type + "." + a.pfm.pid;
                var idB = b.type + "." + b.pfm.pid;
                return pfmOrder.indexOf(idA) - pfmOrder.indexOf(idB);
            });
        }
        skill = canuser[0];
    } else {
        skill = canuser[Math.floor(Math.random() * canuser.length)];
    }
    if (!skill) return false;
    if (this.use_pfm(target, skill.pfm, skill.level, skill.type)) {

        var rtime = skill.pfm.query_releasetime(this, skill.level);

        if (rtime > 0)
            this.release_time = rtime + now;
        else {
            this.release_time = 0;
            rtime = 0;
        }

        var distime = skill.pfm.query_distime(this, skill.level, skill.is_ref);
        skill.release_time = now + distime + rtime;

        // Sync with manual CD temp so manual perform command respects auto-used CD
        var tempKey = "pfm/" + skill.type + "/" + skill.pfm.pid;
        this.set_temp(tempKey, 1, distime + rtime);
        // 记录自定义冷却
        var skillId = skill.type + "." + skill.pfm.pid;
        var customCD = cooldowns[skillId] || 0;
        if (customCD > 0) {
            this.set_temp("auto_cd/" + skillId, 1, customCD);
        }
        if (this.is_player) {
            this.notify('{type:"dispfm",id:"' + skillId + '",rtime:'
                + rtime + ',distime:' + (distime + rtime) + '}');
        }

        return true;
    }
    return false;
}
// 查询所有可用于自动攻击的pfm技能（供配置面板使用）
CHARACTER.prototype.query_auto_pfm_skills = function () {
    var skills = [];
    if (!this.skills) return skills;
    var bases = ["", "force", "unarmed", "dodge", "parry", "bite", "throwing"];
    var weapon = this.query_weapon_type(), base_type = null;
    if (weapon != WEAPON_TYPE.NONE) bases[0] = weapon;
    if (this.is_player && !this.throwing_name()) {
        bases[6] = "";
    }
    var seen = {};  // 去重：同一技能ID只出现一次
    for (var i = 0; i < bases.length; i++) {
        base_type = bases[i];
        if (!base_type) continue;
        var base_skill = this.skills[base_type];
        if (base_skill) {
            var sp_skill = SKILL.get(base_skill.enable_skill || base_type), pfmitem = null;
            if (sp_skill && sp_skill.pfm) {
                var sk_level = this.query_skill(base_skill.enable_skill || base_type, 0);
                for (var p in sp_skill.pfm) {
                    pfmitem = sp_skill.pfm[p];
                    if (pfmitem.no_auto) continue;
                    if (!pfmitem.use) continue;
                    if (pfmitem.check && !pfmitem.check(this, sk_level, base_type)) continue;
                    if (pfmitem.enable_skill && pfmitem.enable_skill != base_type) continue;
                    if (base_type === "force" && this.query_prop("no_force")) continue;
                    var sid = base_type + "." + p;
                    if (seen[sid]) continue;
                    seen[sid] = true;
                    var pname = pfmitem.query_name(this, base_type);
                    if (!pname || pname.indexOf("undefined") >= 0) pname = null;
                    skills.push({
                        id: sid,
                        name: pname || pfmitem.name || (sp_skill.name + "·" + p) || sid,
                        type: base_type,
                        pid: p
                    });
                }
            }
            pfmitem = this.query_ref_skill(this.skills[base_skill.enable_skill]);
            if (pfmitem && pfmitem.enable_skill && pfmitem.enable_skill == bases[i] && !pfmitem.no_auto) {
                var rid = base_type + ".ref";
                if (!seen[rid]) {
                    seen[rid] = true;
                    var rname = pfmitem.query_name(this, base_type);
                    if (!rname || rname.indexOf("undefined") >= 0) rname = null;
                    skills.push({
                        id: rid,
                        name: rname || pfmitem.name || (sp_skill.name + "·ref") || rid,
                        type: base_type,
                        pid: "ref"
                    });
                }
            }
        }
    }
    return skills;
};
CHARACTER.prototype.init_pfms = function () {
    this.auto_skills = [];
    if (!this.skills) return;
    var bases = ["", "force", "unarmed", "dodge", "parry", "bite", "throwing"];
    var weapon = this.query_weapon_type();
    if (weapon !== WEAPON_TYPE.NONE) bases[0] = weapon;
    if (this.is_player && !this.throwing_name()) {
        bases[6] = "";
    }
    for (var base of bases) {
        if (!base) continue;
        var base_skill = this.skills[base];
        if (!base_skill) continue;

        var sp_skill = SKILL.get(base_skill.enable_skill || base);

        var level = base_skill.enable_skill ?
            this.query_skill(base_skill.enable_skill)
            : this.query_skill(base);
        if (sp_skill && sp_skill.pfm) {
            for (var p in sp_skill.pfm) {
                this.add_auto_pfm(sp_skill.pfm[p], base, level, false);
            }
        }
        if (base_skill.enable_skill) {
            var ref_pfm = this.query_ref_skill(this.skills[base_skill.enable_skill]);
            if (ref_pfm) {
                this.add_auto_pfm(ref_pfm, base, level / 2, true);
            }
        }
    }
}
CHARACTER.prototype.add_auto_pfm = function (pfmitem, baseSkill, level, is_ref) {
    if (pfmitem.no_auto) return;
    if (!pfmitem.use) return;
    if (pfmitem.enable_skill && pfmitem.enable_skill !== baseSkill) return;
    if (pfmitem.check && !pfmitem.check(this, level, baseSkill)) return;

    if (pfmitem.allow_busy) this.busy_pfm = true;
    this.auto_skills.push({
        pfm: pfmitem,
        level: level,
        id: baseSkill + "/" + pfmitem.pid,
        type: baseSkill,
        is_ref: is_ref
    });
}
CHARACTER.prototype.set_releasetime = function (rtime) {
    let release_time = Date.now() + rtime;
    if (this.is_player) {
        this.notify('{type:"dispfm",id:"all",rtime:'
            + rtime + ',distime:0}');
    } else {
        if (!this.auto_skills) this.init_pfms();
    }
    this.release_time = release_time;
    if (!this.auto_skills) return;
    for (let askill of this.auto_skills) {
        if (!askill.release_time || askill.release_time < release_time) {
            askill.release_time = release_time;
        }
    }
}