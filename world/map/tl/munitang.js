this.inherits(ROOM);
this.name = "牟尼堂";
this.desc = "这是高僧们的静修之处。整堂全以松木制成，板门木柱，木料均不去皮，天然质朴，和一路行来金碧辉煌的殿堂截然不同。室中五个和尚分坐五个蒲团。四僧朝外，东首一个和尚面朝里壁一动不动。　";
this.exits = {
    "north": "tl/banruo",
};
this.set_npc(["tl/kurongdashi", 1], ["tl/duanyu", 1]);
// 「抓住段誉」与段誉身上的「背负段誉」走同一套规则（world/area/fb1/fb28.js 的 tl_carry）。
// 原先这里另有一套实现：额外刷 3 个和尚、用另一个标记，与和尚/枯荣的判定对不上。
this.add_action("zhua", "抓住段誉", function (me) {
    if (!me.is_player) return true;
    if (this.parent && this.parent.tl_carry) this.parent.tl_carry(me);
    return true;
});

