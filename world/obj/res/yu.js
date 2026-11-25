
this.inherits(OBJ);
this.set({
    unit: "条",
    name: "鲢鱼",
    desc: "一条活蹦乱跳的鲢鱼",
    value: 100
});
this.transable = true;
this.otype = 3;
this.on_create = function (path, par) {
    if (!par) {
        par = 0;
    } else
    par = par.substr(1);
    var lv = parseInt(par);
    if (!(lv >= 0 && lv < 18)) return;
    this.name = ["鲢鱼", "草鱼", "鲤鱼", "鳊鱼", "鲮鱼", "鲂鱼", "黄颡鱼", "黄金鳉",
        "太湖银鱼", "反天刀", "虹鳟", "孔雀鱼", "罗汉鱼", "银龙鱼", "黑龙鱼", "七星刀鱼",
        "巨骨舌鱼", "帝王老虎魟"][lv];
    this.grade = Math.floor(lv / 3);
    // 药材 / 鱼按品级定价（白 10 / 绿 20 / 蓝 50 / 黄 100 / 紫 200 / 橙 500 / 红 1000），原价过高会让采药、钓鱼卖钱冲垮黄金产出
    this.value = [10, 20, 50, 100, 200, 500, 1000][this.grade];
    this.desc = "一条活蹦乱跳的" + this.name;
}
//100, 1000, 5000, 10000, 50000, 100000, 680000][this.grade];
//100 200 300 500 1000
