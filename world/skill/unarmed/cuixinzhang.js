this.inherits(SKILL);
this.name = "催心掌";
this.id = "cuixinzhang";
this.grade = 3;
this.is_public = true;
this.attack_actions = [
    "$N运起催心掌，一掌拍出，阴寒掌力直透$n的心脉",
    "$N催动催心掌力，掌风如刀，劈向$n的$l",
    "$N脚踏奇步，催心掌力吞吐不定，忽地一掌印向$n的胸腹",
    "$N暗运催心掌内劲，掌法阴柔狠辣，直取$n的$l",
    "$N双掌齐出，催心掌力排山倒海般涌向$n",
    "$N翻掌运劲，催心掌阴劲暗吐，无声无息地袭向$n"
];
this.desc = "青城派绝学，掌力阴毒，中者表面无伤而内脏已碎，歹毒无比";
this.can_enables = ["unarmed"];
this.learn_condition = {
    max_mp: 3000,
    skill: {
        unarmed: 400
    }
};
this.query_enable_prop = function (lv) {
    return {
        unarmed: {
            gj: lv * 1.8 + 15,
            mz: lv * 1.2 + 15,
            max_hp: parseInt(lv * 2250 / 1000)
        }
    };
}
