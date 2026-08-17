this.inherits(OBJ);
this.unit = "株";
this.name = "忘忧草";
this.value = 5000;
this.grade = 4;
this.desc = "传说中能令人忘记一切忧愁的仙草。然而世间忧愁，唯有死后方能真正忘却……";
this.action_msg = "吃";
this.distime = 60000;
this.allow_fight = true;
this.transable = true;
this.on_use = function (me) {
    me.send_room("<hiy>$N吞下一株忘忧草，脸上泛起一丝释然的微笑，缓缓倒了下去。</hiy>");
    me.notify("<hiy>你吞下忘忧草，只觉得世间一切烦恼忧愁都离你远去，眼前一黑……</hiy>");
    me.add_hp(-me.max_hp);
    me.die();
}