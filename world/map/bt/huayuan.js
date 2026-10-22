this.inherits(ROOM);
this.name = "花园";
this.desc = "这是个美丽的大花园，园子里面种着鲜艳的红玫瑰。白衣少女常来这里嬉戏。沿着弯弯曲曲的花径，可以通到山庄的许多地方，北面可见巍巍大厅。";
this.exits = {
    "north": "bt/dating",
    "south": "bt/menlang",
};

// [mech] 花园：白衣少女（攻略：可在花园的白衣少女处刷五神剑所需 buff，再回来击杀欧阳锋）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.find_obj_bypath("bt/baiyishaonv")) return;
    NPC.CREATE("bt/baiyishaonv", this);
    this.refresh(me);
    me.notify("<hiw>白衣少女立在花径尽头，冷眼看着你：「白驼山不是你能撒野的地方。」</hiw>");
    me.notify("<hiy>（她并不主动出手——若要刷五神剑所需的 buff，可与她比试）</hiy>");
};
