	this.inherits(NPC);
	this.name = "靳冰云";
	this.desc = "一位白衣如雪的女子，面容清丽绝俗，眉宇间却带着淡淡的哀愁。她静坐于蒲团之上，指尖轻抚琴弦，每一个音符都似在诉说着一段漫长而寂寞的故事。她便是慈航静斋的上代传人——靳冰云。相传她已参透慈航剑典的最高境界「死关」，周身气息与天地交融，似生非生，似死非死。";
	this.title = "<hiw>死关行者</hiw>";
	this.gender = 0;
	this.age = 35;
	this.per = 90;
	this.no_refresh = true;
	this.no_fight = true;
	this.score = 0;
	this.hp = 5000000; this.max_hp = 5000000;
	this.mp = 10000000; this.max_mp = 10000000;

	this.actions = {};
	this.actions["get_yishu"] = {
		name: "接过遗书",
		action: function (me) {
			if (me.query_temp("cihang_yishu")) {
				return me.notify("你已拿到了遗书，快回赏雨亭交给对方吧。");
			}
			if (me.query_temp("cihang_yishu_got")) {
				return me.notify("你已经取得过遗书了。");
			}
			var route = me.query_temp("cihang_route");
			if (!route) {
				return me.notify("靳冰云微微摇头：'你尚未穿越七重门，不知该将此信交给何人。'");
			}
			var targetName = route === "lang" ? "浪翻云" : "庞斑";
			me.notify("<hiw>靳冰云从琴案下取出一封泛黄的信笺，递到你手中。</hiw>");
			me.notify("<hiy>她的声音轻柔而坚定：'将此信交给" + targetName + "。他看了，自然会明白。'</hiy>");
			me.set_temp("cihang_yishu", 1);
			me.set_temp("cihang_yishu_got", 1);
			me.notify("<hig>你获得了靳冰云的遗书。回到赏雨亭交给" + targetName + "吧。</hig>");
			return true;
		}
	};
	this.actions["ask_siguan"] = {
		name: "询问死关",
		action: function (me) {
			if (!me.query_temp("cihang_lanjiang_done")) {
				return me.notify("靳冰云微微摇头：'你尚有心事未了，待你完成使命，再来与我论死关之事。'");
			}
			if (me.query_temp("cihang_siguan")) {
				return me.notify("靳冰云微微一笑：'你已入死关而复返，境界已不在我之下。'");
			}
			me.notify("<hiw>靳冰云凝视着你，眼中闪过一丝异彩：'你既然完成了这趟旅程，想必对生死已有新的体悟。'</hiw>");
			me.notify("<hiy>她轻声道：'死关——乃是慈航剑典的至高境界。闭入死关者，需在绝对的死亡寂静中，寻得一线生机。你可愿一试？'</hiy>");
			me.notify("<hiz>靳冰云指向竹林更深处：'若心意已决，便去死关密室吧。那里，你将直面死亡本身。'</hiz>");
			me.set_temp("cihang_siguan_ready", 1);
			return true;
		}
	};
