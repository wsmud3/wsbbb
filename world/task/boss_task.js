
this.inherits(TASK);
this.id = "boss";
const BOSSTASK = this;
this.startup = function () {
	// this.call_out(this.run, this.random(100000));//this.random(600000)+600000
	this.check_time();
}

this.stop = function () {
	if (this.time_handler) clearTimeout(this.time_handler);
	if (this.boss && this.boss.length) {
		for (var i = 0; i < this.boss.length; i++) {

			this.boss[i].destroy(this.boss[i].name + "离开了。");
		}
		this.boss.length = 0;
		this.boss = null;
	}
	this.time_handler = null;
}
this.check_time = function () {
	var dt = new Date();
	var week = dt.getDay();
	var hour = dt.getHours();
	if (hour == 21) {
		var min = dt.getMinutes();
		this.next_time = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), hour, (parseInt((min + 5) / 5)) * 5, 20);

	} else if (hour == 20) {
		this.next_time = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 21, 0, 20);
	} else {
		this.next_time = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), hour + 1, 6 + this.random(50), 20);
	}

	this.time_handler = this.call_out(this.run, this.next_time - dt);
}
this.quickly = false;
this.boss = null;
this.boss_count = 1;
this.quick = function () {
	if (this.quickly) this.quickly = false;
	else this.quickly = true;
	this.stop();
	this.check_time();
}
const BOSS_LEVELS = ["", "武士", "武师", "宗师", "武圣", "武帝", "武神"];

// 副本掉落筛选：排除 lv5 及以上装备
function filter_fb_drops(drops) {
	if (!drops || !drops.length) return [];
	var result = [];
	for (var i = 0; i < drops.length; i++) {
		var d = drops[i];
		if (typeof d === "string" && d.match(/^eq\/lv([5-9]|\d{2,})\//)) continue;
		result.push(d);
	}
	return result;
}

// 获取副本掉落（已过滤 lv5+ 装备）
function get_fb_drops(fbIndex) {
	var fb = AREA.FBS && AREA.FBS[fbIndex];
	if (!fb || !fb.drops) return [];
	return filter_fb_drops(fb.drops);
}

this.run = function () {
	this.stop();
	this.check_time();
	const list = this.check_users();
	this.boss = [];
	for (var i = 0; i < list.length; i++) {
		if (!list[i]) continue;
		let level = i + 1;
		let bs = this.create_boss(level);
		if (!bs) return console.log("boss 创建失败");
		this.boss.push(bs);
		bs.event_id = 'boss' + level;
		var rm = ROOM.RANDOM(); //ROOM.Get("yz/nanmen");
		rm.item_changed(bs, true);
		let desc = '听说' + bs.name + '出现在' + rm.long_name + '一带';
		let msg = '{"type":"msg","ch":"rumor","content":"' + desc + '。"}';
		for (var j = 0; j < list[i].length; j++) {
			list[i][j].send(msg);
		}
		EVENTS.add(this.create_event(bs.event_id, level, desc, rm));
	}
}
this.create_event = function (evtid, level, desc, rm) {
	return {
		id: evtid,
		name: BOSS_LEVELS[level] + "BOSS挑战",
		desc: desc + "，你可以前往尝试挑战，根据你造成的伤害可获得丰厚奖励。",
		time: 0,
		grade: level,
		command: "前往挑战",
		check: (me) => me.level === level,
		on_command: function (me) {
			if (me.state) return me.send('你正在' + me.state.title + "。");
			if (me.query_temp("bcc", 0) >= 5)
				return me.send('你今日的BOSS挑战次数已满。');
			if (!me.can_trans()) return;
			if (rm.is_full(1))
				return me.send('那里人太多了，你过不去。');
			me.moveto(rm.path, me.name + "离开了。", me.name + "走了过来。");
			return true;
		}
	}
}

this.check_users = function () {
	var list = [];
	for (var i = 0; i < WORLD.USERS.length; i++) {
		var user = WORLD.USERS[i];
		if (!user.level) continue;
		if (!user.socket) continue;
		if (user.query_temp("bcc", 0) >= 5) continue;
		var lv = user.level - 1;
		if (lv > 5) {
			lv = 5;
		}
		if (!list[lv]) list[lv] = [];
		list[lv].push(user);

	}
	return list;
}
this.create_boss = function (player_level) {
	var fbIdx = WORLD.DATA.query_temp("fb_index", 0);
	var max_level = this.boss_levels[fbIdx] ?? this.boss_levels[this.boss_levels.length - 1];
	if (player_level) {
		var boss_max = this.level_max[player_level][1];
		var boss_min = this.level_max[player_level][0];
		if (max_level > boss_max) max_level = boss_max;
	} else {
		boss_max = 0;
		boss_min = 0;
	}

	var level = this.random(max_level - boss_min) + boss_min;

	if (!this.paths[level]) return console.log(level, max_level, " boss 创建失败");
	var diff_level = this.levels[level];
	var boss = NPC.CLONE(this.paths[level]);
	if (!boss) return;
	boss.boss_index = level;
	boss.min_fbindex = this.boss_min_fb[level];
	var sk_level = (level + 1) * 100;
	if (diff_level > 300) {
		sk_level = (level + 1) * 130;
	}
	for (var item in boss.skills) {
		boss.skills[item].level = sk_level;
	}
	boss.diff_level = diff_level;
	boss.hp = boss.max_hp = diff_level * diff_level * 500;

	boss.mp = boss.max_mp = boss.max_hp / 2;
	boss.prop = {};
	boss.level = player_level || this.player_levels[level];
	if (diff_level >= 500) boss.level = 5;
	boss.init();
	boss.recount();
	boss.pfm_rate = 1;
	boss.recount();
	boss.record_damage = true;
	boss.on_died = this.on_died;
	boss.on_enter = null;
	boss.on_kill = this.on_kill;
	boss.no_fight = true;
	boss.no_refresh = true;
	boss.on_die = null;

	return boss;
}
this.on_kill = function (me) {
	if (me.level > this.level) {
		if (this.family == FAMILIES.MONSTER) {
			return me.notify_fail(this.name + "目露凶光狠狠的瞪着你。");
		}
		return me.notify_fail(this.name + "对你拱手说道：这位" + me.call() + "，不知" + this.callme() + "有何得罪之处？");
	}
}

function create_finish_event(boss) {
	// 快照保存 damages/max_hp，防止 end_fight 清空
	var savedDamages = {};
	for (var k in boss.damages) {
		savedDamages[k] = boss.damages[k];
	}
	var savedMaxHp = boss.max_hp;
	var savedDiffLevel = boss.diff_level;
	var savedName = boss.name;
	var savedEventId = boss.event_id;
	var savedLevel = boss.level;
	var savedMinFb = boss.min_fbindex;

	return {
		id: savedEventId,
		name: BOSS_LEVELS[savedLevel] + "BOSS挑战",
		desc: savedName + "被击败了，解锁快速领取可直接领取基础掉落，并增加一次参与次数",
		time: BOSSTASK.next_time.getTime(),
		grade: savedLevel,
		command: "领取",
		check: (me) => me.level === savedLevel,
		on_command: function (me, par) {
			BOSSTASK.boss_auto_drops(me, {
				damages: savedDamages,
				max_hp: savedMaxHp,
				diff_level: savedDiffLevel,
				name: savedName,
				event_id: savedEventId,
				level: savedLevel,
				min_fbindex: savedMinFb,
			}, par);
		}
	}
}



this.on_died = function (me, corpse) {
	if (!this.is_party_boss)
		EVENTS.add(create_finish_event(this));
	if (!this.damages) return;
	corpse.no_alloc = true;
	corpse.clear_items = clear_items.bind(this);
	corpse.query_items = query_items.bind(this);
	corpse.query_damage = query_damage.bind(this);
}
function query_damage() {
	var str = [];
	for (var key in this.damages) {
		var user = WORLD.getUser(key);
		if (user) {
			str.push(user.name);
			str.push("：");
			str.push(this.damages[key]);
			str.push("==");
			str.push(parseInt(this.damages[key] * 100 / this.max_hp));
			str.push("%\n");
		}
	}
	return str.join("");
}

const BOSS_DROPS = {
	lv1_0: [
		"st/st_red#0", "st/st_gre#0", "st/st_blu#0", "st/st_yel#0"],

};




function query_items(me) {
	if (!this.damages) return;

	var sh = this.damages[me.id];
	if (!(sh > 1)) return;
	if (!this.user_items) this.user_items = {};
	if (this.user_items[me.id]) return this.user_items[me.id];
	if (me.query_temp("bcc", 0) >= 5) return;



	sh = parseInt(sh * 100 / this.max_hp);
	if (sh < 3) {
		this.user_items[me.id] = [OBJ.CREATE('money/silver', 1 + me.random(10))];
		return this.user_items[me.id];
	}
	if (sh > 100) sh = 80;
	var lv = this.diff_level - 20;
	if (lv < 0) lv = 0;

	var drops = [
		{
			obj: "st/xuanjing",
			min: 1,
			max: 10
		}, {
			obj: BOSS_DROPS.lv1_0,
			odds: 5000 + lv * 10 + sh * 10
		}
	];

	// 添加副本掉落（已过滤 lv5+ 装备）
	var fbDrops = get_fb_drops(this.min_fbindex);
	if (fbDrops.length) {
		drops.push({
			obj: fbDrops,
			odds: 3000 + lv * 5 + sh * 5
		});
	}

	me.add_temp("bcc", 1, UTIL.diff_time());
	var items = OBJ.create_by_odds(drops);
	this.user_items[me.id] = items;
	return items;
}


function clear_items(me) {
	if (this.user_items) {
		this.user_items[me.id].length = 0;
	}
}

this.boss_auto_drops = function (me, boss, par) {
	if (!boss.damages) return me.notify_fail("该BOSS没有伤害记录。");
	var dmg = boss.damages[me.id];
	if (!dmg || dmg <= 0) return me.notify_fail("你没有对该BOSS造成伤害，无法领取奖励。");
	var percent = parseInt(dmg * 100 / boss.max_hp);
	if (percent < 10) return me.notify_fail("你对BOSS造成的伤害不足10%（当前" + percent + "%），无法领取奖励。");
	if (me.query_temp("boss_reward_" + boss.event_id)) return me.notify_fail("你已经领取过该BOSS的奖励了。");

	me.set_temp("boss_reward_" + boss.event_id, 1, UTIL.diff_time());
	me.add_temp("bcc", 1, UTIL.diff_time());

	var drops = [
		{ obj: "st/xuanjing", min: 5, max: 20 },
		{ obj: "money/silver", min: boss.level * 100, max: boss.level * 500 }
	];

	var lv = boss.diff_level || 20;
	if (percent >= 30) {
		drops.push({ obj: ["eq/lv2/lanbaoshi", "eq/lv2/hongbaoshi", "eq/lv2/lvbaoshi", "eq/lv2/huangbaoshi"], odds: 5000 + lv * 5 });
	}
	if (percent >= 50) {
		drops.push({ obj: ["eq/lv3/jingzhilanbaoshi", "eq/lv3/jingzhihongbaoshi", "eq/lv3/jingzhilvbaoshi"], odds: 2000 + lv * 3 });
	}

	// 添加副本掉落（几率方式，已过滤 lv5+ 装备）
	var fbDrops = get_fb_drops(boss.min_fbindex);
	if (fbDrops.length) {
		drops.push({
			obj: fbDrops,
			odds: 3000 + lv * 5 + percent * 5
		});
	}

	var items = OBJ.create_by_odds(drops);
	if (items && items.length) {
		for (var i = 0; i < items.length; i++) {
			me.add_obj(items[i]);
			me.notify("你获得了" + items[i].unit_name() + "。");
		}
	}
	me.notify("你领取了" + boss.name + "的挑战奖励（伤害" + percent + "%）。");
	return true;
};

// boss_index → diff_level (difficulty)
this.levels = [
	3, 5, 10, 12,               // 武士/武师 (0-3)
	50, 55, 60, 65,              // 宗师 (4-7)
	120, 130, 140, 150,          // 武圣 (8-11)
	200, 220, 240,               // 武帝 (12-14)
	310, 350, 400                // 武神 (15-17)
];

// boss_index → player_level
this.player_levels = [
	1, 1, 1, 2,                  // 武士/武师 (0-3)
	3, 3, 3, 3,                  // 宗师 (4-7)
	4, 4, 4, 4,                  // 武圣 (8-11)
	5, 5, 5,                     // 武帝 (12-14)
	6, 6, 6                      // 武神 (15-17)
];

// player_level → [min_boss_index, max_boss_index]
this.level_max = [
	[0, 99],                     // 未使用
	[0, 2],                      // 武士
	[3, 3],                      // 武师
	[4, 7],                      // 宗师
	[8, 11],                     // 武圣
	[12, 14],                    // 武帝
	[15, 17]                     // 武神
];

// fb_index → 最大可用的 boss_index
this.boss_levels = [
	3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  // fb0-9
	5, 5,                           // fb10-11: 温府→夏雪宜(idx 5)
	6, 6, 6, 6,                     // fb12-15: 恒山→田伯光(idx 6)
	7, 7, 7,                        // fb16-18: 嵩山→左冷禅(idx 7), 云梦→火龙王(idx 4)
	11, 11, 11,                     // fb19-21: 白驼→欧阳锋(idx 8), ...
	11, 11, 11,                     // fb22-24: 移花→邀月(idx 9), 燕子坞→慕容博(idx 10), 黑木崖→东方不败(idx 11)
	14, 14, 14, 14, 14, 14,         // fb25-30: 缥缈峰→天山童姥(idx 14), 光明顶→张无忌(idx 13), 天龙寺→枯荣大师(idx 12)
	17, 17                           // fb31-32: 净念禅宗→天僧(idx 15), 慈航静斋→浪翻云(idx 16), 庞斑(idx 17)
];

// boss_index → 最低需要的 fb_index
this.boss_min_fb = [
	1, 4, 6, 7,                   // 赵志敬/鳌拜/陈近南/洪安通
	17, 10, 12, 16,               // 火龙王(云梦)/夏雪宜(温府)/田伯光(恒山)/左冷禅(嵩山)
	19, 22, 23, 24,               // 欧阳锋(白驼)/邀月(移花)/慕容博(燕子坞)/东方不败(黑木崖)
	27, 26, 25,                   // 枯荣大师(天龙寺)/张无忌(光明顶)/天山童姥(缥缈峰)
	31, 32, 32                    // 天僧(净念禅宗)/浪翻云(慈航静斋)/庞斑(慈航静斋)
];

// boss_index → NPC 路径
this.paths = [
	"yz/lm/zhao",                  // 0: 赵志敬
	"bj/ao/aobai",                // 1: 鳌拜
	"bj/tdh/chen",                // 2: 陈近南
	"bj/shenlong/hong",           // 3: 洪安通
	"ym/huolongwang",             // 4: 火龙王
	"wf/jinshelangjun",           // 5: 夏雪宜
	"hs/tianboguang",             // 6: 田伯光
	"ss/zuolengchan",             // 7: 左冷禅
	"bt/ouyangfeng",              // 8: 欧阳锋
	"yh/yaoyue",                  // 9: 邀月
	"yz2/murongbo",               // 10: 慕容博
	"hmy/dongfangbubai",          // 11: 东方不败
	"tl/kurongdashi",             // 12: 枯荣大师
	"gm/zhangwuji",               // 13: 张无忌
	"pm/tianshantonglao",         // 14: 天山童姥
	"jncz/tianseng",              // 15: 天僧
	"cihang/langfanyun",          // 16: 浪翻云
	"cihang/pangban"              // 17: 庞斑
];
