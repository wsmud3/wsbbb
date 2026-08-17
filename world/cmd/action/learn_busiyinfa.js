this.inherits(COMMAND);
this.command = "learn_busiyinfa";
this.allow_busy = true;
this.enter = function(me, npcId) {
    // 从NPC交互触发时，npcId是NPC的ID
    var sx = null;
    if (npcId) {
        sx = me.environment.find_obj(npcId);
    }
    if (!sx) {
        // fallback: 搜索房间中的石之轩
        sx = me.environment.find_obj_bypath('jncz/shizhixuan');
    }
    if (!sx) {
        return me.notify("石之轩残魂不在这里。");
    }
    if (me.query_temp("jncz_xiewang")) {
        return me.notify("你已领悟不死印法的精髓，获得了「邪王」称号。");
    }
    if (!me.query_status("heshibi_carry")) {
        return me.notify("石之轩残魂轻蔑地看着你：「没有和氏璧的力量，你也配学我的不死印法？」");
    }
    me.set_temp("jncz_xiewang", 1);
    // 传授不死印法
    me.set_skill("busiyinfa", 100);
    me.notify('<hig>石之轩残魂将不死印法的口诀传入你的脑海！你学会了不死印法！</hig>');
    if (!me.titles) me.titles = [];
    var hasTitle = false;
    for (var i = 0; i < me.titles.length; i++) {
        if (me.titles[i].title === '邪王') { hasTitle = true; break; }
    }
    if (!hasTitle) {
        me.add_title('邪王', 'fb');
        me.notify('<hig>你获得了新称号：「邪王」！可在称号界面中查看和佩戴。</hig>');
    }
    // 完成邪王线，移除和氏璧buff
    me.remove_status("heshibi_carry");
    me.remove_temp("jncz_stolen");
    me.add_fbscore(310);
    // 中和所有存活NPC分数，确保100%完成度（不触发die，三条线独立）
    var area = me.environment.parent;
    if (area && area.rooms) {
        var tid = me.query_teamid();
        for (var ri = 0; ri < area.rooms.length; ri++) {
            var cp = area.rooms[ri].query_copy(tid);
            if (!cp) continue;
            for (var ci = 0; ci < cp.items.length; ci++) {
                var it = cp.items[ci];
                if (it && !it.is_player && it.hp > 0 && it.score > 0) {
                    it.score = 0;
                }
            }
        }
    }
    me.notify('<hiy>和氏璧的力量已被不死印法吸收，化为己用。你感觉浑身一轻。</hiy>');
    me.notify('<hio>邪王线完成！净念禅宗试炼达成！</hio>');
};
