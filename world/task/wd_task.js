
this.inherits(USERTASK);
this.id = "wudao";

const TAGS = ['wht', 'hic', 'hiy', 'hiz', 'hio', 'ord'];


this.query_title = function (me) {
    let wd_lv = me.query_temp("wd_level", 0);

    let lv = Math.floor(wd_lv / 20);

    let tag = TAGS[lv];
    return `<${tag}>武道塔挑战：${wd_lv}层</${tag}>`;
}


this.query_desc = function (me) {
    let lv = me.query_temp("wd_level", 0);
    if (!(lv > 0)) return;
    let tm = me.query_temp("wd_tm", 0);
    let wd = 0;
    let mem = "";
    let max = 7;
    if (tm > 0) {
        wd = Math.floor((Date.now() - tm * 100000) / 3600000 / 24);
        if (wd <= 0) {
            wd = 0;
            let time = tm * 100000 + 3600000 * 24 - Date.now();
            if (time > 0) {
                mem = "，下次领取" + this.format_time_span(time);
            }
        } else if (wd < max) {
            let time = tm * 100000 + 3600000 * 24 * (wd + 1) - Date.now();
            if (time > 0) {
                mem = "，下次领取" + this.format_time_span(time);
            }
        } else {
            mem = "，已到上限";
            wd = Math.min(wd, 7);
        }
    }

    return `你的武道塔挑战记录是${lv}层，守门人将按照你的最高挑战记录发放奖励，当前可领取${wd}/7。<br><mem>每天获得一份奖励，挑战更高层获得更多奖励${mem}</mem>`;
}
this.format_time_span = function (time) {

    if (time > 3600000)
        return Math.floor(time / 3600000) + "小时后";
    if (time > 60000)
        return Math.floor(time / 60000) + "分钟后";
    return Math.floor(time / 1000) + "秒后";

}

this.query_count = function (me) {
    let tm = me.query_temp("wd_tm", 0);
    if (!tm) return 0;
    tm = Math.floor((Date.now() - tm * 100000) / 3600000 / 24);
    return Math.min(tm, 7);
}
//0 不显示 1，进行中，2.可领取 3.已完成
this.query_state = function (me) {
    let lv = me.query_temp("wd_level", 0);
    if (!(lv > 0)) return 0;
    let sm = this.query_count(me);
    return sm > 0 ? 2 : 1;
}
const EXPS = [1000, 2000, 3000, 4000, 5000, 6000, 7000];
this.on_finish = function (me) {
    let wd_count = this.query_count(me);
    if (!(wd_count > 0)) return false;
    let wd_lv = me.query_temp("wd_level", 0);
    if (!(wd_lv > 0)) return false;

    this.set_curtm(me, wd_count);
    for (let i = 0; i < wd_count; i++) {
        this.reward(me, wd_lv);
    }

    me.send('<hic>你领取了' + wd_count + '天的武道塔的奖励。</hic>');




    return true;
}
this.set_curtm = function (me, count) {
    let tm = me.query_temp("wd_tm", 0);

    tm = Math.max((Date.now() - 3600000 * 24 * 7) / 100000, tm);


    tm += Math.floor((count * 36 * 24));


    me.set_temp("wd_tm", tm);

}

const REWARDS = [
    ["drug/max_mp#0", "drug/skill2#1"],
    ["drug/max_mp#1", "drug/skill2#2"],
    ["drug/max_mp#2", "drug/skill2#3"],
    ["drug/max_mp#3", "drug/skill2#4"],
    ["drug/max_mp#4", "drug/skill2#5"],
];
this.reward = function (me, lv) {
    let items = [];
    let exp = 10000;
    if (lv <= 29) {
        exp += lv * 10000;
    } else {
        exp += 29 * 10000;
        exp += (lv - 29) * 1000;
    }

    me.add_exp(exp, exp);

    // 帮派活跃度
    var pt = me.query_party();
    if (pt) {
        var scIndex = Math.min(6, Math.max(1, me.level));
        var addSc = Math.floor(lv / 5) || 1;
        pt.add_temp('sc' + scIndex, addSc);
    }

    if (lv >= 10) {
        let wd_count = Math.floor(lv / 10);
        items.push({
            obj: "book/wd",
            count: wd_count
        });
        me.add_temp('wds', wd_count);
    }

    // 通关100层的玩家有概率获得红色技能残页
    if (me.query_temp("wd100")) {
        items.push({
            obj: ["st/st_red#4", "st/st_red#3"],
            odds: 3000
        });
    }

    items = OBJ.create_by_odds(items);
    for (var i = 0; i < items.length; i++) {
        var item = me.add_obj(items[i]);
        if (item) {
            me.send("你获得了" + items[i].unit_name() + "。");
        }
    }

    // 技能残页：按塔层grade随机发放1-3份
    var tower_grade = Math.min(Math.floor(lv / 20), 5) + 1;
    var target_grades = [tower_grade];
    if (tower_grade > 0) target_grades.push(tower_grade - 1);

    var skill_pool = [];
    for (var skid in WORLD.SKILLS) {
        var sk = WORLD.SKILLS[skid];
        if (sk.type === SKILL_TYPES.KNOWLEDGE) continue;
        if (sk.family === FAMILIES.MONSTER) continue;
        if (sk.family && sk.family !== FAMILIES.NONE) continue;
        if (sk.is_custom) continue;
        if (target_grades.indexOf(sk.grade) !== -1) {
            skill_pool.push(skid);
        }
    }

    if (skill_pool.length > 0) {
        var scount = me.random(3) + 1;
        scount = Math.min(scount, skill_pool.length);
        for (var j = 0; j < scount; j++) {
            var ri = j + Math.floor(Math.random() * (skill_pool.length - j));
            var tmp = skill_pool[j];
            skill_pool[j] = skill_pool[ri];
            skill_pool[ri] = tmp;

            var book = OBJ.CREATE("book/bc#" + skill_pool[j]);
            if (book) {
                var added = me.add_obj(book);
                if (added) {
                    me.send("你获得了" + added.unit_name() + "。");
                }
            }
        }
    }

}


