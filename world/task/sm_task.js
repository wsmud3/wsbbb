
this.inherits(USERTASK);
this.id = "sm";
this.on_create = function () {
}


const TAGS = ['hig', 'hic', 'hiy', 'hiz', 'hio', 'ord'];

const TITLES = ['入门弟子', '弟子', '执事', '护法', '长老', '供奉'];
this.query_title = function (me) {
    let tag = TAGS[me.query_temp('sm_level', 0)];
    return `<${tag}>师门物资</${tag}>`;
}

this.query_desc = function (me) {
    let tm = me.query_temp("sm_tm", 0);
    if (!tm) return;

    let sm = 0;
    let mem = "";
    let max = 999999;
    if (tm > 0) {
        sm = Math.floor((Date.now() - tm * 100000) / 3600000);
        if (sm <= 0) {
            sm = 0;
            let time = tm * 100000 + 3600000 - Date.now();
            if (time > 0) {
                mem = "，下次领取" + this.format_time_span(time);
            }
        } else if (sm < max) {
            let time = tm * 100000 + 3600000 * (sm + 1) - Date.now();
            if (time > 0) {
                mem = "，下次领取" + this.format_time_span(time);
            }
        } else {

            mem = "，已到上限";
            sm = Math.min(sm, 999999);
        }
    }

    return `你是${me.family.query_task_title(me)}，在此期间将持续获得师门的资助，当前累计${sm}/999999。<br><mem>每小时获得一份师门资源，可通过后勤管理提升师门职位${mem}</mem>`;
}
this.query_smcount = function (me) {
    let sm = me.query_temp("sm_tm", 0);
    if (!sm) return -1;
    sm = Math.floor((Date.now() - sm * 100000) / 3600000);
    return Math.min(sm, 999999);
}
//0 不显示 1，进行中，2.可领取 3.已完成
this.query_state = function (me) {
    let sm = this.query_smcount(me);
    if (sm < 0) return 0;
    return sm > 0 ? 2 : 1;
}
this.format_time_span = function (time) {
    if (time > 3600000)
        return Math.floor(time / 3600000) + "小时后";
    if (time > 60000)
        return Math.floor(time / 60000) + "分钟后";
    return Math.floor(time / 1000) + "秒后";

}
const EXPS = [5000, 10000, 12500, 15000, 17500, 20000];

const GONGJI = [20, 40, 80, 120, 160, 200];
const MONEYS = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

this.on_finish = function (me) {
    let sm = this.query_smcount(me);
    if (!(sm > 0)) return false;
    let sm_level = me.query_temp('sm_level', 0);
    let gongji = GONGJI[sm_level] * sm;
    let exp = EXPS[sm_level] * sm;
    let pot = exp;
    if (me.level > 2) {
        pot = parseInt(me.exp / 1200);
        if (pot > 150000) {
            pot = 150000;
        }
        pot = pot * sm;
    }
    me.add_temp('gongji', gongji);
    // 帮派活跃度：完成师门任务为帮派贡献活跃度
    var pt = me.query_party();
    var ptMsg = "";
    if (pt) {
        var scIndex = Math.min(6, Math.max(1, me.level));
        pt.add_temp('sc' + scIndex, sm * 10);
        ptMsg = " 帮派活跃度+" + (sm * 10);
    }
    if (!me.skills) me.skills = {};
    me.add_exp(exp, pot);


    // 检查是否有尚未学会的门派进阶技能（skills2）
    var list = [];
    for (var i = 0; i < me.family.skills2.length; i++) {
        if (!me.skills[me.family.skills2[i].id]) {
            list.push(me.family.skills2[i].id);
        }
    }

    // 防呆：检查是否还有任何可用的门派特殊进阶（不包括武道进阶）
    // 返回true表示还有进阶空间，可以继续获得残页
    function has_remaining_sect_advancements(player) {
        var fam = player.family;
        if (!fam || fam === FAMILIES.NONE) return false;

        // 检查1：是否有尚未学会的门派进阶技能（skills2）
        if (fam.skills2) {
            for (var i = 0; i < fam.skills2.length; i++) {
                if (!player.skills[fam.skills2[i].id]) {
                    return true; // 还有未学会的进阶技能
                }
            }
        }

        // 检查2：遍历玩家已学会的本门派技能，检查是否有未完成的特定进阶词条
        for (var skid in player.skills) {
            var sk_base = SKILL.get(skid);
            if (!sk_base || !sk_base.family || sk_base.family !== fam) continue;
            if (sk_base.is_custom) continue; // 自创技能不算

            var sk = player.skills[skid];
            var grd = sk_base.query_grade(player);
            if (grd >= 5) continue; // 已达最高等阶

            // 检查技能特定的进阶词条（slots）
            if (sk_base.slots && sk_base.slots.length > 0) {
                var addin = sk.addin || [];
                for (var j = 0; j < sk_base.slots.length; j++) {
                    var si = 500 + j;
                    var slot_def = sk_base.slots[j];
                    var is_single = (slot_def.count === 1 || !slot_def.count);
                    if (is_single && addin.indexOf(si) === -1) {
                        return true; // 还有未获得的特定进阶词条
                    }
                    if (!is_single) {
                        var cnt = 0;
                        for (var k = 0; k < addin.length; k++) {
                            if (addin[k] === si) cnt++;
                        }
                        if (cnt < (slot_def.count || 1)) return true;
                    }
                }
            }

            // 检查3：该技能是否可以通过门派进阶残页提升等阶（标记式升级）
            // 没有skills2进阶目标、也没有特定词条的技能，可通过标记提升等阶
            if (!sk_base.source_skill) {
                var has_adv_form = false;
                if (fam.skills2) {
                    for (var j = 0; j < fam.skills2.length; j++) {
                        if (fam.skills2[j].source_skill === skid) {
                            has_adv_form = true;
                            break;
                        }
                    }
                }
                if (!has_adv_form) {
                    return true; // 可通过标记式升级提升等阶
                }
            }
        }

        return false; // 所有门派特殊进阶都已完成
    }

    // 提前计算防呆结果，避免在循环中重复调用
    var can_get_up_book = me.family !== FAMILIES.NONE && has_remaining_sect_advancements(me);

    let items = [];
    let count = sm;
    while (count > 0) {
        if (count >= 10) {
            // 每10小时必得1残页
            var is_wuguan = me.query_temp("wg_sr") == 1;
            if (can_get_up_book) {
                items.push({obj: "book/up"});
            } else if (me.family !== FAMILIES.NONE || is_wuguan) {
                // 所有门派进阶已完成，或武馆玩家，改发培元丹
                items.push({obj: "drug/limit_mp#" + Math.min(4, sm_level)});
            }
            items.push({
                obj: "drug/limit_mp#" + Math.min(4, sm_level)
            });
            count -= 10;
        } else {
            // 不足10小时：每小时10%概率获得额外残页
            items.push({
                obj: "drug/limit_mp#" + Math.min(4, sm_level),
                odds: count * 1000
            });
            if (can_get_up_book) {
                items.push({
                    obj: "book/up",
                    odds: count * 1000
                });
            }
            count = 0;
        }
    }
    me.set_temp("sm_up_pity", 0);
    // 武道 — one per accumulated unit
    for (var j = 0; j < sm; j++) {
        items.push({obj: "book/wudao", odds: 10000});
    }
    items = OBJ.create_by_odds(items);
    var itemMap = {};
    for (var i = 0; i < items.length; i++) {
        if (me.add_obj(items[i])) {
            var iname = items[i].name;
            if (!itemMap[iname]) itemMap[iname] = { count: 0, color: items[i].color_name };
            itemMap[iname].count++;
        }
    }
    var itemNames = [];
    for (var key in itemMap) {
        var entry = itemMap[key];
        // 把 <hic>培元丹</hic> 变成 <hic>培元丹×10</hic>
        var colored = entry.color.replace("</", "×" + entry.count + "</");
        itemNames.push(colored);
    }

    var curTm = me.query_temp("sm_tm", 0);
    if (curTm) {
        me.set_temp("sm_tm", curTm + sm * 36);
    }

    var jlMsg = "";
    let limit = me.query_jclimit();
    let jingli = me.query_temp('ad_jl', 0);
    if (limit > jingli) {
        let ad_jl = 10 * sm;
        let add = limit - jingli;
        if (add > ad_jl) add = ad_jl;
        me.add_temp('ad_jl', add);
        jlMsg = " 精力+" + add;
    } else {
        jlMsg = " 精力已满";
    }

    var summary = "<hic>领取" + sm + "份师门物资：经验+" + exp + " 潜能+" + pot + " 功绩+" + gongji + ptMsg + jlMsg;
    if (itemNames.length) summary += "\n获得：" + itemNames.join("、");
    summary += "</hic>";
    me.notify(summary);

    return true;
}

this.set_curtm = function (me, count) {


    let tm = me.query_temp("sm_tm", 0);

    tm = Math.max((Date.now() - 3600000 * 999999) / 100000, tm);


    tm += count * 36;


    me.set_temp("sm_tm", tm);

}