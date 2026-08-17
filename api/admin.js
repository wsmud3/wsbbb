const APIBASE = require('./base');
const { DB } = __CONFIG;
const http = require('http');
const fs = require('fs');
const path = require('path');

const IPC_PORT = 31301;
const IPC_HOST = '127.0.0.1';
const IPC_SECRET = process.env.ADMIN_IPC_SECRET || 'mud-admin-secret-change-me';
const ADMIN_LEVEL = __CONFIG.def_server?.istest ? 0 : 5;
const SKILL_DIR = path.join(__dirname, '..', 'world', 'skill');

// IPC port mapping: server ID -> IPC port
var IPC_PORT_MAP = {
    100: __CONFIG.ADMIN_IPC_PORT || 31303,
    200: __CONFIG.ADMIN_IPC_PORT_FORMAL || 31304
};

function getIpcPort(serverId) {
    if (serverId && IPC_PORT_MAP[serverId]) return IPC_PORT_MAP[serverId];
    // Default: if no serverId specified, use the first available
    return IPC_PORT_MAP[100] || IPC_PORT;
}

function ipcCall(method, url, body, serverId) {
    var port = getIpcPort(serverId);
    return new Promise((resolve, reject) => {
        var parsed = new URL('http://' + IPC_HOST + ':' + port + url);
        var opts = {
            hostname: IPC_HOST, port: port,
            path: parsed.pathname + parsed.search, method: method,
            headers: { 'Content-Type': 'application/json', 'X-IPC-Secret': IPC_SECRET },
            timeout: 10000,
        };
        var req = http.request(opts, function (res) {
            var data = '';
            res.on('data', function (chunk) { data += chunk; });
            res.on('end', function () {
                try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Parse: ' + data)); }
            });
        });
        req.on('error', function (e) { reject(e); });
        req.on('timeout', function () { req.destroy(); reject(new Error('IPC timeout')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Chinese name mapping for skill directories
var SKILL_TYPE_NAMES = {
    force: '内功', dodge: '轻功', parry: '招架', unarmed: '拳脚',
    sword: '剑法', blade: '刀法', staff: '杖法', club: '棍法',
    whip: '鞭法', throwing: '暗器',
    shaolin: '少林', wudang: '武当', huashan: '华山', emei: '峨眉',
    gaibang: '丐帮', xiaoyao: '逍遥', shashou: '杀手', sunv: '素女',
    base: '基础', knowage: '知识', monster: '怪物',
    hslj: '华山论剑', gm: '明教', gm2: '古墓', tl: '天龙',
    xd: '血刀', bh: '冰火岛', yh: '移花宫', hmy: '黑木崖',
    pm: '蓬莱', ss: '星宿', ts: '天山', hs: '衡山', hs2: '恒山',
    qc: '青城', wudu: '五毒', wf: '五风', kw: '野外',
    bt: '白驼山', th: '桃花岛', xx: '西夏',
};

class AdminAPI extends APIBASE {

    _sid(params) {
        var sid = (params && params.sid) ? parseInt(params.sid) : 0;
        return sid || 100; // default to test server
    }

    _requireAdmin() {
        var user = this.getUser();
        if (!user) throw new Error('未登录');
        if ((user.level || 0) < ADMIN_LEVEL) throw new Error('权限不足');
        return user;
    }

    // POST /api/admin/login
    async login(params) {
        var { code, pwd } = params;
        if (!code || !pwd) return { ok: false, msg: '用户名或密码不能为空' };
        code = code.toLowerCase();
        if (!/^[A-Za-z0-9_]{3,20}$/.test(code)) return { ok: false, msg: '用户名格式错误' };
        var user = await DB.getUserBy('name', code);
        if (!user) return { ok: false, msg: '用户不存在' };
        if (user.pwd !== this.MD5(pwd)) return { ok: false, msg: '密码错误' };
        if ((user.level || 0) < ADMIN_LEVEL) return { ok: false, msg: '非管理员账户，无权登录后台' };
        var cert = this.signIn(user.id, user.name, user.pwd, user.level);
        if (cert) {
            // 管理员cookie仅1小时有效，过期需重新登录
            this.res.cookie('u', this.req.cookies['u'], { maxAge: 3600000 });
            this.res.cookie('p', cert, { maxAge: 3600000 });
            return { ok: true, p: cert, u: this.sessionKey(), name: user.name, level: user.level };
        }
        return { ok: false, msg: '登录失败' };
    }

    // GET /api/admin/check
    async check() {
        try { var u = this._requireAdmin(); return { ok: true, name: u.name, level: u.level }; }
        catch (e) { return { ok: false, msg: e.message }; }
    }

    // GET /api/admin/online
    async online(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params);
        try { var r = await ipcCall('GET', '/api/online', null, sid); return { ok: true, data: Array.isArray(r) ? r : [] }; }
        catch (e) { return { ok: false, msg: '游戏服务器离线: ' + e.message, data: [] }; }
    }

    // GET /api/admin/player?id=xxx
    async player(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var pid = params.id || params.name;
        if (!pid) return { ok: false, msg: '请提供玩家ID或名称' };
        var sid = this._sid(params);
        try {
            var r = await ipcCall('GET', '/api/player/' + encodeURIComponent(pid), null, sid);
            if (r && !r.error) return { ok: true, data: r, source: 'online' };
        } catch (e) { /* fallback */ }
        return { ok: false, msg: '未找到在线玩家: ' + pid };
    }

    // GET /api/admin/status
    async status(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params);
        try { var r = await ipcCall('GET', '/api/status', null, sid); return { ok: true, data: r }; }
        catch (e) { return { ok: false, msg: '游戏服务器离线: ' + e.message }; }
    }

    // GET /api/admin/skills
    async skills() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try {
            var tree = {};
            var dirs = fs.readdirSync(SKILL_DIR, { withFileTypes: true });
            for (var i = 0; i < dirs.length; i++) {
                var d = dirs[i];
                if (!d.isDirectory()) continue;
                var files = fs.readdirSync(path.join(SKILL_DIR, d.name))
                    .filter(function (f) { return f.endsWith('.js'); })
                    .map(function (f) { return f.replace('.js', ''); });
                if (files.length > 0) tree[d.name] = files;
            }
            return { ok: true, data: tree, typeNames: SKILL_TYPE_NAMES };
        } catch (e) { return { ok: false, msg: '读取失败: ' + e.message }; }
    }

    // GET /api/admin/skill?type=force&name=jiuyangshengong
    async skill(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var type = params.type, name = params.name;
        if (!type || !name) return { ok: false, msg: 'type和name参数必填' };
        if (!/^[a-zA-Z0-9_]+$/.test(type) || !/^[a-zA-Z0-9_]+$/.test(name)) return { ok: false, msg: '非法文件名' };
        var fp = path.join(SKILL_DIR, type, name + '.js');
        if (!fp.startsWith(SKILL_DIR)) return { ok: false, msg: '路径越界' };
        try { return { ok: true, data: { type: type, name: name, content: fs.readFileSync(fp, 'utf8') } }; }
        catch (e) { return { ok: false, msg: '文件不存在' }; }
    }

    // POST /api/admin/skill_save
    async skill_save(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var type = params.type, name = params.name, content = params.content;
        if (!type || !name || content === undefined) return { ok: false, msg: 'type, name, content必填' };
        if (!/^[a-zA-Z0-9_]+$/.test(type) || !/^[a-zA-Z0-9_]+$/.test(name)) return { ok: false, msg: '非法文件名' };
        try { new Function(content); } catch (e) { return { ok: false, msg: 'JavaScript语法错误: ' + e.message }; }
        var fp = path.join(SKILL_DIR, type, name + '.js');
        if (!fp.startsWith(SKILL_DIR)) return { ok: false, msg: '路径越界' };
        try { fs.writeFileSync(fp, content, 'utf8'); } catch (e) { return { ok: false, msg: '写入失败: ' + e.message }; }
        try { var r = await ipcCall('POST', '/api/update', { path: 'world/skill/' + type + '/', fname: name }); if (r.error) return { ok: true, msg: '文件已保存，但热更失败: ' + r.error }; return { ok: true, msg: '保存成功，热更完成' }; }
        catch (e) { return { ok: true, msg: '保存成功，但热更失败(服务器离线)' }; }
    }

    // POST /api/admin/skill_create
    async skill_create(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var type = params.type, name = params.name, content = params.content;
        if (!type || !name) return { ok: false, msg: 'type和name必填' };
        if (!/^[a-zA-Z0-9_]+$/.test(type) || !/^[a-zA-Z0-9_]+$/.test(name)) return { ok: false, msg: '非法文件名' };
        var fp = path.join(SKILL_DIR, type, name + '.js');
        if (!fp.startsWith(SKILL_DIR)) return { ok: false, msg: '路径越界' };
        if (fs.existsSync(fp)) return { ok: false, msg: '技能文件已存在' };
        var def = content || [
            'this.inherits(SKILL);', 'this.name = "' + name + '";', 'this.id = "' + name + '";',
            'this.grade = 1;', 'this.is_public = true;', 'this.desc = "新技能描述";',
            'this.can_enables = ["' + type + '"];', 'this.learn_condition = { max_mp: 100 };',
            '', 'this.query_enable_prop = function(lv) {',
            '    return { ' + type + ': { gj: lv * 2 } };', '};',
        ].join('\n');
        try { new Function(def); } catch (e) { return { ok: false, msg: '模板语法错误: ' + e.message }; }
        try { fs.writeFileSync(fp, def, 'utf8'); } catch (e) { return { ok: false, msg: '创建失败: ' + e.message }; }
        try { var r = await ipcCall('POST', '/api/update', { path: 'world/skill/' + type + '/', fname: name }); if (r.error) return { ok: true, msg: '文件已创建，但热更失败: ' + r.error }; return { ok: true, msg: '创建成功并已热更' }; }
        catch (e) { return { ok: true, msg: '创建成功，但热更失败(服务器离线)' }; }
    }

    // POST /api/admin/skill_delete
    async skill_delete(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var type = params.type, name = params.name;
        if (!type || !name) return { ok: false, msg: 'type和name必填' };
        if (!/^[a-zA-Z0-9_]+$/.test(type) || !/^[a-zA-Z0-9_]+$/.test(name)) return { ok: false, msg: '非法文件名' };
        var fp = path.join(SKILL_DIR, type, name + '.js');
        if (!fp.startsWith(SKILL_DIR)) return { ok: false, msg: '路径越界' };
        if (!fs.existsSync(fp)) return { ok: false, msg: '文件不存在' };
        try {
            fs.unlinkSync(fp);
            // 通知游戏服务器清缓存（IPC端会删除对应文件并清BASE.ITEMS）
            try { await ipcCall('POST', '/api/skill_delete', { type: type, name: name }); }
            catch (e2) { /* 游戏服务器离线，文件已删除即可 */ }
            return { ok: true, msg: '已删除: ' + type + '/' + name + '.js' };
        } catch (e) { return { ok: false, msg: '删除失败: ' + e.message }; }
    }

    // POST /api/admin/broadcast
    async broadcast(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var msg = params.message;
        if (!msg) return { ok: false, msg: '公告内容不能为空' };
        var items = params.items || [];
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/broadcast', { message: msg, items: items }, sid); return { ok: true, msg: r.message || '已发送' }; }
        catch (e) { return { ok: false, msg: '发送失败: ' + e.message }; }
    }

    // POST /api/admin/broadcast_clear
    async broadcast_clear() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('DELETE', '/api/broadcast'); return { ok: true, msg: r.message || '已清空' }; }
        catch (e) { return { ok: false, msg: '清空失败: ' + e.message }; }
    }

    // POST /api/admin/give_item
    async give_item(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var playerId = params.playerId, itemPath = params.itemPath, count = parseInt(params.count) || 1;
        if (!playerId || !itemPath) return { ok: false, msg: 'playerId和itemPath必填' };
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/give_item', { playerId: playerId, itemPath: itemPath, count: count }, sid); return { ok: r.success || false, msg: r.message || r.error }; }
        catch (e) { return { ok: false, msg: '发放失败: ' + e.message }; }
    }

    // POST /api/admin/reclaim_item
    async reclaim_item(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var playerId = params.playerId, itemPath = params.itemPath, itemId = params.itemId, count = parseInt(params.count) || 1;
        if (!playerId || (!itemPath && !itemId)) return { ok: false, msg: 'playerId和(itemPath或itemId)必填' };
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/reclaim_item', { playerId: playerId, itemPath: itemPath, itemId: itemId, count: count }, sid); return { ok: r.success || false, msg: r.message || r.error }; }
        catch (e) { return { ok: false, msg: '回收失败: ' + e.message }; }
    }

    // POST /api/admin/users_list
    async users_list(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var keyword = params.keyword || '';
        try { var rows = await DB.getAdminUsers(keyword); return { ok: true, data: rows }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message }; }
    }

    // POST /api/admin/set_admin
    async set_admin(params) {
        try { var u = this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if ((u.level || 0) < 6) return { ok: false, msg: '权限不足，仅超级管理员可管理管理员' };
        var name = (params.name || '').trim().toLowerCase();
        var level = parseInt(params.level);
        if (!name || isNaN(level) || level < 0 || level > 5) return { ok: false, msg: '请输入账号并选择有效等级(0-5)' };
        // Look up user by name
        var user = await DB.getUserBy('name', name);
        if (!user) return { ok: false, msg: '账号不存在: ' + name };
        if (user.level >= 6) return { ok: false, msg: '不能修改超级管理员' };
        try { var r = await ipcCall('POST', '/api/set_admin', { uid: user.id, level: level }); return { ok: r.success || false, msg: r.message || r.error }; }
        catch (e) { return { ok: false, msg: '设置失败: ' + e.message }; }
    }

    // POST /api/admin/shutdown
    async shutdown(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params || {});
        try { var r = await ipcCall('POST', '/api/shutdown', {}, sid); return { ok: true, msg: r.message || '关服指令已发送' }; }
        catch (e) { return { ok: false, msg: '关服失败: ' + e.message }; }
    }

    // POST /api/admin/create_map — unified map/dungeon creation
    async create_map(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var id = params.id, name = params.name;
        if (!id || !name) return { ok: false, msg: 'ID和名称必填' };
        if (!/^[a-zA-Z0-9_]+$/.test(id)) return { ok: false, msg: 'ID只允许字母数字下划线' };
        try {
            var r = await ipcCall('POST', '/api/create_map', {
                id: id, name: name, desc: params.desc || '',
                map_type: params.map_type || 'public',
                expend: parseInt(params.expend) || 0,
                exp: parseInt(params.exp) || 0,
                pot: parseInt(params.pot) || 0,
                score: parseInt(params.score) || 0,
                is_multi: !!params.is_multi,
                rooms: params.rooms || [],
                drops: params.drops || [],
            });
            return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message, fb_index: r.fb_index, areaFile: r.areaFile };
        } catch (e) { return { ok: false, msg: '创建失败: ' + e.message }; }
    }

    // [deprecated] kept for backward compat
    async repair_check() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/repair_check'); return { ok: true, data: r.data || [] }; }
        catch (e) { return { ok: false, msg: '检查失败: ' + e.message, data: [] }; }
    }
    async repair_fix() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('POST', '/api/repair_fix'); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message, fixed: r.fixed }; }
        catch (e) { return { ok: false, msg: '修复失败: ' + e.message }; }
    }

    async room_list() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/room_list'); return { ok: true, data: r.data || [] }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }

    // Map management
    async map_list() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/map_list'); return { ok: true, data: r.data || [] }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }
    async map_detail(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/map_detail?type=' + (params.type||'public') + '&id=' + encodeURIComponent(params.id)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message }; }
    }
    async map_delete(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.id) return { ok: false, msg: 'id必填' };
        try { var r = await ipcCall('POST', '/api/map_delete', { type: params.type || 'public', id: params.id }); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message }; }
        catch (e) { return { ok: false, msg: '删除失败: ' + e.message }; }
    }

    async create_dungeon(params) {
        params.map_type = 'dungeon';
        return this.create_map(params);
    }

    // GET /api/admin/items_search?q=keyword
    async items_search(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var q = params.q || '';
        try { var r = await ipcCall('GET', '/api/items_search?q=' + encodeURIComponent(q)); return { ok: true, data: Array.isArray(r) ? r : [] }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }

    // GET /api/admin/npcs
    async npcs(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params || {});
        try { var r = await ipcCall('GET', '/api/npcs', null, sid); return { ok: true, data: Array.isArray(r) ? r : [] }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }

    // GET /api/admin/npc_detail
    async npc_detail(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('GET', '/api/npc_detail?path=' + encodeURIComponent(params.path)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message }; }
    }

    // GET /api/admin/npc_editdata
    async npc_editdata(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('GET', '/api/npc_editdata?path=' + encodeURIComponent(params.path)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message }; }
    }

    // POST /api/admin/npc_delete
    async npc_delete(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('POST', '/api/npc_delete', params); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message }; }
        catch (e) { return { ok: false, msg: '删除失败: ' + e.message }; }
    }

    // POST /api/admin/npc_create
    async npc_create(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('POST', '/api/npc_create', params); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message, path: r.path }; }
        catch (e) { return { ok: false, msg: '创建失败: ' + e.message }; }
    }

    // === Equipment Management ===
    // GET /api/admin/equipments
    async equipments() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/equipments'); return { ok: true, data: r.data || [] }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }
    // GET /api/admin/equipment_detail
    async equipment_detail(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('GET', '/api/equipment_detail?path=' + encodeURIComponent(params.path)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message }; }
    }
    // POST /api/admin/equipment_save
    async equipment_save(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('POST', '/api/equipment_save', params); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message, path: r.path }; }
        catch (e) { return { ok: false, msg: '保存失败: ' + e.message }; }
    }
    // POST /api/admin/equipment_delete
    async equipment_delete(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('POST', '/api/equipment_delete', params); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message }; }
        catch (e) { return { ok: false, msg: '删除失败: ' + e.message }; }
    }

    // POST /api/admin/eval
    async eval(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var code = params.code;
        if (!code) return { ok: false, msg: 'code必填' };
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/eval', { code: code }, sid); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.result }; }
        catch (e) { return { ok: false, msg: '执行失败: ' + e.message }; }
    }
    
    async backup_list() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { var r = await ipcCall('GET', '/api/backups'); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '获取备份列表失败: ' + e.message }; }
    }
    async backup_rollback(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.filename) return { ok: false, msg: 'filename必填' };
        try { var r = await ipcCall('POST', '/api/backup_rollback', { filename: params.filename }); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message }; }
        catch (e) { return { ok: false, msg: '回滚失败: ' + e.message }; }
    }
    async safe_shutdown() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { await ipcCall('POST', '/api/shutdown'); } catch(e) {}
        setTimeout(function () { process.exit(0); }, 1500);
        return { ok: true, msg: '安全关服已启动' };
    }

    // ===== File Manager =====
    // GET /api/admin/file_list?dir=xxx
    async file_list(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var dir = params.dir || '';
        try { var r = await ipcCall('GET', '/api/file_list?dir=' + encodeURIComponent(dir)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data, dir: r.dir }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: [] }; }
    }
    // GET /api/admin/file_read?path=xxx
    async file_read(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('GET', '/api/file_read?path=' + encodeURIComponent(params.path)); return r.error ? { ok: false, msg: r.error } : { ok: true, data: r.data }; }
        catch (e) { return { ok: false, msg: '读取失败: ' + e.message }; }
    }
    // POST /api/admin/file_save
    async file_save(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        if (params.content === undefined) return { ok: false, msg: 'content必填' };
        try { var r = await ipcCall('POST', '/api/file_save', { path: params.path, content: params.content }); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message || '保存成功' }; }
        catch (e) { return { ok: false, msg: '保存失败: ' + e.message }; }
    }
    // POST /api/admin/file_delete
    async file_delete(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.path) return { ok: false, msg: 'path必填' };
        try { var r = await ipcCall('POST', '/api/file_delete', { path: params.path }); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message || '删除成功' }; }
        catch (e) { return { ok: false, msg: '删除失败: ' + e.message }; }
    }

    // POST /api/admin/send_mail — 发送系统邮件
    async send_mail(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var playerId = params.playerId, message = params.message, items = params.items || [];
        if (!playerId || !message) return { ok: false, msg: 'playerId和message必填' };
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/send_mail', { playerId: playerId, message: message, items: items }, sid); return { ok: r.ok || false, msg: r.msg || r.error }; }
        catch (e) { return { ok: false, msg: '发送失败: ' + e.message }; }
    }

    // POST /api/admin/player_update — 更新玩家属性
    async player_update(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/player_update', params, sid); return { ok: r.ok || false, msg: r.msg || r.error }; }
        catch (e) { return { ok: false, msg: '更新失败: ' + e.message }; }
    }

    // POST /api/admin/stats — 获取玩家统计
    async stats(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/stats', {}, sid); return { ok: r.ok || false, data: r.data }; }
        catch (e) { return { ok: false, msg: '查询失败: ' + e.message, data: { totalPlayers: 0, activePlayers: 0 } }; }
    }

    // POST /api/admin/hot_reload — 便捷热更新
    async hot_reload(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        var target = params.target || 'all';
        var sid = this._sid(params);
        try { var r = await ipcCall('POST', '/api/hot_reload', { target: target }, sid); return r.error ? { ok: false, msg: r.error } : { ok: true, msg: r.message, files: r.files }; }
        catch (e) { return { ok: false, msg: '热更新失败(游戏服务器离线): ' + e.message }; }
    }
}
module.exports = AdminAPI;
