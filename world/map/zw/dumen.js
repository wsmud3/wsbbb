this.inherits(ROOM);
this.name = "杜门";
this.desc = "杜门——堵塞不通，阻碍重重。石室中空气凝滞，每一步都如在泥沼中行走。这是对耐心的考验——杜门的意义在于：有些路不通之时，当另寻出路。";
this.exits = { "south": "zw/shangmen", "north": "zw/jingmen" };
this.no_fight = true;

this.add_action("meditate", "运太极心法", function (me) {
    me.notify("<hig>你运转太极心法，以柔克刚，周身的气息重新流通了起来。杜门不再阻碍你——你仿佛感受到了张三丰所说的「后发先至」。</hig>");
});
