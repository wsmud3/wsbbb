this.inherits(NPC);
this.name = "";
this.desc = "一个与武者容貌完全相同的身影，只是全身笼罩着一层淡淡的血雾，眼中透着森然的杀意。";
this.gender = 1;
this.age = 30;
this.level = 5;
this.pfm_rate = 1;
this.no_refresh = true;

// 技能池定义
this.force_pool = ["jiuyangshengong", "taixuangong", "yijinjing2"];
this.parry_pool = ["qiankundanuoyi", "douzhuanxingyi", "dugujiujian2"];
this.sword_pool = ["dugujiujian2", "xuantiejianfa"];
this.blade_pool = ["ranmudao2"];
this.dodge_pool = ["lingboweibu2", "xuanxubu"];
this.unarmed_pool = ["jiuyinbaiguzhao2", "liuyangzhang2"];

// 由房间调用，根据玩家生成影子
this.init_shadow = function (player) {
	// 影子命名：红色"影子 xxx"
	this.name = "<red>影子 " + player.name + "</red>";
	this.title = "";

	// 基础属性（不宜过高，技能dex加成会通过公式dex项=加成×基础dex/5二次放大）
	// dex=50: 最坏组合(凌波+斗转+六阳掌)躲闪~5.1w(命中66%), 其余组合必中
	this.con = this.dex = this.int = this.str = 50;
	this.per = player.per;
	this.hp = this.max_hp = 20000000;
	this.mp = this.max_mp = 3000000;

	// 随机从技能池中选取技能
	var force_skill = this.force_pool[Math.floor(Math.random() * this.force_pool.length)];
	var parry_skill = this.parry_pool[Math.floor(Math.random() * this.parry_pool.length)];
	var dodge_skill = this.dodge_pool[Math.floor(Math.random() * this.dodge_pool.length)];
	var unarmed_skill = this.unarmed_pool[Math.floor(Math.random() * this.unarmed_pool.length)];

	// 随机选择武器类型：剑或刀
	var weapon_type, weapon_skill;
	if (Math.random() < 0.5) {
		weapon_type = "sword";
		weapon_skill = this.sword_pool[Math.floor(Math.random() * this.sword_pool.length)];
	} else {
		weapon_type = "blade";
		weapon_skill = this.blade_pool[Math.floor(Math.random() * this.blade_pool.length)];
	}

	// 配置技能
	var skill_config = [
		["force", 2500],
		["unarmed", 2500],
		[weapon_type, 2500],
		["parry", 2500],
		["dodge", 2500],
		[force_skill, 2500, "force"],
		[unarmed_skill, 2500, "unarmed"],
		[weapon_skill, 2500, weapon_type],
	];

	// 招架技能处理
	if (parry_skill === weapon_skill) {
		// 同一技能同时做武器和招架（如独孤九剑），合并enable为双部位
		for (var k = 0; k < skill_config.length; k++) {
			if (skill_config[k][0] === weapon_skill) {
				skill_config[k][2] = [weapon_type, "parry"];
				break;
			}
		}
	} else if (parry_skill === "douzhuanxingyi") {
		skill_config.push([parry_skill, 2500, "unarmed"]);
	} else {
		skill_config.push([parry_skill, 2500, "parry"]);
	}

	skill_config.push([dodge_skill, 2500, "dodge"]);

	this.skill_map.apply(this, skill_config);

	// 战斗属性
	this.prop = {
		gjsd: 2500,
		add_sh_per: 60,
		diff_sh_per: 20,
		diff_downside_per: 40,
		mz: 18000,
		ds: 18000,
		gj: 80000,
		fy: 50000,
		zj: 50000
	};

	// 存储创建者ID用于掉落
	this.owner_id = player.id;

	this.init();
	this.recount();
};

// 击杀掉落：直接用killer（NPC.die传入），不绕WORLD.getUser
this.on_die = function (killer) {
	if (killer && killer.is_player) {
		var zhu = killer.add_obj("sp/juyuanzhu", 1);
		if (zhu) {
			killer.notify("<hiy>你从试炼之影身上获得了一颗" + zhu.color_name + "</hiy><hiz>！</hiz>");
			killer.notify("<hiw>击败试炼之影后，你可以在当前地点再次点击「修炼」来吸收聚元珠中的灵气。</hiw>");
		}
		var loc_key = killer.query_temp("wd_current_location");
		if (loc_key && WORLD.COMMANDS.wudi_xl) {
			WORLD.COMMANDS.wudi_xl.mark_defeated(killer, loc_key);
		}
		killer.remove_temp("wd_current_location");
	}
	if (this.environment) {
		var env = this.environment;
		var self = this;
		this.call_out(function () {
			var idx = env.items.indexOf(self);
			if (idx >= 0) env.items.splice(idx, 1);
		}, 3000);
	}
};