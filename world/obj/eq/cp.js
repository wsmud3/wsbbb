		this.inherits(EQUIPMENT);
		this.unit = "件";
		this.name = "自制装备";
		this.desc = "一件精心锻造的自制装备。";
		this.value = 100000;
		this.grade = 5;
		this.hole_count = 4;
		this.no_fenjie = false;
		this.transable = true;
		this.is_custom = true;

		this.on_create = function (path, par) {
						this.is_custom = true;
						// 兼容BASE.CREATE传入的"#参数"格式（如"#sword"），去掉前导"#"
						if (par && typeof par === 'string' && par.startsWith('#')) {
										par = par.substring(1);
						}
						if (par) {
										var weapon_names = { sword: '剑', blade: '刀', club: '棍', staff: '杖', whip: '鞭', none: '武器' };
										if (par === "sword" || par === "blade" || par === "club" || par === "staff" || par === "whip" || par === "none") {
														this.eq_type = EQUIP_TYPE.WEAPON;
														// 覆盖显示名称，显示具体武器类型而非泛称"武器"
														this.parts = this.parts.slice();
														this.parts[0] = weapon_names[par] || '武器';
														if (par !== "none") this.weapon_type = WEAPON_TYPE[par.toUpperCase()];
										} else if (par === "throwing") {
														this.eq_type = EQUIP_TYPE.THROWING;
										} else if (par === "cloth") {
														this.eq_type = EQUIP_TYPE.CLOTH;
										} else if (par === "shoes") {
														this.eq_type = EQUIP_TYPE.SHOES;
										} else if (par === "head") {
														this.eq_type = EQUIP_TYPE.HEAD;
										} else if (par === "cape") {
														this.eq_type = EQUIP_TYPE.CAPE;
										} else if (par === "ring") {
														this.eq_type = EQUIP_TYPE.RING;
										} else if (par === "necklace") {
														this.eq_type = EQUIP_TYPE.NECKLACE;
										} else if (par === "jewels") {
														this.eq_type = EQUIP_TYPE.JEWELS;
										} else if (par === "wrist") {
														this.eq_type = EQUIP_TYPE.WRIST;
										} else if (par === "waist") {
														this.eq_type = EQUIP_TYPE.WAIST;
										}
						}
						// 初始化基础属性：保证数据库加载时也有BASE_PROPS兜底，不会清零
						if (this.eq_type !== undefined && this.eq_type !== null) {
										var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
										if (duanzao && duanzao.BASE_PROPS) {
														var base = duanzao.BASE_PROPS[this.eq_type] || {};
														this.prop = Object.assign({}, base);
														this.original_prop = Object.assign({}, this.prop);
										}
						}
						this.max_word_count = 5;
						this.words = [];
						this.refine_count = 0;
		};

		this.on_reload = function (me) {
						if (!me) return;
						this.is_custom = true;
						// 恢复武器类型显示
						if (this.eq_type === EQUIP_TYPE.WEAPON) {
										// 兼容旧数据：如果weapon_type未设置，尝试从path中恢复（如"eq/cp#sword"）
										if (!this.weapon_type && this.path) {
														var legacy_match = /^eq\/cp#(\w+)$/.exec(this.path);
														if (legacy_match && legacy_match[1] && legacy_match[1] !== "none") {
																		this.weapon_type = WEAPON_TYPE[legacy_match[1].toUpperCase()];
														}
										}
										if (this.weapon_type) {
														var weapon_type_names = { sword: '剑', blade: '刀', club: '棍', staff: '杖', whip: '鞭', unarmed: '武器' };
														var wpName = null;
														for (var k in WEAPON_TYPE) {
																		if (WEAPON_TYPE[k] === this.weapon_type) { wpName = k.toLowerCase(); break; }
														}
														if (wpName && weapon_type_names[wpName]) {
																		this.parts = this.parts.slice();
																		this.parts[0] = weapon_type_names[wpName];
														}
										}
						}
						var name = this.query_temp("name");
						if (name) {
										this.name = name;
										var cc = ["wht", "hig", "hic", "hiy", "HIZ", "hio", "ord"][this.grade] || "hio";
										this.color_name = "<" + cc + ">" + name + "</" + cc + ">";
										this.pretag = null;
						}
						this.init();
		};
