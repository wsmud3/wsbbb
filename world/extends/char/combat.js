
CHARACTER.prototype.recount = function () {

    this.gjsd = 4000 - (this.query_prop("gjsd") || 0);
    if (this.gjsd > 500) {
        this.gjsd = parseInt(this.gjsd - (this.gjsd * this.query_prop("gjsd_per") / 100));
        if (this.gjsd < 500) this.gjsd = 500;
    } else {
        this.gjsd = 500;
    }

    // NPC战斗属性：如果模板中已显式设定（gj>0），则保留设定值，避免后天属性被公式重复计算
    // 未设定的NPC（如动物/简单怪物）仍由基础属性+后天加成公式计算
    if (!(this.gj > 0)) {
        this.gj = parseInt(this.str + (this.query_prop("gj") + this.query_prop("str") * this.str / 10) * (100 + this.query_prop("gj_per")) / 100);
    }
    if (!(this.fy > 0)) {
        this.fy = parseInt(((this.str + this.con) / 10 + this.query_prop("fy") + this.query_prop("con") * this.con / 10) * (100 + this.query_prop("fy_per")) / 100);
    }
    if (!(this.mz > 0)) {
        this.mz = parseInt((this.dex / 2 + this.query_prop("mz")) * (100 + this.query_prop("mz_per")) / 100);
    }
    if (!(this.ds > 0)) {
        var zcFocus = this.query_prop("zc_focus") || 0;
        var dexDodge = this.query_prop("dex") * this.dex / 5;
        if (zcFocus > 0) dexDodge = dexDodge * (1 + zcFocus);
        this.ds = parseInt((this.dex / 2 + this.query_prop("ds") + dexDodge) * (100 + this.query_prop("ds_per")) / 100);
    }
    if (!(this.zj > 0)) {
        this.zj = parseInt((this.str / 2 + this.query_prop("zj") + this.query_prop("str") * this.str / 5) * (100 + this.query_prop("zj_per")) / 100);
    }
    this.bj = parseInt(this.dex / 10 + this.query_prop("bj_per"));

    this.diff_sh_per = this.query_prop('diff_sh_per');
    this.diff_fy_per = this.query_prop('diff_fy_per');


}

CHARACTER.prototype.crit = function (target, part, bj_per) {
    var finalBj = bj_per + (part ? part.crit : 0) - target.query_prop("diff_bj");
    var diffBjPer = target.query_prop("diff_bj_per") || 0;
    if (diffBjPer > 0) finalBj = finalBj - finalBj * diffBjPer / 100;
    if (this.random(100) < finalBj) {
        return true;
    }
}
CHARACTER.prototype.do_attack = function (par) {
    if (this.is_faint || this.hp <= 0 || !this.fight_type) return;
    var target = par.target;
    if (!target) {
        target = this.query_enemy();
        if (!target) return;
    }
    var weapon = this.query_weapon();//par.no_weapon ? null :
    var attackskill = par.no_weapon ? this.noweapon_skill : this.attack_skill;

    if (attackskill.on_before_attack
        && !par.is_throwing
        && !par.no_append_before) attackskill.on_before_attack(this, target, par);
    if (this.force_skill.on_before_attack && !par.no_append_before) {
        this.force_skill.on_before_attack(this, target, par);
    }

    this.attack_part = par.part ?? target.query_part();

    var attack_msg = par.attack_msg;
    if (attack_msg === undefined) {
        attack_msg = attackskill.query_attack_action(this, target);
    }
    if (par.attack_before) {
        attack_msg = par.attack_before + attack_msg;
    }
    var weapon_type = par.no_weapon ?
        WEAPON_TYPE.NONE : (weapon ? weapon.weapon_type : WEAPON_TYPE.NONE);
    if (attack_msg) this.send_combat(attack_msg, target);


    var sh = par.gj ?? this.gj, mz = par.mz ?? this.mz;
    par.is_dodge = false; par.is_parry = false;
    if (target.is_faint || this.is_shadow) {
        par.is_dodge = false;
        par.is_parry = false;
    }
    else if (target.is_rash) {
        par.is_dodge = false;
        par.is_parry = (target.is_busy || par.no_parry) ? false : Math.random() * (target.zj / 2) + target.zj / 2 > mz;
    } else if (this.is_miss && !par.no_dodge) {
        par.is_dodge = true;
        par.is_parry = (target.is_busy || par.no_parry) ? false : Math.random() * (target.zj / 2) + target.zj / 2 > mz;
    } else if (target.is_miss || par.no_dodge) {
        par.is_dodge = false;
        par.is_parry = (target.is_busy || par.no_parry) ? false : (Math.random() * (target.zj / 2) + target.zj / 2 > mz);
    } else if (target.is_busy || par.no_parry) {
        par.is_dodge = Math.random() * (target.ds / 2) + target.ds / 2 > mz;
        par.is_parry = false;
    } else {
        par.is_dodge = Math.random() * (target.ds / 2) + target.ds / 2 > mz;
        par.is_parry = Math.random() * (target.zj / 2) + target.zj / 2 > mz;
    }
    if (par.is_dodge) {
        if (par.on_dodge) par.on_dodge(target);
    } else if (target.dodge_skill.on_dodge) {
        target.dodge_skill.on_dodge(target, this, par);
    }
    if (par.is_dodge) {
        sh = 0;
        this.send_combat((par.miss_msg || target.dodge_skill.query_dodge_action()) + "\n", target);
    } else {

        if (target.parry_skill.on_parry &&
            !par.no_parry && !target.is_busy && !target.is_faint) {
            target.parry_skill.on_parry(target, this, par);
        }
        if (par.on_parry) {
            par.on_parry(target, par.is_parry);
        }
        par.bj = par.bj ?? this.bj;
        if (par.is_parry) {
            sh = 0;
        } else {
            if (weapon && weapon.do_attack &&
                ((par.no_weapon && weapon_type === WEAPON_TYPE.NONE)
                    || (!par.no_weapon && weapon_type !== WEAPON_TYPE.NONE))
                && !par.is_throwing) {
                sh += weapon.do_attack(this, target, par);
            }
            if (attackskill.on_attack && !par.is_throwing) {
                sh += attackskill.on_attack(this, target, par);
            }
            sh = sh * this.attack_part.hert;
            if (!par.no_power) {
                sh = sh + sh * this.query_prop("add_sh_per") / 100; //增加伤害%

                // ZC passives: 嗜血 - damage increases as self HP decreases
                var zcBloodthirst = this.query_prop("zc_bloodthirst") || 0;
                if (zcBloodthirst > 0 && this.max_hp > 0) {
                    var missingHpPct = (1 - this.hp / this.max_hp);
                    if (missingHpPct > 0) {
                        var btBonus = sh * zcBloodthirst * missingHpPct * 100;
                        sh = sh + btBonus;
                        if (btBonus > 0) this.send_combat("<HIR>$N越战越狂，出招更添狠厉！</HIR>\n", target);
                    }
                }

                // ZC passives: 无情 - damage increases as target HP decreases
                var zcMerciless = this.query_prop("zc_merciless") || 0;
                if (zcMerciless > 0 && target.max_hp > 0) {
                    var targetMissingHpPct = (1 - target.hp / target.max_hp);
                    if (targetMissingHpPct > 0) {
                        var mcBonus = sh * zcMerciless * targetMissingHpPct * 100;
                        sh = sh + mcBonus;
                        if (mcBonus > 0) this.send_combat("<HIB>$N窥得$n破绽，趁虚而入！</HIB>\n", target);
                    }
                }

                par.iscirt = par.cirt ? par.cirt(target, this.attack_part, par.bj) : this.crit(target,
                    this.attack_part, par.bj);

                if (par.iscirt)
                    sh = sh * (150 + (par.add_bjsh_per ?? this.query_prop("add_bjsh_per"))) / 100;
            }
        }
        let power_gj = par.power_gj ?? 0;
        if (this.force_skill.do_force_attack) {
            power_gj += this.force_skill.do_force_attack(this, target, par);
        }
        if (power_gj > 0 && (!weapon || weapon.weapon_type === WEAPON_TYPE.NONE)) {
            power_gj = power_gj + power_gj * this.query_prop("add_sh_per") / 100; //增加伤害%
            if (par.iscirt)
                power_gj = power_gj * (150 + (par.add_bjsh_per ?? this.query_prop("add_bjsh_per"))) / 100;

        }

        if (power_gj > 0) sh += power_gj;

        // ZC passives: 战神 - force damage based on max MP, doubled when unarmed
        var zcWarGod = this.query_prop("zc_war_god") || 0;
        if (zcWarGod > 0 && this.max_mp > 0) {
            var warGodDmg = this.max_mp * zcWarGod;
            var isUnarmed = (!weapon || weapon.weapon_type === WEAPON_TYPE.NONE);
            if (isUnarmed)
                warGodDmg = warGodDmg * 2;
            sh = sh + warGodDmg;
            this.send_combat("<HIY>$N内力激荡，灌注$w攻势大增！</HIY>\n", target);
        }

        // ZC passives: 内伤 - force damage based on max MP
        var zcInternalInjury = this.query_prop("zc_internal_injury") || 0;
        if (zcInternalInjury > 0 && this.max_mp > 0) {
            var iiDmg = this.max_mp * zcInternalInjury;
            sh = sh + iiDmg;
            this.send_combat("<HIM>$N的内力侵入$n经脉，造成内伤！</HIM>\n", target);
        }

        if (target.force_skill.on_force_parry) {
            par.power_gj = power_gj;
            sh -= target.force_skill.on_force_parry(target, this, sh, par);
            if (this.hp <= 0 || !target.fight_type) {
                return;
            }
        }
        if (sh > 0 && target.eyi_hundun) {
            var cap = Math.floor(target.max_hp * 0.13);
            if (sh > cap) {
                var excess = sh - cap;
                target.do_recover(excess);
                target.add_mp(parseInt(excess));
                target.send_room("<hio>$N的混沌真气将" + excess + "点伤害转化为气血和内力！</hio>");
                sh = cap;
            }
        }
        if (sh > 0)
            sh = target.damage(sh, this, par.diff_fy);

        if (par.is_parry) {
            this.send_combat((par.parry_msg || target.parry_skill.query_parry_action(target, this, weapon_type)) + "\n", target);
            if (sh > 0) {
                target.send_combat(query_status_msg(target.hp, target.max_hp));
                target.on_damage && target.on_damage(this, sh);
            }
            // ZC passive: 反击(招架) - counter-attack on successful parry
            var zcCounterParry = target.query_prop("zc_counter_parry") || 0;
            if (zcCounterParry > 0 && this.hp > 0 && target.fight_type) {
                var counterDmg = target.gj * zcCounterParry;
                counterDmg = this.damage(counterDmg, target, 0);
                if (counterDmg > 0)
                    target.send_combat("<HIC>移花接木！反击造成" + Math.floor(counterDmg) + "点伤害。</HIC>\n", this);
            }
            // ZC passive: 乾坤 - stacking DR on parry
            var zcQiankun = target.query_prop("zc_qiankun") || 0;
            if (zcQiankun > 0) {
                target._apply_zc_stack("qiankun", "diff_sh_per", zcQiankun * 100, 20);
                target.send_combat("<HIC>$N运起乾坤劲，卸去攻击力道。</HIC>\n", this);
            }
            // ZC passive: 纵横 - stacking hit on parry
            var zcZongheng = target.query_prop("zc_zongheng") || 0;
            if (zcZongheng > 0) {
                target._apply_zc_stack("zongheng", "mz", zcZongheng, 10);
                target.send_combat("<HIG>$N纵横开阖，出手愈发精准。</HIG>\n", this);
            }
        }
        else {
            if (sh > 0) {
                this.send_combat(damage_msg(sh, par.is_throwing ? WEAPON_TYPE.THROWING : weapon_type,
                    target, par.iscirt, par.damage_msg)
                    , target);
                target.send_combat(query_status_msg(target.hp, target.max_hp));
                target.on_damage && target.on_damage(this, sh);

                // ZC passive: 吸血(武器) - lifesteal from damage dealt
                var zcLifesteal = this.query_prop("zc_lifesteal") || 0;
                if (zcLifesteal > 0 && sh > 0) {
                    var healAmt = Math.floor(sh * zcLifesteal);
                    if (healAmt > 0) {
                        this.do_recover(healAmt);
                        this.send_combat("<HIR>$N从伤口中汲取$n气血！</HIR>\n", target);
                    }
                }

                // ZC passive: 吸血(太玄) - force-based lifesteal on hit
                var zcLifestealForce = this.query_prop("zc_lifesteal_force") || 0;
                if (zcLifestealForce > 0 && sh > 0) {
                    var forceDmg = this.gj * zcLifestealForce;
                    if (forceDmg > 0) {
                        target.damage(forceDmg, this, 0);
                        var forceHeal = Math.floor(forceDmg * 0.5);
                        this.do_recover(forceHeal);
                        this.send_combat("<HIM>$N以太玄真气反噬$n，并恢复自身气血！</HIM>\n", target);
                    }
                }

                // ZC passive: 溅射 - splash damage to nearby enemy
                var zcSplash = this.query_prop("zc_splash") || 0;
                if (zcSplash > 0 && sh > 0) {
                    var splashDmg = sh * zcSplash;
                    var splashTarget = target.query_enemy();
                    if (splashTarget && splashTarget !== this && splashTarget.hp > 0) {
                        splashTarget.damage(splashDmg, this, 0);
                        this.send_combat("<HIY>溅射对" + splashTarget.name + "造成" + Math.floor(splashDmg) + "点伤害。</HIY>\n");
                    }
                }

                // ZC passive: 弱化 - on hit, reduce target combat stats
                var zcWeaken = this.query_prop("zc_weaken") || 0;
                if (zcWeaken > 0) {
                    target._apply_zc_stack("weaken_gj", "gj", -zcWeaken, 10);
                    target._apply_zc_stack("weaken_fy", "fy", -zcWeaken, 10);
                    target._apply_zc_stack("weaken_mz", "mz", -zcWeaken, 10);
                    target._apply_zc_stack("weaken_ds", "ds", -zcWeaken, 10);
                    target._apply_zc_stack("weaken_zj", "zj", -zcWeaken, 10);
                    this.send_combat("<HIB>$N击中$n要害，$n攻防渐弱。</HIB>\n", target);
                }

                // ZC passive: 穿透 - on hit, increase target's damage taken
                var zcPierce = this.query_prop("zc_pierce") || 0;
                if (zcPierce > 0) {
                    target._apply_zc_stack("pierce", "diff_sh_per", -zcPierce * 100, 10);
                    this.send_combat("<HIW>$N的攻势击穿了$n的防御！</HIW>\n", target);
                }

                // ZC passive: 剑心 - extra attacks on hit (count-based)
                var zcSwordHeart = this.query_prop("zc_sword_heart") || 0;
                if (zcSwordHeart >= 1 && this.fight_type && target.hp > 0 && !par._is_sword_heart) {
                    var extraCount = Math.floor(zcSwordHeart);
                    for (var ec = 0; ec < extraCount; ec++) {
                        this.send_combat("<HIM>剑心通明！额外攻击一次。</HIM>\n", target);
                        var extraPar = { target: target, no_weapon: par.no_weapon, is_throwing: par.is_throwing, no_append_target: true, _is_sword_heart: true };
                        this.do_attack(extraPar);
                    }
                }
            } else {
                this.send_combat("结果没有造成任何伤害。\n", true);
            }
        }

    }
    // ZC passive: 反击(轻功) - counter-attack on successful dodge
    if (par.is_dodge && target.fight_type && this.hp > 0) {
        var zcCounterDodge = target.query_prop("zc_counter_dodge") || 0;
        if (zcCounterDodge > 0) {
            var cdDmg = target.gj * zcCounterDodge;
            var cdResult = this.damage(cdDmg, target, 0);
            if (cdResult > 0)
                target.send_combat("<HIC>灵巧反击！造成" + Math.floor(cdResult) + "点伤害。</HIC>\n", this);
        }
        // ZC passive: 灵动 - stacking speed/hit on dodge
        var zcLingdong = target.query_prop("zc_lingdong") || 0;
        if (zcLingdong > 0) {
            target._apply_zc_stack("lingdong_gjsd", "gjsd", zcLingdong, 10);
            target._apply_zc_stack("lingdong_mz", "mz", zcLingdong, 10);
            target.send_combat("<HIG>$N闪避后身法更显灵动！</HIG>\n", this);
        }
    }
    if (this.fight_type) {
        if (!par.no_append_target) {
            target.dodge_skill.on_dodge_over
                && target.dodge_skill.on_dodge_over(target, this, par);

            if (!par.is_dodge)
                target.parry_skill.on_parry_over &&
                    target.parry_skill.on_parry_over(target, this, par);
        }
        if (!par.no_append) {
            attackskill.on_attack_over && attackskill.on_attack_over(this, target, par, sh);
            this.force_skill.on_force_over &&
                this.force_skill.on_force_over(this, target, par, sh);
            // 攻击者自身的回调（NPC可用）
            this.on_attack_over && this.on_attack_over(this, target, par, sh);
        }
    }
    return sh;
}
CHARACTER.prototype.from_attack = function (sh, mz, gjmsg, shmsg, dsmsg, parrymsg) {
    gjmsg && this.send_room(gjmsg);
    var is_dodge = mz > 0 ? Math.random() * (this.ds / 2) + this.ds / 2 > mz : false;
    if (is_dodge) {
        this.send_room((dsmsg || this.dodge_skill.query_dodge_action()), this);
    } else {
        this.send_room(shmsg);
        this.damage(sh);
        this.send_combat(query_status_msg(this.hp, this.max_hp));

        if (this.fight_type === 1 && this.hp < 0) {
            this.hp = 1;
        } else if (this.hp <= 0) {
            this.die();
            this.end_fight();
        }
    }
    return is_dodge;
}
CHARACTER.prototype.do_recover = function (hp) {
    hp = hp + hp * this.query_prop('recover_per') / 100;
    if (!(hp > 0)) return 0;
    var result = this.add_hp(parseInt(hp));
    if (result > 0 && this.is_player) {
        var stack = new Error().stack;
        require('fs').appendFileSync('/tmp/debug_heal.log', "[do_recover] player=" + this.name + " hp_heal=" + result + " hp=" + this.hp + " max_hp=" + this.max_hp + " time=" + Date.now() + " stack=" + (stack ? stack.split("\n").slice(1, 6).join(" <- ") : "none") + "\n");
    }
    return result;
}

CHARACTER.prototype.damage = function (sh, from, diff_fy) {
    if (!(sh > 0)) return 0;
    if (this._wushen_taiji_invincible) return 0;
    let diff_sh_per = this.diff_sh_per;
    let fy = this.fy;
    if (diff_fy > 0) {
        diff_sh_per -= diff_sh_per * diff_fy / 100;
        fy -= fy * diff_fy / 100;
    }
    let diff_fy_per = from ? from.diff_fy_per : 0;//忽视防御，从免伤开始减
    if (diff_sh_per > 0 && diff_fy_per > 0) {
        diff_sh_per -= diff_fy_per;
        if (diff_sh_per < 0) {
            diff_fy_per = -diff_sh_per;
        }
    }
    if (fy > 0 && diff_fy_per > 0) {
        fy -= fy * diff_fy_per / 100;
        if (fy < 0) fy = 0;
    }
    if (diff_sh_per > 0)
        sh = sh - sh * diff_sh_per / 100;//伤害减免
    if (fy > 0 && sh > 0)
        sh = (sh / (sh + fy) * sh);
    sh = sh - this.query_prop("diff_sh");

    if (sh > 0 && this.equipment && this.equipment[1] && this.equipment[1].on_defense) {
        sh = this.equipment[1].on_defense(this, from, sh);
    }
    if (sh > 0 && this.force_skill.on_damage) {
        sh = this.force_skill.on_damage(this, from, sh);
    }

    // ZC passive: 守护 - damage reduction as self HP decreases
    var zcGuardian = this.query_prop("zc_guardian") || 0;
    if (zcGuardian > 0 && this.max_hp > 0 && sh > 0 && this.hp > 0) {
        var missingHpPct = (1 - this.hp / this.max_hp);
        if (missingHpPct > 0) {
            var guardianReduction = sh * zcGuardian * missingHpPct * 100;
            sh = sh - guardianReduction;
            if (sh < 0) sh = 0;
            if (guardianReduction > 10) this.send_combat("<HIC>$N以残血之躯激发守护之力，伤害大减！</HIC>\n", from);
        }
    }

    if (sh > 0) {
        sh = parseInt(sh);
        // ZC passive: 反震 - reflect damage to attacker based on max MP
        var zcRebound = this.query_prop("zc_rebound") || 0;
        if (zcRebound > 0 && from && from.hp > 0 && this.max_mp > 0) {
            var reboundDmg = this.max_mp * zcRebound;
            from.damage(reboundDmg, this, 0);
            this.send_combat("<HIY>$N以内力反震，将伤害回敬$n！</HIY>\n", from);
        }

        // ZC passive: 不灭 - trigger at low HP
        var zcUndying = this.query_prop("zc_undying") || 0;
        if (zcUndying > 0 && this.hp > 0 && this.max_hp > 0 && !this._zc_undying_cd) {
            var hpPct = this.hp / this.max_hp;
            if (hpPct <= zcUndying) {
                var undyingHeal = Math.floor(this.max_hp * zcUndying);
                this.do_recover(undyingHeal);
                this._zc_undying_cd = true;
                this.add_status({
                    id: "zc_bumie",
                    name: "不灭",
                    desc: "无视所有伤害",
                    duration: 5000,
                    downside: false,
                    override: 2,
                    prop: { diff_sh_per: 10000, diff_sh: 99999999 },
                    start_msg: "<HIR>混沌真气爆发，不灭之体护住全身！</HIR>\n",
                    finish_msg: "不灭之体消散了。",
                });
                this.send_combat("<HIR>混沌不灭！触发不灭恢复" + undyingHeal + "点气血！</HIR>\n");
                var selfRef = this;
                setTimeout(function() { selfRef._zc_undying_cd = false; }, 600000);
            }
        }

        if (this.record_damage && from) {
            if (!this.damages) this.damages = {};
            let damag = (this.damages[from.id] || 0) + sh;
            this.damages[from.id] = damag;
            this.sum_damages = (this.sum_damages ?? 0) + sh;
        }
        this.add_hp(-sh);
        return sh;
    }
    return 0;
}
CHARACTER.prototype.damage2 = function (sh, from) {
    if (!sh) return;

    if (this.record_damage && from) {
        if (!this.damages) this.damages = {};
        var damag = (this.damages[from.id] || 0) + sh;
        this.damages[from.id] = damag;

    }
    if (this.force_skill.on_damage) {
        sh = this.force_skill.on_damage(this, from, sh);
        if (!sh) return 0;
    }
    this.add_hp(-sh);
    return sh;
}
CHARACTER.prototype.damage3 = function (sh, from) {
    if (!(sh > 0)) return;

    this.add_hp(-sh);
    if (this.force_skill.on_damage) {
        this.force_skill.on_damage(this, from, 0);
    }
    return sh;
}


var catch_hunt_msg = [
    "<HIW>$N和$n仇人相见分外眼红，立刻打了起来！</HIW>",
    "<HIW>$N对著$n大喝：「可恶，又是你！」</HIW>",
    "<HIW>$N和$n一碰面，二话不说就打了起来！</HIW>",
    "<HIW>$N一眼瞥见$n，「哼」的一声冲了过来！</HIW>",
    "<HIW>$N一见到$n，愣了一愣，大叫：「我宰了你！」</HIW>",
    "<HIW>$N喝道：「$n，我们的帐还没算完，看招！」</HIW>",
    "<HIW>$N喝道：「$n，看招！」</HIW>"];
var guard_msg = [
    "<CYN>$N注视著$n的行动，企图寻找机会出手。\n</CYN>",
    "<CYN>$N正盯著$n的一举一动，随时准备发动攻势。\n</CYN>",
    "<CYN>$N缓缓地移动脚步，想要找出$n的破绽。\n</CYN>",
    "<CYN>$N目不转睛地盯著$n的动作，寻找进攻的最佳时机。\n</CYN>",
    "<CYN>$N慢慢地移动著脚步，伺机出手。\n</CYN>",
];


var status_msg = [
    "($N<HIG>看起来充满活力，一点也不累。</HIG>)\n",
    "($N<HIG>似乎有些疲惫，但是仍然十分有活力。</HIG>)\n",
    "($N<HIY>看起来可能有些累了。</HIY>)\n",
    "($N<HIY>动作似乎开始有点不太灵光，但是仍然有条不紊。</HIY>)\n",
    "($N<HIY>气喘嘘嘘，看起来状况并不太好。</HIY>)\n",
    "($N<RED>似乎十分疲惫，看来需要好好休息了。</RED>)\n",
    "($N<RED>已经一副头重脚轻的模样，正在勉力支撑著不倒下去。</RED>)\n",
    "($N<RED>看起来已经力不从心了。</RED>)\n",
    "($N<HIR>摇头晃脑、歪歪斜斜地站都站不稳，眼看就要倒在地上。</HIR>)\n",
    "($N<HIR>已经陷入半昏迷状态，随时都可能摔倒晕去。</HIR>)\n"
];
function query_status_msg(hp, maxhp) {
    var ratio = parseInt(hp * 10 / maxhp);
    if (ratio < 0) ratio = 0;
    if (ratio > 9) ratio = 9;
    return status_msg[9 - ratio];
}
function damage_msg2(msg, damage, iscrit) {
    return msg + "\n$N对$n造成" + iscrit ? ("<hir>" + damage + "</hir>点暴击伤害") : ("<wht>" + damage + "</wht>点伤害");//$N的攻击对$n
}
function damage_msg(damage, type, ob, iscrit, msg) {
    if (msg) {
        return msg + "\n$N对$n造成" + (iscrit ? ("<hir>" + damage + "</hir>点暴击伤害") : ("<wht>" + damage + "</wht>点伤害"));//$N的攻击对$n
    }

    if (damage === 0) return "结果没有造成任何伤害。";
    var sh = iscrit ? "<hir>" + damage + "</hir>点暴击伤害" : "<wht>" + damage + "</wht>点伤害";
    if (ob.hp > 0) {
        damage = damage * 100 / ob.hp;
    } else
        damage = 120;
    switch (type) {
        case WEAPON_TYPE.BLADE:
        case WEAPON_TYPE.WHIP:
            if (damage < 5) return "结果只是轻轻地划破$p的皮肉，造成" + sh + "。";
            else if (damage < 10) return "结果在$p$l划出一道细长的血痕，造成" + sh + "！";
            else if (damage < 20) return "结果「嗤」地一声划出一道伤口，造成" + sh + "！";
            else if (damage < 40) return "结果「嗤」地一声划出一道血淋淋的伤口，造成" + sh + "！";
            else if (damage < 80) return "结果「嗤」地一声划出一道又长又深的伤口，溅得$N满脸鲜血，造成" + sh + "！";
            else return "结果只听见$n一声惨嚎，$w已在$p$l划出一道深及见骨的可怕伤口，造成" + sh + "！！";
        case WEAPON_TYPE.SWORD:
            if (damage < 10) return "结果只是轻轻地刺破$p的皮肉，造成" + sh + "！";
            else if (damage < 20) return "结果在$p$l刺出一个创口，造成" + sh + "！";
            else if (damage < 40) return "结果「噗」地一声刺入了$n$l寸许，造成" + sh + "！";
            else if (damage < 60) return "结果「噗」地一声刺进$n的$l，使$p不由自主地退了几步，造成" + sh + "！";
            else if (damage < 80) return "结果「噗嗤」地一声，$w已在$p$l刺出一个血肉模糊的血窟窿，造成" + sh + "！";
            else return "结果只听见$n一声惨嚎，$w已在$p的$l对穿而出，鲜血溅得满地，造成" + sh + "！！";
        case WEAPON_TYPE.NONE:
        case WEAPON_TYPE.STAFF:
        case WEAPON_TYPE.CLUB:
            if (damage < 5) return "结果只是轻轻地碰到，比拍苍蝇稍微重了点，造成" + sh + "！";
            else if (damage < 10) return "结果在$p的$l造成一处瘀青，造成" + sh + "！";
            else if (damage < 25) return "结果一击命中，$n的$l登时肿了一块老高，造成" + sh + "！";
            else if (damage < 40) return "结果一击命中，$n闷哼了一声显然吃了不小的亏，造成" + sh + "！";
            else if (damage < 50) return "结果「砰」地一声，$n退了两步，造成" + sh + "！";
            else if (damage < 60) return "结果这一下「砰」地一声打得$n连退了好几步，差一点摔倒，造成" + sh + "！";
            else if (damage < 80) return "结果重重地击中，$n「哇」地一声吐出一口鲜血，造成" + sh + "！";
            else return "结果只听见「砰」地一声巨响，$n像一捆稻草般飞了出去，造成" + sh + "！！";
        case "force":
            if (damage < 10) return "结果只是把$n打得退了半步，毫发无损，造成" + sh + "！";
            else if (damage < 20) return "结果$n痛哼一声，在$p的$l造成一处瘀伤，造成" + sh + "！";
            else if (damage < 30) return "结果一击命中，把$n打得痛得弯下腰去，造成" + sh + "！";
            else if (damage < 40) return "结果$n闷哼了一声，脸上一阵青一阵白，显然受了点内伤，造成" + sh + "！";
            else if (damage < 60) return "结果$n脸色一下变得惨白，昏昏沉沉接连退了好几步，造成" + sh + "！";
            else if (damage < 75) return "结果重重地击中，$n「哇」地一声吐出一口鲜血，造成" + sh + "！";
            else if (damage < 90) return "结果「轰」地一声，$n全身气血倒流，口中鲜血狂喷而出，造成" + sh + "！";
            else return "结果只听见几声喀喀轻响，$n一声惨叫，像滩软泥般塌了下去，造成" + sh + "！！";

        case WEAPON_TYPE.THROWING:
            if (damage < 5) return "结果只是轻轻地划破$p的皮肉，造成" + sh + "。";
            else if (damage < 10) return "结果在$p$l划出一道细长的血痕，造成" + sh + "！";
            else if (damage < 20) return "结果「嗤」地一声划出一道伤口，造成" + sh + "！";
            else if (damage < 40) return "结果「嗤」地一声划出一道血淋淋的伤口，造成" + sh + "！";
            else if (damage < 80) return "结果「嗤」地一声划出一道又长又深的伤口，溅得$N满脸鲜血，造成" + sh + "！";
            else return "结果只听见$n一声惨嚎，$T已在$p$l划出一道深及见骨的可怕伤口，造成" + sh + "！！";
        default:
            //if (damage < 10) return "结果只是勉强造成一处轻微伤害！";
            //else if (damage < 20) return "结果造成轻微的伤害！";
            //else if (damage < 30) return "结果造成一处伤害！";
            //else if (damage < 50) return "结果造成一处严重伤害！";
            //else if (damage < 60) return "结果造成颇为严重的伤害！！";
            //else if (damage < 70) return "结果造成相当严重的伤害！！";
            //else if (damage < 80) return "结果造成十分严重的伤害！！";
            //else if (damage < 90) return "结果造成极其严重的伤害！！";
            //else return "结果造成非常可怕的严重伤害！！";
            return "<wht>结果造成" + sh + "。</wht>";
    }
}