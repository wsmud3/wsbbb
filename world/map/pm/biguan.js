this.inherits(ROOM);
this.name = "闭关室";
this.desc = "这是天山童姥闭关修练的地方，这里设施简陋，是闻名天下的天山童姥闭关的地方。就算是她的亲传弟子，也不要轻易打搅。";
this.exits = {
    "south": "pm/xiaodao",
};
this.set_npc([]);

// [mech] 背着童姥、且李秋水已在童姥面前伏诛 → 送达 +100 分（规则见 world/area/fb1/fb26.js pm_deliver）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.parent && this.parent.pm_deliver) this.parent.pm_deliver(this, me);
};
