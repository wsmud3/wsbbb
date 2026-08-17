this.inherits(EQUIPMENT);
this.set({
	grade: 5,
	name: "邪帝舍利",
	desc: "传说中「邪极宗」一脉相传的黄色晶体，为历代魔门圣君於临死前将毕生元精灌注其中，所以蕴含了数代魔君元精及元气。\n可将其中蕴含的功力吸收转为己有。",
	unit: "颗",
	eq_type: EQUIP_TYPE.JEWELS,
	hole_count: 4,
	prop: {
		con: 100,
		dazuo_per: 13,
		limit_mp: 30000,
	}
});
this.on_use = function (me) {
	me.notify("<hiy>你开始吸收邪帝舍利中蕴含的历代魔君功力……</hiy>");
	var expGain = 500000 + Math.floor(Math.random() * 300000);
	var potGain = 300000 + Math.floor(Math.random() * 200000);
	me.add_exp(expGain, potGain);
	me.notify("<hir>邪帝舍利中的元精尽数被你吸收！你获得了" + expGain + "经验和" + potGain + "潜能。</hir>");
	this.remove_obj(me, 1);
	return true;
};
