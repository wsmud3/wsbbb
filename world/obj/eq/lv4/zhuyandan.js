	this.inherits(OBJ);
	this.name = "驻颜丹";
	this.grade = 4;
	this.value = 5000;
	this.unit = "颗";
	this.desc = "传说中的驻颜灵丹，服下后容颜不老，青春永驻";
	this.combined = true;
	this.on_use = function (me) {
					me.per += 5;
					me.notify("<hig>你服下驻颜丹，感觉容貌焕发！</hig>");
					return true;
	};
	this.action_msg = "服用";
