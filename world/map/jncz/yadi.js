this.inherits(ROOM);
this.name = "崖底";
this.desc = "这里是后山悬崖的底部，四周怪石嶙峋，浓雾弥漫。抬头望去，崖壁如刀削般笔直，高不见顶。一块巨石上刻着两行字：「生门——跳下来者不死，即证菩提。」西面隐约可见一座石窟，散发着霸道的气息。";
this.exits = { "west": "jncz/xiewangshiku" };
this.set_npc([]);
this.add_action("climb", "攀爬上去", function (me) {
    me.notify("<hiy>你沿着崖壁攀爬而上，回到了观音殿。生门试炼已成，菩提在心。</hiy>");
    me.moveto("jncz/guanyindian");
    return true;
});
