this.inherits(SKILL);
this.name = "北冥神功";
this.id = "beimingshengong2";
this.source_skill = "beimingshengong";
this.grade = 4;
this.family = FAMILIES.XIAOYAO;
this.force_rad = 0.8;
this.desc = "逍遥派镇派神功，可吸取他人内力以供己用，是迅速提升功力的捷径功法。";
this.can_enables = ["force", "parry"];
this.learn_condition = {
	max_mp: 4000,
	skill: { force: 400 }
};
this.query_enable_prop = function (lv) {
	return {
	force: {
			con: parseInt(lv * 510.0 / 1000),
			dex: parseInt(lv * 334.0 / 1000),
			limit_mp: lv * 165,
			desc: "唯一：将你内力的80%转化为气血",
	},
	parry: {
			zj: parseInt(lv * 1.8) + 20,
			dex: parseInt(lv * 252.0 / 1000),
			max_hp: lv * 13,
	},
}
};

this.pfm = {

	huifu:
	{
	name: "鲲字诀",
	distime: 30000,
	enable_skill: "force",
	mp: 0,
	release_time: 0,
	no_auto: true,
	use: function (me, target, lv) {

var gj = lv * 5;
me.send_room("<him>$N默运北冥神功「鲲字诀」，周身紫气缭绕，犹如北冥之鲲吞吐天地灵气。$N体内经脉如鲸吸百川，将四周的天地元气源源不绝地纳入丹田，转眼间真气充盈，精神焕发！</him>", target);
me.add_mp(gj);
	},
	query_desc: function (me, lv) {
var gj = lv * 5;
return "鲲字诀——战斗中恢复自己" + gj + "点内力。";
	}
}, power: {
	name: "凝神诀",
	distime: 30000,
	enable_skill: "force",
	mp: 20,
	release_time: 0,
	no_auto: true,
	use_type: 2,
	use: function (me, target, lv) {
		if (me.query_temp('bmsg_add'))
			return me.notify('你已经附加凝神诀的效果了。');
		me.send_room("<hig>$N神凝丹田，息游紫府，周身经脉豁然贯通。天地间的灵气仿佛受到召唤，如潮水般朝$N汇聚而来，$N周身紫光流转，内力修为竟在瞬息之间暴涨一截！</hig>");

		var time = Math.round(lv * 100) + 60000;
		var nl = 100 + lv * 10;
		var ts = me.team || [me];
		for (var i = 0; i < ts.length; i++) {
			if (!ts[i].is_here(me)) continue;
			ts[i].add_status({
				id: "force",
				name: "北冥",
				desc: "北冥神功之凝神诀，增加你的最大内力",
				duration: time,
				prop: {
					desc: "增加" + nl + "最大内力"
				}, on_attach: function (p) {
					p.max_mp += nl;
					p.set_temp('bmsg_add', nl);
					p.recount();
					p.notify_hp();
				},
				on_expire: function (p) {
					p.max_mp -= nl;
					p.remove_temp('bmsg_add', nl);
					p.recount();
					p.notify_hp();
				}
			});
		}

	},
	query_desc: function (me, lv) {
var gj = Math.round(lv * 100) + 60000;
var nl = 100 + lv * 10;
return "凝神诀——增加你和你附近队友的最大内力" + nl + "点，持续" + (gj / 1000) + "秒。";
	}
}
}
