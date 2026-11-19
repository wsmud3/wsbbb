this.inherits(COMMAND);
this.command = "caiyao";

this.enter = function (me) {
    if (!me.environment) return false;
    if (!me.environment.can_caiyao)
        return me.notify('这里不能采药、');
    let name = "药林";
    if (me.environment.is('home/huayuan'))
        name = '花圃';
    me.send_room("$N走进" + name + "，开始认真寻找药材。");
    me.set_state({
        id: "cai",
        type: "work",
        title: "采药",
        player: me,
        attach_level: 0,
        rate: 2,
        on_enter: do_cai,
        stime: Date.now(),
        on_check: on_check,
        no_move: "你还在采药，专心点比较好！",
        desc: '["你仔细盯着树底下，石缝下面，一颗小草也不放过。","你找到一株奇怪的药草，努力辨别它的品种。","你爬到树上仔细寻找有没有需要的药材。"]',
    });
}

function on_check(me) {
    var exp = WORLD.DATA.exp100(me)
        + WORLD.DATA.query_temp("caiyao_exp", 0) * 100
        + me.query_prop('caiyao_exp') * 100;
    let grade = me.query_prop('caiyao1');
    let str = "有概率采集到橙色及以下药材";
    let rare = rare_chance(me);
    if (rare > 0) str += "，有" + Math.round(rare * 100) + "%几率多找一株、留下品质更好的那株";
    me.send(`你正在采药，当前效率${grade}，每10秒获得${exp}经验，${exp}潜能，${str}。`);
}

// 采药效率 caiyao1（药王神篇、神农百草经等）：每次采药有一定几率再找一株，留下品质高的那株。
// 几率 = 效率 / (效率 + 100)：药篓类工具 1~30 约 1%~23%，武神药王神篇 200 约 67%，武神神农百草经 5000 约 98%。
function rare_chance(me) {
    let v = me.query_prop('caiyao1');
    return v > 0 ? v / (v + 100) : 0;
}

function do_cai(me) {
    let lv = me.random(18);
    if (Math.random() < rare_chance(me)) lv = Math.max(lv, me.random(18));
    let obj = me.add_obj('res/cao#' + lv);
    if (obj) {
        me.send_room("<hig>$N采到一株" + obj.color_name + "。</hig>");
    }
    let exp = WORLD.DATA.exp100(me)
        + WORLD.DATA.query_temp("caiyao_exp", 0) * 100;
    let pot = exp + me.query_prop('ly_qn') * 100;
    me.add_exp(exp, pot, 0);
}