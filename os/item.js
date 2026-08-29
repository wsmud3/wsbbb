require("./util/util");
ITEM = function () {

}
ITEM.inherits(BASE);


ITEM.prototype.heart_beat = function (dt) {

}
ITEM.prototype.init = function () {

}
//物件对命令的反应有几种方式实现
//1. 直接实现ON_XXXX，cmd里定义的有直接对象的命令推荐这种，比如on_accept是当别人给你东西时候，on_checkskill当别人学你技能时，适合目标明确的操作
//2. add_action方式，房间里的指令推荐用这种，虽然也可以实现1，但是因为调用add_action时候还没ID，适合房间的自定义命令和已定义的有目标的命令
//3. on(xxx)方式，对房间里的命令的反映，适合回应目标不是当前对象，或没有目标的命令
//actions里定义的动作会作为对象的可用操作发送出去
//添加物件可以接收的命令,目标是当前对象的
ITEM.prototype.add_action = function (cmd, name, func) {
    if (!cmd) return;
    if (!this.actions) this.actions = {};
    var act = this.actions[cmd];
    if (act) {
        if (!name) {
            act.action = func;
        } else {
            act.name = name;
        }
        if (!func) {
            act.name = name;
        } else {
            act.action = func;
        }
    } else {
        act = {
            name: name,
            action: func
        };
        this.actions[cmd] = act;
    }
    this.json = null;
    return act;
}
//移除物件可以接收的命令
ITEM.prototype.remove_action = function (name, func) {
    if (!this.actions) this.actions = {};
    if (typeof (name) === "string") {
        delete this.actions[name];
    } else {
        for (var i = 0; i < name.length; i++) {
            delete this.actions[name[i]];
        }
    }
    this.json = null;
}
//执行命令 返回true表示已经完成命令，后续不需要执行 
ITEM.prototype.exec = function (cmdName, pars) {
    if (this.actions) {
        var cmd = this.actions[cmdName];
        if (cmd && cmd.action) {
            return cmd.action.apply(this, pars);
        }
    }
    return false;
}
ITEM.prototype.max_item_count = 10;
ITEM.prototype.item_count = function () {
    return this.items ? this.items.length : 0;
}
ITEM.prototype.is_full = function (val) {
    if (!this.items) return false;
    if (val) return this.items.length + val > this.max_item_count;

    return this.items.length >= this.max_item_count;
}
ITEM.prototype.find_obj = function (id) {
    return null;
}
ITEM.prototype.find_obj_bypath = function (path, parent) {
    parent = parent || this;
    if (!parent.items) return;
    for (var i = 0; i < parent.items.length; i++) {
        if (parent.items[i].path === path) {
            return parent.items[i];
        }
    }
}
ITEM.prototype.each_item = function (func, parent) {
    if (!func) return;
    parent = parent || this;
    var l = parent.items.length;
    for (var i = 0; i < l; i++) {
        var item = parent.items[i];
        if (!item) continue;
        if (func(item) === false) return;
    }
};
ITEM.prototype.is = function (obj) {
    if (!obj) return false;
    if (typeof obj === "string")
        return this.path === obj;
    return this.path === obj.path;
}
ITEM.prototype.remove_item_byid = function (obj, count = 0) {
    if (!obj || !this.items) return;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (item.id === obj) {
            if (item.combined && count > 0) {
                var subitem = item.uncombine(count);
                if (!subitem) return;
                if (subitem === item) {
                    this.items.splice(i, 1);
                }
                return subitem;
            } else {
                this.items.splice(i, 1);
                return item;
            }
        }
    }
    return null;
}
ITEM.prototype.remove_item = function (obj, count) {
    if (!obj || !this.items) return;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (item === obj) {
            if (item.combined) {
                var subitem = item.uncombine(count);
                if (!subitem) return;
                if (subitem === item) {
                    this.items.splice(i, 1);
                }
                return subitem;
            } else {
                this.items.splice(i, 1);
                return item;
            }
        }
    }
    return null;
}
ITEM.prototype.move_item_to = function (obj, count, target) {
    if (!obj || !this.items) return;
    var moved_obj = this.remove_item(obj, count);
    if (!target) return;
    return target.push_item(moved_obj);
}
ITEM.prototype.push_item = function (moved_obj) {
    if (!moved_obj) return;
    if (!this.items) this.items = [];
    if (moved_obj.is_money && this.money !== undefined) {

        this.money += moved_obj.value * moved_obj.count;
    } else if (moved_obj.combined) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].is(moved_obj)) {
                this.items[i].combine(moved_obj);
                return this.items[i];
            }
        }
        this.items.push(moved_obj);
    } else {
        this.items.push(moved_obj);
    }
    return moved_obj;
}
ITEM.prototype.create_id = function () {
    this.id = UTIL.create_id();

}
ITEM.prototype.refresh = function () {
    this.json = null;
}
ITEM.prototype.is_hidden = function () {
    return false;
}
ITEM.prototype.query_create_time = function () {
    var id = this.id;
    if (!id) return;
    var time = parseInt(id.substr(4), 16);

    return new Date(time * 1000 + UTIL.begin);
}

ITEM.prototype.find_obj_byid = function (items, oid) {
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === oid) {
            return items[i];
        }
    }
}

ITEM.prototype.long_name = function () {
    return this.name;
}




ITEM.prototype.create = function (file, ctor) {
    this.uid = this.create_uid();
}
ITEM.prototype.destroy = function () {

}

ITEM.prototype.format_temp = function (temp, timeout = 120000) {
    if (!temp) return "{}";
    var dt = Date.now() + timeout;
    var tmp = ["{"];
    for (var key in temp) {
        var v = temp[key];
        if (!v) continue;
        if (v && typeof v == "object" && v.e && Object.prototype.hasOwnProperty.call(v, "v")) {
            if (dt > v.e || !v.v) continue;
            var svInner;
            if (typeof v.v == "string") svInner = JSON.stringify(v.v);
            else if (v.v && typeof v.v == "object") {
                svInner = safeStringify(v.v);
                if (svInner === undefined) continue; // 循环引用等不可序列化，跳过
            } else svInner = v.v;
            if (tmp.length > 1) tmp.push(",");
            tmp.push(JSON.stringify(key));
            tmp.push(":{e:");
            tmp.push(v.e);
            tmp.push(",v:");
            tmp.push(svInner);
            tmp.push("}");
        } else {
            // 先算出可序列化的值，不可序列化（循环引用）则整条跳过，避免残留 "key": 残片
            var vstr;
            if (typeof v == "string") vstr = JSON.stringify(v);
            else if (Array.isArray(v)) {
                vstr = safeStringify(v);
                if (vstr === undefined) vstr = "[]";
            } else if (v && typeof v == "object") {
                // 临时状态可能是对象；必须序列化，否则会写成非法的 [object Object]。
                // 但 Node 定时器句柄（Timeout）等含循环引用的对象无法序列化，
                // 会抛 "Converting circular structure to JSON" 导致整个存档崩溃，此类条目直接跳过。
                vstr = safeStringify(v);
                if (vstr === undefined) continue;
            } else {
                vstr = v;
            }
            if (tmp.length > 1) tmp.push(",");
            tmp.push(JSON.stringify(key));
            tmp.push(":");
            tmp.push(vstr);
        }
    }
    tmp.push("}");
    return tmp.join("");
}

// 安全 JSON 序列化：循环引用等不可序列化的对象返回 undefined 而非抛异常
function safeStringify(v) {
    try {
        var s = JSON.stringify(v);
        return s === undefined ? undefined : s;
    } catch (e) {
        return undefined;
    }
}