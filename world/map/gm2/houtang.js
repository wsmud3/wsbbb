this.inherits(ROOM);
this.name = "后堂";
this.desc = "堂上也是空荡荡的没什么摆设，正前方写着一行大字，东西两壁都挂着一幅画。西首 的画像是两个女郎，正是古墓派的师尊林朝英和师祖婆婆的肖像，东侧画像中却是一个道士。 ";
this.exits = {
    "west": "gm2/qianting",
    "north": "gm2/woshi",
    "east": "gm2/qinshi",
};
this.set_npc(["gm2/auto_3", 1], ["gm2/auto_1", 1]);
