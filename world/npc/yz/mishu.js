this.inherits(NPC);
this.set({
    name: "秘籍商人",
    desc: "一位神秘的书商，据说他收藏了天下所有非门派的武学秘籍。",
    title: "书商",
    gender: 1,
    age: 50,
    per: 22,
    mp: 15000, max_mp: 15000,
    hp: 15000, max_hp: 15000,
});

this.add_action("list", "购买秘籍", function (me) {
    me.do_command("list", this.id);
});

this.on_kill = function (me) {
    return me.notify_fail("秘籍商人微微一笑：\"我只是个卖书的，何必打打杀杀呢？\"");
};

this.on_die = function () {
    return false;
};

this._goodsCache = null;

this.on_sell = function (me) {
    if (this._goodsCache) return this._goodsCache;

    this._goodsCache = [];
    for (var skillId in WORLD.SKILLS) {
        var skill = WORLD.SKILLS[skillId];
        if (!skill || !skill.name) continue;
        if (skill.type !== SKILL_TYPES.SKILL) continue;
        if (skill.family && skill.family != FAMILIES.NONE) continue;
        if (skill.is_custom) continue;
        if (skill.family === FAMILIES.MONSTER) continue;

        var book = OBJ.CREATE("book/book#" + skillId);
        if (!book) continue;
        book.count = 9999;   // 几乎无限
        book.value = 10000;  // 1黄金
        this._goodsCache.push(book);
    }
    return this._goodsCache;
};
