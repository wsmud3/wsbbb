this.inherits(ROOM);
this.name = "木剑阁";
this.desc = "第四座剑冢。出乎意料地简陋——石台上只放着一柄朽木削成的木剑，剑身满是裂纹，似乎一碰即碎。然而当你靠近时，腰间的兵刃竟自行颤抖起来——不是恐惧，而是共鸣。木剑前方，一道透明的人影盘膝而坐，淡淡道：「放下你的剑。在这里，它只会成为你的束缚。」";
this.exits = { "south": "jz/xijianchi", "north": "jz/wujianshi" };

this.on_create = function () {
    this._unarmed = false;
};

// 如果玩家装备了武器，每5秒反噬
this.on_heart_beat = function () {
    var me = this.query_player();
    if (!me || this._unarmed) return;
    var weapon = me.query_equiped("weapon");
    if (weapon) {
        me.damage2(Math.floor(me.max_hp * 0.03));
        me.notify("<hir>你手中的兵器发出尖锐的哀鸣——剑意正在反噬！快卸下武器！</hir>");
    } else {
        this._unarmed = true;
        me.notify("<hig>木剑停止了颤动。那道透明的人影缓缓起身，说道：「很好。现在——让我看看你的真本事。」</hig>");
        this.set_npc("jz/mujian_ling", 1);
    }
};

this.add_action("lay_down", "卸下武器", function (me) {
    var weapon = me.query_equiped("weapon");
    if (!weapon) return me.notify("你手中本就没有武器。");
    me.notify("<hig>你将武器收入背包。木剑的颤动平息了——剑冢认可了你的觉悟。</hig>");
});
