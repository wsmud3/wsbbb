	this.inherits(NPC);
	this.name = "庞斑";
	this.desc = "一个身材魁梧的大汉，赤着上身，古铜色的皮肤上布满了狰狞的旧伤。他双目如电，周身散发着毁灭性的霸道气息——魔师庞斑，黑榜排名第一的绝世凶人。传说其魔功已臻化境，举手投足间皆有毁天灭地之威。";
	this.title = "<hir>魔师</hir>";
	this.gender = 1;
	this.age = 50;
	this.per = 30;
	this.no_refresh = true;
	this.score = 0;

	this.str = 5000; this.con = 4500; this.dex = 3000; this.int = 2500;
	this.hp = 50000000; this.max_hp = 50000000;
	this.mp = 120000000; this.max_mp = 120000000;
	this.gj = 400000; this.fy = 300000; this.mz = 200000; this.ds = 250000; this.zj = 300000;
	this.prop = {
	    gjsd: 3500,
	    add_sh_per: 90,
	    diff_sh_per: 140,
	    diff_downside_per: 80,
	    ds_per: 30,
	    zj_per: 30,
	    gj_per: 40,
	    fy_per: 30,
	};

	this.set_objects(["eq/lv0/jian", 1, 1]);

	this.skill_map(
	    ["dodge", 4000],
	    ["parry", 4000],
	    ["force", 4500],
	    ["unarmed", 4500],
	    ["sword", 4500],
	    ["tianmoce", 4500, "force"],
	    ["tianmoce", 4500, "parry"],
	    ["tianmoce", 4500, "dodge"],
	    ["tianmoce", 4500, "unarmed"],
	    ["bianjiushi", 4500, "sword"],
	);

	// 困难模式：属性提高30%
	// 霸道魔体：每10秒生成护盾
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
	    if (this._lanjiang_boss) {
	        this.add_status({
	            id: "badao_moti",
	            name: "<hir>魔体</hir>",
	            duration: 10000,
	            duration_count: 0,
	            override: 2,
	            no_clear: true,
	            only_combat: true,
	            on_interval: function (who, count) {
	                if (!who || who.hp <= 0) return;
	                var shield = Math.floor(who.max_hp * 0.15);
	                who.add_prop("fy", shield);
	                setTimeout(function () { if (who && who.hp > 0) who.add_prop("fy", -shield); }, 5000);
	                who.send_combat("<hir>庞斑暴喝一声，魔气翻涌！</hir>");
	            },
	        });
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
	            from.notify("<hio>庞斑大笑着后退三步：'痛快！没想到你竟有如此实力！'</hio>");
	            from.notify("<hiy>你通过了庞斑的赐教！</hiy>");
	            from.set_temp("cihang_spar_win", 1);
	            from.notify("<hig>庞斑指向北方：'去拦江岛。浪翻云在等你——三次击杀，剑魔之名便是你的。'</hig>");
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
	    killer.notify("<hio>你第" + prevKills + "次击杀了庞斑！</hio>");

	    if (prevKills >= 3) {
	        killer.notify("<hir>三次击杀！庞斑的身影在魔气中彻底崩碎！</hir>");
	        killer.notify("<hio>恭喜你完成了浪翻云的嘱托！你获得了称号「魔师」！</hio>");
	        killer.set_temp("cihang_lanjiang_done", 1);
	        killer.add_title("魔师", "fb");
	        killer.add_fbscore(330);
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
	        killer.notify("<hio>慈航静斋试炼达成！</hio>");
	    } else {
	        if (env && env.spawn_boss) {
	            env.boss_spawned = false;
	            // 延迟重生：避免在on_die调用链中同步创建新boss并开战导致状态撕裂
	            var _killer = killer;
	            setTimeout(function () { env.spawn_boss(_killer); }, 0);
	        }
	    }
	};
