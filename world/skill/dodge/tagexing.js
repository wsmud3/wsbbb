	this.inherits(SKILL);
	this.name = "踏歌行";
	this.id = "tagexing";
	this.grade = 2;
	this.desc = "青城派轻功，如踏歌而行，潇洒飘逸";
	this.can_enables = ["dodge"];
	this.learn_condition = {
			max_mp: 2000,
			skill: { dodge: 200 }
		};

	this.query_enable_prop = function (lv) {
			return {
				dodge: {
					ds: parseInt(lv * 1.3) + 40,
					dex: parseInt(lv * 126.0 / 1000),
				},
			}
		}

	this.query_dodge_action = function() {
			return this.dodge_actions.random();
		};
	this.dodge_actions = [
			"$n身形飘忽，宛如轻烟，$N的攻击落空了。",
			"$n足不点地，一招「青云直上」，$N的攻击差之毫厘。",
			"$n身法如电，$N只觉眼前一花，$n已在数丈之外。",
			"$n长吟一声，施展「踏歌而行」，脚步合着节拍，身形飘然闪避，$N的攻击尽数落空。",
			"$n一式「醉步凌虚」，身形歪歪斜斜，看似踉跄实则精妙，$N的招式擦身而过。",
			"但见$n「歌动九天」，引吭高歌间身形翩翩起舞，$N的攻击被其舞步巧妙化解。",
			"$n使出「行云流水」，身法潇洒自如，如行云流水般自然流畅，$N难以捉摸。",
			"$n一招「诗酒飘零」，脚步微醺却暗含玄机，身形忽左忽右，$N的攻击尽数落空。",
			"只见$n「长歌当行」，歌声未落身形已飘出数丈，$N的招式打在了空处。",
			"$n施展「踏雪寻梅」，足尖轻点地面，身形如诗人赏梅般优雅地避开$N的攻势。",
		];
	this.pfm = {
			pfm1: {
				name: "踏歌行",
				distime: 30000,
				enable_skill: "dodge",
				mp: 20,
				use: function (me, target, lv) {
					me.send_room("<HIC>$N踏歌而行，身姿飘逸——「踏歌行」！$N步履轻盈如踩云端，攻守之间尽显洒脱！</HIC>", me);
					me.add_status({
						id: "tagexing",
						name: "踏歌",
						desc: "攻击增加2000点，躲闪增加2500点",
						duration: 10000 + parseInt(lv * 10),
						prop: { gj: 2000, ds: 2500 },
					})},
				query_desc: function (me, lv) {
					return "" + (10 + parseInt(lv * 10 / 1000)) + "秒内，提升自身攻击力2000点，躲闪2500点。";
				}
			}
		};
