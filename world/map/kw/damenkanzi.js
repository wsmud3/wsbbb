this.inherits(ROOM);
this.name = "大门坎子";
this.desc = "这里是沿江向东的古道，多为进山采参的参客所走，因此也称“参路”。前面一座小山截断去路，因其行似门坎，且为东去采参的第一道屏障，故被称为大门坎子。西面是宽阔的松花江。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = { "west": "kw/songhuajiang", "northeast": "kw/ermenkanzi" };

// 原版机制：西行渡江需付船家 1 两黄金（10000 money），且船夫不可杀。
this.on_leave = function (me, dir) {
    // 只在"从大门坎子往西"时检查船资
    if (dir !== "west") return true;
    if (me.query_temp("kw_ferry_ok")) { me.remove_temp("kw_ferry_ok"); return true; }
    me.send("船夫对你说道：坐船到江对面1两黄金。");
    me.send_commands("kw_ferry", "交钱坐船");
    return false;
};

this.add_action("kw_ferry", null, function (me) {
    var money = me.query_cash ? me.query_cash() : (me.money || 0);
    if (money < 10000) return me.notify("你的银两不够。");
    me.add_money(-10000);
    me.set_temp("kw_ferry_ok", 1, 10000);
    me.send_room("$N付了船资，船夫撑船将$N送到江对岸。");
    me.moveto("kw/songhuajiang");
});
