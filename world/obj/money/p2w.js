this.inherits(OBJ);
this.set({
    name: "百亿潜能",
    desc: "使用后获得百亿点潜能",
    unit: "百亿点",
    value: 0,
    grade: 1
});
this.on_use = function (me) {
    me.add_exp(0, 10000000000);
}

// this.unit_name = function (count) {
//     count = count ?? this.count;
//     return UTIL.to_c(count) + "万点<hig>潜能</hig>";
// }
