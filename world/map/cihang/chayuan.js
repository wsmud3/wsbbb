this.inherits(ROOM);
this.name = "茶园";
this.desc = "这是一处面积广阔的茶园，里面载种着绿油油漫山遍野的茶树，各种树木混合着茶香清丽而整洁，看来平时打理的很勤快，其中有道小路蔓延而去，不知去往何处";
this.exits = {
    "enter": "cihang/shiku",
    "north": "cihang/xiaolu3",
};

// [mech] 茶园深处的小径通石窟（攻略：进入桃源小径，进入石窟，领悟）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("cihang_lanjiang_done") && !me.query_temp("cihang_done")) {
        me.notify("<hiy>茶园尽头一条小径隐入茶树深处，曲径通幽，似通往桃源——尽头便是那处石窟。</hiy>");
    }
};
