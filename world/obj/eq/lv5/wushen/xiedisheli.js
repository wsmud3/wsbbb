this.inherits(EQUIPMENT);
this.set({
	grade: 5,
	name: "邪帝舍利",
	desc: "传说中「邪极宗」一脉相传的黄色晶体，为历代魔门圣君於临死前将毕生元精灌注其中，所以蕴含了数代魔君元精及元气。\n可将其中蕴含的功力吸收转为己有：装备后使用，永久增加30万点内力上限。每颗舍利只能吸收一次，吸收后舍利不会消失。",
	unit: "颗",
	eq_type: EQUIP_TYPE.JEWELS,
	hole_count: 4,
	prop: {
		con: 100,
		dazuo_per: 13,
		limit_mp: 30000,
	}
});
// 使用后舍利本身保留（仍可作为饰品装备），见 use.js 的 no_consume
this.no_consume = true;
// 每颗舍利的「已吸收」标记记在物品实例的 temp 上：EQUIPMENT.save_db/load_db 会随物品存读档，
// clone（比武/随从复制等）也会复制 temp；穿脱只是在背包与装备栏之间移动同一个实例，标记不会丢。
var USED_KEY = "xdsl_used";
var LIMIT_MP_GAIN = 300000;
this.on_use = function (me) {
	if (this.query_temp(USED_KEY)) {
		me.notify("<hiy>这颗" + this.color_name + "中的历代魔君元精早已被吸收殆尽，再也吸不出半点功力了。</hiy>");
		return false; // 不计冷却
	}
	this.set_temp(USED_KEY, 1);
	me.notify("<hiy>你开始吸收邪帝舍利中蕴含的历代魔君功力……</hiy>");
	// 基础内力上限（直接加在 limit_mp 上随存档保存，不是装备属性；装备属性里的 limit_mp 另算）
	me.limit_mp = (me.limit_mp || 0) + LIMIT_MP_GAIN;
	me.recount();
	me.notify("<hir>邪帝舍利中的元精尽数被你吸收！你的内力上限永久增加了" + LIMIT_MP_GAIN + "点。</hir>");
	return true;
};
