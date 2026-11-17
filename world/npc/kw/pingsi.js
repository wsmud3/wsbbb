this.inherits(NPC);
this.set({
    name: "平四",
    desc: "一个老实巴交的中年汉子，脸上满是风霜之色。他是胡家的老仆，忠心耿耿，多年来一直在寻找胡家后人。",
    title: "胡家忠仆",
    gender: 1,
    age: 45,
    per: 12,
    hp: 5132,
    max_hp: 5132,
    mp: 8000,
    max_mp: 8000,
    score: 0,
    gj: 207,
    fy: 87,
    mz: 156,
    ds: 99,
    zj: 52
});
this.skill_map(
    ["dodge", 300],
    ["parry", 300],
    ["force", 300],
    ["unarmed", 300]
);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 30
});
this.on_enter = function (me) {
    me.notify("平四抬起头看了看你，又低下头去，喃喃自语道：少爷……您到底在哪儿啊……");
};
