this.inherits(ROOM);
this.name = "观云台";
this.desc = "一方突出崖外的石台，脚下便是翻涌的云海。晴日里，云海偶尔裂开一线，可以望见山中各处的草庐檐角、禅舍塔尖与袅袅炊烟，转眼又被云雾吞没，仿佛从未出现过。";
this.exits = {"southwest": "jindi/shiping"};
this.no_fight = true;

this.add_action("look_clouds", "眺望云海", function (me) {
    me.notify("你凭栏远眺。云海翻涌之间，西北崖边有草庐一角，北面松林中露出禅舍飞檐，西面雪峰下一座玉阁泛着冷光，东面竹林后一缕炊烟袅袅……\n只在此山中，云深不知处。");
});
