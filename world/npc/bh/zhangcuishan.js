this.inherits(NPC);
this.set({
    name: "张翠山",
    desc: "武当张五侠，手持真武剑，面容坚毅。",
    gender: 1,
    age: 35,
    per: 15,
    hp: 444400,
    max_hp: 444400,
    mp: 85000,
    max_mp: 85000,
    score: 65,
    gj: 30580,
    fy: 26183,
    mz: 43340,
    ds: 19228,
    zj: 1440
});
this.skill_map(
    ["dodge", 2081],
    ["parry", 2109],
    ["force", 2081],
    ["sword", 2081],
    ["taijijian", 2081, "sword"]);
