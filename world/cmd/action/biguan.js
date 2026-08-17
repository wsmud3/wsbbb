this.inherits(COMMAND);
this.command = "biguan";
this.allow_fight = false;

const TICKS_PER_HOUR = 360; // rate:2 = 每10秒1跳, 360跳=1小时

this.enter = function (me) {
    if (me.level < 5) return me.notify("<red>只有武帝和武神级别的武者才能闭死关。</red>");
    if (me.is_fighting()) return me.notify("战斗中打坐，你找死吗？");
    if (me.state) {
        if (me.state.id === "biguan") {
            me.notify("<hiy>你运功完毕，从闭死关中醒来。</hiy>");
            me.send_message(me.name + "从闭死关中醒来。");
            me.set_state(null, false);
            return true;
        }
        return me.notify("你正在" + me.state.title + "，没有时间闭关。");
    }

    me.set_temp("biguan_ticks", me.query_temp("biguan_ticks", 0) || 0);
    me.set_temp("biguan_books", me.query_temp("biguan_books", 0) || 0);
    me.notify("<hir>你盘膝坐下，闭目凝神，进入闭死关状态。</hir>");
    me.send_message(me.name + "盘膝坐下，开始闭关修炼。");
    me.set_state({
        id: "biguan",
        cmd: "biguan",
        title: "闭关修炼",
        rate: 2,
        on_enter: do_biguan,
        on_check: on_check,
        stime: Date.now(),
        desc: '[]',
        no_move: "闭关时要专心，小心走火入魔。",
        on_stop: function (me, isauto) {
            if (isauto) {
                me.notify("<hiy>你因故中断了闭关修炼。</hiy>");
            } else {
                me.notify("<hiy>你运功完毕，从闭死关中醒来。</hiy>");
            }
            me.send_message(me.name + "从闭死关中醒来。");
            if (isauto && me.query_setting('auto_work')) {
                return WORLD.check_user_next(me);
            }
        }
    });
    return true;
};

function do_biguan(me) {
    // 武帝(level 5): 100经验 200潜能; 武神(level 6+): 200经验 400潜能
    if (me.level === 5) {
        me.add_exp(100, 200, 0);
    } else {
        me.add_exp(200, 400, 0);
    }
    var ticks = me.add_temp("biguan_ticks", 1);
    var totalBooks = Math.floor(ticks / (TICKS_PER_HOUR * 10));
    var bookCount = me.query_temp("biguan_books", 0);
    if (totalBooks > bookCount) {
        me.set_temp("biguan_books", totalBooks);
        var book = me.add_obj("book/wudao");
        if (book) {
            me.notify("<hig>闭关已满" + (totalBooks * 10) + "小时，你领悟了一本武林秘辛——《武道》！</hig>");
            me.send_message(me.name + "在闭死关中散发出一阵金光，似乎有所领悟！");
        }
    }
}

function on_check(me) {
    var ticks = me.query_temp("biguan_ticks", 0);
    var bookCount = me.query_temp("biguan_books", 0);
    var nextBookAt = (bookCount + 1) * TICKS_PER_HOUR * 10;
    var remaining = nextBookAt - ticks;
    var remainingMin = Math.ceil(remaining / 6); // 每10秒1跳, 6跳=1分钟
    var exp = me.level === 5 ? 100 : 200;
    var pot = me.level === 5 ? 200 : 400;
    return me.send("你正在闭死关，每10秒获得" + exp + "经验、" + pot + "潜能，距离下一本《武道》还需约" + remainingMin + "分钟。已累计闭关" + Math.floor(ticks / TICKS_PER_HOUR) + "小时，获得" + bookCount + "本武道。");
}
