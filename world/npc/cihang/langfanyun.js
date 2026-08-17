	this.inherits(NPC);
	this.name = "浪翻云";
	this.desc = "一位中年男子，身着青色长衫，负手而立。他看似平凡，周身却散发出一股难以言喻的剑意——仿佛他本身便是一柄绝世好剑。黑榜第一高手，「覆雨剑」浪翻云，传说中已达「唯能极于情，故能极于剑」的境界。";
	this.title = "<hio>覆雨剑</hio>";
	this.gender = 1;
	this.age = 45;
	this.per = 80;
	this.no_refresh = true;
	this.score = 0;

	this.str = 4000; this.con = 3500; this.dex = 4500; this.int = 3000;
	this.hp = 45000000; this.max_hp = 45000000;
	this.mp = 100000000; this.max_mp = 100000000;
	this.gj = 350000; this.fy = 200000; this.mz = 350000; this.ds = 320000; this.zj = 320000;
	this.prop = {
	    gjsd: 2500,
	    add_sh_per: 80,
	    diff_sh_per: 120,
	    diff_downside_per: 80,
	    mz_per: 40,
	    ds_per: 35,
	    zj_per: 35,
	    gj_per: 30,
	    fy_per: 20,
	};

	this.set_objects(["eq/lv6/wushen/fuyu_sword", 1, 1]);

	this.skill_map(
	    ["dodge", 4500],
	    ["parry", 4500],
	    ["force", 4500],
	    ["sword", 4500],
	    ["unarmed", 4500],
	    ["fuyujianfa", 4500, "sword"],
	);

	// 困难模式：属性提高30%
	this.on_create = function () {
	    if (this.environment && this.environment._is_hard) {
	        var scale = 1.3;
	        this.str = Math.floor(this.str * scale);
	        this.con = Math.floor(this.con * scale);
	        this.dex = Math.floor(this.dex * scale);
	        this.int = Math.floor(this.int * scale);
	        this.hp = this.max_hp = Math.floor(this.max_hp * scale);
	        this.mp = this.max_mp = Math.floor(this.max_mp * scale);
	        this.gj = Math.floor(this.gj * scale);
	        this.fy = Math.floor(this.fy * scale);
	        this.mz = Math.floor(this.mz * scale);
	        this.ds = Math.floor(this.ds * scale);
	        this.zj = Math.floor(this.zj * scale);
	        this.recount();
	    }
	};

	// 水之剑意：每5次命中追加伤害
	this._lang_sword_stacks = 0;
	this.on_attack_over = function (target, par, sh) {
	    if (target && target.is_player && sh > 0) {
	        this._lang_sword_stacks = (this._lang_sword_stacks || 0) + 1;
	        if (this._lang_sword_stacks % 5 === 0) {
	            var extraDmg = Math.floor(this.gj * 0.4 * this._lang_sword_stacks / 5);
	            if (extraDmg > 800000) extraDmg = 800000;
	            target.damage(extraDmg, this);
	            target.send_combat("<hio>浪翻云剑势如潮，一浪高过一浪！覆雨剑意追加" + extraDmg + "点伤害！</hio>", this);
	        }
	    }
	};

	this.on_damage = function (from, sh) {
	    // 赐教模式：HP低于50%即判定胜利
	    if (this._sparring && this.hp - sh <= this.max_hp * 0.5) {
	        this._sparring = false;
	        this.hp = this.max_hp;
	        // 用end_fight替代remove_all_killer，避免框架黑盒方法在攻击链中间导致状态撕裂掉线
	        this.end_fight();
	        if (from && from.is_player) {
	            from.end_fight();
	            from.notify("<hio>浪翻云收剑后退，眼中露出赞许之色：'好身手！冰云没有看错人。'</hio>");
	            from.notify("<hiy>你通过了浪翻云的赐教！</hiy>");
	            from.set_temp("cihang_spar_win", 1);
	            from.notify("<hig>浪翻云指向北方：'去拦江岛吧。庞斑在那里等你——记住，杀他三次，你便是魔师。'</hig>");
	            // 解锁拦江岛
	            if (this.environment) {
	                this.environment.add_action("go_lanjiang", "前往拦江岛", function (p) {
	                    if (!p.query_temp("cihang_spar_win")) return p.notify("你还没有通过赐教。");
	                    p.moveto("cihang/lanjiangdao");
	                    return true;
	                });
	                this.environment.refresh(from);
	            }
	        }
	        return 0;
	    }
	    return sh;
	};

	this.on_die = function (killer) {
	    if (!this._lanjiang_boss) return;
	    if (!killer || !killer.is_player) return;

	    var env = this.environment;
	    var prevKills = killer.query_temp("cihang_lanjiang_kills", 0) + 1;
	    killer.set_temp("cihang_lanjiang_kills", prevKills);
	    killer.notify("<hio>你第" + prevKills + "次击杀了浪翻云！</hio>");

	    if (prevKills >= 3) {
	        killer.notify("<hir>三次击杀！浪翻云最后的残影消散于天地之间！</hir>");
	        killer.notify("<hio>恭喜你完成了庞斑的嘱托！你获得了称号「剑魔」！</hio>");
	        killer.set_temp("cihang_lanjiang_done", 1);
	        killer.add_title("剑魔", "fb");
	        killer.add_fbscore(330);
	        // 中和其他NPC分数
	        var area = env && env.parent;
	        if (area && area.rooms) {
	            var tid = killer.query_teamid();
	            for (var ri = 0; ri < area.rooms.length; ri++) {
	                var cp = area.rooms[ri].query_copy(tid);
	                if (!cp) continue;
	                for (var ci = 0; ci < cp.items.length; ci++) {
	                    var it = cp.items[ci];
	                    if (it && !it.is_player && it.hp > 0 && it.score > 0) it.score = 0;
	                }
	            }
	        }
	        killer.notify("<hio> 慈航静斋副本完成 </hio>");
	    } else {
	        // 重新生成boss（延迟重生，避免在on_die调用链中同步开战撕裂状态）
	        if (env && env.spawn_boss) {
	            env.boss_spawned = false;
	            var _killer = killer;
	            setTimeout(function () { env.spawn_boss(_killer); }, 0);
	        }
	    }
	};
