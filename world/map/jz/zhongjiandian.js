this.inherits(ROOM);
this.name = "重剑殿";
this.desc = "第三座剑冢。一柄通体漆黑的玄铁重剑直直插入巨石之中，剑身粗厚无刃，与其说是剑不如说是一块巨大的铁尺。重剑散发出沉重的压迫感，空气都为之凝滞。重剑之后，一道巨大的石门封住去路，门上有一个血红色的掌印凹槽——需以鲜血为引，方能开启。";
this.exits = { "south": "jz/zhongjianqian" };

this.on_create = function () {
    this._sacrificed = 0;
};

this.add_action("sacrifice_30", "献祭三成气血", function (me) {
    if (this._sacrificed) return me.notify("你已经献祭过了。");
    var cost = Math.floor(me.max_hp * 0.3);
    me.damage2(cost);
    this._sacrificed = 1;
    me.notify("<hig>你将手掌按在血印上，鲜血涌入凹槽。石门缓缓开启——但重剑剑灵的力量似乎并未减弱多少。</hig>");
    this.exits = { "south": "jz/zhongjianqian", "north": "jz/xuantie" };
    this.set_npc("jz/zhongjian_ling", 1);
});
this.add_action("sacrifice_50", "献祭五成气血", function (me) {
    if (this._sacrificed) return me.notify("你已经献祭过了。");
    var cost = Math.floor(me.max_hp * 0.5);
    me.damage2(cost);
    this._sacrificed = 2;
    me.notify("<hig>大量鲜血涌入凹槽，石门轰然大开！重剑剑灵似乎对你的决意产生了一丝敬意。</hig>");
    this.exits = { "south": "jz/zhongjianqian", "north": "jz/xuantie" };
    this.set_npc("jz/zhongjian_ling_weak", 1);
});
this.add_action("sacrifice_70", "献祭七成气血", function (me) {
    if (this._sacrificed) return me.notify("你已经献祭过了。");
    var cost = Math.floor(me.max_hp * 0.7);
    me.damage2(cost);
    this._sacrificed = 3;
    me.notify("<hig>你将七成气血灌入石门，门扉轰然洞开，整个大殿都在震颤！重剑剑灵认可了你的决心——如此决绝之人，方配握此重剑。</hig>");
    this.exits = { "south": "jz/zhongjianqian", "north": "jz/xuantie" };
    this.set_npc("jz/zhongjian_ling_weakest", 1);
});
