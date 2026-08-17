
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backup');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

module.exports = {
    parties: new Map(),
    PAIMAI: new Map(),
    temp: {},
    save: function () {

        let str = ["{"];
        this.save_temp(str);
        if (this.on_save) this.on_save(str);
        str.push('}');
        var content = str.join('');
        var md5 = crypto.createHash('md5').update(content).digest('hex');
        content += '\n//MD5:' + md5;
        return WORLD.DB.saveData(content);
    },
    temp_replacer: function (key, value) {
        if (value.e) {

        }

        return value;
    },
    backup: function () {
        var srcPath = __PATH.DATA + 'data.js';
        if (!fs.existsSync(srcPath)) return;
        var now = new Date();
        var ts = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '_' + String(now.getHours()).padStart(2,'0') + '-' + String(now.getMinutes()).padStart(2,'0');
        var dstPath = path.join(BACKUP_DIR, 'data_' + ts + '.js');
        try {
            fs.copyFileSync(srcPath, dstPath);
            var files = fs.readdirSync(BACKUP_DIR).filter(function(f){return f.endsWith('.js');}).sort();
            while (files.length > 48) { fs.unlinkSync(path.join(BACKUP_DIR, files.shift())); }
        } catch(e) { console.error('backup fail:', e.message); }
    },
    listBackups: function () {
        try { return fs.readdirSync(BACKUP_DIR).filter(function(f){return f.endsWith('.js');}).sort().reverse(); }
        catch(e) { return []; }
    },
    rollback: function (filename) {
        var src = path.join(BACKUP_DIR, filename);
        var dst = __PATH.DATA + 'data.js';
        if (!fs.existsSync(src)) return false;
        try {
            var now = new Date();
            var ts = 'rollback_' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
            // 回滚前先备份当前数据
            if (fs.existsSync(dst)) {
                fs.copyFileSync(dst, path.join(BACKUP_DIR, ts + '.js'));
            }
            fs.copyFileSync(src, dst);
            return true;
        } catch(e) { console.error('rollback fail:', e.message); return false; }
    },
    save_temp: function (str) {
        // 清理过期temp数据，防止data.js膨胀
        var now = Date.now();
        for (var key in this.temp) {
            var item = this.temp[key];
            if (item && item.e && item.e < now) {
                delete this.temp[key];
            }
        }
        str.push('temp:', JSON.stringify(this.temp));
    },
    load: async function () {
        const data = await WORLD.DB.readData(__PATH.DATA + "data.js");
        if (!data) { console.error('[存档] 数据为空，使用默认存档'); this.temp = {}; return; }
        this.temp = data.temp ?? {};
        this.on_load(data);
    },
    query_temp: function (name, def) {
        if (!this.temp) return;
        let item = this.temp[name];
        if (item && item.e) {
            if (Date.now() <= item.e) {
                return item.v;
            }
            delete this.temp[name];
            return def;
        }
        return item || def;
    },
    set_temp: function (name, value, time) {
        if (!this.temp) this.temp = {};
        if (time) {
            this.temp[name] = {
                v: value,
                e: Date.now() + time
            };
        } else {
            this.temp[name] = value;
        }
    },
    remove_temp: function (name) {
        if (!this.temp) return;
        this.temp[name] = null;
    },

    add_temp: function (name, value, time) {
        if (!this.temp) this.temp = {};
        let old = this.temp[name];
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
                let v = value + (old || 0);
                this.temp[name] = {
                    v: v,
                    e: Date.now() + time
                };
                return v;
            }
        } else {
            let v = value + (old || 0);
            this.temp[name] = v;
            return v;
        }
    },
    temp_data: {},
    clear_data: function () {
        this.temp_data = {};
    }
    ,
    add_data: function (key, user, val) {
        if (!val) return;
        let data = this.temp_data[key];
        if (!data) data = this.temp_data[key] = {};
        let user_data = data[user.id];
        if (!user_data) user_data = data[user.id] = { name: user.name, value: 0 };
        user_data.value += val;
    }, query_max_data: function (key) {
        let data = this.temp_data[key];
        if (!data) return;
        let userData = null;
        for (let key in data) {
            let item = data[key];
            if (!userData) userData = item;
            else if (item.value > userData.value) {
                userData = item;
            }
        }
        return userData;
    }, query_min_data: function (key) {
        let data = this.temp_data[key];
        if (!data) return;
        let userData = null;
        for (let key in data) {
            let item = data[key];
            if (!userData) userData = item;
            else if (item.value < userData.value) {
                userData = item;
            }
        }
        return userData;
    }
};

