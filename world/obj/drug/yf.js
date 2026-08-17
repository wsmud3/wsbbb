this.inherits(OBJ);
this.unit = "张";
this.name = "药方";
this.value = 100;
this.grade = 1;
this.combined = true;
this.transable = true;
this.desc = "一张泛黄的药方，记载着某种丹药的炼制方法。";
this.action_msg = "使用";
this.on_use = function (me) {
	me.notify("<hic>你按照" + this.name + "炼制了一份丹药。</hic>");
	switch (this.drug_type % 5) {
		case 0:
			var hp = me.add_hp(parseInt(me.max_hp * 0.2));
			if (hp) me.notify("<hig>你恢复了" + hp + "气血。</hig>");
			break;
		case 1:
			me.add_status({
				id: "yf_atk",
				name: "药力",
				desc: "攻击力+10%",
				duration: 10000,
				downside: false,
				override: 2,
				prop: { gj_per: 10 },
			});
			break;
		case 2:
			me.add_status({
				id: "yf_def",
				name: "药力",
				desc: "防御力+10%",
				duration: 10000,
				downside: false,
				override: 2,
				prop: { fy_per: 10 },
			});
			break;
		case 3:
			var mp = me.add_mp(parseInt(me.max_mp * 0.2));
			if (mp) me.notify("<hiw>你恢复了" + mp + "内力。</hiw>");
			break;
		default:
			me.do_recover(parseInt(me.max_hp * 0.1));
			me.add_mp(parseInt(me.max_mp * 0.1));
			break;
	}
};
this.on_create = function (path, par) {
	var lv = 0;
	if (par) {
			lv = parseInt(par.substring(1));
	}
	this.drug_type = lv;
	var names = ["回春药方", "强身药方", "铁骨药方", "回气药方", "培元药方"];
	this.name = names[lv % 5] || "药方";
};
