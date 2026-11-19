this.inherits(ROOM);
this.name = "木剑阁";
this.desc = "第四座剑冢。出乎意料地简陋——石台上只放着一柄朽木削成的木剑，剑身满是裂纹，似乎一碰即碎。然而当你靠近时，腰间的兵刃竟自行颤抖起来——不是恐惧，而是共鸣。木剑前方，一道透明的人影盘膝而坐，淡淡道：「放下你的剑。在这里，它只会成为你的束缚。」";
this.exits = { "south": "jz/xijianchi", "north": "jz/wujianshi" };
this.no_fight = true;

// 机关【木剑守拙】：须卸下兵刃，空手盘坐于木剑前。手持兵刃求见会被剑意反噬。
var PZ_KEY = "jz", PZ_ID = 4;

this.add_action("jz_sit", "盘坐于木剑前", function (me) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.puzzle_solved(me, data, PZ_ID)) return me.notify("人影朝你微微颔首，不再多言。");
    var weapon = me.query_weapon && me.query_weapon();
    if (weapon && weapon.weapon_type !== WEAPON_TYPE.NONE) {
        me.damage2(Math.floor(me.max_hp * 0.05));
        return me.notify("<hir>你刚一坐下，手中兵器便发出尖锐的哀鸣——剑意反噬而来！</hir>人影摇头：「你还握着它。」");
    }
    me.notify("<hig>你空着双手在木剑前坐下。良久，人影缓缓睁眼：「不滞于物，草木竹石，均可为剑。去吧。」</hig>");
    WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID);
});

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
