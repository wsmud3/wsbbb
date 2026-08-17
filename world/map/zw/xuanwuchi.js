this.inherits(ROOM);
this.name = "玄武池";
this.desc = "一片幽静的池水，池面平滑如镜，没有一丝波澜。池水中游动着真气凝聚成的玄武虚影——龟蛇合体，镇守北方。池边有两道侧门，东为炼丹房，西为藏经密室。继续向北则通往云海崖。";
this.exits = { "south": "zw/zhenwujiantai", "north": "zw/yunhaiya", "east": "zw/liandanfang", "west": "zw/cangjingmishi" };
this.no_fight = true;

this.add_action("rest", "饮玄武池水", function (me) {
    if (me.query_temp("zw_rested")) return me.notify("已经饮过了，池水虽好不可贪杯。");
    me.set_temp("zw_rested", 1);
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.notify("<hig>你捧起一掬池水饮下。一股冰凉清冽的真气涌入四肢百骸，全身状态恢复至巅峰。</hig>");
});
