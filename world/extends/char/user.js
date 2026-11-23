
USER.prototype.recount = function () {
    // 安全钳位：防止先天属性异常为负值
    if (!(this.str > 14)) this.str = 15;
    if (!(this.con > 14)) this.con = 15;
    if (!(this.dex > 14)) this.dex = 15;
    if (!(this.int > 14)) this.int = 15;
    this.max_hp = parseInt(this.con * 5 + (this.max_mp * this.query_force_rad()
        + this.query_prop("max_hp") + this.query_prop("con") * this.con) * (100 + this.query_prop("hp_per")) / 100);

    if (this.hp > this.max_hp) this.hp = this.max_hp;

    this.gjsd = 4000 - (this.query_prop("gjsd") || 0);
    if (this.gjsd > 500) {
        this.gjsd = parseInt(this.gjsd - (this.gjsd * this.query_prop("gjsd_per") / 100));
        if (this.gjsd < 500) this.gjsd = 500;
    } else {
        this.gjsd = 500;
    }
    // 武学被动可突破攻速下限（如疾风剑法将 0.5 秒下限提升至 0.25 秒）
    if (this.attack_skill && this.attack_skill.on_recount_gjsd) {
        var jf_gjsd = this.attack_skill.on_recount_gjsd(this);
        if (jf_gjsd > 0) this.gjsd = jf_gjsd;
    }


    this.gj = parseInt(this.str + (this.query_prop("gj") + this.query_prop("str") * this.str / 10) * (100 + this.query_prop("gj_per")) / 100);
    this.fy = parseInt(((this.str + this.con) / 10 + this.query_prop("fy") + this.query_prop("con") * this.con / 10) * (100 + this.query_prop("fy_per")) / 100);
    this.mz = parseInt((this.dex / 2 + this.query_prop("mz")) * (100 + this.query_prop("mz_per")) / 100);
    var zcFocus = this.query_prop("zc_focus") || 0;
    var dexDodge = this.query_prop("dex") * this.dex / 10;
    if (zcFocus > 0) dexDodge = dexDodge * (1 + zcFocus);
    this.ds = parseInt((this.dex / 2 + this.query_prop("ds") + dexDodge) * (100 + this.query_prop("ds_per")) / 100);
    if (this.dodge_skill && this.dodge_skill.on_recount_dodge) {
        this.ds += this.dodge_skill.on_recount_dodge(this);
    }
    this.zj = parseInt((this.str / 2 + this.query_prop("zj") + this.query_prop("str") * this.str / 10) * (100 + this.query_prop("zj_per")) / 100);
    if (this.parry_skill && this.parry_skill.on_recount_parry) {
        this.zj += this.parry_skill.on_recount_parry(this);
    }
    // 总加/总减（total_per）：攻击、防御、命中、躲闪、招架各自算完（含 *_per 加算百分比、技能加成）后
    // 再整体乘一次，与 buff 的加算百分比不同。例：背负段誉/童姥 total_per = -50 → 五项最终值各减半。
    var totalPer = this.query_prop("total_per") || 0;
    if (totalPer) {
        var tf = Math.max(0, 100 + totalPer) / 100;
        this.gj = parseInt(this.gj * tf);
        this.fy = parseInt(this.fy * tf);
        this.mz = parseInt(this.mz * tf);
        this.ds = parseInt(this.ds * tf);
        this.zj = parseInt(this.zj * tf);
    }
    this.bj = parseInt(this.dex / 10 + this.query_prop("bj_per"));
    // 免伤/破防经软上限折算（见 CHARACTER.soft_cap）
    // 特殊免伤 diff_sh_per2（免伤类 buff 专用）在软上限之后叠加；破防的 diff_fy_per2 已并入软上限
    this.diff_sh_per = this.query_soft_prop('diff_sh_per') + this.query_prop('diff_sh_per2');
    this.diff_fy_per = this.query_soft_prop('diff_fy_per');
    if (this._reapply_zc_stacks) this._reapply_zc_stacks();
}

// 境界突破奖励（经验/潜能、内力上限、先天属性）。下标 = 突破后的境界。
var LEVELUP_REWARDS = [null,
    { exp: 10000, mp: 1000, mp_msg: "你的内力限制增加了1000。" },
    { exp: 100000, mp: 5000 },
    { exp: 200000, mp: 10000 },
    { exp: 500000, mp: 20000 },
    { exp: 1000000, mp: 50000 },
    { exp: 2000000, mp: 500000, fenpei: 1, no_sk_msg: true },
];
// 已领过突破奖励的最高境界：存档 temp.lvup_top；没有记录的老角色按当前境界算（升到当前境界时已经领过）。
// 测试号可以降境界后再按流程升上来，境界不超过这个值时不再重复发放突破奖励。
USER.prototype.levelup_reward_top = function () {
    var top = parseInt(this.query_temp("lvup_top", 0)) || 0;
    return Math.max(top, this.level || 0);
}
// 记一笔“已领到 lv 境界的突破奖励”（降境界前调用，保证之后再升上来不会重复领）
USER.prototype.mark_levelup_rewarded = function (lv) {
    var top = Math.max(parseInt(this.query_temp("lvup_top", 0)) || 0, lv || 0);
    if (top > 0) this.set_temp("lvup_top", top);
}
// 本次突破是否发奖励（不改状态）：给金古易等调用方判断是否发师父奖励、广播等
USER.prototype.levelup_will_reward = function () {
    return (this.level || 0) + 1 > this.levelup_reward_top();
}
// 返回 true 表示本次发放了突破奖励；false 表示此前已领过（或已到顶）。
USER.prototype.level_up = function () {
    var lv = (this.level || 0) + 1;
    if (lv >= LEVELUP_REWARDS.length) return false;
    var reward = lv > this.levelup_reward_top(), r = LEVELUP_REWARDS[lv];
    var sk = this.skill_limit();
    this.level = lv;
    this.notify("<hiy>恭喜你提升到了" + this.get_level_desc() + "境界。</hiy>");
    if (reward) {
        this.add_exp(r.exp, r.exp);
        this.limit_mp += r.mp;
        this.notify("<hiw>" + (r.mp_msg || "你的最大内力限制增加了" + r.mp + "。") + "</hiw>");
        if (r.fenpei) {
            this.add_temp("fenpei", r.fenpei);
            this.set_temp("wushen_rwd", 1);
            this.notify("<hiw>你的先天属性增加了1点。</hiw>");
        }
        this.mark_levelup_rewarded(lv);
    } else {
        this.notify("<hic>你此前已领取过" + this.get_level_desc() + "境界的突破奖励，本次不再发放。</hic>");
    }
    if (!r.no_sk_msg) this.notify("<hiw>你的技能等级限制增加了" + (this.skill_limit() - sk) + "。</hiw>");
    this.color_name = null;
    this.environment.item_changed(this, true);
    this.send(`{type:"levelup",level:${this.level}}`);
    this.check_unlock_sect_jds();
    return reward;
}
USER.prototype.is_team = function (p) {
    if (!p || !p.team) return;
    return this.team == p.team;
}

USER.prototype.query_teamid = function () {
    if (this.team) return this.team.id;
    return this.id;
}

USER.prototype.can_trans = function () {
    if (!this.environment) return true;
    if (this.environment.is_fb()) return this.notify_fail("你现在正在副本区域。");
    if (this.environment.parent.on_leave(this) == false) return false;
    return true;
}

USER.prototype.enable_area = function () {

    let area = this.environment.parent;
    if (!(area.jd_index >= 0)) return;
    if (!this.query_bool('fb2', area.jd_index)) {
        this.set_bool('fb2', area.jd_index, true);
        this.send('<him>你解锁新地图【' + area.name + '】。</him>');
        this.send(`{type:"dialog",dialog:"jh",unlock2:${this.query_temp('fb2', 0)}}`);
    }

}
USER.prototype.isenable_area = function (fb) {
    if (!fb) return false;
    if (this.is_test_char()) return true;   // 测试号：全部禁地已解锁（sktest）
    if (typeof fb === 'number') {
        return this.query_bool('fb2', fb);
    }
    if (!(fb.jd_index >= 0)) return false;
    return this.query_bool('fb2', fb.jd_index);
}

USER.prototype.check_unlock_sect_jds = function () {
    if (WORLD.ZHENYI && WORLD.ZHENYI.check_unlock) {
        return WORLD.ZHENYI.check_unlock(this, false);
    }
    var FAMILY_TO_JDS = {
        HUASHAN: 2, WUDANG: 3, SHAOLIN: 4, EMEI: 5,
        GAIBANG: 6, XIAOYAO: 7, SHASHOU: 8, SUNV: 9,
    };
    var JDS_NAMES = {
        2: "独孤剑冢", 3: "真武秘境", 4: "达摩洞", 5: "金顶佛光",
        6: "君山密录", 7: "琅嬛福地", 8: "修罗暗殿", 9: "九天瑶池",
    };
    if (!this.family) return;
    var jd = FAMILY_TO_JDS[this.family.id];
    if (!jd) return;
    if (this.level >= 5 && (this.query_temp("wd_level", 0) >= 100 || this.query_temp("wd100", 0))) {
        if (!this.query_bool("fb2", jd)) {
            this.set_bool("fb2", jd, true);
            this.send('<him>你冥冥中感到远处传来呼唤，似乎在催促你前往，你已解锁【' + JDS_NAMES[jd] + '】。</him>');
            this.send(JSON.stringify({type: "dialog", dialog: "jh", unlock2: this.query_temp("fb2", 0)}));
        }
    }
};

USER.prototype.query_bool = function (key, index) {
    let step = parseInt(index / 32);
    if (step > 0) key = key.toString() + step.toString();
    let num = this.query_temp(key, 0);
    if (!num) return false;
    let bit = index % 32;
    return (num & (1 << bit)) !== 0;
}
USER.prototype.set_bool = function (key, index, value, time) {
    let step = parseInt(index / 32);
    if (step > 0) key = key.toString() + step.toString();
    let num = this.query_temp(key, 0);
    let bit = index % 32;
    if (value)
        this.set_temp(key, num | (1 << bit), time);
    else
        this.set_temp(key, num & ~(1 << bit), time);
}
USER.prototype.clear_bool = function (key, count) {
    let num = this.query_temp(key, 0);
    if (!num) return;
    for (let i = 0; i < count; i++) {
        if ((num & (1 << i)) !== 0) {
            return;
        }
    }
    this.remove_temp(key);
}


USER.prototype.expend_jingli = function (val) {
    if (val > 0 && this.query_jingli() >= val) {
        var expend = this.query_temp("ex_jl", 0);
        if (expend >= 200) {
            var add = this.query_temp("ad_jl", 0);
            if (add < val) return false;
            this.add_temp("ad_jl", -val);

        } else {
            if (expend + val > 200) {
                this.set_temp("ex_jl", 200, UTIL.diff_time());
                val = val - (200 - expend);
                this.add_temp("ad_jl", -val);
            } else {
                this.add_temp("ex_jl", val, UTIL.diff_time());
            }
        }
        return true;
    }
    return false;
}
USER.prototype.create_for = function (id) {
    if (!this.custom_skills) return false;
    return this.custom_skills.indexOf(id) > -1;
}

USER.prototype.add_custom_skill = function (skill_id) {
    if (!this.custom_skills)
        this.custom_skills = [];
    if (this.custom_skills.indexOf(skill_id) < 0) {
        this.custom_skills.push(skill_id);
        return true;
    }
    return false;
};

USER.prototype.has_custom_skill = function (skill_id) {
    if (!this.custom_skills) return false;
    return this.custom_skills.indexOf(skill_id) > -1;
};
USER.prototype.query_age = function () {
    var dt = Date.now() - this.reg_time * 60000;

    return 14 + dt / 86400000 / 12 - this.query_prop("age") - this.query_temp("age", 0);
}
// ===== 山外山：宗师境界（level>=3）自动解锁禁地 sws =====
// check_unlock_sect_jds 在登录、重连和升级时都会被调用，这里包一层实现自动解锁。
var SWS_JD_INDEX = 3;   // 八派禁地合并为云湺山（第 2 位）后，山外山由第 10 位前移到第 3 位
function sws_check_unlock(me) {
    if (!me || !me.is_player) return;
    if (me.level < 3) return;
    if (me.query_bool("fb2", SWS_JD_INDEX)) return;
    me.set_bool("fb2", SWS_JD_INDEX, true);
    me.send("<hio>你只觉胸中意境大开，天外之山隐隐向你呼唤，秘境【山外山】已解锁，可从江湖-禁地前往。</hio>");
    me.send(JSON.stringify({ type: "dialog", dialog: "jh", unlock2: me.query_temp("fb2", 0) }));
}
if (!USER._sws_orig_check_unlock) {
    USER._sws_orig_check_unlock = USER.prototype.check_unlock_sect_jds;
    USER.prototype.check_unlock_sect_jds = function () {
        // 先迁移禁地列表位布局，再按新位置自动解锁，避免旧版第 3 位（武当禁地）被误当成山外山。
        try { if (WORLD.ZHENYI && WORLD.ZHENYI.migrate_jd_layout) WORLD.ZHENYI.migrate_jd_layout(this); } catch (e) {}
        try { sws_check_unlock(this); } catch (e) {}
        // 存档型限时增益（如剑冢「参悟」）：登录 / 重连时按剩余时间重新挂上
        try { if (WORLD.ZHENYI && WORLD.ZHENYI.restore_timed_buffs) WORLD.ZHENYI.restore_timed_buffs(this); } catch (e) {}
        return USER._sws_orig_check_unlock.apply(this, arguments);
    };
}
FOLLOWER.prototype.remove_obj = USER.prototype.remove_obj;
FOLLOWER.prototype.recount = USER.prototype.recount;
USER.prototype.soft_cap_props = true;
FOLLOWER.prototype.soft_cap_props = true;
FOLLOWER.prototype.items_changed = USER.prototype.items_changed;
FOLLOWER.prototype.send_commands = USER.prototype.send_commands;


