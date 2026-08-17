this.inherits(ROOM);
this.name = "真武殿";
this.desc = "武当后山的真武大殿，供奉着真武大帝的神像。殿中香烟缭绕，气氛庄严。大殿后方的石壁上浮现着一个巨大的太极图案，隐隐旋转，散发出柔和的阴阳之力。这便是真武秘境的入口——唯有参透太极奥义的武当弟子，方能踏入。";
this.exits = { "north": "zw/baguazhen" };
this.no_fight = true;

this.add_action("enter_secret", "踏入太极图", function (me) {
    me.notify("\n<hig>你一步踏入太极图中。阴阳二气环绕周身，天地倒转——</hig>\n\n眼前景色骤变，你发现自己站在一座由八卦巨石组成的阵法之前。");
});
