this.inherits(OBJ);
this.unit = "张";
this.name = "珍方";
this.value = 300;
this.grade = 2;
this.combined = true;
this.transable = true;
this.desc = "一张珍稀的药方，记载着上等丹药的炼制方法。";
this.action_msg = "使用";
this.on_use = function (me) {
	me.notify("<hic>你按照" + this.name + "炼制了一份珍品丹药。</hic>");
	switch (this.drug_type % 5) {
		case 0:
			var hp = me.add_hp(parseInt(me.max_hp * 0.4));
			if (hp) me.notify("<hig>你恢复了" + hp + "气血。</hig>");
			break;
		case 1:
			me.add_status({
				id: "yf2_atk",
				name: "药力",
				desc: "攻击力+20%",
				duration: 15000,
				downside: false,
				override: 2,
				prop: { gj_per: 20 },
			});
			break;
		case 2:
			me.add_status({
				id: "yf2_def",
				name: "药力",
				desc: "防御力+20%",
				duration: 15000,
				downside: false,
				override: 2,
				prop: { fy_per: 20 },
			});
			break;
		case 3:
			var mp = me.add_mp(parseInt(me.max_mp * 0.4));
			if (mp) me.notify("<hiw>你恢复了" + mp + "内力。</hiw>");
			break;
		default:
			me.do_recover(parseInt(me.max_hp * 0.2));
			me.add_mp(parseInt(me.max_mp * 0.2));
			break;
	}
};
this.on_create = function (path, par) {
	var lv = 0;
	if (par) {
			lv = parseInt(par.substring(1));
	}
	this.drug_type = lv;
	var names = ["回春珍方", "强身珍方", "铁骨珍方", "回气珍方", "培元珍方"];
	this.name = names[lv % 5] || "珍方";
};
