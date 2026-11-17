
require("./character.js");
CHARACTER.prototype.set_objects = function () {
    if (!arguments.length) return;
    if (!this.items) this.items = [];
    for (var i = 0; i < arguments.length; i++) {
        var item = arguments[i];
        var obj = OBJ.CREATE(item[0], item[1]);
        if (!obj) continue;
        if (item[2] && obj.is_equipment) {
            if (!this.equipment) this.equipment = []
            this.equipment[obj.eq_type] = obj;
        } else {
            this.items.push(obj);
        }
    }

}

CHARACTER.prototype.unequip = function (obj, notsend, recover_time = 0) {
    if (!obj || !obj.is_equipment || !this.equipment) return;
    if (obj.uneq(this, notsend) == false) {
        return false;
    }
    var slot = -1;
    for (var i = 0; i < this.equipment.length; i++) {
        if (this.equipment[i] === obj) {
            slot = i;
            break;
        }
    }
    if (slot < 0) return;
    if (!this.items) this.items = [];
    this.items.push(obj);
    this.equipment[slot] = null;
    if (obj.eq_type == EQUIP_TYPE.WEAPON) {
        this.remove_status('weapon', true);
        if (obj.is_shortcut) {
            this.send("{type:'addAction',id:'" + obj.id + "',name:'" + obj.name + "'}");
        }
    }

    if (obj.eq_type === EQUIP_TYPE.WEAPON)
        this.weapon_changed(false);
    this.recount();
    if (recover_time > 0 && this.is_player) {
        this.set_temp('eq_wea', obj.id, 60000);
    }
}



CHARACTER.prototype.equip = function (obj) {
    if (!obj || !obj.is_equipment) return;
    if (!this.equipment) this.equipment = []
    var equiped = this.equipment[obj.eq_type];
    if (equiped == obj) {
        return;
    }
    if (obj.check && obj.check(this) === false) return false;
    if (equiped) {
        if (equiped.uneq(this) === false) return false;
        this.equipment[equiped.eq_type] = null;
        this.items.push(equiped);
        if (equiped.eq_type == EQUIP_TYPE.WEAPON) {
            this.remove_status('weapon', true);
        }
        if (equiped.on_use) {
            equiped.notify_action(this, false);
        }
        if (equiped.is_shortcut) {
            this.send("{type:'addAction',id:'" + equiped.id + "',name:'" + equiped.name + "'}");
        }
    }
    if (obj.eq(this) == false) {
        if (equiped) {
            if (equiped.eq(this) !== false) {
                this.items.remove(equiped);
                this.equipment[equiped.eq_type] = equiped;
            }
            if (obj.eq_type === EQUIP_TYPE.WEAPON)
                this.weapon_changed(!!this.equipment[obj.eq_type]);
            this.recount();
        }
        return false;
    }
    this.items.remove(obj);
    this.equipment[obj.eq_type] = obj;
    if (obj.eq_type === EQUIP_TYPE.WEAPON)
        this.weapon_changed(true);
    this.recount();
    if (obj.is_shortcut) {
        this.send("{type:'removeAction',id:'" + obj.id + "'}");
    }
    if (obj.eq_type == EQUIP_TYPE.WEAPON) {
        if (this.fight_type) {
            this.release_time = 3000 + Date.now();
            this.send('{type:"dispfm",rtime:3000}');
        }
        if (this.query_temp('jxtm')) {
            this.remove_status('force');
        }
    }
}
const WEAPON_TYPES = {
    "sword": true,
    "blade": true,
    "staff": true,
    "club": true,
    "whip": true,
    "throwing": true
}
CHARACTER.prototype.weapon_changed = function (iseq) {
    this.attack_skill = this.query_used_skill(this.query_weapon_type());
    this.on_skillchanged && this.on_skillchanged();
    if (!this.auto_skills) return;

    for (let item of this.auto_skills) {
        if (WEAPON_TYPES[item.type]) {
            item.ban_use = !iseq;
        }
    }
}
CHARACTER.prototype.add_obj = function (obj, count) {
    if (!obj) return;
    if (typeof obj == "string") {
        obj = OBJ.clone_to(obj, this, count);
        if (!obj) return;
    } else {
        obj = this.push_item(obj);
    }
    return obj;
}
CHARACTER.prototype.remove_obj = function (obj, count) {
    if (typeof obj == "string") {
        obj = this.find_obj(obj);
    }
    if (!obj) return;
    count = count || obj.count || 1;
    this.remove_item(obj, count);
    return obj;
}
CHARACTER.prototype.query_weapon = function () {
    if (this.equipment) {
        return this.equipment[EQUIP_TYPE.WEAPON];
    }
}
CHARACTER.prototype.query_weapon_type = function () {
    if (this.equipment) {
        var eq = this.equipment[EQUIP_TYPE.WEAPON];
        if (eq && eq.weapon_type) return eq.weapon_type;
    }
    return WEAPON_TYPE.NONE;
}
CHARACTER.prototype.weapon_name = function () {
    if (this.equipment && this.equipment[EQUIP_TYPE.WEAPON]) {
        return this.equipment[EQUIP_TYPE.WEAPON].color_name;
    }
    return "";
}
CHARACTER.prototype.throwing_name = function () {
    if (this.equipment && this.equipment[EQUIP_TYPE.THROWING]) {
        return this.equipment[EQUIP_TYPE.THROWING].color_name;
    }
    return "";
}
CHARACTER.prototype.can_throwing = function () {
    if (this.equipment) {
        var th = this.equipment[EQUIP_TYPE.THROWING];
        if (!th) return false;
        return true;
    }
    return false;
}
CHARACTER.prototype.get_equipment = function (type) {
    return this.equipment && this.equipment[type];
}
CHARACTER.prototype.set_drop = function () {
    this.drop_list = this.drop_list || [];
    for (var i = 0; i < arguments.length; i++) {
        this.drop_list.push(arguments[i]);
    }
}
// 掉落归属的玩家：玩家本人；随从/宠物找主人；NPC 补刀等则取房间里的第一个玩家
function query_drop_owner(killer, env) {
    if (killer && killer.is_player) return killer;
    var items = env && env.items || [];
    if (killer && killer.master) {
        for (var i = 0; i < items.length; i++) if (items[i] && items[i].is_player && items[i].id === killer.master) return items[i];
    }
    for (var j = 0; j < items.length; j++) if (items[j] && items[j].is_player) return items[j];
    return null;
}
CHARACTER.prototype.query_drop = function () {
    if (!this.drop_list) return;
    // 按所在副本的难度过滤 diff 条目（非副本房间返回 undefined，不过滤）
    var env = this.environment || this.die_room;
    var diff = env && env.query_difficulty ? env.query_difficulty() : undefined;
    var items = OBJ.create_by_odds(this.drop_list, diff);
    // 副本里：击杀者（随从算主人）该副本次数不到 800 次不出橙装（AREA.filter_orange）
    if (env && env.is_fb && env.is_fb() && typeof AREA !== "undefined" && AREA.filter_orange) {
        items = AREA.filter_orange(env.parent, query_drop_owner(this._drop_killer, env), items);
    }
    return items;

}
