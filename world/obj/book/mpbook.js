
this.inherits(OBJ);
this.set({
    unit: "份",
    name: "门派进阶残页",
    desc: "一张记载了门派技能进阶之法的残页，仅可用于门派技能的进阶。",
    value: 10000,
    grade: 4,
    combined: true
});
this.otype = 1;
this.lingwu = function (me, p) {
    me.notify("请使用 <hic>lingwu <技能ID></hic> 来为门派技能进行门派进阶，例如：lingwu wuhuduanmendao");
};
