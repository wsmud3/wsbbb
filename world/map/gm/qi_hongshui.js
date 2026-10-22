this.inherits(ROOM);
this.name = "洪水旗";
this.desc = "这里是明教的洪水旗，旗中教众个个精通水性，且有旗使唐洋所创的毒水阵，令敌人闻风丧胆，屡建奇功。向东就是由洪水旗守护的明教圣地之一碧水寒潭。";
this.exits = {
    "north": "gm/qi_liehuo",
    "east": "gm/shanya",
    "west": "gm/qi_houtu",
};
this.set_npc(["gm/auto_8", 1], ["gm/auto_4", 1]);
