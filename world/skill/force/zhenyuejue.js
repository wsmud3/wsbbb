this.inherits(SKILL);
this.name = "镇岳诀";
this.id = "zhenyuejue";
this.grade = 3;
this.force_rad = 0.77;
this.desc = "镇岳诀";
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 3000,
	skill: { force: 300 }
};
this.query_enable_prop = function (lv) {
	return {
		force: {
			fy: parseInt(lv * 1.3) + 10,
			max_hp: parseInt(lv * 10050.0 / 1000),
			fy_per: 1 + parseInt(lv  / 200),
			limit_mp: lv * 103,
			desc: "唯一：将你内力的77%转化为气血",
		}
	};
}
this.pfm = {
	pfm1: {
		name: "镇岳",
		distime: 60000,
		enable_skill: "force",
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIY>$N沉声低喝，一股浑厚无比的内力自丹田勃发——「镇岳」！霎时间，$N周身真气如群山耸立，巍然不动，双臂青筋暴起，力量如泰山压顶般节节攀升！</HIY>", me);
			me.add_status({
				id: "zhenyue",
				name: "镇岳",
				desc: "臂力增加" + parseInt(lv * 333 / 1000) + "点",
				duration: 30000,
				prop: {
					str: parseInt(lv * 333 / 1000),
				},
			});
		},
		query_desc: function (me, lv) {
			var str = parseInt(lv * 333 / 1000);
			return "使用镇岳诀增加你" + str + "的臂力，持续30秒";
		}
	}
};
