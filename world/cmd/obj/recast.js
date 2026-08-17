	this.inherits(COMMAND);
	this.command = "recast";
	this.regex = /^(\w+)(?:\s(\w+))?(?:\s(\w+))?(?:\s(\w+))?$/;

	// 洗练次数 → 各分类词条数量上限 [基础,后天,高级,稀有,特殊]
	this.get_category_limits = function (refine_count) {
	    var rc = refine_count || 0;
	    if (rc >= 60) return [4, 4, 4, 3, 2];
	    if (rc >= 30) return [4, 4, 4, 2, 2];
	    if (rc >= 10) return [4, 4, 3, 2, 1];
	    return [4, 3, 2, 1, 1];
	};

	// 洗练次数 → 词条等级上限 (每10次+1级, max6)
	this.get_max_word_level = function (refine_count) {
	    var rc = refine_count || 0;
	    var cap = Math.floor(rc / 10) + 1;
	    if (cap > 6) cap = 6;
	    return cap;
	};

	// 洗练≥25可添加能力词条
	this.can_add_ability_word = function (refine_count) {
	    return (refine_count || 0) >= 25;
	};

	this.word_base = function () {
	    var d = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    return (d && d.WORD_BASE) || {};
	};

	// Send the full recast UI for an item
	this.send_ui = function (player, obj) {
	    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    if (!duanzao) return;
	    var rc = obj.refine_count || 0;
	    var limits = this.get_category_limits(rc);
	    var max_lv = this.get_max_word_level(rc);

	    var cat_counts = [0, 0, 0, 0, 0];
	    for (var i = 0; i < obj.words.length; i++) {
	        var wi = duanzao.PROPS[obj.words[i].key];
	        var wcat = wi ? wi.category : 0;
	        if (wcat < 5) cat_counts[wcat]++;
	    }
	    var catNames = duanzao.category_names || ["基础","后天","高级","稀有","特殊"];

	    var descLines = [];
	    descLines.push(obj.color_name + ' 洗练' + rc + '次 | 词条等级上限Lv.' + max_lv);
	    if (this.can_add_ability_word(rc)) descLines.push('能力词条已解锁');
	    descLines.push('词条上限：');
	    for (var c = 0; c < 5; c++) {
	        descLines.push(' ' + catNames[c] + cat_counts[c] + '/' + limits[c]);
	    }
	    var desc = descLines.join('<br>');

	    var stones = [];
	    for (var i = 0; i < player.items.length; i++) {
	        var st = player.items[i];
	        if (st.prop_key && duanzao.can_attach_prop(obj.eq_type, st.prop_key)) {
	            stones.push(st);
	        }
	    }

	    var stonesJson = [];
	    for (var j = 0; j < stones.length; j++) {
	        var stj = stones[j];
	        var base = this.word_base()[stj.prop_key] || 100;
	        var is_per = stj.prop_key.endsWith('_per') || stj.prop_key === 'ignore_fy' || stj.prop_key === 'final_damage';
	        var val_str = is_per ? ('+' + base + '%') : ('+' + base);
	        stonesJson.push({
	            id: stj.id,
	            name: stj.color_name,
	            prop_key: stj.prop_key,
	            cat: stj.prop_category || 0,
	            val: val_str
	        });
	    }

	    var wordsJson = [];
	    for (var k = 0; k < obj.words.length; k++) {
	        var wk = obj.words[k];
	        var wki = duanzao.PROPS[wk.key];
	        wordsJson.push({
	            key: wk.key,
	            name: wki ? wki.name : wk.key,
	            level: wk.level || 1,
	            cat: wki ? wki.category : 0
	        });
	    }

	    // 统计玩家身上的元晶数量
	    var yuanjingCount = 0;
	    var yuanjing = player.find_obj_bypath ? player.find_obj_bypath("st/yuanjing") : null;
	    if (!yuanjing && player.items) {
	        for (var yi = 0; yi < player.items.length; yi++) {
	            if (player.items[yi] && player.items[yi].path === "st/yuanjing") {
	                yuanjing = player.items[yi]; break;
	            }
	        }
	    }
	    if (yuanjing) yuanjingCount = yuanjing.count || 0;

	    player.send(JSON.stringify({
	        type: "dialog",
	        dialog: "pack",
	        rcdesc: desc,
	        id: obj.id,
	        stones: stonesJson,
	        words: wordsJson,
	        refineCount: rc,
	        maxWordLevel: max_lv,
	        limits: limits,
	        yuanjingCount: yuanjingCount
	    }));
	};

	this.enter = function (player, objid, arg2, arg3, arg4) {
	    var obj = player.find_obj(objid);
	    if (!obj && player.equipment) {
	        for (var ei = 0; ei < player.equipment.length; ei++) {
	            if (player.equipment[ei] && player.equipment[ei].id === objid) {
	                return player.notify('请先脱下' + player.equipment[ei].color_name + '才能重铸。');
	            }
	        }
	    }
	    if (!obj) return player.notify('找不到装备。');
	    if (!obj.is_equipment) return player.notify('这不是装备。');
	    if (obj.eq_type !== undefined && player.equipment && player.equipment[obj.eq_type] === obj) {
	        return player.notify('请先脱下' + obj.color_name + '才能重铸。');
	    }

	    var isCustom = obj.is_custom || (obj.path && (obj.path === "eq/cp" || obj.path.indexOf("eq/cp#") === 0 || obj.path.indexOf("eq/cp/") === 0));
	    if (!isCustom) return player.send('{type:"dialog",dialog:"pack",rcdesc:"只有自制装备才能重铸",id:"' + obj.id + '"}');
	    if (!obj.words) obj.words = [];

	    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    if (!duanzao) return player.notify('锻造系统未初始化。');

	    var rc = obj.refine_count || 0;
	    var limits = this.get_category_limits(rc);
	    var max_lv = this.get_max_word_level(rc);

	    if (arg2 === "replace") {
	        if (this.replace_word(player, objid, arg3, arg4) !== false)
	            this.send_ui(player, player.find_obj(objid));
	        return;
	    }

	    if (arg2 === "refine") {
	        this.do_refine(player, obj, 1);
	        return;
	    }

	    if (arg2 === "refine10") {
	        this.do_refine(player, obj, 10);
	        return;
	    }

	    // Handle rename: recast <objid> rename [newname]
	    if (arg2 === "rename") {
	        var newName = arg3;
        var grade_color = ["wht", "hig", "hic", "hiy", "HIZ", "hio", "ord"];
	        if (!newName) {
	            player.wait_input = function(me, cmd) {
	                me.wait_input = null;
	                if (!cmd) return;
	                var parts = cmd.split(' ');
	                if (parts.length < 2) return me.notify('请输入新名称，如：say 神兵利器');
	                var nn = parts.slice(1).join(' ');
	                if (nn.length < 2 || nn.length > 8) return me.notify('装备名需2-8个字符。');
	                var cur = me.find_obj(objid);
	                if (!cur) return me.notify('找不到装备。');
	                cur.name = nn;
	                var cc = grade_color[cur.grade] || "hio"; cur.color_name = "<" + cc + ">" + nn + "</" + cc + ">";
			cur.set_temp("name", nn); cur.pretag = null;
	                me.notify('装备已改名为：' + nn + '。');
			var packCmd = WORLD.COMMANDS && WORLD.COMMANDS.pack;
			var recastCmd = WORLD.COMMANDS && WORLD.COMMANDS.recast;
			if (recastCmd) recastCmd.send_ui(me, cur);
			if (packCmd) packCmd.enter(me, "");
	            };
	            player.notify('请输入新名称(打开聊天框任意频道输入)：');
	            player.send_commands("clearwait", "取消改名");
	            return;
	        }
	        if (newName.length < 2 || newName.length > 8) return player.notify('装备名需2-8个字符。');
	        obj.name = newName;
	        var cc = grade_color[obj.grade] || "hio"; obj.color_name = "<" + cc + ">" + newName + "</" + cc + ">";
	        player.notify('装备已改名为：' + newName + '。');
	        var packCmd = WORLD.COMMANDS && WORLD.COMMANDS.pack;
	        var recastCmd = WORLD.COMMANDS && WORLD.COMMANDS.recast;
	        if (recastCmd) recastCmd.send_ui(player, obj);
	        if (packCmd) packCmd.enter(player, "");
	        obj.set_temp("name", newName); obj.pretag = null;
	        return;
	    }

	    if (arg2) {
	        if (!obj.prop) {
	            obj.prop = {};
	        } else if (!Object.prototype.hasOwnProperty.call(obj, 'prop')) {
	            obj.prop = Object.assign({}, obj.prop);
	        }
	        var stone = player.find_obj(arg2);
	        if (!stone) { player.notify('找不到词条石。'); return; }
	        if (!stone.prop_key) { player.notify('无效的词条石。'); return; }

	        var prop_info = duanzao.PROPS[stone.prop_key];
	        if (!prop_info) { player.notify('词条石属性无效。'); return; }

	        if (!duanzao.can_attach_prop(obj.eq_type, stone.prop_key)) {
	            player.notify(prop_info.name + '不能装配到此部位。'); return;
	        }

	        var cat = stone.prop_category || prop_info.category || 0;
	        var is_ability = stone.is_ability || false;

	        if (is_ability && !this.can_add_ability_word(rc)) {
	            player.notify('洗练不足25次，无法添加能力词条。'); return;
	        }

	        var existing_idx = -1;
	        for (var i = 0; i < obj.words.length; i++) {
	            if (obj.words[i] && obj.words[i].key === stone.prop_key) {
	                existing_idx = i;
	                break;
	            }
	        }

	        if (!is_ability && existing_idx < 0) {
	            var cat_count = 0;
	            for (var i = 0; i < obj.words.length; i++) {
	                var wi = duanzao.PROPS[obj.words[i].key];
	                var wcat = wi ? wi.category : 0;
	                if (wcat === cat) cat_count++;
	            }
	            if (cat_count >= limits[cat]) {
	                var catNames = duanzao.category_names || ["基础","后天","高级","稀有","特殊"];
	                player.notify(catNames[cat] + '词条已满(上限' + limits[cat] + ')。'); return;
	            }
	        }

	        if (existing_idx >= 0) {
	            var existing = obj.words[existing_idx];
	            var current_lv = existing.level || 1;
	            if (current_lv >= max_lv && !is_ability) {
	                player.notify('词条已达上限Lv.' + max_lv + '。'); return;
	            }
	            if (is_ability && current_lv >= 1) {
	                player.notify('能力词条不可升级。'); return;
	            }
	            var new_level = current_lv + 1;
	            var old_val = obj.word_prop_value(stone.prop_key, current_lv);
	            var new_val = obj.word_prop_value(stone.prop_key, new_level);
	            if (obj.prop[stone.prop_key] !== undefined) {
	                obj.prop[stone.prop_key] = (obj.prop[stone.prop_key] || 0) - old_val + new_val;
	            } else {
	                obj.prop[stone.prop_key] = new_val;
	            }
	            existing.level = new_level;
	            stone = player.remove_obj(stone, 1);
	            if (stone) {
	                WORLD.STATS.updateWeapon(player, obj);
	                this.send_ui(player, obj);
	            } else {
	                player.notify('升级失败，请重试。');
	            }
	        } else {
	            var max_words = 4;
	            if (obj.words.length >= max_words) {
	                player.notify('词条已满，无法继续镶嵌。');
	                return;
	            }
	            var base_val = obj.word_prop_value(stone.prop_key, 1);
	            stone = player.remove_obj(stone, 1);
	            if (stone) {
	                if (!obj.prop) obj.prop = {};
	                obj.prop[stone.prop_key] = (obj.prop[stone.prop_key] || 0) + base_val;
	                obj.words.push({ key: stone.prop_key, level: 1, category: cat, is_ability: is_ability });
	                WORLD.STATS.updateWeapon(player, obj);
	                this.send_ui(player, obj);
	            } else {
	                player.notify('镶嵌失败，请重试。');
	            }
	        }
	        return;
	    }

	    this.send_ui(player, obj);
	};

	this.do_refine = function (player, obj, count) {
	    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    if (!duanzao) return;
	    var rc = obj.refine_count || 0;
	    if (rc >= 50) {
	        return player.send('{type:"dialog",dialog:"pack",rcdesc:"已达最大洗练次数(50次)",id:"' + obj.id + '"}');
	    }
	    if (!obj.prop) {
	        obj.prop = {};
	    } else if (!Object.prototype.hasOwnProperty.call(obj, 'prop')) {
	        obj.prop = Object.assign({}, obj.prop);
	    }
	    var yuanjing = player.find_obj_bypath ? player.find_obj_bypath("st/yuanjing") : null;
	    if (!yuanjing && player.items) {
	        for (var ri = 0; ri < player.items.length; ri++) {
	            if (player.items[ri] && player.items[ri].path === "st/yuanjing") {
	                yuanjing = player.items[ri]; break;
	            }
	        }
	    }
	    if (!yuanjing || yuanjing.count < 1) {
	        return player.send('{type:"dialog",dialog:"pack",rcdesc:"需要1个元晶进行洗练。可通过分解橙装获取。",id:"' + obj.id + '"}');
	    }

	    var maxTimes = Math.min(count, yuanjing.count, 50 - rc);
	    if (maxTimes <= 0) {
	        return player.send('{type:"dialog",dialog:"pack",rcdesc:"已达最大洗练次数(50次)",id:"' + obj.id + '"}');
	    }
	    var removed = player.remove_obj(yuanjing, maxTimes);
	    if (!removed) return player.send('{type:"dialog",dialog:"pack",rcdesc:"洗练失败",id:"' + obj.id + '"}');
	    obj.refine_count = rc + maxTimes;
	    if (duanzao && duanzao.DEFAULT_PROPS) {
	        var defProp = duanzao.DEFAULT_PROPS[obj.eq_type];
	        if (defProp && obj.prop) {
	            obj.prop[defProp] = (obj.prop[defProp] || 0) + maxTimes;
	        }
	    }
	    WORLD.STATS.updateWeapon(player, obj);
	    this.send_ui(player, obj);
	};

	this.word_value = function (prop_key, level) {
	    var base = this.word_base()[prop_key] || 100;
	    if (!level || level <= 1) return base;
	    return base * level;
	};

	this.replace_word = function (player, objid, old_key, stoneid) {
	    var obj = player.find_obj(objid);
	    if (!obj) { player.notify('找不到装备。'); return false; }
	    if (!obj.prop) {
	        obj.prop = {};
	    } else if (!Object.prototype.hasOwnProperty.call(obj, 'prop')) {
	        obj.prop = Object.assign({}, obj.prop);
	    }
	    var stone = player.find_obj(stoneid);
	    if (!stone) { player.notify('你身上没有这种词条石。'); return false; }
	    if (!stone.prop_key) { player.notify('无效的词条石。'); return false; }
	    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    if (!duanzao) { player.notify('锻造系统未初始化。'); return false; }
	    if (stone.prop_key === old_key) { player.notify('不能替换为同名词条，请使用升级功能。'); return false; }
	    if (!duanzao.can_attach_prop(obj.eq_type, stone.prop_key)) {
	        var pi = duanzao.PROPS[stone.prop_key];
	        player.notify((pi ? pi.name : stone.prop_key) + '不能装配到此部位。'); return false;
	    }
	    for (var ci = 0; ci < obj.words.length; ci++) {
	        if (obj.words[ci].key === stone.prop_key) {
	            player.notify('该装备已有此词条，请使用升级功能。'); return false;
	        }
	    }
	    var new_cat = stone.prop_category || (duanzao.PROPS[stone.prop_key] ? duanzao.PROPS[stone.prop_key].category : 0);
	    var rc = obj.refine_count || 0;
	    var limits = this.get_category_limits(rc);
	    var cat_count = 0;
	    for (var ci = 0; ci < obj.words.length; ci++) {
	        var wi = duanzao.PROPS[obj.words[ci].key];
	        var wcat = wi ? wi.category : 0;
	        if (wcat === new_cat && obj.words[ci].key !== old_key) cat_count++;
	    }
	    if (cat_count >= limits[new_cat]) {
	        player.notify(duanzao.category_names[new_cat] + '词条已满(上限' + limits[new_cat] + ')，无法替换。'); return false;
	    }
	    var old_idx = -1;
	    for (var i = 0; i < obj.words.length; i++) {
	        if (obj.words[i].key === old_key) { old_idx = i; break; }
	    }
	    if (old_idx < 0) { player.notify('该装备没有这个词条。'); return false; }
	    var old_word = obj.words[old_idx];
	    var old_level = old_word.level || 1;
	    var old_prop_info = duanzao.PROPS[old_key];
	    player.add_obj('st/p#' + old_key, old_level);
	    player.notify('旧词条 ' + (old_prop_info ? old_prop_info.name : old_key) + ' Lv.' + old_level + ' 已返还。');
	    var old_val = obj.word_prop_value(old_key, old_level);
	    if (obj.prop[old_key] !== undefined) {
	        obj.prop[old_key] -= old_val;
	        if (obj.prop[old_key] <= 0) delete obj.prop[old_key];
	    }
	    var success = false;
	    stone = player.remove_obj(stone, 1);
	    if (stone) {
	        var new_val = obj.word_prop_value(stone.prop_key, 1);
	        var new_prop_info = duanzao.PROPS[stone.prop_key];
	        obj.prop[stone.prop_key] = (obj.prop[stone.prop_key] || 0) + new_val;
	        obj.words.splice(old_idx, 1);
	        obj.words.push({ key: stone.prop_key, level: 1, category: new_cat });
	        player.notify('你为' + obj.color_name + '替换了' + (new_prop_info ? new_prop_info.name : stone.prop_key) + '词条。');
	        WORLD.STATS.updateWeapon(player, obj);
	        success = true;
	    } else {
	        var returned = null;
	        if (player.items) {
	            for (var k = 0; k < player.items.length; k++) {
	                if (player.items[k] && player.items[k].path === 'st/p#' + old_key) {
	                    returned = player.items[k]; break;
	                }
	            }
	        }
	        if (returned) player.remove_obj(returned, 1);
	        player.notify('替换失败，旧词条已保留。');
	    }
	    return success;
	};
