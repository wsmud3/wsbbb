// 参数化真意升级材料：st/zhenyi_hen#<禁地key>_<真意id>
this.inherits(OBJ);
this.set({
    name: "无名悟痕",
    desc: "完成门派真意试炼后凝结的悟道痕迹，可用于提升对应真意。",
    unit: "枚",
    value: 1000,
    combined: true,
    transable: false,
    no_drop: true,
    grade: 3
});
this.otype = 2;

this.on_create = function (path, par) {
    var token = (par || "").replace(/^#/, "").split("_");
    var data = WORLD.ZHENYI && WORLD.ZHENYI.find_by_key(token[0]);
    var intent = data && WORLD.ZHENYI.find_intent(data, parseInt(token[1]));
    if (!intent) return;
    this.name = intent.name + "悟痕";
    this.desc = "【" + intent.trial + "】中凝结的悟道痕迹，只可用于提升【" + intent.name + "】。";
    this.zhenyi_key = token[0];
    this.zhenyi_id = intent.id;
};
