this.inherits(SKILL);
this.name = "嵩山拳法";
this.id = "songshanquanfa";
this.grade = 1;
this.attack_actions = [
		"$N嵩山拳法刚猛有力，一拳打出，虎虎生风",
		"$N拳势如嵩山般厚重，每一拳都力贯千钧"
];
this.desc = "嵩山派拳法，刚猛有力";
this.can_enables = ["unarmed"];
this.learn_condition = {
	skill: {
		unarmed: 100
	}
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: lv * 2 + 10,
			mz: lv * 1.5 + 10
		}
	};
}
