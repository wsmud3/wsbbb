this.inherits(NPC);
this.name = "梵清惠";
this.desc = "慈航静斋当代斋主，风姿绰约，气质超凡脱俗。她目光平静如水，却蕴含着无上剑意。作为慈航剑典的当代守护者，她已守护此地数十载。";
this.title = "<hig>慈航斋主</hig>";
this.gender = 0;
this.age = 38;
this.per = 85;
this.no_refresh = true;
this.score = 0;
this.hp = 10000000; this.max_hp = 10000000;
this.mp = 40000000; this.max_mp = 40000000;

this.set_drop({
	obj: "money/silver",
	min: 5,
	max: 20
},  {
	obj: ["eq/lv5/wushen/feiyi_sword"],
	odds: 2000
});

this.add_action("ask_qichong", "询问七重门", function (me) {
    if (me.query_temp("cihang_route")) {
        return me.notify("梵清惠含笑道：'既已过七重门，便去赴你的约吧。'");
    }
    me.notify("<hig>梵清惠神色宁静：'七重门乃本派前辈所设，以佛门七苦为基——生、老、病、死、爱别离、怨憎会、求不得。'</hig>");
    me.notify("<hiy>她继续道：'穿越七重门者，有两条路可走。其一为：下、下、左、上、左、右、下、下。其二为：下、下、下、右、上、左、右、下。'</hiy>");
    me.notify("<hiw>梵清惠提醒道：'走错一步，便会被罡风逼回入口。心魔之外，迷障自破。'</hiw>");
});

this.add_action("ask_langpang", "询问浪翻云与庞斑", function (me) {
    me.notify("<hig>梵清惠眼中闪过一丝凝重：'浪翻云与庞斑……一者以情入剑，一者以力证魔。二人相争数十年，始终难分胜负。'</hig>");
    me.notify("<hiy>她轻声道：'如今二人在拦江岛约战，却因靳冰云之事陷入僵局。你穿越七重门后，或遇其一。他们各自需要助力——如何选择，全凭机缘。'</hiy>");
});
