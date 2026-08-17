
	this.inherits(NPC);
	this.set({
	    name: "门派后勤管理员",
	    desc: "他是你们门派里面负责发放弟子福利的人",
	    gender: 1,
	    age: 25,
	    per: this.random(20) + 10,
	    mp: 400,
	    max_mp: 400,
	    hp: 400,
	    max_hp: 400,

	});
	this.skill_map(
	    ["force", 100],
	    ["dodge", 100],
	    ["parry", 100],
	    ["sword", 100],
	    ["blade", 100],
	    ["club", 100],
	    ["staff", 100],
	    ["whip", 100],
	    ["unarmed", 100]);
	this.on_create = function (path, par) {
	    if (!par) return;
	    this.family = FAMILIES[par.substr(1)];
	    if (!this.family.customer) this.family.customer = {};
	    if (this.family == FAMILIES.NONE) {
	        this.name = "武馆后勤";
	    }
	}
	this.gongji_sell = true;
	this.on_sell = function (me) {
	    var is_wuguan = this.family === FAMILIES.NONE;
	    if (is_wuguan) {
	        if (me.family !== FAMILIES.NONE || !me.query_temp('wg_sr'))
	            return [];
	    } else if (me.family !== this.family) {
	        return [];
	    }
	    var today = new Date().getDate();
	    if (this._goods_date !== today) {
	        this._goods = null;
	        this._goods_date = today;
	    }
	    if (this._goods) return this._goods;
	    var list = [];

	    // 元晶 — available to all
	    var yj = OBJ.CREATE("st/yuanjing");
	    if (yj) {
	        yj.count = -1;
	        yj.value = 100;
	        list.push(yj);
	    }

	    if (is_wuguan) {
	        // ===== 武馆后勤：随机其他门派装备 =====
	        var WUGUAN_FAMS = ["WUDANG", "SHAOLIN", "GAIBANG", "HUASHAN", "EMEI", "XIAOYAO", "SHASHOU", "SUNV"];
	        // 每个门派实际拥有的部位（只含存在的装备文件）
	        var WUGUAN_SLOTS = {
	            "WUDANG":  ["cloth", "head", "shoes", "waist", "sword", "wrist"],
	            "SHAOLIN": ["cloth", "head", "shoes", "waist", "blade", "wrist", "weapon"],
	            "GAIBANG": ["cloth", "head", "shoes", "waist", "staff", "wrist"],
	            "HUASHAN": ["cloth", "head", "shoes", "waist", "sword", "wrist"],
	            "EMEI":    ["cloth", "head", "shoes", "waist", "sword", "wrist"],
	            "XIAOYAO": ["cloth", "head", "shoes", "waist", "glove", "wrist"],
	            "SHASHOU": ["ss_throw"],
	            "SUNV":    ["cloth", "head", "shoes", "waist", "sword", "wrist"],
	        };

	        var eq_date = me.query_temp("eq_refresh_date", 0);
	        if (eq_date !== today) {
	            me.set_temp("eq_refresh_date", today);
	            me.remove_temp("eq_refresh_slots");
	        }
	        var grades = [1, 2, 3, 4, 5];
	        var eq_slots = me.query_temp("eq_refresh_slots", null);
	        var eq_list = [];

	        for (var g = 0; g < grades.length; g++) {
	            var piece_grade = grades[g];
	            var fam_id, slot_type;
	            if (eq_slots && eq_slots[g]) {
	                var parts = eq_slots[g].split("/");
	                fam_id = WUGUAN_FAMS[parseInt(parts[0])];
	                slot_type = parts[1];
	            } else {
	                fam_id = WUGUAN_FAMS[Math.floor(Math.random() * WUGUAN_FAMS.length)];
	                var fam_slots = WUGUAN_SLOTS[fam_id];
	                slot_type = fam_slots[Math.floor(Math.random() * fam_slots.length)];
	            }
	            var fam_dir = fam_id.toLowerCase();
	            var eq_path = "eq/lv" + piece_grade + "/" + fam_dir + "/" + slot_type;
	            var eq = OBJ.CREATE(eq_path);
	            if (eq) {
	                eq.count = 1;
	                eq.value = eq.VALUES ? (eq.VALUES[eq.grade] || 50000) : 50000;
	                eq_list.push(eq);
	            }
	        }

	        if (!eq_slots) {
	            eq_slots = [];
	            for (var e = 0; e < eq_list.length; e++) {
	                var ep = eq_list[e].path || eq_list[e].id;
	                var lastSlash = ep.lastIndexOf("/");
	                var dirSlash = ep.lastIndexOf("/", lastSlash - 1);
	                var famName = ep.substring(dirSlash + 1, lastSlash);
	                var famIdx = WUGUAN_FAMS.indexOf(famName.toUpperCase());
	                eq_slots.push((famIdx >= 0 ? famIdx : 0) + "/" + ep.substring(lastSlash + 1));
	            }
	            me.set_temp("eq_refresh_slots", eq_slots);
	        }

	        for (var e = 0; e < eq_list.length; e++) {
	            list.push(eq_list[e]);
	        }

	        // 武馆也出售知识进阶残页
	        var wg_frags = ["book/lt#GAIBANG", "book/lt#guanqi", "book/lt#HUASHAN", "book/lt#EMEI", "book/lt#SHASHOU", "book/lt#jianchan", "book/lt#qixiaoyao"];
	        for (var f = 0; f < wg_frags.length; f++) {
	            var wgf = OBJ.CREATE(wg_frags[f]);
	            if (wgf) {
	                wgf.count = -1;
	                wgf.value = 500;
	                list.push(wgf);
	            }
	        }

	        this._goods = list;
	        return this._goods;
	    }

	    // ===== 正常门派后勤 =====
	    var fragment_map = {
	        "GAIBANG": "book/lt#GAIBANG",
	        "WUDANG": "book/lt#guanqi",
	        "HUASHAN": "book/lt#HUASHAN",
	        "EMEI": "book/lt#EMEI",
	        "SHAOLIN": "book/lt#jianchan",
	        "XIAOYAO": "book/lt#qixiaoyao"
	    };

	    var frag_path = fragment_map[this.family.id];
	    if (frag_path) {
	        var frag = OBJ.CREATE(frag_path);
	        if (frag) {
	            frag.count = -1;
	            frag.value = 500;
	            list.push(frag);
	        }
	    }

	    if (this.family === FAMILIES.SHASHOU) {
	        var ss_frag = OBJ.CREATE("book/lt#SHASHOU");
	        if (ss_frag) {
	            ss_frag.count = -1;
	            ss_frag.value = 500;
	            list.push(ss_frag);
	        }
	    }
	    // All schools get extra knowledge advancement pages
	    var extra_frags = ["book/lt#GAIBANG", "book/lt#guanqi", "book/lt#HUASHAN", "book/lt#EMEI", "book/lt#SHASHOU", "book/lt#jianchan", "book/lt#qixiaoyao"];
	    for (var i = 0; i < extra_frags.length; i++) {
	        var ef = OBJ.CREATE(extra_frags[i]);
	        if (ef) {
	            ef.count = -1;
	            ef.value = 500;
	            list.push(ef);
	        }
	    }

	    // ===== 门派装备 =====
	    var eq_date2 = me.query_temp("eq_refresh_date", 0);
	    var sm_level = me.query_temp("sm_level", 0);

	    if (eq_date2 !== today) {
	        me.set_temp("eq_refresh_date", today);
	        me.remove_temp("eq_refresh_slots");
	    }

	    if (sm_level >= 0 && this.family && this.family.id) {
	        var fam_id = this.family.id;
	        var fam_dir = fam_id.toLowerCase();

	        var all_slots;
	        if (fam_id === "SHASHOU") {
	            all_slots = ["ss_throw"];
	        } else {
	            all_slots = ["cloth", "head", "shoes", "waist"];
	            if (fam_id === "SHAOLIN") all_slots.push("blade");
	            else if (fam_id === "GAIBANG") all_slots.push("staff");
	            else if (fam_id === "XIAOYAO") all_slots.push("glove");
	            else all_slots.push("sword");
	        }

	        var grades = [1, 2, 3, 4, 5];
	        var eq_slots2 = me.query_temp("eq_refresh_slots", null);
	        var eq_list = [];

	        for (var g = 0; g < grades.length; g++) {
	            var piece_grade = grades[g];
	            var slot_type;
	            if (eq_slots2 && eq_slots2[g]) {
	                slot_type = eq_slots2[g];
	            } else {
	                slot_type = all_slots[Math.floor(Math.random() * all_slots.length)];
	            }
	            var eq_path = "eq/lv" + piece_grade + "/" + fam_dir + "/" + slot_type;
	            var eq = OBJ.CREATE(eq_path);
	            if (eq) {
	                eq.count = 1;
	                eq.value = eq.VALUES ? (eq.VALUES[eq.grade] || 50000) : 50000;
	                eq_list.push(eq);
	            }
	        }

	        if (!eq_slots2) {
	            eq_slots2 = [];
	            for (var e = 0; e < eq_list.length; e++) {
	                var ep = eq_list[e].path || eq_list[e].id;
	                var lastSlash = ep.lastIndexOf("/");
	                eq_slots2.push(ep.substring(lastSlash + 1));
	            }
	            me.set_temp("eq_refresh_slots", eq_slots2);
	        }

	        for (var e = 0; e < eq_list.length; e++) {
	            list.push(eq_list[e]);
	        }
	    }

	    this._goods = list;
	    return this._goods;
	};

	const NEEDS_GJ = [500, 5000, 10000, 50000, 100000];
	const NEEDS_LEVEL = [0, 3, 4, 5, 6];
	const NEEDS_LEVEL_DESC = [null, "宗师", "武圣", "武帝", "武神"];
	this.add_action("job_fam", "门派职位", function (me) {

	    var fam = me.family;
	    if (fam === FAMILIES.NONE) {
	        if (!me.query_temp('wg_sr'))
	            return me.notify(this.name +
	                "对你说道：这位" + me.call() + "和本馆素无瓜葛，升职从何说起？");
	    }
	    if (fam != this.family) return me.notify(this.name +
	        "对你说道：这位" + me.call() + "和本派素无瓜葛，升职从何说起？");
	    let gj = me.query_temp('gongji', 0);
	    let level = me.query_temp('sm_level', 0);
	    if (level >= 5) return me.send(this.name +
	        "对你说道：这位" + me.call() + "已经是最高级别的职位了。");

	    me.send(`${this.name}说：你现在是${fam.query_job_title(level)}，消耗${gj}/${NEEDS_GJ[level]}可以晋升到${fam.query_job_title(level + 1)}。`);
	    if (gj >= NEEDS_GJ[level]) {
	        me.send_commands('job_up_ok ' + this.id, '确定晋升');
	    }
	});
	this.add_action("job_up_ok", null, function (me) {

	    var fam = me.family;
	    if (fam != this.family) return me.notify(this.name +
	        "对你说道：这位" + me.call() + "和本派素无瓜葛，升职从何说起？");
	    if (fam === FAMILIES.NONE) {
	        if (!me.query_temp('wg_sr'))
	            return me.notify(this.name +
	                "对你说道：这位" + me.call() + "和本馆素无瓜葛，升职从何说起？");
	    }
	    let level = me.query_temp('sm_level', 0);
	    if (level >= 5) return me.send(this.name +
	        "对你说道：这位" + me.call() + "已经是最高级别的职位了。");

	    if (me.level < NEEDS_LEVEL[level])
	        return me.send(`${this.name}说道：这位${me.call()}，${fam.query_job_title(level + 1)}可不是谁都能当的，最少得是${NEEDS_LEVEL_DESC[level]}才行。`);
	    let gj = me.query_temp('gongji', 0);
	    let need = NEEDS_GJ[level];
	    if (gj >= NEEDS_GJ[level]) {
	        me.add_temp('gongji', -need);
	        USERTASK.GET('sm').on_finish(me);
	        level = me.add_temp('sm_level', 1);
	        me.send(`${this.name}说：恭喜你，现在是${me.family.query_task_title(me)}了，你的师门物资获得大幅度提升。`);

	    } else {
	        me.send(`${this.name}说：你的师门功绩还不够晋升，再努力一点吧。`);
	    }
	});

	this.add_action("gongji_shop", "门贡兑换", function (me) {
	    if (me.family !== this.family) return me.notify(this.name + "对你说道：你不是本派弟子，无法兑换。");
	    var cmd = WORLD.COMMANDS["list"];
	    if (cmd) cmd.enter(me, this.id);
	});

	this.add_action("gongji_refresh", "刷新货物", function (me) {
	    if (me.family !== this.family) return me.notify("你不是本派弟子。");
	    var today = new Date().getDate();
	    var lastDate = me.query_temp("gongji_refresh_date", 0);
	    var count = me.query_temp("gongji_refresh", 0);
	    if (lastDate !== today) {
	        count = 0;
	        me.set_temp("gongji_refresh_date", today);
	        me.remove_temp("gongji_refresh");
	    }
	    if (count >= 10) return me.notify(this.name + "说道：今天已经刷新太多次了，明天再来吧。");
	    var cost = (count + 1) * 100;
	    var gj = me.query_temp("gongji", 0);
	    me.send(this.name + "说道：第" + (count + 1) + "次刷新需要消耗" + cost + "点门贡，确定刷新吗？（今日还可刷新" + (9 - count) + "次）");
	    if (gj >= cost) {
	        me.send_commands("gongji_refresh_ok " + this.id, "确定刷新(" + cost + "门贡)");
	    } else {
	        me.notify("你的门贡不够" + cost + "。");
	    }
	});

	this.add_action("gongji_refresh_ok", null, function (me) {
	    if (me.family !== this.family) return;
	    var today = new Date().getDate();
	    var lastDate = me.query_temp("gongji_refresh_date", 0);
	    var count = me.query_temp("gongji_refresh", 0);
	    if (lastDate !== today) count = 0;
	    if (count >= 10) return me.notify("今天已经刷新太多次了。");
	    var cost = (count + 1) * 100;
	    var gj = me.query_temp("gongji", 0);
	    if (gj < cost) return me.notify("你的门贡不够" + cost + "。");
	    me.add_temp("gongji", -cost);
	    me.add_temp("gongji_refresh", 1);
	    me.set_temp("gongji_refresh_date", today);
	    // Re-randomize equipment slots
	    me.remove_temp("eq_refresh_slots");
	    this._goods = null;
	    me.notify(this.name + "说道：货物已刷新！");
	    var cmd = WORLD.COMMANDS["list"];
	    if (cmd) cmd.enter(me, this.id);
	});

	var FAM_TREASURES = {
	    "XIAOYAO": "qibao_ring",
	    "WUDANG": "taiji_cloth",
	    "HUASHAN": "haotian_shoes",
	    "EMEI": "jinding_head",
	    "SHAOLIN": "jinlan_cape",
	    "SHASHOU": "taiyin_throw",
            "GAIBANG": "fushen_waist"
	};

	this.add_action("fam_treasure", "门派至宝", function (me) {
	    if (me.level < 6) {
	        return me.notify("门派至宝只有武神才有资格兑换。");
	    }
	    if (me.family !== this.family) {
	        return me.notify(this.name + "对你说道：你不是本派弟子，无法兑换本派至宝。");
	    }

	    var treasure = FAM_TREASURES[this.family.id];
	    if (!treasure) {
	        return me.notify(this.name + "对你说道：本派暂无门派至宝。");
	    }

	    var soulFrag = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
	    var artFrag = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
	    var soulCount = soulFrag ? soulFrag.count : 0;
	    var artCount = artFrag ? artFrag.count : 0;

	    var treasurePath = "eq/lv6/wushen/" + treasure;
	    var treasureObj = OBJ.CREATE(treasurePath);
	    var treasureName = treasureObj ? treasureObj.name : "门派至宝";
	    var gradeColor = treasureObj ? treasureObj.query_grade_color() : "hiw";

	    var lines = [];
	    lines.push("\n<hiz>══ 门派至宝兑换 ══</hiz>");
	    lines.push("<hiw>" + this.family.name + "至宝：</hiw><" + gradeColor + ">" + treasureName + "</" + gradeColor + ">");

	    if (treasureObj && treasureObj.desc) {
	        lines.push(treasureObj.desc);
	    }

	    if (treasureObj && treasureObj.prop) {
	        lines.push("<" + gradeColor + ">" + UTIL.prop_toString(treasureObj.prop) + "</" + gradeColor + ">");
	    }

	    lines.push("\n<hiz>──────────────────</hiz>");
	    lines.push("<hiw>兑换条件：</hiw><hir>神魂碎片</hir><hiw>×30 + </hiw><hir>神器碎片</hir><hiw>×30</hiw>");
	    lines.push("<hiw>当前碎片：</hiw><hir>神魂碎片</hir><hiw>×" + soulCount + "  </hiw><hir>神器碎片</hir><hiw>×" + artCount + "</hiw>");

	    if (soulCount >= 30 && artCount >= 30) {
	        lines.push("\n<hig>碎片充足，可以兑换。</hig>");
	    } else {
	        lines.push("\n<hir>碎片不足，你确定要兑换吗？</hir>");
	    }

	    me.notify(lines.join("\n"));
	    me.send_commands("fam_treasure_ok " + this.id, "确定兑换(" + treasureName + ")");
	});

	this.add_action("fam_treasure_ok", null, function (me, par) {
	    if (me.family !== this.family) return;
	    var treasure = FAM_TREASURES[this.family.id];
	    if (!treasure) return;

	    var soulFrag = me.find_obj_bypath("eq/lv6/wushen/shenhunsuipian");
	    var artFrag = me.find_obj_bypath("eq/lv6/wushen/shenqisuipian");
	    var soulCount = soulFrag ? soulFrag.count : 0;
	    var artCount = artFrag ? artFrag.count : 0;

	    if (soulCount < 30 || artCount < 30) {
	        return me.notify("<hir>" + this.name + "</hir><hiw>对你说道：碎片不足，无法兑换。需要</hiw><hiy>神魂碎片</hiy><hiw>×30（当前：" + soulCount + "）、</hiw><wht>神器碎片</wht><hiw>×30（当前：" + artCount + "）。</hiw>");
	    }

	    me.remove_obj(soulFrag, 30);
	    me.remove_obj(artFrag, 30);
	    var obj = me.add_obj("eq/lv6/wushen/" + treasure, 1);
	    if (obj) {
	        me.notify("\n<hig>" + this.name + "郑重地将" + obj.color_name + "</hig><hiw>交到你手中：</hiw><hiy>望你善用此宝，不负师门厚望！</hiy>");
	    }
	});
