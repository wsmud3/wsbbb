this.inherits(ROOM);
this.name = "第一百层"
this.desc = "这里是武道塔的顶层，四壁镶嵌着无数闪烁着微光的宝石，脚下是流动的云雾，仿佛置身于天地之巅。传说中的武道守护者就镇守于此。";
this.exits = { "down": "wudao/ding" };
this.max_item_count = 1;

this.on_before_enter = function (me) {
    var npc = NPC.CLONE("pub/wudao_boss100");
    npc.init_from(me);
    npc.die = this.on_die;
    npc.environment = this;
    this.items.length = 0;
    this.items.push(npc);
    this.refresh();
}

this.on_enter = function (me) {
    me.die = this.on_die1;
    let npc = this.items[0];
    if (npc && !npc.is_player) {
        me.send('<ord>' + npc.name + '：这位' + me.call() + '，你能来到这里实属不易。来吧，让我看看你的武道！</ord>');
        npc.do_kill(me);
    }
}

this.on_die1 = function (me) {
    if (this.on_die && this.on_die(me) == false) {
        this.hp = 1;
        return false;
    }
    this.hp = this.max_hp;
    this.mp = this.max_mp;
    var npc = this.environment.find_by_path("pub/wudao_boss100");
    npc && npc.destroy();
    this.moveto('wudao/ding');
    this.notify("<hir>你的挑战失败了。</hir>");
}

this.on_die = function (me) {
    me.notify("<hig>恭喜你战胜了武道守护者，通过了武道塔第一百层！</hig>");

    USERTASK.GET('wudao').on_finish(me);
    me.set_temp("wd100", 1);
    me.notify("<ord>你获得了称号：武道守护者！</ord>");

    const count = me.add_temp("wd_level", 1);
    me.notify("<hic>你的武道塔挑战纪录已更新为" + count + "层。</hic>");
    me.check_unlock_sect_jds();
    const max = WORLD.DATA.query_temp("wudao_max", 0);
    if (count > max) {
        WORLD.DATA.set_temp("wudao_max", count);
        WORLD.DATA.set_temp("wudao_max_user", me.name);
        COMMAND.DO("rumor", "听说" + me.name + "通过了武道塔第一百层，获得了武道守护者的称号！");
    }
    me.environment.item_changed(this, false, this.name + "倒下了。");
}

this.on_leave = function (me, dir) {
    var npc = this.find_by_path("pub/wudao_boss100");
    if (dir == "up") {
        if (npc) {
            return me.notify_fail(npc.name + "对你说道：打败我，你就可以离开。");
        }
        me.moveto('wudao/ding');
        return false;
    } else {
        if (npc) this.items.remove(npc);
        me.die = USER.prototype.die;
    }
}
