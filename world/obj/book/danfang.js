// 丹方：book/danfang#<丹方 id>。品级与对应丹药相同，使用后学会这种丹药的炼制方法（不能重复学）。
// 学习条件：炼药术 绿 300 / 蓝 500 / 黄 800 / 紫 1500 / 橙 3000 / 红 4000 级（见 world/lianyao.js）。
this.inherits(OBJ);
this.unit = "张";
this.name = "丹方";
this.desc = "一张残旧的丹方。";
this.value = 0;   // 丹方不可出售（价值 0，商人不收），仍可交易
this.combined = true;
this.transable = true;
this.action_msg = "研读";
this.otype = 1;

this.on_create = function (path, par) {
    var L = WORLD.LIANYAO, rec = par && L ? L.get(par.substr(1)) : null;
    if (!rec) return;
    this.recipe = rec.id;
    this.grade = rec.grade;
    this.name = "丹方·" + rec.name;
    this.desc = "一张" + L.GRADE_TEXT[rec.grade] + "品质的" + rec.name + "丹方，研读后便能炼制" + rec.name + "（" + L.effect_text(rec) + "）。"
        + "\n炼制所需：" + L.material_text(rec) + "\n需要炼药术" + L.learn_level(rec.grade) + "级才能看懂。";
};

this.on_use = function (me) {
    var L = WORLD.LIANYAO;
    if (!L) return me.notify_fail("这张丹方看不懂。");
    var why = L.learn(me, this.recipe);
    if (why) return me.notify_fail(why);
    var rec = L.get(this.recipe);
    me.send_room("$N仔细研读了一张" + this.color_name + "。");
    me.notify("<hig>你学会了炼制" + L.GRADE_TEXT[rec.grade] + rec.name + "，可以到炼药房炼药了。</hig>");
};
