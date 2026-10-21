this.inherits(ROOM);
this.name = "松风观";
this.desc = "松风观是青城派总所，青城派威镇川中，以其人才辈出之故。当今掌门人余沧海道长，虽其貌不扬，身形矮小，却是青城一代宗师。殿中左右分列四大天王，手中分执剑、琵琶、伞、蛇四样法器 ，代表了风调雨顺的凡民宿愿。";
this.exits = {
    "north": "qc/zhongmen",
    "southdown": "qc/shangqing",
};
this.set_npc("qc/yucanghai");    // 余沧海 score60：松风观(掌门)
