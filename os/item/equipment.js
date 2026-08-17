
require("../util/util.js");
EQUIPMENT = function () {
    this.eq_type = EQUIP_TYPE.WEAPON;
    this.level = 0;
    this.exp = 0;
    this.grade = 0;
    this.count = 1;
    this.combined = false;
    this.showAction = true;
    this.allow_fight = true;
    this.otype = 4;
}
EQUIPMENT.inherits(OBJ);
EQUIPMENT.prototype.is_equipment = true;
EQUIPMENT.prototype.transable = true;
//EQUIPMENT.prototype.eq_msg = "$N装备上$n。";
//EQUIPMENT.prototype.uneq_msg = "$N脱下$n。";
EQUIPMENT.prototype.change_prop = function (me, is_attach) {
    me.change_prop(this.prop, is_attach);
    if (this.st_prop) {
        for (var i = 0; i < this.st_prop.length; i++) {
            me.change_prop(this.st_prop[i].prop, is_attach);
        }
    }
}
EQUIPMENT.prototype.notify_action = function (me, isadd) {
    if (!this.on_use) return;
    isadd = me.equipment[this.eq_type] == this;
    if (isadd)
        me.send("{type:'addAction',id:'" + this.id + "',name:'" + this.name + "',distime:" + (this.distime || 0) + "}");
    else
        me.send("{type:'removeAction',id:'" + this.id + "'}");
}
EQUIPMENT.prototype.check = function (me) {
    if (!this.condition) return true;
    for (var key in this.condition) {
        var val = this.condition[key];
        switch (key) {
            case "skill":
                for (var sk in val) {
                    if (me.query_skill(sk, 0) < val[sk]) {
                        var sk_base = SKILL.get(sk);

                        return me.notify_fail("你的" + sk_base.color_name + "等级不够" + val[sk] + "，无法装备" + this.color_name + "。");
                    }
                }
                break;
            case "str1":
            case "con1":
            case "dex1":
            case "int1":
                if (me[key.replace("1", "")] < val) {
                    return me.notify_fail("你的先天" + PROPERTIES[key] + "不够" + val + "，无法装备" + this.color_name + "。");;
                }
                break;
            case "str":
            case "con":
            case "dex":
            case "int":
                if (me[key] + me.query_prop(key) < val) {
                    return me.notify_fail("你的" + PROPERTIES[key] + "不够" + val + "，无法装备" + this.color_name + "。");;
                }
                break;
            case "gender":
                if (me.gender != val) return me.notify_fail("你不是" + (val == 1 ? "男性" : "女性") + "，无法装备" + this.color_name + "。");
                break;
            case "desc":
                break;
            default:
                var me_val = me[key] || 0;
                me_val = me_val + me.query_prop(key);
                if (!me_val || me_val < val) {

                    return me.notify_fail("你的" + PROPERTIES[key] + "不够" + val + "，无法装备" + this.color_name + "。");;
                }
                break;
        }
    }
    return true;
}
EQUIPMENT.prototype.eq = function (me, notsend) {
    if (this.check(me) == false) {
        return false;
    }
    if (this.on_eq && this.on_eq(me) == false) {
        return false;
    }
    this.change_prop(me, true);
    this.check_group(me, true);
    //me.add_score(this.query_score());
    if (!notsend) {
        if (this.eq_msg)
            me.send_room(this.eq_msg, this);
        else {
            var msg;
            switch (this.eq_type) {
                case EQUIP_TYPE.WEAPON:
                    msg = "$N抽出一" + this.unit + this.color_name + "拿在手上。";
                    break;
                case EQUIP_TYPE.CLOTH:
                case EQUIP_TYPE.SHOES:
                case EQUIP_TYPE.PANTS:
                    msg = "$N穿上一" + this.unit + this.color_name + "。";
                    break;
                case EQUIP_TYPE.RING:
                    msg = "$N拿出一" + this.unit + this.color_name + "戴在手上。";
                    break;
                case EQUIP_TYPE.NECKLACE:
                case EQUIP_TYPE.JEWELS:
                case EQUIP_TYPE.WRIST:
                    msg = "$N戴上一" + this.unit + this.color_name + "。";
                    break;
                default:
                    msg = "$N装备上一" + this.unit + this.color_name + "。";
                    break;
            }
            me.send_room(msg, this);
        }
    }
    me.send('{type:"dialog",dialog:"pack",id:"' + this.id + '",eq:' + this.eq_type + '}');
}
EQUIPMENT.prototype.uneq = function (me, notsend) {
    this.on_uneq && this.on_uneq(me);
    this.change_prop(me, false);
    this.check_group(me, false);
    //me.add_score(-this.query_score());

    if (!notsend) {
        if (this.uneq_msg)
            me.send_room(this.uneq_msg, this);
        else {
            var msg;
            switch (this.eq_type) {
                case EQUIP_TYPE.WEAPON:
                    msg = "$N收回手中的" + this.color_name + "。";
                    break;
                case EQUIP_TYPE.CLOTH:
                case EQUIP_TYPE.SHOES:
                case EQUIP_TYPE.PANTS:
                case EQUIP_TYPE.WRIST:
                    msg = "$N将" + this.color_name + "脱了下来。";
                    break;
                case EQUIP_TYPE.RING:
                case EQUIP_TYPE.NECKLACE:
                case EQUIP_TYPE.JEWELS:
                    msg = "$N将" + this.color_name + "取了下来。";
                    break;
                default:
                    msg = "$N脱下一" + this.unit + this.color_name + "。";
                    break;
            }
            me.send_room(msg, this);
        }

    }

    me.send('{type:"dialog",dialog:"pack",id:"' + this.id + '",uneq:' + this.eq_type + '}');
}

EQUIPMENT.prototype.condition_tostring = function (str) {
    if (!this.condition) return;
    for (var key in this.condition) {
        var val = this.condition[key];
        switch (key) {
            case "skill":
                for (var sk in val) {
                    var sk_base = SKILL.get(sk);
                    str.push(sk_base.name + "要求：" + val[sk] + "级");
                }
                break;
            case "desc":
                str.push(desc);
                break;
            case "gender":
                str.push("性别要求：" + (val == 1 ? "男" : "女"));
                break;
            default:
                str.push(PROPERTIES[key] + "要求：" + val);
                break;
        }
        str.push("\n");
    }
}
EQUIPMENT.prototype.parts = ['武器', '衣服', '鞋', '头部', '披风', '戒指', '项链', '饰品', '护腕', '腰带', '暗器'];
EQUIPMENT.prototype.qualities = ["普通", "精良", "高级", "稀有", "绝世", "传说", "神器"];

EQUIPMENT.prototype.get_desc = function (me) {
    var str = [this.color_name];
    str.push("\n");
    str.push(this.parts[this.eq_type]);
    //str.push("\n");
    //str.push(this.query_quality());
    str.push("\n");
    this.condition_tostring(str);

    if (this.desc) str.push(this.desc);
    str.push("\n");
    if (this.prop) {
        str.push("<");
        str.push(this.query_grade_color());
        str.push(">");
        str.push(UTIL.prop_toString(this.prop));

        str.push("</");
        str.push(this.query_grade_color());
        str.push(">\n");
    }
    if (this.st_prop) {
        for (var i = 0; i < this.st_prop.length; i++) {
            str.push(this.st_prop[i].name);
            str.push("\n");
        }
    }
    if (this.words && this.words.length > 0) {
        var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
        str.push("<hio>词条属性：</hio>\n");
        for (var i = 0; i < this.words.length; i++) {
            var w = this.words[i];
            var wi = duanzao && duanzao.PROPS ? duanzao.PROPS[w.key] : null;
            var wname = wi ? wi.name : w.key;
            str.push("  " + wname + " Lv." + (w.level || 1));
            str.push("\n");
        }
    }
    if (this.hole_count) {
        for (var i = 0; i < this.hole_count; i++) {
            str.push("◇");
        }
    }
    this.query_group_desc(me, str);
    return str.join("");
}


EQUIPMENT.prototype.query_quality = function () {
    return this.qualities[this.grade];
}
const level_desc = ["", "☆", "★", "★☆", "★★", "★★☆", "★★★",
    "★★★☆", "★★★★", "★★★★☆", "★★★★★", "★★★★★☆", "★★★★★★"];
	// 计算词条属性的实际加成值（自制装备的基础/后天词条随精炼成长，公式同橙装）
	EQUIPMENT.prototype.word_prop_value = function (key, level) {
	    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
	    var base = duanzao && duanzao.WORD_BASE ? duanzao.WORD_BASE[key] : 0;
	    if (!base) return 0;
	    var wordVal = base * (level || 1);
	    if (this.is_custom && this.level > 0 && duanzao && duanzao.PROPS) {
	        var propInfo = duanzao.PROPS[key];
	        if (propInfo && (propInfo.category === 0 || propInfo.category === 1)) {
	            var val = this.levelData[this.level];
	            wordVal = wordVal + parseInt(wordVal * val / 100);
	        }
	    }
	    return wordVal;
	};

	EQUIPMENT.prototype.apply_words = function () {
    // 确保prop是自有属性，避免修改原型链上共享的prop对象
    if (!this.prop) {
        this.prop = {};
    } else if (!Object.prototype.hasOwnProperty.call(this, 'prop')) {
        this.prop = Object.assign({}, this.prop);
    }
    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
    // 清理已迁移的旧key prop残留
    if (duanzao && duanzao.KEY_MIGRATION) {
        for (var old_key in duanzao.KEY_MIGRATION) {
            if (this.prop[old_key] !== undefined) {
                delete this.prop[old_key];
            }
        }
    }
    if (!this.words || !this.words.length) return;
    if (!duanzao || !duanzao.WORD_BASE) return;
    for (var i = 0; i < this.words.length; i++) {
        var word = this.words[i];
        var base = duanzao.WORD_BASE[word.key];
        if (base) {
            this.prop[word.key] = (this.prop[word.key] || 0) + this.word_prop_value(word.key, word.level || 1);
        }
    }
}

EQUIPMENT.prototype.level_up = function (lev) {
    var cc = this.query_grade_color();

    this.prop = {};
    this.level = lev;
    this.levelchange_prop();
    this.apply_words();
    // 恢复洗练加成：每次洗练给不可替换的基础属性+1（仅自制装备，红装已有完整的levelchange_prop成长体系）
    if (this.refine_count > 0 && this.eq_type !== undefined && this.is_custom) {
        var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
        if (duanzao && duanzao.DEFAULT_PROPS) {
            var defProp = duanzao.DEFAULT_PROPS[this.eq_type];
            if (defProp) {
                this.prop[defProp] = (this.prop[defProp] || 0) + this.refine_count;
            }
        }
    }
    this.color_name = "<" + cc + ">" + level_desc[this.level] + this.name + "</" + cc + ">";
    this.json = null;
}


EQUIPMENT.prototype.levelData = [
    0, 4, 7, 15, 26, 41, 60, 82, 108, 138, 172, 209, 250
];
EQUIPMENT.prototype.levelchange_prop = function () {
    if (!(this.level >= 0 && this.level < 13)) return;
    const base_props = this.original_prop ?? Object.getPrototypeOf(this).prop;
    var val = this.levelData[this.level];
    for (var key in base_props) {
        var value = base_props[key];
        switch (key) {
            case "desc":
            case "str1":
            case "con1":
            case "dex1":
            case "int1":
            case "kar":
            case "skill":
                this.prop[key] = value;
                break;

            // 基础/后天可随精炼成长
            case "diff_busy":
            case "busy_per":
            case "caiyao1":
            case "diaoyu1":
            case "kuang1":
            case "lianyao1":
            case "expend_mp":
            case "busy":
                this.prop[key] = value + parseInt(value * val / 1000);
                break;

            // 自制装备：高级/稀有/特殊属性不受精炼等级影响
            // 普通装备：正常精炼成长
            case "per":
            case "gjsd":
            case "gjsd_per":
            case "distime_per":
            case "releasetime_per":
            case "gj_per":
            case "fy_per":
            case "mz_per":
            case "ds_per":
            case "zj_per":
            case "hp_per":
            case "diff_sh_per":
            case "diff_sh":
            case "diff_downside_per":
            case "diff_downside":
            case "expend_mp_per":
            case "diff_busy_per":
            case "bj_per":
            case "diff_bj":
            case "add_bjsh_per":
            case "distime":
            case "releasetime":
            case "diff_fy_per":
            case "add_sh_per":
                if (this.is_custom)
                    this.prop[key] = value;
                else
                    this.prop[key] = value + parseInt(value * val / 1000);
                break;
            default:
                if (PROPERTIES[key])
                    this.prop[key] = value + parseInt(value * val / 100);
                else
                    this.prop[key] = value;
                break;
        }
    }
}
EQUIPMENT.prototype.clear_stone = function () {
    if (!this.st_prop) return;

    this.hole_count += (this.st_prop.length);
    this.st_prop.length = 0;
}
EQUIPMENT.prototype.push_stone = function (stone) {
    if (!stone || !stone.prop) return false;
    if (!this.hole_count) return false;

    if (!this.st_prop) this.st_prop = [];
    this.hole_count--;
    var cc = stone.query_grade_color();
    var str = ["<", cc, ">◆", stone.name, " "];
    str.push(UTIL.prop_toString(stone.prop, " "));
    str.push("</");
    str.push(cc);
    str.push(">");

    this.json = null;
    this.st_prop.push({
        id: stone.id,
        path: stone.path,
        name: str.join(""),
        prop: stone.prop,
        grade: stone.grade
    });
}
EQUIPMENT.prototype.clone = function (me) {
    var obj = OBJ.CREATE(this.path);
    if (this.temp) {
        obj.temp = {};
        for (var key in this.temp) {
            obj.temp[key] = this.temp[key];
        }
    }
    obj.on_reload && obj.on_reload(me);
    obj.level_up(this.level);
    obj.st_prop = this.st_prop;
    return obj;
}



EQUIPMENT.prototype.save_db = function (str) {
    str.push('["', this.path, '","', this.id, '",', this.level);
    if (this.st_prop && this.st_prop.length) {
        str.push(",[");
        for (var i = 0; i < this.st_prop.length; i++) {
            if (i > 0) str.push(",");
            str.push('"', this.st_prop[i].path, '"');
        }
        str.push("]");
    }
    if (this.is_locked)
        str.push(',1');
    if (this.is_custom)
        str.push(',"custom"');
    if (this.refine_count)
        str.push(',"rc",', this.refine_count);
    if (this.eq_type !== undefined)
        str.push(',"et",', this.eq_type);
    if (this.weapon_type)
        str.push(',"wt","', this.weapon_type, '"');
    if (this.words && this.words.length) {
        str.push(',"words",[');
        for (var i = 0; i < this.words.length; i++) {
            if (i > 0) str.push(',');
            str.push('"', this.words[i].key, '",', this.words[i].level || 1);
        }
        str.push(']');
    }
    if (this.temp)
        str.push(",", this.format_temp(this.temp));
    str.push("]");
}
EQUIPMENT.prototype.load_db = function (data) {
    this.id = data[1];
    if (data[2] > 0) {
        this.level = data[2];
    }
    var i = 3;
    while (i < data.length) {
        let value = data[i];
        if (value === 1) {
            this.is_locked = true;
            i++;
        } else if (value === "custom") {
            this.is_custom = true;
            i++;
        } else if (value === "rc") {
            this.refine_count = data[i + 1] || 0;
            i += 2;
        } else if (value === "et") {
            this.eq_type = data[i + 1] || 0;
            i += 2;
        } else if (value === "wt") {
            this.weapon_type = data[i + 1];
            i += 2;
        } else if (value === "words") {
            var wordData = data[i + 1];
            if (Array.isArray(wordData)) {
                this.words = [];
                var migration = (WORLD.COMMANDS && WORLD.COMMANDS.duanzao) ? WORLD.COMMANDS.duanzao.KEY_MIGRATION : null;
                for (var j = 0; j < wordData.length; j += 2) {
                    var wk = wordData[j];
                    // 兼容旧key：自动迁移到新key名
                    if (migration && migration[wk]) wk = migration[wk];
                    this.words.push({ key: wk, level: wordData[j + 1] || 1 });
                }
            }
            i += 2;
        } else if (Array.isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                var st_item = OBJ.CREATE(value[j]);
                if (st_item) {
                    this.push_stone(st_item);
                }
            }
            i++;
        } else if (typeof value === 'object') {
            this.temp = value;
            i++;
        } else {
            i++;
        }
    }
}
EQUIPMENT.prototype.on_load = function (me) {
    this.on_reload && this.on_reload(me);
    if (this.level > 0) {
        this.level_up(this.level);
    } else {
        // level 0 equipment: level_up not called, apply word stats directly
        this.apply_words();
    }
    // 兼容旧数据：仅当path明确指向自制装备时才设为custom
    // 红装也有精炼计数，且绝不允许根据词条反推is_custom（会造成红装污染）
    if (!this.is_custom) {
        if (this.path && (this.path === "eq/cp" || this.path.indexOf("eq/cp#") === 0 || this.path.indexOf("eq/cp/") === 0)) {
            this.is_custom = true;
        }
    }
}

EQUIPMENT.prototype.VALUES = [100, 500, 2000, 8000, 25000, 50000, 200000];
EQUIPMENT.prototype.on_create = function (path, par) {
    this.value = this.VALUES[this.grade];

}

EQUIPMENT.prototype.query_group_desc = function (me, str) {
    if (!this.group_prop || !this.group_name) return;
    var count = 0;
    if (me && me.equipment) {
        for (var i = 0; i < me.equipment.length; i++) {
            if (me.equipment[i] && me.equipment[i].group_name == this.group_name) {
                count++;
            }
        }
    }
    for (var i = 2; i < 8; i++) {
        var prop = this.group_prop(i);
        if (prop) {
            var cc = i <= count ? this.query_grade_color() : "blk";

            str.push("<");
            str.push(cc);
            str.push(">");
            str.push("\n");
            str.push(UTIL.to_c(i));
            str.push("件套：");
            str.push(UTIL.prop_toString(prop, " "));
            str.push("</");
            str.push(cc);
            str.push(">");
        }
    }


}

EQUIPMENT.prototype.check_group = function (me, isadd) {
    if (!this.group_prop || !this.group_name) return;
    var count = isadd ? 1 : 0;
    for (var i = 0; i < me.equipment.length; i++) {
        if (me.equipment[i] && me.equipment[i].group_name == this.group_name) {
            count++;
        }
    }
    var prop = this.group_prop(count);
    if (prop) {
        me.change_prop(prop, isadd);
    }

}