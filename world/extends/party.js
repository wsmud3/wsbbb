// 帮派数据类
Party = function (name, creator) {
    this.id = "pt_" + Date.now();
    this.name = name;
    this.level = 1;             // 帮派等级 1-5
    this.exp = 0;               // 帮派经验
    this.roles = [{
        id: creator.id,
        name: creator.name,
        level: 1,               // 1=帮主 2=副帮主 3=长老 4=堂主 5=帮众
        sc: 0,                  // 本周活跃度
        online: true
    }];
    this.notice = "";           // 帮派公告
    this.battle_family = "";    // 帮战目标门派
    this.temp = {};             // 临时数据
}

// 每级所需经验
Party.prototype.level_exp = [0, 1000, 3000, 6000, 10000];
// 每级最大人数
Party.prototype.level_roles = [0, 20, 30, 40, 50, 60];

Party.prototype.query_temp = function (name, def) {
    if (!this.temp) return def;
    var item = this.temp[name];
    if (item && item.e) {
        if (Date.now() <= item.e) {
            return item.v;
        }
        delete this.temp[name];
        return def;
    }
    return item !== undefined ? item : def;
};

Party.prototype.set_temp = function (name, value, time) {
    if (!this.temp) this.temp = {};
    if (time) {
        this.temp[name] = {
            v: value,
            e: Date.now() + time
        };
    } else {
        this.temp[name] = value;
    }
};

Party.prototype.add_temp = function (name, value, time) {
    if (!this.temp) this.temp = {};
    var old = this.temp[name];
    if (time) {
        if (old && old.e) {
            time = Date.now() + time;
            if (old.e < Date.now()) {
                old.e = time;
                old.v = value;
            } else {
                if (old.e < time) old.e = time;
                old.v += value;
            }
            return old.v;
        } else {
            var v = value + (old || 0);
            this.temp[name] = {
                v: v,
                e: Date.now() + time
            };
            return v;
        }
    } else {
        var v = value + (old || 0);
        this.temp[name] = v;
        return v;
    }
};

Party.prototype.remove_temp = function (name) {
    if (!this.temp) return;
    delete this.temp[name];
};

// 计算本周总活跃度（汇总各等级段的活跃度）
Party.prototype.query_score = function () {
    var total = 0;
    for (var i = 1; i <= 6; i++) {
        total += this.query_temp('sc' + i, 0);
    }
    return total;
};

// 获取帮派经验
Party.prototype.query_exp = function () {
    return this.exp;
};

// 获取成员
Party.prototype.get_role = function (id) {
    for (var i = 0; i < this.roles.length; i++) {
        if (this.roles[i].id === id) return this.roles[i];
    }
    return null;
};

// 最大成员数
Party.prototype.max_roles = function () {
    return this.level_roles[this.level] || 20;
};

// CHARACTER原型方法：获取玩家所属帮派
CHARACTER.prototype.query_party = function () {
    var ptId = this.query_temp("pt");
    if (!ptId) return null;
    return WORLD.DATA.parties.get(ptId) || null;
};

// 帮派数据持久化：序列化
Party.prototype.toJSON = function () {
    return {
        id: this.id,
        name: this.name,
        level: this.level,
        exp: this.exp,
        roles: this.roles,
        notice: this.notice,
        battle_family: this.battle_family,
        temp: this.temp
    };
};

// 帮派数据持久化：从JSON恢复
Party.fromJSON = function (json) {
    var pt = new Party({ id: "", name: "" }, { id: "", name: "" });
    pt.id = json.id;
    pt.name = json.name;
    pt.level = json.level || 1;
    pt.exp = json.exp || 0;
    pt.roles = json.roles || [];
    pt.notice = json.notice || "";
    pt.battle_family = json.battle_family || "";
    pt.temp = json.temp || {};
    return pt;
};

// 挂载帮派存档
(function () {
    var _on_save = WORLD.DATA.on_save;
    WORLD.DATA.on_save = function (str) {
        if (_on_save) _on_save.call(this, str);
        var arr = [];
        WORLD.DATA.parties.forEach(function (pt) {
            arr.push(pt.toJSON());
        });
        str.push(',parties:' + JSON.stringify(arr));
    };

    var _on_load = WORLD.DATA.on_load;
    WORLD.DATA.on_load = function (data) {
        if (_on_load) _on_load.call(this, data);
        WORLD.DATA.parties = new Map();
        var arr = data.parties;
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                var pt = Party.fromJSON(arr[i]);
                WORLD.DATA.parties.set(pt.id, pt);
            }
        }
    };

})();
