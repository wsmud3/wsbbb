this.inherits(ROOM);
this.name = "藕香榭";
this.desc = "这是间厨房， 浓郁的饭菜香味一个劲地钻进你的鼻子， 你仿佛听到“咕咕”的响声，环顾四周不知来源。 原来是你的肚子作怪。";
this.exits = {
    "west": "pm/huayuan"
};
this.set_npc(["pm/lanjian", 1]);
