this.inherits(ROOM);
this.name = "剑器长廊";
this.desc = "一条由青石砌成的长廊，两侧各有两座石质剑架，一字排开共四座。每座剑架上陈列着一柄剑的青铜复制品，下方刻着独孤求败亲笔所书的铭文。长廊尽头是第五座剑架——空空如也，下方铭文只有简短的四个字：「自此无剑」。";
this.exits = { "south": "jz/waidao2", "north": "jz/lijiange" };
this.no_fight = true;

this.add_action("examine_lijian", "观摩利剑", function (me) {
    me.notify("\n<hig>你走近第一座剑架。</hig>\n\n一柄青光闪闪的利剑横放架上，剑身薄如蝉翼，刃口寒芒逼人。\n下方铭文：「凌厉刚猛，无坚不摧。弱冠前以之与河朔群雄争锋。」\n\n这柄剑代表的是纯粹的速度与锋锐——以快制胜，以锋破敌。");
});
this.add_action("examine_ruanjian", "观摩软剑", function (me) {
    me.notify("\n<hig>你走近第二座剑架。</hig>\n\n架上陈列的是一柄软剑的复制品——剑身柔软如绸，在无风的廊中竟自行颤动。\n下方铭文：「紫薇软剑，三十岁前所用。误伤义士不祥，乃弃之深谷。」\n\n软剑无常，变化莫测。但要当心——变化太多，反而伤及自身。");
});
this.add_action("examine_zhongjian", "观摩重剑", function (me) {
    me.notify("\n<hig>你走近第三座剑架。</hig>\n\n一柄通体漆黑的玄铁重剑，剑身粗厚无刃，与其说是剑不如说是一块铁尺。\n下方铭文：「玄铁重剑，重剑无锋，大巧不工。四十岁前恃之横行天下。」\n\n不必花巧，不必锋锐。一剑下去，山也劈开。");
});
this.add_action("examine_mujian", "观摩木剑", function (me) {
    me.notify("\n<hig>你走近第四座剑架。</hig>\n\n一柄朽木削成的木剑，剑身满是裂纹，似乎一碰即碎。\n下方铭文：「四十岁后，不滞于物，草木竹石均可为剑。」\n\n当你不再依赖手中之剑时，万物皆可为剑。");
});
this.add_action("examine_wujian", "凝视空剑架", function (me) {
    me.notify("\n<hig>你凝视着第五座空空如也的剑架。</hig>\n\n下方只有四个字：<hic>「自此无剑」</hic>\n\n突然，一道苍老的声音从你的心底升起——\n\n「剑已在心中，何须陈列？」\n\n你猛地回头，长廊中只有你一人。但那声音仍在回荡。");
});
