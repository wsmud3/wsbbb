this.inherits(NPC);
this.set({
    name: "小青",
    desc: "一位身着青衣的少女，面容姣好，但眼角带着几分毒蛇般的冷意。她是欧阳锋的弟子，精通蛇毒制药之术，可以为武林中人配置蛇血药剂。",
    title: "蛇毒药师",
    gender: 2,
    age: 18,
    per: 24,
    hp: 60000,
    max_hp: 60000,
    mp: 15000,
    max_mp: 15000,
    score: 40,
    gj: 3000,
    fy: 1700,
    mz: 2400,
    ds: 1360,
    zj: 900
});
this.skill_map(
    ["dodge", 420],
    ["parry", 400],
    ["force", 420],
    ["unarmed", 420],
    ["chanchubufa", 420, "dodge"]
);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
});
