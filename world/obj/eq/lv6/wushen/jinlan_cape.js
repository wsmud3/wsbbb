this.inherits(EQUIPMENT);
this.set({
				grade: 6,
				name: "锦斓袈裟",
				desc: "少林至宝上嵌七宝，水火不侵，可以防身趋祟。\n特效：免疫暴击（暴击抵抗+1000%），受到的伤害减少61600点",
				unit: "件",
				eq_type: EQUIP_TYPE.CAPE,
				hole_count: 5,
				prop: {
								fy: 1430,
								int: 440,
								fy_per: 20,
								hp_per: 20,
								diff_sh: 61600,
								diff_bj: 1000,
				},
});

// 说明里的减伤数值随精炼变化（基础 61600，+12 精炼为 77000），显示当前实际值
this.query_item_desc = function () {
    var v = (this.prop && this.prop.diff_sh) || 61600;
    return "少林至宝上嵌七宝，水火不侵，可以防身趋祟。\n特效：免疫暴击（暴击抵抗+1000%），受到的伤害减少" + v + "点";
};
