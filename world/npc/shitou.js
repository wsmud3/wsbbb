this.inherits(NPC);
this.set({
    name: "石头人",
    desc: "卖孩子的石头人",
    gender: 1,
    age: 22,
    per: this.random(20) + 10,
    mp: 150,
    max_mp: 150,
    hp: 150,
    max_hp: 150,
});
this.on_enter = function (me) {
    var str = "";
    switch (this.random(2)) {
        case 0:
            str = "石头人笑咪咪地说道：这位" + me.call()
                + "，看看这美味的石头吧。";
            break;
        case 1:
    }
    me.notify(str);
}
this.set_goods("st/xuanjing", "st/st_red", "st/st_red#1", "st/st_red#2", "st/st_red#3","st/st_red#4", "st/st_gre", "st/st_gre#1", "st/st_gre#2", "st/st_gre#3","st/st_gre#4","st/st_blu","st/st_blu#1","st/st_blu#2","st/st_blu#3","st/st_blu#4","st/st_yel","st/st_yel#1","st/st_yel#2","st/st_yel#3","st/st_yel#4","st/st_gj","st/st_gj#6","st/st_gj#2","st/st_gj#3","st/st_gj#4","st/st_gj#5","st/st_mz","st/st_mz#6","st/st_mz#2","st/st_mz#3","st/st_mz#4","st/st_mz#5","st/st_ds","st/st_ds#6","st/st_ds#2","st/st_ds#3","st/st_ds#4","st/st_ds#5","st/st_fy","st/st_fy#6","st/st_fy#2","st/st_fy#3","st/st_fy#4","st/st_fy#5",);


this.on_leave = function (me, dir) {

}