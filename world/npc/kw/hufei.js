this.inherits(NPC);
this.set({
    name: "胡斐",
    desc: "一位英气勃发的年轻刀客，背负一柄单刀，目光如电。他是胡一刀之子，为报父仇隐居于此。",
    title: "<hiy>雪山飞狐</hiy>",
    gender: 1,
    age: 22,
    per: 28,
    hp: 20000,
    max_hp: 20000,
    mp: 8000,
    max_mp: 8000,
    score: 50,
    gj: 900,
    fy: 600,
    mz: 700,
    ds: 500,
    zj: 300
});
this.skill_map(
    ["dodge", 450],
    ["parry", 450],
    ["force", 450],
    ["blade", 500],
    ["unarmed", 400],
    ["hujiadaofa", 450, "blade"],
    ["sixiangbu", 400, "dodge"],
    ["lengyueshengong", 450, "force"]);

this.on_enter = function (me) {
    me.notify("胡斐看了你一眼，沉声道：阁下若是来杀阎基那恶贼的，便请将他头颅带来。我愿以胡家刀法残页相谢。");
    // Exchange: if player has 阎基头颅 (yanji_head), give 胡家刀法残页
	    var head = me.find_obj_bypath("sp/kw/yanjitoulu");
	    if (head) {
	        me.notify("胡斐接过阎基的头颅，脸上露出欣慰的神色：多谢壮士！这残页便赠与你罢。");
	        me.remove_obj(head, 1);
	        var book = OBJ.CREATE("book/bc#hujiadaofa");
	        if (book) me.add_obj(book);
	    }
};
