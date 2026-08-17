this.inherits(ROOM);
this.name = "死关密室";
this.desc = "一间完全封闭的石室，四壁漆黑如墨，没有任何门窗的痕迹。地面上用朱砂画着巨大的太极图，阴阳鱼缓缓转动，散发着古老而神秘的气息。室中央放着一个蒲团，除此之外再无他物。空气沉重而寂静，仿佛连时间都在此停滞——这便是慈航剑典最高境界「死关」的闭关之地。\n\n相传进入死关者，需经历真正的死亡体验。能从此地走出者，才算真正参透了生死。";
this.exits = { "south": "cihang/tingyuting" };
this.set_npc([]);
this.siguan_active = false;

this.add_action("begin_siguan", "盘膝入定", function (me) {
    if (me.query_temp("cihang_siguan")) {
        return me.notify("你已通过死关试炼，石室恢复了宁静。");
    }
    if (!me.query_temp("cihang_siguan_ready")) {
        return me.notify("你尚未得到靳冰云的指引，不可贸然尝试死关。");
    }
    if (this.siguan_active) {
        return me.notify("死关试炼已在进行中。");
    }
    if (me.is_fighting()) {
        return me.notify("你正身处战斗中，无法入定。");
    }

    this.siguan_active = true;
    me.notify("<hir>你盘膝坐于太极图中央，闭上了双眼。</hir>");
    me.notify("<hiz>渐渐地，你的心跳越来越慢，呼吸越来越轻……世界开始变得模糊。</hiz>");
    me.notify("<hiy>死关试炼开始了——你将经历七苦的最终考验：死亡的寂静。</hiy>");

    var drainCount = 0;
    var self = this;
    var drainTimer = setInterval(function () {
        if (!me || me.hp <= 0 || me.query_temp("cihang_siguan")) {
            clearInterval(drainTimer);
            if (me && me.hp <= 0) {
                me.hp = 1;
                self.siguan_active = false;
                me.notify("<hir>你在死关中失去了意识……试炼失败。请养好伤势后再来。</hir>");
            }
            return;
        }
        drainCount++;
        var pct = 5 + drainCount * 4;
        if (pct > 40) pct = 40;
        var dmg = Math.floor(me.max_hp * pct / 100);
        var newHp = me.hp - dmg;
        if (newHp < 1) newHp = 1;

        me.hp = newHp;
        me.notify("<red>死关之力侵蚀着你……气血持续流逝。（-" + pct + "%）</red>");

        if (drainCount === 1) {
            me.notify("<hiz>你的意识开始回溯——你看到了自己初入江湖的那一天。</hiz>");
        } else if (drainCount === 3) {
            me.notify("<hiz>你看到了此生最激烈的一战，每一招每一式都在眼前重演。</hiz>");
        } else if (drainCount === 5) {
            me.notify("<hiz>你看到了所有你失去的、放弃的、错过的人与事……爱别离、求不得。</hiz>");
        } else if (drainCount === 7) {
            me.notify("<hiz>最终，一切归于寂静。你听到了最后一个心跳声——然后，世界空了。</hiz>");
        }

        if (newHp <= 1) {
            clearInterval(drainTimer);
            me.notify("<hio>在死亡的绝对寂静中，你感受到了一线微光——那是生的萌芽。</hio>");
            me.notify("<hig>「死之极处便是生」——你终于领悟了这句话的真谛！</hig>");
            me.notify("<hiy>你睁开了双眼！死关试炼通过！</hiy>");

            me.hp = me.max_hp;
            me.mp = me.max_mp;
            me.set_temp("cihang_siguan", 1);
            self.siguan_active = false;

            me.notify("<hio>你获得了死关印记。与生门印记结合，便是通往武神境界的生死门钥匙。</hio>");
        }
    }, 5000);

    return true;
});
