this.inherits(ROOM);
this.name = "小洞";
this.desc = "此处为一小山洞，中间透入一线天光，宛如天窗一般。这里陶碗、土灶、石床、厨具等一应俱全。";
this.exits = {
    "east": "bh/xiongdong",
};
this.set_npc(["bh/xiexun", 1]);

// 攻略：
//   屠龙刀仅困难掉落——谢逊基础掉落表里没有，困难副本开启时加进本实例（扫荡掉落见 bh/hard_drops）。
//   困难：打谢逊的时候张五侠帮忙；谢逊会燃木刀法，一刀就能回武庙。
this.on_set_difficulty = function (type) {
    var xx = this.find_obj_bypath("bh/xiexun");
    if (type !== 1) return;
    if (xx) {
        xx.bh_hard = 1;
        xx.drop_list = (xx.drop_list || []).concat([xx.BH_HARD_DROP]);
        xx.skill_map(["ranmudao2", 2680, "blade"]);
        xx.init_skill();
        xx.recount();
        xx.hp = xx.max_hp;
    }
    if (!this.find_obj_bypath("bh/zhangcuishan")) NPC.CREATE("bh/zhangcuishan", this);
};
