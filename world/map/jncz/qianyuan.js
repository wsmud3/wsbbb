this.inherits(ROOM);
this.name = "前院";
this.desc = "穿过天王殿，一片宽阔的前院映入眼帘。青石板铺地，两排千年古柏参天，树影婆娑。院中弥漫着檀香，远处钟声悠扬。北面是宏伟的大雄宝殿，西面是护法僧修行的禅院，东面通往藏经阁。";
this.exits = { "south": "jncz/fangshengchi", "north": "jncz/daxiongbaodian", "east": "jncz/cangjingge", "west": "jncz/chanyuan" };
this.set_npc([]);
this.ambush_triggered = false;
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (this.ambush_triggered) return;
    if (me.query_status("heshibi_carry") && me.query_temp("jncz_stolen")) {
        this.ambush_triggered = true;
        me.notify('<red>突然，三名护宝僧从暗处冲出，向你扑来！「交出和氏璧！」</red>');
        for (var i = 0; i < 3; i++) {
            var monk = NPC.CREATE("jncz/hubaoseng", this);
            if (monk) monk.do_kill(me);
        }
    }
};
