this.inherits(ROOM);
this.name = "牟尼堂";
this.desc = "这是高僧们的静修之处。整堂全以松木制成，板门木柱，木料均不去皮，天然质朴，和一路行来金碧辉煌的殿堂截然不同。室中五个和尚分坐五个蒲团。四僧朝外，东首一个和尚面朝里壁一动不动。　";
this.exits = {
    "north": "tl/banruo",
};
this.set_npc(["tl/kurongdashi", 1], ["tl/auto_2", 1]);
