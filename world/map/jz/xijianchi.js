this.inherits(ROOM);
this.name = "洗剑池";
this.desc = "一片小小的地下湖泊，湖水清澈见底，湖底铺着一层亮晶晶的矿物质，散发出柔和的暖意。这应该是山腹中的天然温泉，大概是独孤求败当年洗剑休憩之处。湖边散落着一些生活痕迹——一个石枕、一方石桌、几卷早已化为齑粉的帛书残迹。";
this.exits = { "south": "jz/xuantie", "north": "jz/mujiange" };
this.no_fight = true;

this.add_action("rest", "入温泉调息", function (me) {
    if (me.query_temp("jz_rested")) return me.notify("你已经在此调息过了，温泉水虽好，多泡无益。");
    me.set_temp("jz_rested", 1);
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.notify("<hig>你踏入温泉，暖意浸透四肢百骸。剑冢中积累的疲惫一扫而空，全身状态恢复至巅峰。</hig>");
});
this.add_action("examine_table", "查看石桌遗迹", function (me) {
    me.notify("\n<hig>你拂去石桌上的灰尘。</hig>\n\n石桌上刻着独孤求败的随笔，笔迹从凌厉渐次变得平和：\n\n「今日斩燕十三剑，剑剑不同。问世间，谁能懂此寂寞？」\n「今日无剑，以手为剑破二十八人。剑已在胸中，何须再持？」\n「……我似乎明白了。无剑的真意，不是手中无剑，而是——」\n\n最后一行字没有写完，只留下一个深深的指洞。");
});
