this.inherits(NPC);
this.name = "师妃暄";
this.desc = "一位白衣如雪的女子，气质清冷如霜，眉宇间带着淡淡的出尘之意。她手持一柄古朴长剑，正是慈航静斋当代最杰出的传人——师妃暄。传闻其剑法已得慈航剑典真传，剑心通明之境已臻化境。";
this.title = "<hiw>慈航传人</hiw>";
this.gender = 0;
this.age = 22;
this.per = 90;
this.no_refresh = true;
this.score = 0;
this.hp = 5000000; this.max_hp = 5000000;
this.mp = 20000000; this.max_mp = 20000000;

this.add_action("ask_route", "询问来意", function (me) {
    if (me.query_temp("cihang_route")) {
        return me.notify("师妃暄微微颔首：'既已选定道路，便去七重门吧。'");
    }
    me.notify("<hiw>师妃暄白衣飘飘，长剑微倾：'能到此处者，皆非等闲之辈。'</hiw>");
    me.notify("<hiy>她指向北方的竹林：'斋主在竹林中。穿过竹林便是七重门——那是你的必经之路。'</hiy>");
});

this.add_action("ask_cihang", "询问慈航剑典", function (me) {
    me.notify("<hiw>师妃暄神色一凝：'慈航剑典乃本派至高绝学，分四卷——心有灵犀、剑心通明、死关、最终章。'</hiw>");
    me.notify("<hiy>她轻叹一声：'能练至死关者，唯有靳冰云师叔一人而已。她如今在听雨亭闭关，你若有机缘，或可一见。'</hiy>");
});
