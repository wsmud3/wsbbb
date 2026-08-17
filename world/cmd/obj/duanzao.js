	this.inherits(COMMAND);
	this.command = "duanzao";

	this.PROPS = {
	// 基础属性 (category 0)
	gj: { name: "攻击", category: 0, desc: "提升攻击力" },
	fy: { name: "防御", category: 0, desc: "提升防御力" },
	mz: { name: "命中", category: 0, desc: "提升命中" },
	ds: { name: "躲闪", category: 0, desc: "提升躲闪" },
	zj: { name: "招架", category: 0, desc: "提升招架" },
	max_hp: { name: "气血上限", category: 0, desc: "提升气血上限" },
	max_mp: { name: "内力上限", category: 0, desc: "提升内力上限" },
	// 后天属性 (category 1)
	str: { name: "臂力", category: 1, desc: "提升臂力" },
	con: { name: "根骨", category: 1, desc: "提升根骨" },
	dex: { name: "身法", category: 1, desc: "提升身法" },
	int: { name: "悟性", category: 1, desc: "提升悟性" },
	// 高级属性 (category 2)
	gj_per: { name: "攻击%", category: 2, desc: "提升攻击百分比" },
	fy_per: { name: "防御%", category: 2, desc: "提升防御百分比" },
	mz_per: { name: "命中%", category: 2, desc: "提升命中百分比" },
	ds_per: { name: "躲闪%", category: 2, desc: "提升躲闪百分比" },
	hp_per: { name: "气血%", category: 2, desc: "提升气血百分比" },
	zj_per: { name: "招架%", category: 2, desc: "提升招架百分比" },
		lianxi_per: { name: "练习效率%", category: 2, desc: "提升练习效率百分比" },
		dazuo_per: { name: "打坐效率%", category: 2, desc: "提升打坐效率百分比" },
		study_per: { name: "学习效率%", category: 2, desc: "提升学习效率百分比" },
	// 稀有属性 (category 3)
	diff_sh_per: { name: "伤害减免", category: 3, desc: "减免百分比伤害" },
	gjsd_per: { name: "攻击速度%", category: 3, desc: "提升攻速百分比" },
	releasetime_per: { name: "出招时间%", category: 3, desc: "减少出招时间百分比" },
	add_sh_per: { name: "最终伤害%", category: 3, desc: "提升最终伤害百分比" },
	diff_fy_per: { name: "忽视防御%", category: 3, desc: "忽视对方防御百分比" },
	ignore_busy_per: { name: "忽视忙乱%", category: 3, desc: "减少忙乱状态时间百分比" },
	add_bjsh_per: { name: "暴击伤害%", category: 3, desc: "提升暴击伤害百分比" },
	expend_mp_per: { name: "内力消耗%", category: 3, desc: "减少内力消耗百分比" },
	bj_resist_per: { name: "暴击抵抗%", category: 3, desc: "减少被暴击几率" },
	// 特殊属性 (category 4)
	per: { name: "容貌", category: 4, desc: "提升容貌" },
	bj_per: { name: "暴击%", category: 4, desc: "提升暴击几率" },
	busy_per: { name: "忙乱%", category: 4, desc: "增加忙乱对方时间百分比" },
	debuff_resist_per: { name: "负面抵抗%", category: 4, desc: "减少负面状态时间百分比" },
	gjsd: { name: "攻击速度", category: 4, desc: "减少攻击间隔时间" },
	distime_per: { name: "冷却时间%", category: 4, desc: "减少招式冷却百分比" },
	distime: { name: "冷却缩减", category: 4, desc: "减少冷却时间" },
	releasetime: { name: "出招缩减", category: 4, desc: "减少出招时间" },
	diff_sh: { name: "受到的伤害减少", category: 4, desc: "减免受到的固定伤害" },
};

	this.DEFAULT_PROPS = [];
	this.DEFAULT_PROPS[0] = "gj";   // 武器
	this.DEFAULT_PROPS[1] = "fy";   // 衣服
	this.DEFAULT_PROPS[2] = "fy";   // 鞋
	this.DEFAULT_PROPS[3] = "fy";   // 头部
	this.DEFAULT_PROPS[4] = "fy";   // 披风
	this.DEFAULT_PROPS[5] = "mz";   // 戒指
	this.DEFAULT_PROPS[6] = "ds";   // 项链
	this.DEFAULT_PROPS[7] = "fy";   // 饰品
	this.DEFAULT_PROPS[8] = "zj";   // 护腕
	this.DEFAULT_PROPS[9] = "fy";   // 腰带
	this.DEFAULT_PROPS[10] = "gj";  // 暗器

	this.WORD_BASE = {
	gj: 70, fy: 70, mz: 70, ds: 70, zj: 70,
	max_hp: 1400, max_mp: 1400,
	str: 15, con: 15, dex: 15, int: 15,
	gj_per: 3, fy_per: 3, mz_per: 3, ds_per: 3, zj_per: 3,
	hp_per: 2,
		lianxi_per: 22, dazuo_per: 22, study_per: 22,
	diff_sh_per: 2, gjsd_per: 3, releasetime_per: 3,
	add_sh_per: 2, diff_fy_per: 2,
	ignore_busy_per: 6, add_bjsh_per: 12, expend_mp_per: 5, bj_resist_per: 5,
	per: 7, bj_per: 5, busy_per: 7, debuff_resist_per: 5,
	gjsd: 350, distime_per: 3,
	distime: 350, releasetime: 350,
	diff_sh: 700,
};

	this.sum_needs = function (prop, level) {
	if (!level || level <= 0) return 0;
	var total = 0;
	for (var i = 0; i < level; i++) {
	    total += Math.pow(2, i);
	}
	return total;
};

	this.BASE_PROPS = [];
	this.BASE_PROPS[0] = { gj: 550 };                              // 武器：对标屠龙刀/碧血剑 lv5
	this.BASE_PROPS[1] = { fy: 500 };                              // 衣服：对标天龙飞羽服 lv5
	this.BASE_PROPS[2] = { fy: 470 };                              // 鞋：对标木凤羽靴 lv5
	this.BASE_PROPS[3] = { fy: 400 };                              // 头部：对标金碧簪 lv5
	this.BASE_PROPS[4] = { fy: 470 };                              // 披风：对标龙血斗篷 lv5
	this.BASE_PROPS[5] = { mz: 220 };                              // 戒指：对标龙骨环 mz lv5
	this.BASE_PROPS[6] = { ds: 300 };                              // 项链
	this.BASE_PROPS[7] = { fy: 330 };                              // 饰品：对标龙骨舍利 fy lv5
	this.BASE_PROPS[8] = { zj: 440 };                              // 护腕：对标逆鳞护腕 lv5
	this.BASE_PROPS[9] = { fy: 240 };                              // 腰带：对标天龙腰带 fy lv5
	this.BASE_PROPS[10] = { gj: 550 };                             // 暗器：对标千羽

	this.default_template = function (obj, eq_type) {
	obj.grade = 5;
	obj.hole_count = 4;
	obj.max_word_count = 5;
	obj.words = [];
	obj.is_custom = true;
	obj.refine_count = 0;
	if (eq_type !== undefined && eq_type !== null) {
	    obj.eq_type = eq_type;
	    // Custom equipment starts with all BASE_PROPS for this type
	    var base = this.BASE_PROPS[eq_type] || {};
	    obj.prop = Object.assign({}, base);
	    obj.original_prop = Object.assign({}, obj.prop);
	}
};

	this.enter = function (player, arg) {
	var rm = player.environment;
	if (!rm) return;
	if (rm.items) {
	    for (var i = 0; i < rm.items.length; i++) {
	        if (rm.items[i] && rm.items[i].on_duanzao) {
	            rm.items[i].on_duanzao(player, arg);
	            return;
	        }
	    }
	}
	player.notify("锻造系统请通过NPC进行操作。铁匠可锻造武器/暗器，裁缝可制作防具，杂货店可制作饰品。");
};

	// 旧key→新key迁移表（兼容历史装备数据）
	this.KEY_MIGRATION = {
		bj_sh: 'add_bjsh_per',
		limit_hp: 'max_hp',
		limit_mp: 'max_mp',
	};

	this.category_names = ["基础属性", "后天属性", "高级属性", "稀有属性", "特殊属性"];
	this.category_grade = [4, 5, 5, 6, 6];

	// ========== 装备属性装配限制 ==========
	// 每个部位禁止的高级属性（category 2）
	this.FORBIDDEN_ADVANCED = {
	    0: ['fy_per', 'ds_per', 'zj_per'],          // 武器: 禁止防御%躲闪%气血%招架%
	    1: ['gj_per', 'mz_per'],                               // 衣服: 禁止攻击%命中%
	    2: ['gj_per'],                                         // 鞋
	    3: ['gj_per'],                                         // 头: 禁止攻击%
	    4: ['gj_per', 'mz_per'],                               // 披风
	    5: ['mz_per', 'fy_per', 'ds_per', 'zj_per'], // 戒指
	    6: ['gj_per', 'fy_per'],                               // 项链: 禁止攻击%防御%
	    7: [],                                                 // 饰品: 全部允许
	    8: ['gj_per', 'fy_per', 'ds_per', 'zj_per'], // 护腕
	    9: ['mz_per', 'ds_per'],                               // 腰带
	    10: ['fy_per', 'ds_per', 'zj_per'],          // 暗器
	};

	// 每个部位允许的特殊属性（category 4）
	this.ALLOWED_SPECIAL = {
	    0: ['per', 'bj_per', 'busy_per', 'debuff_resist_per', 'gjsd', 'distime_per', 'distime', 'releasetime', 'diff_sh'],
	    1: ['per', 'diff_sh'],
	    2: ['per', 'debuff_resist_per', 'distime', 'releasetime'],
	    3: ['per', 'bj_per', 'debuff_resist_per'],
	    4: ['per', 'debuff_resist_per', 'distime_per', 'distime', 'releasetime', 'diff_sh'],
	    5: ['per', 'bj_per', 'gjsd', 'distime_per', 'distime', 'releasetime'],
	    6: ['per', 'distime_per', 'distime', 'releasetime'],
	    7: ['per', 'bj_per', 'gjsd', 'distime_per', 'distime', 'releasetime'],
	    8: ['per', 'bj_per', 'busy_per', 'gjsd', 'distime_per', 'distime', 'releasetime'],
	    9: ['per', 'busy_per', 'distime_per', 'distime', 'releasetime'],
	    10: ['bj_per'],
	};

	// 每个部位允许的稀有属性（category 3）
	this.ALLOWED_RARE = {
	    0: ['add_bjsh_per', 'expend_mp_per', 'gjsd_per', 'releasetime_per', 'add_sh_per', 'diff_fy_per'],
	    1: ['bj_resist_per', 'ignore_busy_per', 'diff_sh_per'],
	    2: ['ignore_busy_per', 'diff_sh_per'],
	    3: ['bj_resist_per', 'expend_mp_per', 'ignore_busy_per'],
	    4: ['bj_resist_per', 'ignore_busy_per', 'diff_sh_per'],
	    5: ['expend_mp_per', 'gjsd_per', 'releasetime_per', 'add_sh_per', 'diff_fy_per'],
	    6: ['diff_sh_per', 'releasetime_per', 'diff_fy_per'],
	    7: ['expend_mp_per', 'diff_sh_per', 'gjsd_per', 'releasetime_per', 'add_sh_per', 'diff_fy_per'],
	    8: ['add_bjsh_per', 'expend_mp_per', 'gjsd_per', 'releasetime_per', 'add_sh_per', 'diff_fy_per'],
	    9: ['ignore_busy_per', 'diff_sh_per', 'diff_fy_per'],
	    10: ['add_sh_per', 'add_bjsh_per', 'diff_fy_per'],
	};

	// 检查指定属性是否能装配到指定部位
	this.can_attach_prop = function (eq_type, prop_key) {
	    var info = this.PROPS[prop_key];
	    if (!info) return true; // 未知属性默认允许
	    var cat = info.category;

	    // 默认属性不可替换
	    var def = this.DEFAULT_PROPS[eq_type];
	    if (def && def === prop_key) return false;

	    // 后天属性(cat 1)所有部位均可
	    if (cat === 1) return true;

	    // 基础属性(cat 0)所有部位均可
	    if (cat === 0) return true;

	    // 高级属性(cat 2)：检查禁止列表
	    if (cat === 2) {
	        var forbid = this.FORBIDDEN_ADVANCED[eq_type];
	        if (forbid && forbid.indexOf(prop_key) >= 0) return false;
	        return true;
	    }

	    // 稀有属性(cat 3)：检查允许列表
	    if (cat === 3) {
	        var allowRare = this.ALLOWED_RARE[eq_type];
	        if (allowRare && allowRare.indexOf(prop_key) >= 0) return true;
	        return false;
	    }

	    // 特殊属性(cat 4)：检查允许列表
	    if (cat === 4) {
	        var allowSp = this.ALLOWED_SPECIAL[eq_type];
	        if (allowSp && allowSp.indexOf(prop_key) >= 0) return true;
	        return false;
	    }

	    return false;
	};
