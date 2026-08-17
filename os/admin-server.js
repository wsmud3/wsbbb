// Admin IPC Server - runs inside main.js process
// Listens on 127.0.0.1:31301, only accessible from localhost
// Used by web.js to query game state and trigger actions

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('../data/db');
const IPC_PORT = parseInt(process.env.ADMIN_IPC_PORT) || 31301;
const IPC_SECRET = process.env.ADMIN_IPC_SECRET || 'mud-admin-secret-change-me';
const SKILL_DIR = path.join(__dirname, '..', 'world', 'skill');
const OBJ_DIR = path.join(__dirname, '..', 'world', 'obj');
const NPC_DIR = path.join(__dirname, '..', 'world', 'npc');
const JH_FILE = path.join(__dirname, '..', 'world', 'cmd', 'dialog', 'jh.js');

// Cache for item name->path mapping (lazy loaded)
var itemCache = null;
var itemCacheTime = 0;
function getItemList() {
    var now = Date.now();
    if (itemCache && (now - itemCacheTime) < 600000) return itemCache; // 10min cache
    var items = [];
    function scanObjDir(dir, prefix) {
        var entries = fs.readdirSync(dir, { withFileTypes: true });
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            var full = path.join(dir, e.name);
            if (e.isDirectory()) { scanObjDir(full, prefix + e.name + '/'); }
            else if (e.name.endsWith('.js')) {
                var relPath = prefix + e.name.replace('.js', '');
                var name = '';
                try {
                    var content = fs.readFileSync(full, 'utf8');
                    var m1 = content.match(/this\.set\(\s*\{[\s\S]*?name:\s*"([^"]+)"/);
                    if (m1) name = m1[1];
                    else {
                        var m2 = content.match(/this\.name\s*=\s*"([^"]+)"/);
                        if (m2) name = m2[1];
                    }
                    name = name.replace(/<[^>]+>/g, ''); // strip color tags
                } catch (ex) {}
                items.push({ path: relPath, name: name || relPath });
            }
        }
    }
    scanObjDir(OBJ_DIR, '');
    // Sort: items with names first, then by name
    items.sort(function(a, b) {
        if (a.name && !b.name) return -1;
        if (!a.name && b.name) return 1;
        return (a.name || a.path).localeCompare(b.name || b.path);
    });
    itemCache = items;
    itemCacheTime = now;
    return items;
}

// NPC listing
function getNpcList() {
    var npcs = [];
    if (!fs.existsSync(NPC_DIR)) return npcs;
    function scanNpcDir(dir, prefix) {
        var entries = fs.readdirSync(dir, { withFileTypes: true });
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            var full = path.join(dir, e.name);
            if (e.isDirectory()) { scanNpcDir(full, prefix + e.name + '/'); }
            else if (e.name.endsWith('.js')) {
                var relPath = prefix + e.name.replace('.js', '');
                var name = '';
                var hp = 0, gj = 0, score = 0;
                var noFight = false, isMerchant = false;
                try {
                    var content = fs.readFileSync(full, 'utf8');
                    var m1 = content.match(/this\.set\(\s*\{[\s\S]*?name:\s*"([^"]+)"/);
                    if (m1) name = m1[1];
                    var m2 = content.match(/hp:\s*(\d+)/);
                    if (m2) hp = parseInt(m2[1]);
                    var m3 = content.match(/gj:\s*(\d+)/);
                    if (m3) gj = parseInt(m3[1]);
                    var m4 = content.match(/score:\s*(\d+)/);
                    if (m4) score = parseInt(m4[1]);
                    noFight = /no_fight:\s*true/.test(content);
                    isMerchant = /is_merchant:\s*true/.test(content) || /this\.sell_list\s*=/.test(content);
                } catch (ex) {}
                npcs.push({ path: relPath, name: name || relPath, hp: hp, gj: gj, score: score, no_fight: noFight, is_merchant: isMerchant });
            }
        }
    }
    scanNpcDir(NPC_DIR, '');
    npcs.sort(function(a, b) { return (a.name || a.path).localeCompare(b.name || b.path); });
    return npcs;
}

function verifySecret(req, res) {
    var secret = req.headers['x-ipc-secret'];
    if (secret !== IPC_SECRET) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden: invalid IPC secret' }));
        return false;
    }
    return true;
}

function readBody(req, callback) {
    var body = '';
    req.on('data', function (chunk) { body += chunk; });
    req.on('end', function () {
        try { callback(null, body ? JSON.parse(body) : {}); }
        catch (e) { callback(e, null); }
    });
}

function sendJSON(res, data, status) {
    res.writeHead(status || 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function isFormalServer() {
    return WORLD.SERVER && !WORLD.SERVER.istest;
}

var startTime = Date.now();

// Chinese name mapping for skills
function getSkillName(skillId) {
    var sk = SKILL.get(skillId);
    return sk ? sk.name : skillId;
}

// Chinese name mapping for equipment slots
var EQUIP_SLOTS = ['武器', '衣服', '头盔', '鞋子', '腰带', '护腕', '项链', '戒指', '披风', '手套'];

function handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8088');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-IPC-Secret');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (!verifySecret(req, res)) return;

    var url = req.url.split('?')[0];
    var method = req.method;

    try {
        // GET /api/status
        if (url === '/api/status' && method === 'GET') {
            sendJSON(res, {
                uptime: Math.floor((Date.now() - startTime) / 1000),
                playerCount: WORLD.USERS.length,
                connectCount: WORLD.CONNECT_COUNT || 0,
                heartbeatCount: WORLD.HEARTBEATCOUNT || 0,
                serverId: WORLD.SERVERID,
                serverName: WORLD.SERVER ? WORLD.SERVER.name : 'unknown',
                status: 'running'
            });
        }
        // POST /api/stats — 获取玩家统计
        else if (url === '/api/stats' && method === 'POST') {
            readBody(req, function (err, body) {
                var totalPlayers = 0, activePlayers = 0;
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var u = WORLD.USERS[i];
                    if (!u || !u.is_player) continue;
                    totalPlayers++;
                    if (u.is_active) activePlayers++;
                }
                sendJSON(res, { ok: true, data: { totalPlayers: totalPlayers, activePlayers: activePlayers } });
            });
        }
        // GET /api/online
        else if (url === '/api/online' && method === 'GET') {
            var players = [];
            for (var i = 0; i < WORLD.USERS.length; i++) {
                var u = WORLD.USERS[i];
                if (!u || !u.is_player) continue;
                var env = u.environment;
                players.push({
                    id: u.id, name: u.name, level: u.level || 0,
                    hp: u.hp, max_hp: u.max_hp, mp: u.mp, max_mp: u.max_mp,
                    str: u.str, con: u.con, dex: u.dex, int: u.int,
                    gj: u.gj, fy: u.fy, mz: u.mz, ds: u.ds, zj: u.zj,
                    exp: u.exp || 0, pot: u.pot || 0, money: u.money || 0,
                    score: u.score || 0,
                    location: env ? (env.parent ? env.parent.name + '-' + env.name : env.name) : 'unknown',
                    locationPath: env ? env.path : 'unknown',
                    title: u.title || '', gender: u.gender || 0,
                    age: u.age || 0, per: u.per || 0,
                    family: u.family ? u.family.name : '无',
                    isBusy: !!u.is_busy, isFaint: !!u.is_faint, isFighting: u.fight_type > 0,
                });
            }
            sendJSON(res, players);
        }
        // GET /api/player/:id
        else if (url.startsWith('/api/player/') && method === 'GET') {
            var pid = decodeURIComponent(url.substring('/api/player/'.length));
            var found = WORLD.find_user(pid);
            if (!found) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    if (WORLD.USERS[i] && WORLD.USERS[i].is_player && WORLD.USERS[i].id === pid) {
                        found = WORLD.USERS[i]; break;
                    }
                }
            }
            if (!found) { sendJSON(res, { error: 'Player not found online' }, 404); return; }

            var env = found.environment;
            // Skills with Chinese names
            var skills = {};
            if (found.skills) {
                for (var sk in found.skills) {
                    skills[sk] = {
                        name: getSkillName(sk),
                        level: found.skills[sk].level,
                        exp: found.skills[sk].exp || 0
                    };
                }
            }
            var statuses = [];
            if (found.status) {
                for (var si = 0; si < found.status.length; si++) {
                    var st = found.status[si];
                    statuses.push({ id: st.id, name: st.name, desc: st.desc, downside: !!st.downside, duration: st.duration, start_time: st.start_time });
                }
            }
            var eq = [];
            if (found.equipment) {
                for (var ei = 0; ei < found.equipment.length; ei++) {
                    if (found.equipment[ei]) {
                        eq.push({ slot: ei, slotName: EQUIP_SLOTS[ei] || ('槽' + ei), name: found.equipment[ei].name, path: found.equipment[ei].path });
                    }
                }
            }
            // Inventory items
            var inv = [];
            if (found.items) {
                for (var ii = 0; ii < found.items.length; ii++) {
                    var it = found.items[ii];
                    if (it) inv.push({ name: it.name, path: it.path, id: it.id, count: it.count || 1 });
                }
            }
            sendJSON(res, {
                id: found.id, name: found.name, level: found.level || 0,
                hp: found.hp, max_hp: found.max_hp, mp: found.mp, max_mp: found.max_mp,
                str: found.str, con: found.con, dex: found.dex, int: found.int,
                gj: found.gj, fy: found.fy, mz: found.mz, ds: found.ds, zj: found.zj, bj: found.bj,
                diff_sh_per: found.diff_sh_per, diff_fy_per: found.diff_fy_per,
                exp: found.exp || 0, pot: found.pot || 0, money: found.money || 0,
                score: found.score || 0,
                location: env ? (env.parent ? env.parent.name + '-' + env.name : env.name) : 'unknown',
                locationPath: env ? env.path : 'unknown',
                title: found.title || '', gender: found.gender || 0,
                age: found.age || 0, per: found.per || 0, kar: found.kar || 0,
                family: found.family ? found.family.name : '无',
                limit_mp: found.limit_mp || 0,
                skills: skills, statuses: statuses, equipment: eq, inventory: inv,
                isBusy: !!found.is_busy, isFaint: !!found.is_faint, isFighting: found.fight_type > 0,
            });
        }
        // POST /api/player_update — 更新玩家属性
        else if (url === '/api/player_update' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { ok: false, msg: 'Invalid JSON' }, 400); return; }
                var pid = body.id;
                if (!pid) { sendJSON(res, { ok: false, msg: '缺少玩家ID' }, 400); return; }
                var found = WORLD.find_user(pid);
                if (!found) {
                    for (var i = 0; i < WORLD.USERS.length; i++) {
                        if (WORLD.USERS[i] && WORLD.USERS[i].is_player && WORLD.USERS[i].id === pid) {
                            found = WORLD.USERS[i]; break;
                        }
                    }
                }
                if (!found) { sendJSON(res, { ok: false, msg: '玩家不在线' }, 404); return; }
                var fields = ['hp', 'max_hp', 'mp', 'max_mp', 'gj', 'fy', 'mz', 'ds', 'zj', 'exp', 'pot', 'money'];
                fields.forEach(function (f) {
                    if (body[f] !== undefined) found[f] = body[f];
                });
                sendJSON(res, { ok: true, msg: '玩家属性已更新' });
            });
        }
        // POST /api/send_mail — 发送系统邮件
        else if (url === '/api/send_mail' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { ok: false, msg: 'Invalid JSON' }, 400); return; }
                var pid = body.playerId, msg = body.message, items = body.items || [];
                if (!pid || !msg) { sendJSON(res, { ok: false, msg: '缺少玩家ID或邮件内容' }, 400); return; }
                var found = null;
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    if (WORLD.USERS[i] && WORLD.USERS[i].is_player && (WORLD.USERS[i].id === pid || WORLD.USERS[i].name === pid)) {
                        found = WORLD.USERS[i]; break;
                    }
                }
                if (!found) { sendJSON(res, { ok: false, msg: '找不到该玩家' }, 404); return; }
                // 推送到消息系统
                if (WORLD.MESSAGE && WORLD.MESSAGE.pushUserMessage) {
                    var attachItems = [];
                    for (var j = 0; j < items.length; j++) {
                        var obj = OBJ.CREATE(items[j].obj, items[j].count || 1);
                        if (obj) attachItems.push({ name: obj.unit_name(items[j].count || 1), obj: items[j].obj, count: items[j].count || 1 });
                    }
                    WORLD.MESSAGE.pushUserMessage(found.id, { id: 'system', name: '系统' }, {
                        time: Date.now(), content: msg, attach: attachItems.length > 0 ? attachItems : undefined
                    });
                    var dialogMsg = JSON.stringify({ type: 'dialog', dialog: 'message', message: { id: 'system', name: '系统', content: msg, time: Date.now(), attach: attachItems.length > 0 ? attachItems : undefined } });
                    if (found.socket) found.send(dialogMsg);
                    sendJSON(res, { ok: true, msg: '邮件已发送' });
                } else {
                    sendJSON(res, { ok: false, msg: '消息系统未初始化' }, 500);
                }
            });
        }
        // POST /api/update
        else if (url === '/api/update' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var p = body.path, fname = body.fname;
                if (!p || !fname) { sendJSON(res, { error: 'path and fname required' }, 400); return; }
                try {
                    BASE.UPDATE(p, fname);
                    sendJSON(res, { success: true, message: 'Hot-reload OK: ' + p + fname });
                } catch (e) { sendJSON(res, { error: 'Hot-reload failed: ' + e.message }, 500); }
            });
        }
        // POST /api/hot_reload — bulk hot-reload game resources
        else if (url === '/api/hot_reload' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var target = body.target || 'all';
                var dirs = [
                    __PATH.EXTENDS, __PATH.COMMAND, __PATH.FAMILY,
                    __PATH.OBJ, __PATH.AREA, __PATH.SKILL,
                    __PATH.NPC, __PATH.MAP
                ];
                // Filter based on target
                if (target === 'skills') dirs = [__PATH.SKILL];
                else if (target === 'npcs') dirs = [__PATH.NPC];
                else if (target === 'objects') dirs = [__PATH.OBJ];
                else if (target === 'maps') dirs = [__PATH.MAP];
                else if (target === 'areas') dirs = [__PATH.AREA];
                else if (target === 'cmds') dirs = [__PATH.COMMAND];

                var totalFiles = 0;
                for (var di = 0; di < dirs.length; di++) {
                    // Ensure basePath ends with separator for correct relative path extraction
                    var basePath = dirs[di];
                    if (!basePath.endsWith(path.sep)) basePath += path.sep;

                    function scanReload(scanPath) {
                        if (!fs.existsSync(scanPath)) return;
                        var entries = fs.readdirSync(scanPath, { withFileTypes: true });
                        for (var ei = 0; ei < entries.length; ei++) {
                            var e = entries[ei];
                            var full = path.join(scanPath, e.name);
                            if (e.isDirectory()) {
                                scanReload(full);
                            } else if (e.name.endsWith('.js')) {
                                var fname = full.replace(basePath, '').replace(/\\/g, '/').replace('.js', '');
                                try {
                                    // 强制清除所有缓存后重新加载
                                    var fkey = basePath + fname;
                                    delete BASE.ITEMS[fkey];
                                    // 清除NPC/物品的二级缓存
                                    if (WORLD && WORLD.NPC_STROE) WORLD.NPC_STROE.delete(fname);
                                    if (WORLD && WORLD.OBJ_STROE) WORLD.OBJ_STROE.delete(fname);
                                    BASE.CREATE(basePath, fname);
                                    totalFiles++;
                                } catch(ex) { /* skip broken files */ }
                            }
                        }
                    }
                    try { scanReload(basePath); } catch(e) {}
                }
                sendJSON(res, { success: true, message: '热更新完成，重载 ' + totalFiles + ' 个文件', files: totalFiles });
            });
        }
        // POST /api/broadcast — use msg type like rumor.js to avoid dialog popup
        else if (url === '/api/broadcast' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var msg = body.message;
                if (!msg) { sendJSON(res, { error: 'message required' }, 400); return; }
                var items = body.items || [];
                // Store in notices for message dialog history
                if (!WORLD.MESSAGE) WORLD.MESSAGE = { NOTICES: [] };
                var noticeEntry = { content: msg, time: Date.now() };
                if (items.length) noticeEntry.attach = items;
                WORLD.MESSAGE.NOTICES.push(noticeEntry);
                // Send as chat message (type:msg) — shows in social area, NOT as dialog popup
                WORLD.sendAll(JSON.stringify({ type: "msg", ch: "sys", content: msg }));
                // If items attached, push per-user messages to all online players for claiming
                if (items.length) {
                    // Resolve item names
                    for (var i = 0; i < items.length; i++) {
                        var obj = OBJ.CREATE(items[i].obj, items[i].count);
                        if (obj) items[i].name = obj.unit_name(items[i].count);
                    }
                    var dialogMsg = {
                        type: "dialog",
                        dialog: "message",
                        message: {
                            id: "notice",
                            name: "公告",
                            content: msg,
                            time: noticeEntry.time,
                            attach: items
                        }
                    };
                    for (var j = 0; j < WORLD.USERS.length; j++) {
                        var user = WORLD.USERS[j];
                        var userMsg = {
                            time: noticeEntry.time,
                            content: msg,
                            attach: items
                        };
                        WORLD.MESSAGE.pushUserMessage(user.id, {
                            id: "notice", name: "公告"
                        }, userMsg);
                        dialogMsg.message.index = userMsg.index;
                        if (user.socket) user.send(JSON.stringify(dialogMsg));
                    }
                }
                sendJSON(res, { success: true, message: 'Broadcast sent' + (items.length ? ' (with ' + items.length + ' items)' : '') });
            });
        }
        // DELETE /api/broadcast — clear all notice history
        else if (url === '/api/broadcast' && method === 'DELETE') {
            if (WORLD.MESSAGE && WORLD.MESSAGE.NOTICES) {
                WORLD.MESSAGE.NOTICES.length = 0;
                WORLD.save(); // 立即存档确保持久化
            }
            sendJSON(res, { success: true, message: 'Notices cleared' });
        }
        // POST /api/shutdown
        else if (url === '/api/shutdown' && method === 'POST') {
            sendJSON(res, { success: true, message: 'Shutdown initiated, saving data...' });
            setTimeout(async function () {
                await WORLD.save();
                process.exit(0);
            }, 1000);
        }
        // POST /api/give_item — give item to player
        else if (url === '/api/give_item' && method === 'POST') {
            if (isFormalServer()) { sendJSON(res, { error: '正式服不允许发放物品' }, 403); return; }
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var playerId = body.playerId;
                var itemPath = body.itemPath;
                var count = body.count || 1;
                if (!playerId || !itemPath) { sendJSON(res, { error: 'playerId and itemPath required' }, 400); return; }
                var player = WORLD.find_user(playerId);
                if (!player) {
                    for (var i = 0; i < WORLD.USERS.length; i++) {
                        if (WORLD.USERS[i] && WORLD.USERS[i].is_player && WORLD.USERS[i].id === playerId) {
                            player = WORLD.USERS[i]; break;
                        }
                    }
                }
                if (!player) { sendJSON(res, { error: 'Player not found' }, 404); return; }
                try {
                    var obj = player.add_obj(itemPath, count);
                    if (obj && obj.color_name) {
                        player.notify('<hiy>管理员赠送了你：' + obj.color_name + (count > 1 ? ' x' + count : '') + '</hiy>');
                    }
                    sendJSON(res, { success: true, message: '已向 ' + player.name + ' 发放 ' + count + ' 个 ' + itemPath });
                } catch (e) { sendJSON(res, { error: '发放失败: ' + e.message }, 500); }
            });
        }
        // POST /api/reclaim_item — reclaim item from player
        else if (url === '/api/reclaim_item' && method === 'POST') {
            if (isFormalServer()) { sendJSON(res, { error: '正式服不允许回收物品' }, 403); return; }
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var playerId = body.playerId;
                var itemPath = body.itemPath;
                var itemId = body.itemId;
                var count = body.count || 1;
                if (!playerId || (!itemPath && !itemId)) { sendJSON(res, { error: 'playerId and (itemPath or itemId) required' }, 400); return; }
                var player = WORLD.find_user(playerId);
                if (!player) {
                    for (var i = 0; i < WORLD.USERS.length; i++) {
                        if (WORLD.USERS[i] && WORLD.USERS[i].is_player && WORLD.USERS[i].id === playerId) {
                            player = WORLD.USERS[i]; break;
                        }
                    }
                }
                if (!player) { sendJSON(res, { error: 'Player not found' }, 404); return; }
                var removed = 0;
                try {
                    var obj;
                    if (itemId) obj = player.find_obj(itemId);
                    else obj = player.find_obj_bypath(itemPath);
                    if (obj) {
                        removed = Math.min(count, obj.count || 1);
                        player.remove_obj(obj, removed);
                    }
                    if (removed > 0) player.notify('<hiy>管理员回收了你的一件物品。</hiy>');
                    sendJSON(res, { success: true, message: '已从 ' + player.name + ' 回收 ' + removed + ' 件物品', removed: removed });
                } catch (e) { sendJSON(res, { error: '回收失败: ' + e.message }, 500); }
            });
        }
        // POST /api/set_admin — update user admin level
        else if (url === '/api/set_admin' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var uid = parseInt(body.uid) || 0;
                var level = parseInt(body.level);
                if (!uid || isNaN(level) || level < 0 || level > 6) {
                    sendJSON(res, { error: '参数错误' }, 400); return;
                }
                try {
                    db.db.prepare("update users set level=? where id=?").run(level, uid);
                    // Update in-memory user if online
                    for (var i = 0; i < WORLD.USERS.length; i++) {
                        if (WORLD.USERS[i] && WORLD.USERS[i].id == uid) {
                            WORLD.USERS[i].allow_level = level;
                            WORLD.USERS[i].notify('<hiy>你的管理员权限已被更新为 Lv.' + level + '</hiy>');
                            break;
                        }
                    }
                    sendJSON(res, { success: true, message: '用户 ' + uid + ' 权限已更新为 Lv.' + level });
                } catch (e) { sendJSON(res, { error: '设置失败: ' + e.message }, 500); }
            });
        }
        // POST /api/skill_delete — delete skill file and clear caches
        else if (url === '/api/skill_delete' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var type = body.type, name = body.name;
                if (!type || !name) { sendJSON(res, { error: 'type and name required' }, 400); return; }
                if (!/^[a-zA-Z0-9_]+$/.test(type) || !/^[a-zA-Z0-9_]+$/.test(name)) {
                    sendJSON(res, { error: 'Invalid type or name' }, 400); return;
                }
                var fp = path.join(SKILL_DIR, type, name + '.js');
                if (!fp.startsWith(SKILL_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
                try {
                    // 清除BASE.ITEMS编译缓存
                    var skillPath = path.join(__dirname, '..', 'world', 'skill') + path.sep;
                    var fkey = skillPath + type + '/' + name;
                    delete BASE.ITEMS[fkey];
                    // 从WORLD.SKILLS中移除（如果已加载）
                    if (WORLD && WORLD.SKILLS) {
                        delete WORLD.SKILLS[name];
                    }
                    if (fs.existsSync(fp)) {
                        fs.unlinkSync(fp);
                    }
                    sendJSON(res, { success: true, message: 'Deleted: ' + type + '/' + name + '.js (cache cleared)' });
                } catch (e) { sendJSON(res, { error: 'Delete failed: ' + e.message }, 500); }
            });
        }
        // POST /api/create_dungeon
        else if (url === '/api/create_dungeon' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var id = body.id, name = body.name, desc = body.desc, score = parseInt(body.score) || 100;
                var is_multi = !!body.is_multi, expend = parseInt(body.expend) || 10;
                var exp = parseInt(body.exp) || 10000, pot = parseInt(body.pot) || 8000;
                var rooms = body.rooms || [];
                var drops = body.drops || [];
                if (!id || !name) { sendJSON(res, { error: 'id and name required' }, 400); return; }
                if (!/^[a-zA-Z0-9_]+$/.test(id)) { sendJSON(res, { error: 'id must be alphanumeric' }, 400); return; }

                var baseDir = path.join(__dirname, '..');
                var areaDir = path.join(baseDir, 'world', 'area', 'fb1');
                var mapDir = path.join(baseDir, 'world', 'map', id);
                var npcDir = path.join(baseDir, 'world', 'npc', id);
                var jhFile = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');

                try {
                    // Read jh.js to get next fb_index
                    var jhContent = fs.readFileSync(jhFile, 'utf8');
                    var fbMatch = jhContent.match(/var FBS = \{([^}]+)\}/);
                    if (!fbMatch) { sendJSON(res, { error: 'Cannot parse FBS in jh.js' }, 500); return; }
                    var entries = fbMatch[1].match(/"\w+":\s*\d+/g) || [];
                    var maxIdx = -1;
                    for (var ei = 0; ei < entries.length; ei++) {
                        var parts = entries[ei].match(/"(\w+)":\s*(\d+)/);
                        if (parts) { var idx = parseInt(parts[2]); if (idx > maxIdx) maxIdx = idx; }
                    }
                    var nextIdx = maxIdx + 1;

                    // Create area file
                    var areaContent = [
                        'this.inherits(AREA);',
                        'this.set({',
                        '    id: "' + id + '",',
                        '    name: "' + name + '",',
                        '    desc: "' + (desc || name + '副本') + '",',
                        '    score: ' + score + ',',
                        '    is_show: true,',
                        '    first: "' + id + '/r0",',
                        '    is_copy: true,',
                        '    expend: ' + expend + ',',
                        '    is_multi: ' + (is_multi ? 'true' : 'false') + ',',
                        '    exp: ' + exp + ',',
                        '    pot: ' + pot + ',',
                        '    room_path: "' + id + '/",',
                        '    ss_title: "' + name + '首杀"',
                        '});',
                    ].join('\n');

                    // Generate map
                    var mapEntries = [];
                    for (var ri = 0; ri < rooms.length; ri++) {
                        var rm = rooms[ri];
                        mapEntries.push('    { n: "' + rm.name + '", id: "' + id + '/' + rm.rid + '", p: [' + (rm.x || ri) + ', ' + (rm.y || ri) + '], exits: [' + (rm.exits ? rm.exits.map(function(e){return '"'+e+'"'}).join(',') : '') + '] }');
                    }
                    if (rooms.length === 0) {
                        mapEntries.push('    { n: "入口", id: "' + id + '/r0", p: [0, 0], exits: [] }');
                    }
                    areaContent += '\nthis.map = [\n' + mapEntries.join(',\n') + '\n];';

                    // Drops
                    var dropEntries = (drops.length > 0) ? drops.map(function(d){return '"' + d + '"'}).join(',\n        ') : '';
                    areaContent += '\nthis.drops = [\n        ' + dropEntries + '\n];';

                    areaContent += '\nthis.on_enterd = function (me) {\n    me.set_temp("' + id + '_clear", 0);\n};';
                    areaContent += '\nthis.on_leaved = function (me) {\n    me.remove_temp("' + id + '_clear");\n};\n';

                    // Create directories
                    if (!fs.existsSync(mapDir)) fs.mkdirSync(mapDir, { recursive: true });
                    if (!fs.existsSync(npcDir)) fs.mkdirSync(npcDir, { recursive: true });

                    // Write area file
                    var areaPath = path.join(areaDir, 'fb' + (nextIdx + 1) + '.js');
                    fs.writeFileSync(areaPath, areaContent, 'utf8');

                    // Write room files
                    for (var ri = 0; ri < rooms.length; ri++) {
                        var rm = rooms[ri];
                        var roomContent = [
                            'this.inherits(ROOM);',
                            'this.name = "' + rm.name + '";',
                            'this.desc = "' + (rm.desc || rm.name) + '";',
                            'this.exits = {' + (rm.exits ? rm.exits.map(function(e){return e + ': "' + id + '/' + rm.exitsTo[e] + '"'}).join(',') : '') + '};',
                            'this.set_npc([]);',
                        ].join('\n');
                        if (rm.npc) {
                            roomContent += '\nthis.set_npc(["' + id + '/' + rm.npc + '", 1]);';
                        }
                        fs.writeFileSync(path.join(mapDir, rm.rid + '.js'), roomContent, 'utf8');
                    }
                    if (rooms.length === 0) {
                        fs.writeFileSync(path.join(mapDir, 'r0.js'), [
                            'this.inherits(ROOM);',
                            'this.name = "入口";',
                            'this.desc = "' + name + '的入口区域。";',
                            'this.exits = {};',
                            'this.set_npc([]);',
                        ].join('\n'), 'utf8');
                    }

                    // Write basic NPC file
                    var npcContent = [
                        'this.inherits(NPC);',
                        'this.set({',
                        '    name: "' + name + '守卫",',
                        '    desc: "' + name + '的守卫。",',
                        '    title: "<hiy>' + name + '守卫</hiy>",',
                        '    gender: 1,',
                        '    age: 40,',
                        '    per: 15,',
                        '    no_refresh: true,',
                        '    hp: 1000000,',
                        '    max_hp: 1000000,',
                        '    mp: 500000,',
                        '    max_mp: 500000,',
                        '    score: 50,',
                        '    gj: 50000, fy: 50000, mz: 60000, ds: 45000, zj: 50000,',
                        '    str: 10000, con: 10000, dex: 8000, int: 8000,',
                        '});',
                        'this.set_objects(["eq/lv0/cloth", 1, 1]);',
                        'this.skill_map(',
                        '    ["dodge", 3000],',
                        '    ["parry", 3000],',
                        '    ["force", 3000],',
                        '    ["unarmed", 3000]',
                        ');',
                        'this.on_enter = function (me) {',
                        '    this.do_kill(me);',
                        '};',
                    ].join('\n');
                    fs.writeFileSync(path.join(npcDir, 'guard.js'), npcContent, 'utf8');

                    // Update jh.js FBS
                    var newEntry = ',\n    "' + id + '": ' + nextIdx;
                    jhContent = jhContent.replace(/(var FBS = \{[\s\S]*?\})/, function (match) {
                        return match.replace(/\}/, newEntry + '\n}');
                    });
                    fs.writeFileSync(jhFile, jhContent, 'utf8');

                    sendJSON(res, {
                        success: true,
                        message: '副本 ' + name + ' (' + id + ') 创建成功！fb_index=' + nextIdx,
                        fb_index: nextIdx,
                        areaFile: 'world/area/fb1/fb' + (nextIdx + 1) + '.js',
                    });
                } catch (e) {
                    sendJSON(res, { error: '创建失败: ' + e.message }, 500);
                }
            });
        }
        // POST /api/create_map — unified map/dungeon creation
        else if (url === '/api/create_map' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var id = body.id, name = body.name, desc = body.desc;
                var mapType = body.map_type || 'public';
                if (!id || !name) { sendJSON(res, { error: 'id and name required' }, 400); return; }
                if (!/^[a-zA-Z0-9_]+$/.test(id)) { sendJSON(res, { error: 'id must be alphanumeric' }, 400); return; }
                var rooms = body.rooms || [];
                var baseDir = path.join(__dirname, '..');
                var mapDir = path.join(baseDir, 'world', 'map', id);
                var npcDir = path.join(baseDir, 'world', 'npc', id);
                var jhFile = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');

                try {
                    // Read jh.js
                    var jhContent = fs.readFileSync(jhFile, 'utf8');
                    var isDungeon = mapType === 'dungeon';

                    var areaContent;
                    if (isDungeon) {
                        // === Dungeon (副本) ===
                        var score = parseInt(body.score) || 100;
                        var is_multi = !!body.is_multi;
                        var expend = parseInt(body.expend) || 10;
                        var exp = parseInt(body.exp) || 10000;
                        var pot = parseInt(body.pot) || 8000;
                        var fbMatch = jhContent.match(/var FBS = \{([^}]+)\}/);
                        if (!fbMatch) { sendJSON(res, { error: 'Cannot parse FBS in jh.js' }, 500); return; }
                        var entries = fbMatch[1].match(/"\w+":\s*\d+/g) || [];
                        var maxIdx = -1;
                        for (var ei = 0; ei < entries.length; ei++) {
                            var parts = entries[ei].match(/"(\w+)":\s*(\d+)/);
                            if (parts) { var idx = parseInt(parts[2]); if (idx > maxIdx) maxIdx = idx; }
                        }
                        var nextIdx = maxIdx + 1;
                        var areaDir = path.join(baseDir, 'world', 'area', 'fb1');
                        areaContent = [
                            'this.inherits(AREA);',
                            'this.set({',
                            '    id: "' + id + '",',
                            '    name: "' + name + '",',
                            '    desc: "' + desc + '",',
                            '    score: ' + score + ',',
                            '    is_show: true,',
                            '    first: "' + id + '/r0",',
                            '    is_copy: true,',
                            '    expend: ' + expend + ',',
                            '    is_multi: ' + (is_multi ? 'true' : 'false') + ',',
                            '    exp: ' + exp + ',',
                            '    pot: ' + pot + ',',
                            '    room_path: "' + id + '/",',
                            '    ss_title: "' + name + '首杀"',
                            '});',
                        ].join('\n');
                        // Map entries for dungeon
                        var mapEntries = [];
                        for (var ri = 0; ri < rooms.length; ri++) {
                            var rm = rooms[ri];
                            mapEntries.push('    { n: "' + rm.name + '", id: "' + id + '/' + rm.rid + '", p: [' + (rm.x || ri) + ', ' + (rm.y || ri) + '], exits: [' + (rm.exits ? rm.exits.map(function(e){return '"'+e+'"'}).join(',') : '') + '] }');
                        }
                        if (rooms.length === 0) mapEntries.push('    { n: "入口", id: "' + id + '/r0", p: [0, 0], exits: [] }');
                        areaContent += '\nthis.map = [\n' + mapEntries.join(',\n') + '\n];';
                        var dropEntries = (body.drops || []).map(function(d){return '"' + d + '"'}).join(',\n        ');
                        areaContent += '\nthis.drops = [\n        ' + dropEntries + '\n];';
                        areaContent += '\nthis.on_enterd = function (me) {\n    me.set_temp("' + id + '_clear", 0);\n};';
                        areaContent += '\nthis.on_leaved = function (me) {\n    me.remove_temp("' + id + '_clear");\n};\n';
                        var areaPath = path.join(areaDir, 'fb' + (nextIdx + 1) + '.js');
                        // Update jh.js FBS
                        var newEntry = ',\n    "' + id + '": ' + nextIdx;
                        jhContent = jhContent.replace(/(var FBS = \{[\s\S]*?\})/, function (match) {
                            return match.replace(/\}/, newEntry + '\n}');
                        });
                        fs.writeFileSync(jhFile, jhContent, 'utf8');
                        fs.writeFileSync(areaPath, areaContent, 'utf8');

                        sendJSON(res, { success: true, message: '副本 ' + name + ' 创建成功！fb_index=' + nextIdx, fb_index: nextIdx, areaFile: 'world/area/fb1/fb' + (nextIdx + 1) + '.js' });
                    } else {
                        // === Public Map (公共地图) ===
                        var areaDir = path.join(baseDir, 'world', 'area', 'map');
                        areaContent = [
                            'this.inherits(AREA);',
                            'this.set({',
                            '    id: "' + id + '",',
                            '    name: "' + name + '",',
                            '    desc: "' + (desc || name) + '",',
                            '    is_area: true,',
                            '    is_show: true,',
                            '    first: "' + id + '/r0",',
                            '    room_path: "' + id + '/",',
                            '});',
                        ].join('\n');
                        // Map entries for public map
                        var mapEntries = [];
                        for (var ri2 = 0; ri2 < rooms.length; ri2++) {
                            var rm2 = rooms[ri2];
                            mapEntries.push('    { n: "' + rm2.name + '", id: "' + id + '/' + rm2.rid + '", p: [' + (rm2.x || ri2) + ', ' + (rm2.y || ri2) + '], exits: [' + (rm2.exits ? rm2.exits.map(function(e){return '"'+e+'"'}).join(',') : '') + '] }');
                        }
                        if (rooms.length === 0) mapEntries.push('    { n: "入口", id: "' + id + '/r0", p: [0, 0], exits: [] }');
                        areaContent += '\nthis.map = [\n' + mapEntries.join(',\n') + '\n];\n';
                        var areaPath = path.join(areaDir, id + '.js');
                        // Update jh.js AREAS
                        var areaEntry = ',\n    ' + id + ': ' + 99;
                        jhContent = jhContent.replace(/(const AREAS = \{[\s\S]*?\})/, function (match) {
                            return match.replace(/\}/, areaEntry + '\n}');
                        });
                        fs.writeFileSync(jhFile, jhContent, 'utf8');
                        fs.writeFileSync(areaPath, areaContent, 'utf8');

                        sendJSON(res, { success: true, message: '公共地图 ' + name + ' 创建成功！', areaFile: 'world/area/map/' + id + '.js' });
                    }

                    // === Common: create room files with auto-exits ===
                    if (!fs.existsSync(mapDir)) fs.mkdirSync(mapDir, { recursive: true });
                    // Build position lookup for auto-connection
                    var posMap = {}; // "x,y" -> rid
                    for (var rj = 0; rj < rooms.length; rj++) {
                        var rmd = rooms[rj];
                        posMap[rmd.x + ',' + rmd.y] = rmd.rid;
                    }
                    var DIRS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
                    var REVERSE = { north: 'south', south: 'north', east: 'west', west: 'east' };
                    for (var rj2 = 0; rj2 < rooms.length; rj2++) {
                        var rmd2 = rooms[rj2];
                        var roomExits = {};
                        // Auto-connect adjacent rooms by position
                        for (var dir in DIRS) {
                            var dx = DIRS[dir][0], dy = DIRS[dir][1];
                            var adjKey = (rmd2.x + dx) + ',' + (rmd2.y + dy);
                            if (posMap[adjKey]) {
                                roomExits[dir] = id + '/' + posMap[adjKey];
                            }
                        }
                        // Merge any manually specified exits (old format)
                        if (rmd2.exits && rmd2.exits.length > 0) {
                            for (var ek2 = 0; ek2 < rmd2.exits.length; ek2++) {
                                var ed = rmd2.exits[ek2];
                                var et = rmd2.exitsTo[ed];
                                if (et && !roomExits[ed]) {
                                    roomExits[ed] = id + '/' + et;
                                }
                            }
                        }
                        var roomContent = [
                            'this.inherits(ROOM);',
                            'this.name = "' + rmd2.name + '";',
                            'this.desc = "' + (rmd2.desc || rmd2.name) + '";',
                            'this.exits = ' + JSON.stringify(roomExits).replace(/"/g, '"') + ';',
                            'this.set_npc([]);',
                        ].join('\n');
                        if (rmd2.npc) {
                            roomContent += '\nthis.set_npc(["' + id + '/' + rmd2.npc + '", 1]);';
                        }
                        fs.writeFileSync(path.join(mapDir, rmd2.rid + '.js'), roomContent, 'utf8');
                    }
                    if (rooms.length === 0) {
                        fs.writeFileSync(path.join(mapDir, 'r0.js'), [
                            'this.inherits(ROOM);', 'this.name = "入口";',
                            'this.desc = "' + name + '的入口区域。";', 'this.exits = {};', 'this.set_npc([]);',
                        ].join('\n'), 'utf8');
                    }
                    // Create NPC dir
                    if (!fs.existsSync(npcDir)) fs.mkdirSync(npcDir, { recursive: true });
                    fs.writeFileSync(path.join(npcDir, 'guard.js'), [
                        'this.inherits(NPC);',
                        'this.set({', '    name: "' + name + '守卫",', '    desc: "' + name + '的守卫。",',
                        '    title: "<hiy>' + name + '守卫</hiy>",', '    gender: 1, age: 40, per: 15,',
                        '    no_refresh: true,', '    hp: 1000000, max_hp: 1000000,', '    mp: 500000, max_mp: 500000,',
                        '    score: 50,', '    gj: 50000, fy: 50000, mz: 60000, ds: 45000, zj: 50000,',
                        '    str: 10000, con: 10000, dex: 8000, int: 8000,', '});',
                        'this.set_objects(["eq/lv0/cloth", 1, 1]);',
                        'this.skill_map(["dodge", 3000],["parry", 3000],["force", 3000],["unarmed", 3000]);',
                        'this.on_enter = function (me) { this.do_kill(me); };',
                    ].join('\n'), 'utf8');

                } catch (e) { sendJSON(res, { error: '创建失败: ' + e.message }, 500); }
            });
        }
        // GET /api/repair_check — scan rooms for broken NPC references
        else if (url === '/api/repair_check' && method === 'GET') {
            var broken = [];
            var mapDir = path.join(__dirname, '..', 'world', 'map');
            var npcDir = path.join(__dirname, '..', 'world', 'npc');
            if (fs.existsSync(mapDir)) {
                function scanRooms(dir, prefix) {
                    var entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (var i = 0; i < entries.length; i++) {
                        var e = entries[i];
                        var full = path.join(dir, e.name);
                        if (e.isDirectory()) { scanRooms(full, prefix + e.name + '/'); }
                        else if (e.name.endsWith('.js')) {
                            var relPath = prefix + e.name.replace('.js', '');
                            try {
                                var content = fs.readFileSync(full, 'utf8');
                                // Only check NPC refs inside set_npc(...) calls
                                var snMatch = content.match(/this\.set_npc\(([\s\S]*?)\);/g);
                                if (snMatch) {
                                    for (var si = 0; si < snMatch.length; si++) {
                                        var refs = snMatch[si].match(/"([^"]+)"/g) || [];
                                        for (var ri = 0; ri < refs.length; ri++) {
                                            var ref = refs[ri].replace(/"/g, '');
                                            var npcFile = path.join(npcDir, ref + '.js');
                                            if (!fs.existsSync(npcFile)) {
                                                broken.push({ room: relPath, npc: ref });
                                            }
                                        }
                                    }
                                }
                            } catch(ex) {}
                        }
                    }
                }
                scanRooms(mapDir, '');
            }
            sendJSON(res, { success: true, data: broken });
        }
        // POST /api/repair_fix — remove broken NPC references from rooms (only in set_npc calls)
        else if (url === '/api/repair_fix' && method === 'POST') {
            var fixed = 0;
            var mapDir2 = path.join(__dirname, '..', 'world', 'map');
            var npcDir2 = path.join(__dirname, '..', 'world', 'npc');
            if (fs.existsSync(mapDir2)) {
                function fixRooms(dir, prefix) {
                    var entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (var i = 0; i < entries.length; i++) {
                        var e = entries[i];
                        var full = path.join(dir, e.name);
                        if (e.isDirectory()) { fixRooms(full, prefix + e.name + '/'); }
                        else if (e.name.endsWith('.js')) {
                            var relPath = prefix + e.name.replace('.js', '');
                            try {
                                var content = fs.readFileSync(full, 'utf8');
                                var modified = false;
                                // Only fix NPC refs inside set_npc(...) calls
                                content = content.replace(/this\.set_npc\(([\s\S]*?)\);/g, function(match, args) {
                                    var npcRefs = args.match(/\["([^"]+)",\s*\d+\]/g) || [];
                                    var newRefs = [];
                                    for (var ri = 0; ri < npcRefs.length; ri++) {
                                        var rm = npcRefs[ri].match(/"([^"]+)",\s*(\d+)/);
                                        if (rm) {
                                            var npcPath2 = rm[1];
                                            var npcFile = path.join(npcDir2, npcPath2 + '.js');
                                            if (fs.existsSync(npcFile)) {
                                                newRefs.push(npcRefs[ri]);
                                            } else {
                                                modified = true; fixed++;
                                                console.log('[Repair] Removing broken NPC ref: ' + npcPath2 + ' from ' + relPath);
                                            }
                                        }
                                    }
                                    if (newRefs.length > 0) {
                                        return 'this.set_npc(' + newRefs.join(', ') + ');';
                                    } else {
                                        return '';
                                    }
                                });
                                if (modified) {
                                    fs.writeFileSync(full, content, 'utf8');
                                }
                            } catch(ex) {}
                        }
                    }
                }
                fixRooms(mapDir2, '');
            }
            sendJSON(res, { success: true, message: '已修复 ' + fixed + ' 个损坏的NPC引用', fixed: fixed });
        }
        // GET /api/room_list — list all room paths with names
        else if (url === '/api/room_list' && method === 'GET') {
            var rooms = [];
            var mapDir = path.join(__dirname, '..', 'world', 'map');
            if (fs.existsSync(mapDir)) {
                function scanRooms(dir, prefix) {
                    var entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (var i = 0; i < entries.length; i++) {
                        var e = entries[i];
                        var full = path.join(dir, e.name);
                        if (e.isDirectory()) { scanRooms(full, prefix + e.name + '/'); }
                        else if (e.name.endsWith('.js')) {
                            var relPath = prefix + e.name.replace('.js', '');
                            var name = relPath;
                            try {
                                var c = fs.readFileSync(full, 'utf8');
                                var nm = c.match(/this\.name\s*=\s*"([^"]+)"/);
                                if (nm) name = nm[1];
                            } catch(ex) {}
                            rooms.push({ path: relPath, name: name });
                        }
                    }
                }
                scanRooms(mapDir, '');
            }
            rooms.sort(function(a,b) { return a.path.localeCompare(b.path); });
            sendJSON(res, { success: true, data: rooms.slice(0, 2000) });
        }
        // GET /api/map_list — list all maps (public + dungeons)
        else if (url === '/api/map_list' && method === 'GET') {
            var maps = [];
            var baseDir = path.join(__dirname, '..');
            // Public maps
            var pubDir = path.join(baseDir, 'world', 'area', 'map');
            if (fs.existsSync(pubDir)) {
                var pubFiles = fs.readdirSync(pubDir).filter(function(f) { return f.endsWith('.js'); });
                for (var i = 0; i < pubFiles.length; i++) {
                    var id = pubFiles[i].replace('.js', '');
                    var areaPath = path.join(pubDir, pubFiles[i]);
                    var name = id;
                    try {
                        var c = fs.readFileSync(areaPath, 'utf8');
                        var nm = c.match(/name:\s*"([^"]+)"/);
                        if (nm) name = nm[1];
                    } catch(e) {}
                    maps.push({ id: id, name: name, type: 'public', path: 'world/area/map/' + id + '.js' });
                }
            }
            // Dungeons from FBS in jh.js
            var jhFile = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');
            if (fs.existsSync(jhFile)) {
                try {
                    var jh = fs.readFileSync(jhFile, 'utf8');
                    var fbMatch = jh.match(/var FBS = \{([^}]+)\}/);
                    if (fbMatch) {
                        var fbs = fbMatch[1].match(/"(\w+)":\s*\d+/g) || [];
                        for (var j = 0; j < fbs.length; j++) {
                            var m = fbs[j].match(/"(\w+)":\s*(\d+)/);
                            if (m) {
                                var fbId = m[1], fbIdx = parseInt(m[2]);
                                var areaFile = path.join(baseDir, 'world', 'area', 'fb1', 'fb' + (fbIdx + 1) + '.js');
                                var fbName = fbId;
                                if (fs.existsSync(areaFile)) {
                                    try {
                                        var ac = fs.readFileSync(areaFile, 'utf8');
                                        var an = ac.match(/name:\s*"([^"]+)"/);
                                        if (an) fbName = an[1];
                                    } catch(e) {}
                                }
                                maps.push({ id: fbId, name: fbName, type: 'dungeon', fb_index: fbIdx, path: 'world/area/fb1/fb' + (fbIdx + 1) + '.js' });
                            }
                        }
                    }
                } catch(e) {}
            }
            sendJSON(res, { success: true, data: maps });
        }
        // GET /api/map_detail?type=public&id=yz — get map area file content
        else if (url.startsWith('/api/map_detail') && method === 'GET') {
            var params = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {});
            var mType = params.type || 'public', mId = params.id || '';
            if (!mId) { sendJSON(res, { error: 'id required' }, 400); return; }
            var baseDir = path.join(__dirname, '..');
            var areaPath;
            if (mType === 'dungeon') {
                var jhFile = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');
                var fbIdx = -1;
                if (fs.existsSync(jhFile)) {
                    var jh = fs.readFileSync(jhFile, 'utf8');
                    var m = jh.match(new RegExp('"' + mId + '":\\s*(\\d+)'));
                    if (m) fbIdx = parseInt(m[1]);
                }
                if (fbIdx < 0) { sendJSON(res, { error: 'Dungeon not found: ' + mId }, 404); return; }
                areaPath = path.join(baseDir, 'world', 'area', 'fb1', 'fb' + (fbIdx + 1) + '.js');
            } else {
                areaPath = path.join(baseDir, 'world', 'area', 'map', mId + '.js');
            }
            try {
                if (!fs.existsSync(areaPath)) { sendJSON(res, { error: 'Area file not found' }, 404); return; }
                var content = fs.readFileSync(areaPath, 'utf8');
                // Parse rooms from the area content
                var rooms = [];
                var mapMatch = content.match(/this\.map\s*=\s*\[([\s\S]*?)\];/);
                if (mapMatch) {
                    var roomEntries = mapMatch[1].match(/\{[^}]+\}/g) || [];
                    for (var ri = 0; ri < roomEntries.length; ri++) {
                        var re = roomEntries[ri];
                        var rn = (re.match(/n:\s*"([^"]+)"/) || [])[1] || '';
                        var rid = (re.match(/id:\s*"([^"]+)"/) || [])[1] || '';
                        var rp = re.match(/p:\s*\[(\d+),\s*(\d+)\]/);
                        var rx = rp ? parseInt(rp[1]) : 0, ry = rp ? parseInt(rp[2]) : 0;
                        var rex = re.match(/exits:\s*\[([^\]]*)\]/);
                        var exits = rex ? rex[1].replace(/"/g, '').split(',').map(function(e){return e.trim()}).filter(Boolean) : [];
                        rooms.push({ n: rn, id: rid, x: rx, y: ry, exits: exits });
                    }
                }
                // Parse other fields
                var dm = {
                    id: mId, type: mType, content: content, rooms: rooms,
                    name: (content.match(/name:\s*"([^"]+)"/) || [])[1] || mId,
                    desc: (content.match(/desc:\s*"([^"]+)"/) || [])[1] || '',
                    is_copy: /is_copy:\s*true/.test(content),
                    first: (content.match(/first:\s*"([^"]+)"/) || [])[1] || '',
                    room_path: (content.match(/room_path:\s*"([^"]+)"/) || [])[1] || '',
                };
                if (dm.is_copy) {
                    dm.expend = parseInt((content.match(/expend:\s*(\d+)/) || [])[1]) || 0;
                    dm.exp = parseInt((content.match(/exp:\s*(\d+)/) || [])[1]) || 0;
                    dm.pot = parseInt((content.match(/pot:\s*(\d+)/) || [])[1]) || 0;
                    dm.score = parseInt((content.match(/score:\s*(\d+)/) || [])[1]) || 0;
                    dm.is_multi = /is_multi:\s*true/.test(content);
                }
                sendJSON(res, { success: true, data: dm });
            } catch(e) { sendJSON(res, { error: 'Read failed: ' + e.message }, 500); }
        }
        // POST /api/map_delete — delete a map
        else if (url === '/api/map_delete' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var mType = body.type || 'public', mId = body.id || '';
                if (!mId) { sendJSON(res, { error: 'id required' }, 400); return; }
                var baseDir = path.join(__dirname, '..');
                try {
                    var areaPath, mapDir = path.join(baseDir, 'world', 'map', mId);
                    if (mType === 'dungeon') {
                        var jhFile = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');
                        var jh = fs.readFileSync(jhFile, 'utf8');
                        var m = jh.match(new RegExp('"' + mId + '":\\s*(\\d+)'));
                        var fbIdx = m ? parseInt(m[1]) : -1;
                        if (fbIdx < 0) { sendJSON(res, { error: 'Dungeon not found' }, 404); return; }
                        areaPath = path.join(baseDir, 'world', 'area', 'fb1', 'fb' + (fbIdx + 1) + '.js');
                        // Remove from FBS
                        jh = jh.replace(new RegExp(',\\s*"' + mId + '":\\s*' + fbIdx), '');
                        jh = jh.replace(new RegExp('"' + mId + '":\\s*' + fbIdx + ',?\\s*'), '');
                        fs.writeFileSync(jhFile, jh, 'utf8');
                    } else {
                        areaPath = path.join(baseDir, 'world', 'area', 'map', mId + '.js');
                        // Remove from AREAS
                        var jhFile2 = path.join(baseDir, 'world', 'cmd', 'dialog', 'jh.js');
                        if (fs.existsSync(jhFile2)) {
                            var jh2 = fs.readFileSync(jhFile2, 'utf8');
                            jh2 = jh2.replace(new RegExp(',?\\s*' + mId + ':\\s*\\d+'), '');
                            fs.writeFileSync(jhFile2, jh2, 'utf8');
                        }
                    }
                    // Delete area file
                    if (fs.existsSync(areaPath)) fs.unlinkSync(areaPath);
                    // Delete map directory
                    if (fs.existsSync(mapDir)) {
                        function rmdir(d) {
                            var entries = fs.readdirSync(d, { withFileTypes: true });
                            for (var ei = 0; ei < entries.length; ei++) {
                                var fp = path.join(d, entries[ei].name);
                                if (entries[ei].isDirectory()) rmdir(fp); else fs.unlinkSync(fp);
                            }
                            fs.rmdirSync(d);
                        }
                        rmdir(mapDir);
                    }
                    sendJSON(res, { success: true, message: '已删除地图: ' + mId });
                } catch(e) { sendJSON(res, { error: '删除失败: ' + e.message }, 500); }
            });
        }
        // GET /api/items_search?q=keyword
        else if (url.startsWith('/api/items_search') && method === 'GET') {
            var q = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).q || '';
            var all = getItemList();
            if (q) {
                var lower = q.toLowerCase();
                all = all.filter(function(item) {
                    return (item.name && item.name.indexOf(q) >= 0) || item.path.toLowerCase().indexOf(lower) >= 0;
                });
            }
            sendJSON(res, all.slice(0, 200)); // limit results
        }
        // GET /api/npcs
        else if (url === '/api/npcs' && method === 'GET') {
            sendJSON(res, getNpcList());
        }
        // GET /api/npc_detail?path=xxx — read full NPC file content
        else if (url.startsWith('/api/npc_detail') && method === 'GET') {
            var npcPath = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).path || '';
            if (!npcPath) { sendJSON(res, { error: 'path required' }, 400); return; }
            if (!/^[a-zA-Z0-9_\/]+$/.test(npcPath)) { sendJSON(res, { error: 'Invalid path' }, 400); return; }
            var fullPath = path.join(NPC_DIR, npcPath + '.js');
            if (!fullPath.startsWith(NPC_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
            try {
                if (!fs.existsSync(fullPath)) { sendJSON(res, { error: 'NPC file not found' }, 404); return; }
                var content = fs.readFileSync(fullPath, 'utf8');
                // Parse skills: skill_map(["dodge", 3000], ["parry", 3000], ...)
                var skills = [];
                var skMatch = content.match(/this\.skill_map\s*\(([\s\S]*?)\);/);
                if (skMatch) {
                    var skBlock = skMatch[1];
                    var skEntries = skBlock.match(/\["([^"]+)",\s*(\d+)(?:,\s*"([^"]*)")?\]/g);
                    if (skEntries) {
                        for (var si = 0; si < skEntries.length; si++) {
                            var m = skEntries[si].match(/"([^"]+)",\s*(\d+)(?:,\s*"([^"]*)")?/);
                            if (m) skills.push({ id: m[1], level: parseInt(m[2]), enable: m[3] || '' });
                        }
                    }
                }
                // Parse drops: this.set_drop(...)
                var drops = [];
                var dpMatch = content.match(/this\.set_drop\s*\(([\s\S]*?)\);/);
                if (dpMatch) {
                    var dpEntries = dpMatch[1].match(/\{obj:\s*"([^"]+)",\s*odds:\s*(\d+)\}/g);
                    if (dpEntries) {
                        for (var di = 0; di < dpEntries.length; di++) {
                            var dm = dpEntries[di].match(/"([^"]+)",\s*odds:\s*(\d+)/);
                            if (dm) drops.push({ obj: dm[1], odds: parseInt(dm[2]) });
                        }
                    }
                }
                sendJSON(res, { success: true, data: { path: npcPath, content: content, skills: skills, drops: drops } });
            } catch(e) { sendJSON(res, { error: 'Read failed: ' + e.message }, 500); }
        }
        // GET /api/npc_editdata?path=xxx — return all editable fields for the edit form
        else if (url.startsWith('/api/npc_editdata') && method === 'GET') {
            var npcPath2 = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).path || '';
            if (!npcPath2) { sendJSON(res, { error: 'path required' }, 400); return; }
            if (!/^[a-zA-Z0-9_\/]+$/.test(npcPath2)) { sendJSON(res, { error: 'Invalid path' }, 400); return; }
            var fullPath2 = path.join(NPC_DIR, npcPath2 + '.js');
            if (!fullPath2.startsWith(NPC_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
            try {
                if (!fs.existsSync(fullPath2)) { sendJSON(res, { error: 'NPC file not found' }, 404); return; }
                var c = fs.readFileSync(fullPath2, 'utf8');
                // Parse all editable fields from existing NPC file
                var name = '';
                var nm = c.match(/name:\s*"([^"]+)"/);
                if (nm) name = nm[1];
                var desc = '';
                var dm = c.match(/desc:\s*"([^"]+)"/);
                if (dm) desc = dm[1];
                var hp = 100000, mp = 50000, gj = 10000, fy = 10000, mz = 12000, ds = 10000, zj = 10000;
                var str = 5000, con = 5000, dex = 4000, int_ = 4000, score = 50;
                var hm = c.match(/hp:\s*(\d+)/); if (hm) hp = parseInt(hm[1]);
                var mpm = c.match(/mp:\s*(\d+)/); if (mpm) mp = parseInt(mpm[1]);
                var gm = c.match(/gj:\s*(\d+)/); if (gm) gj = parseInt(gm[1]);
                var fym = c.match(/fy:\s*(\d+)/); if (fym) fy = parseInt(fym[1]);
                var mzm = c.match(/mz:\s*(\d+)/); if (mzm) mz = parseInt(mzm[1]);
                var dsm = c.match(/ds:\s*(\d+)/); if (dsm) ds = parseInt(dsm[1]);
                var zjm = c.match(/zj:\s*(\d+)/); if (zjm) zj = parseInt(zjm[1]);
                var strm = c.match(/str:\s*(\d+)/); if (strm) str = parseInt(strm[1]);
                var conm = c.match(/con:\s*(\d+)/); if (conm) con = parseInt(conm[1]);
                var dexm = c.match(/dex:\s*(\d+)/); if (dexm) dex = parseInt(dexm[1]);
                var intm = c.match(/int:\s*(\d+)/); if (intm) int_ = parseInt(intm[1]);
                var scm = c.match(/score:\s*(\d+)/); if (scm) score = parseInt(scm[1]);
                var noFight = /no_fight:\s*true/.test(c);
                var isMerchant = /is_merchant:\s*true/.test(c) || /this\.sell_list\s*=/.test(c);
                // Parse sell_list into comma-separated string: "path:price,path:price"
                var sellItems = '';
                var slMatch = c.match(/this\.sell_list\s*=\s*\[([\s\S]*?)\];/);
                if (slMatch) {
                    var entries = slMatch[1].match(/\{\s*obj:\s*"([^"]+)",\s*price:\s*(\d+)\s*\}/g) || [];
                    sellItems = entries.map(function(e) {
                        var m2 = e.match(/"([^"]+)",\s*price:\s*(\d+)/);
                        return m2 ? m2[1] + ':' + m2[2] : '';
                    }).filter(Boolean).join(',');
                }
                // Parse placed_in comment
                var roomPath = '';
                var rpMatch = c.match(/\/\/\s*placed_in:\s*(.+)/);
                if (rpMatch) roomPath = rpMatch[1].trim();
                // Parse skills
                var skills = [];
                var skMatch2 = c.match(/this\.skill_map\s*\(([\s\S]*?)\);/);
                if (skMatch2) {
                    var skEntries2 = skMatch2[1].match(/\["([^"]+)",\s*(\d+)(?:,\s*"([^"]*)")?\]/g);
                    if (skEntries2) {
                        for (var si2 = 0; si2 < skEntries2.length; si2++) {
                            var m3 = skEntries2[si2].match(/"([^"]+)",\s*(\d+)(?:,\s*"([^"]*)")?/);
                            if (m3) skills.push({ id: m3[1], level: parseInt(m3[2]), enable: m3[3] || '' });
                        }
                    }
                }
                // Parse drops
                var drops = [];
                var dpMatch2 = c.match(/this\.set_drop\s*\(([\s\S]*?)\);/);
                if (dpMatch2) {
                    var dpEntries2 = dpMatch2[1].match(/\{obj:\s*"([^"]+)",\s*odds:\s*(\d+)\}/g);
                    if (dpEntries2) {
                        for (var di2 = 0; di2 < dpEntries2.length; di2++) {
                            var dm2 = dpEntries2[di2].match(/"([^"]+)",\s*odds:\s*(\d+)/);
                            if (dm2) drops.push({ obj: dm2[1], odds: parseInt(dm2[2]) });
                        }
                    }
                }
                sendJSON(res, {
                    success: true,
                    data: {
                        path: npcPath2, name: name, desc: desc,
                        hp: hp, mp: mp, gj: gj, fy: fy, mz: mz, ds: ds, zj: zj,
                        str: str, con: con, dex: dex, int: int_, score: score,
                        no_fight: noFight, is_merchant: isMerchant,
                        sell_items: sellItems, room_path: roomPath,
                        skills: skills, drops: drops, content: c
                    }
                });
            } catch(e) { sendJSON(res, { error: 'Read failed: ' + e.message }, 500); }
        }
        // === Equipment Management ===
        // GET /api/equipments — list all equipment files
        else if (url === '/api/equipments' && method === 'GET') {
            var eqDir = path.join(OBJ_DIR, 'eq');
            var items = [];
            function scanEq(dir, prefix) {
                if (!fs.existsSync(dir)) return;
                var entries = fs.readdirSync(dir, { withFileTypes: true });
                for (var i = 0; i < entries.length; i++) {
                    var e = entries[i];
                    var full = path.join(dir, e.name);
                    if (e.isDirectory()) { scanEq(full, prefix + e.name + '/'); }
                    else if (e.name.endsWith('.js')) {
                        var relPath = (prefix + e.name.replace('.js', ''));
                        var name = '', grade = 0, eqType = -1, wType = '';
                        try {
                            var content = fs.readFileSync(full, 'utf8');
                            var m = content.match(/name:\s*"([^"]+)"/);
                            if (m) name = m[1].replace(/<[^>]+>/g, '');
                            var g = content.match(/grade:\s*(\d+)/);
                            if (g) grade = parseInt(g[1]);
                            var et = content.match(/eq_type:\s*(\w+)(?:\.(\w+))?/);
                            if (et) { var en = et[1]; eqType = en === 'EQUIP_TYPE' ? (et[2]||en) : en; }
                            var wt = content.match(/weapon_type:\s*(\w+)(?:\.(\w+))?/);
                            if (wt) { var wn = wt[1]; wType = wn === 'WEAPON_TYPE' ? (wt[2]||wn) : wn; }
                        } catch(ex) {}
                        items.push({ path: 'eq/' + relPath, name: name || relPath, grade: grade, eq_type: eqType, weapon_type: wType });
                    }
                }
            }
            scanEq(eqDir, '');
            items.sort(function(a,b) { return a.grade !== b.grade ? b.grade - a.grade : a.path.localeCompare(b.path); });
            sendJSON(res, { success: true, data: items });
        }
        // GET /api/equipment_detail?path=xxx — read full equipment file
        else if (url.startsWith('/api/equipment_detail') && method === 'GET') {
            var eqPath = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).path || '';
            if (!eqPath) { sendJSON(res, { error: 'path required' }, 400); return; }
            var fullPath = path.join(OBJ_DIR, eqPath + '.js');
            if (!fullPath.startsWith(OBJ_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
            try {
                if (!fs.existsSync(fullPath)) { sendJSON(res, { error: 'File not found' }, 404); return; }
                var content = fs.readFileSync(fullPath, 'utf8');
                // Parse basic fields
                function parseVal(regex, def) { var m = content.match(regex); return m ? m[1] : def; }
                var data = {
                    path: eqPath,
                    content: content,
                    name: parseVal(/name:\s*"([^"]+)"/, ''),
                    desc: parseVal(/desc:\s*"([^"]+)"/, ''),
                    unit: parseVal(/unit:\s*"([^"]+)"/, '件'),
                    grade: parseInt(parseVal(/grade:\s*(\d+)/, '0')),
                    value: parseInt(parseVal(/value:\s*(\d+)/, '0')),
                    hole_count: parseInt(parseVal(/hole_count:\s*(\d+)/, '0')),
                    eq_type: parseVal(/eq_type:\s*([\w.]+)/, ''), // raw match
                    weapon_type: parseVal(/weapon_type:\s*([\w.]+)/, ''),
                    group_name: parseVal(/group_name:\s*"([^"]+)"/, ''),
                };
                // Parse prop object
                var propMatch = content.match(/prop:\s*\{([^}]+)\}/);
                if (propMatch) {
                    var propStr = propMatch[1];
                    var propObj = {};
                    var propEntries = propStr.match(/(\w+):\s*(-?\d+(?:\.\d+)?)/g);
                    if (propEntries) {
                        for (var pi = 0; pi < propEntries.length; pi++) {
                            var pm = propEntries[pi].match(/(\w+):\s*(-?\d+(?:\.\d+)?)/);
                            if (pm) propObj[pm[1]] = parseFloat(pm[2]);
                        }
                    }
                    data.prop = propObj;
                }
                // Parse condition
                var condMatch = content.match(/this\.condition\s*=\s*\{([^}]+)\}/);
                if (condMatch) {
                    var condStr = condMatch[1];
                    var condObj = {};
                    // skill: {sword: 100}
                    var skMatch = condStr.match(/skill:\s*\{([^}]+)\}/);
                    if (skMatch) {
                        var skStr = skMatch[1];
                        var skObj = {};
                        var skEntries = skStr.match(/(\w+):\s*(\d+)/g);
                        if (skEntries) {
                            for (var si = 0; si < skEntries.length; si++) {
                                var sm = skEntries[si].match(/(\w+):\s*(\d+)/);
                                if (sm) skObj[sm[1]] = parseInt(sm[2]);
                            }
                        }
                        condObj.skill = skObj;
                    }
                    // attr requirements
                    ['str','con','dex','int','gender'].forEach(function(k) {
                        var km = condStr.match(new RegExp(k+':\\s*(\\d+)'));
                        if (km) condObj[k] = parseInt(km[1]);
                    });
                    data.condition = condObj;
                }
                // Parse family
                var famMatch = content.match(/this\.family\s*=\s*(\w[\w.]*\w)/);
                if (famMatch) data.family = famMatch[1];
                // Parse flags
                data.no_fenjie = /this\.no_fenjie/.test(content);
                data.is_shortcut = /is_shortcut:\s*true/.test(content);
                // Parse special effects (do_attack, on_use, on_uneq)
                data.has_do_attack = /this\.do_attack\s*=/.test(content);
                data.has_on_use = /this\.on_use\s*=/.test(content);
                data.has_on_uneq = /this\.on_uneq\s*=/.test(content);
                data.has_group_prop = /this\.group_prop\s*=/.test(content);
                sendJSON(res, { success: true, data: data });
            } catch(e) { sendJSON(res, { error: 'Read failed: ' + e.message }, 500); }
        }
        // POST /api/equipment_save — create or update equipment file
        else if (url === '/api/equipment_save' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var eqPath = body.path;
                var content = body.content;
                // If no content provided, generate from params
                if (!content) {
                    var name = body.name || '新装备';
                    var grade = parseInt(body.grade) || 0;
                    var eqType = body.eq_type || 'EQUIP_TYPE.CLOTH';
                    var weaponType = body.weapon_type || '';
                    var unit = body.unit || '件';
                    var desc = body.desc || name;
                    var holeCount = parseInt(body.hole_count) || 0;
                    var value = parseInt(body.value) || 0;
                    var groupName = body.group_name || '';
                    var props = body.prop || {};
                    var condition = body.condition || {};
                    var family = body.family || '';

                    var lines = ['this.inherits(EQUIPMENT);'];
                    var setLines = ['    unit: "' + unit + '"', 'name: "' + name + '"', 'desc: "' + desc + '"', 'grade: ' + grade];
                    if (eqType) setLines.push('eq_type: ' + eqType);
                    if (weaponType) setLines.push('weapon_type: ' + weaponType);
                    if (holeCount > 0) setLines.push('hole_count: ' + holeCount);
                    if (value > 0) setLines.push('value: ' + value);
                    if (groupName) setLines.push('group_name: "' + groupName + '"');

                    // Build prop object
                    var propKeys = Object.keys(props).filter(function(k) { return props[k] !== 0 && props[k] !== '' && props[k] !== null && props[k] !== undefined; });
                    if (propKeys.length > 0) {
                        var propLines = propKeys.map(function(k) { return '        ' + k + ': ' + props[k]; }).join(',\n');
                        setLines.push('prop: {\n' + propLines + '\n    }');
                    }
                    // Passive description
                    var passiveDesc = body.passive_desc || '';
                    if (passiveDesc) {
                        setLines.push('passive_desc: "' + passiveDesc.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"');
                    }
                    lines.push('this.set({\n' + setLines.join(',\n') + '\n});');

                    // Condition
                    var condKeys = Object.keys(condition).filter(function(k) { return condition[k]; });
                    if (condKeys.length > 0) {
                        var condObj = {};
                        condKeys.forEach(function(k) {
                            if (k === 'skill' && typeof condition[k] === 'object') {
                                var skKeys = Object.keys(condition[k]).filter(function(sk) { return condition[k][sk]; });
                                if (skKeys.length > 0) {
                                    var skObj = {};
                                    skKeys.forEach(function(sk) { skObj[sk] = parseInt(condition[k][sk]) || 100; });
                                    condObj.skill = skObj;
                                }
                            } else if (['str','con','dex','int','gender'].indexOf(k) >= 0) {
                                condObj[k] = parseInt(condition[k]) || 0;
                            }
                        });
                        if (Object.keys(condObj).length > 0) {
                            lines.push('this.condition = ' + JSON.stringify(condObj).replace(/"(\w+)":/g, '$1:') + ';');
                        }
                    }
                    if (family) lines.push('this.family = ' + family + ';');
                    if (body.no_fenjie) lines.push('this.no_fenjie = true;');

                    // Special effects (keep existing from body.content if editing)
                    if (body.do_attack_code) lines.push(body.do_attack_code);
                    if (body.on_use_code) lines.push(body.on_use_code);
                    if (body.on_uneq_code) lines.push(body.on_uneq_code);
                    if (body.group_prop_code) lines.push(body.group_prop_code);

                    content = lines.join('\n');
                }

                if (!eqPath) { sendJSON(res, { error: 'path required' }, 400); return; }
                var lastSlash = eqPath.lastIndexOf('/');
                var dir = lastSlash > 0 ? eqPath.substring(0, lastSlash) : '';
                var fullDir = path.join(OBJ_DIR, dir);
                var fullPath = path.join(OBJ_DIR, eqPath + '.js');
                if (!fullPath.startsWith(OBJ_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
                try {
                    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
                    fs.writeFileSync(fullPath, content, 'utf8');
                    // Hot-reload the equipment
                    try { BASE.CREATE(path.join(OBJ_DIR, '/'), eqPath); } catch(ex) {}
                    sendJSON(res, { success: true, message: '装备已保存: ' + eqPath, path: eqPath });
                } catch(e) { sendJSON(res, { error: '保存失败: ' + e.message }, 500); }
            });
        }
        // POST /api/equipment_delete — delete equipment file
        else if (url === '/api/equipment_delete' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var eqPath = body.path;
                if (!eqPath) { sendJSON(res, { error: 'path required' }, 400); return; }
                var fullPath = path.join(OBJ_DIR, eqPath + '.js');
                if (!fullPath.startsWith(OBJ_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
                try {
                    if (!fs.existsSync(fullPath)) { sendJSON(res, { error: 'File not found' }, 404); return; }
                    fs.unlinkSync(fullPath);
                    sendJSON(res, { success: true, message: '已删除: ' + eqPath });
                } catch(e) { sendJSON(res, { error: '删除失败: ' + e.message }, 500); }
            });
        }
        // POST /api/npc_create
        else if (url === '/api/npc_create' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var npcPath = body.path, npcName = body.name, npcDesc = body.desc;
                var hp = parseInt(body.hp) || 100000, mp = parseInt(body.mp) || 50000;
                var gj = parseInt(body.gj) || 10000, fy = parseInt(body.fy) || 10000;
                var mz = parseInt(body.mz) || 12000, ds = parseInt(body.ds) || 10000, zj = parseInt(body.zj) || 10000;
                var str = parseInt(body['str']) || 5000, con = parseInt(body.con) || 5000;
                var dex = parseInt(body.dex) || 4000, int_ = parseInt(body.int) || 4000;
                var npcScore = parseInt(body.score) || 50;
                var noFight = !!body.no_fight || !!body.is_merchant; // Merchants are peaceful by default
                var drops = body.drops || [];
                var npcSkills = body.skills || [];
                var diffSh = parseInt(body.diff_sh) || 0;
                if (!npcPath || !npcName) { sendJSON(res, { error: 'path and name required' }, 400); return; }
                if (!/^[a-zA-Z0-9_\/]+$/.test(npcPath)) { sendJSON(res, { error: 'Invalid path' }, 400); return; }
                var lastSlash = npcPath.lastIndexOf('/');
                var dir = lastSlash > 0 ? npcPath.substring(0, lastSlash) : '';
                var fname = lastSlash > 0 ? npcPath.substring(lastSlash + 1) : npcPath;
                var fullDir = path.join(NPC_DIR, dir);
                var fullPath = path.join(fullDir, fname + '.js');
                if (!fullPath.startsWith(NPC_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
                // Allow overwrite — supports updating existing NPCs
                try {
                    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
                    var skillLines = npcSkills.length > 0
                        ? "this.skill_map(\n    " + npcSkills.map(function(s){ return '["' + s.id + '", ' + (s.level || 1000) + (s.enable ? ', "' + s.enable + '"' : '') + ']'; }).join(',\n    ') + "\n);"
                        : (noFight ? '' : 'this.skill_map(\n    ["dodge", 1000],\n    ["parry", 1000],\n    ["force", 1000],\n    ["unarmed", 1000]\n);');
                    var dropLines = '';
                    if (drops.length > 0) {
                        dropLines = 'this.set_drop(\n' + drops.map(function(d) {
                            return '    {obj: "' + d.obj + '", odds: ' + (d.odds || 10000) + '}';
                        }).join(',\n') + '\n);';
                    }
                    var enterLine = noFight
                        ? 'this.on_enter = function (me) {\n    me.notify("' + npcName + '看了你一眼。");\n};'
                        : 'this.on_enter = function (me) {\n    this.do_kill(me);\n};';
                    var diffShLine = diffSh > 0 ? 'this.add_prop("diff_sh_per", ' + diffSh + ');' : '';
                    var roomPathStr = body.room_path || '';
                    var roomPaths = roomPathStr ? roomPathStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
                    var fileExists = fs.existsSync(fullPath);
                    var existingContent = body.content || (fileExists ? fs.readFileSync(fullPath, 'utf8') : '');
                    var content;
                    // If editing existing NPC, patch the file content to preserve custom code
                    if (fileExists) {
                        content = existingContent;

                        // Patch skill_map
                        var newSkillMap = npcSkills.length > 0
                            ? "this.skill_map(\n    " + npcSkills.map(function(s){ return '["' + s.id + '", ' + (s.level || 1000) + (s.enable ? ', "' + s.enable + '"' : '') + ']'; }).join(',\n    ') + "\n);"
                            : '';
                        if (content.match(/this\.skill_map\s*\([\s\S]*?\);/)) {
                            if (newSkillMap) {
                                content = content.replace(/this\.skill_map\s*\([\s\S]*?\);/g, newSkillMap);
                            } else {
                                // Remove skill_map line(s) if skills cleared
                                content = content.replace(/this\.skill_map\s*\([\s\S]*?\);\s*/g, '');
                            }
                        } else if (newSkillMap) {
                            // No skill_map — insert before on_enter / on_kill / on_die / on_sell / set_drop
                            var insertPos = content.search(/this\.(on_enter|on_kill|on_die|on_sell|on_accept|set_drop|add_action)\s*=/);
                            if (insertPos >= 0) {
                                content = content.substring(0, insertPos) + newSkillMap + '\n' + content.substring(insertPos);
                            } else {
                                content += '\n' + newSkillMap;
                            }
                        }

                        // Patch set_drop
                        if (drops.length > 0) {
                            var newDropBlock = 'this.set_drop(\n' + drops.map(function(d) {
                                return '    {obj: "' + d.obj + '", odds: ' + (d.odds || 10000) + '}';
                            }).join(',\n') + '\n);';
                            if (content.match(/this\.set_drop\s*\([\s\S]*?\);/)) {
                                content = content.replace(/this\.set_drop\s*\([\s\S]*?\);/g, newDropBlock);
                            } else {
                                // Insert before skill_map or on_enter
                                var dpPos = content.search(/this\.(skill_map|on_enter|on_kill|on_die|on_sell|add_action)\s*=/);
                                if (dpPos >= 0) {
                                    content = content.substring(0, dpPos) + newDropBlock + '\n' + content.substring(dpPos);
                                } else {
                                    content += '\n' + newDropBlock;
                                }
                            }
                        } else if (content.match(/this\.set_drop\s*\([\s\S]*?\);/)) {
                            // Remove drops if cleared
                            content = content.replace(/this\.set_drop\s*\([\s\S]*?\);\s*/g, '');
                        }

                        // Patch sell_list
                        var sellItems = body.sell_items || '';
                        if (sellItems) {
                            var items = sellItems.split(',').filter(Boolean).map(function(s) {
                                var parts = s.trim().split(':');
                                return { path: parts[0].trim(), price: parts[1] ? parseInt(parts[1]) : 10000 };
                            });
                            var newSellEntries = items.map(function(it) {
                                return '    { obj: "' + it.path + '", price: ' + it.price + ' }';
                            }).join(',\n');
                            var newSellList = 'this.sell_list = [\n' + newSellEntries + '\n];';
                            if (content.match(/this\.sell_list\s*=\s*\[[\s\S]*?\];/)) {
                                content = content.replace(/this\.sell_list\s*=\s*\[[\s\S]*?\];/, newSellList);
                            } else if (content.match(/this\.on_sell\s*=/)) {
                                content = content.replace(/(this\.on_sell\s*=)/, newSellList + '\n$1');
                            } else {
                                content += '\n' + newSellList;
                            }
                        }
                        // Patch placed_in comment
                        if (roomPaths.length > 0) {
                            var placedStr = '// placed_in: ' + roomPaths.join(', ');
                            if (content.match(/\/\/\s*placed_in:/)) {
                                content = content.replace(/\/\/\s*placed_in:.*/, placedStr);
                            } else {
                                content += '\n' + placedStr;
                            }
                        }
                        // Ensure no_fight if merchant
                        if (body.is_merchant && !/no_fight:\s*true/.test(content)) {
                            content = content.replace(/(no_refresh:\s*true,)/, '$1\n    no_fight: true,');
                        }
                        // Ensure is_merchant if merchant
                        if (body.is_merchant && !/is_merchant:\s*true/.test(content)) {
                            content = content.replace(/(no_refresh:\s*true,)/, '$1\n    is_merchant: true,');
                        }
                    } else {
                        // New NPC — generate from scratch
                        content = [
                            'this.inherits(NPC);',
                            'this.set({',
                            '    name: "' + npcName + '",',
                            '    desc: "' + (npcDesc || npcName) + '",',
                            '    title: "<hiy>' + npcName + '</hiy>",',
                            '    gender: 1, age: 40, per: 15,',
                            '    no_refresh: true,',
                            (noFight ? '    no_fight: true,' : ''),
                            (body.is_merchant ? '    is_merchant: true,' : ''),
                            '    hp: ' + hp + ', max_hp: ' + hp + ',',
                            '    mp: ' + mp + ', max_mp: ' + mp + ',',
                            '    score: ' + npcScore + ',',
                            '    gj: ' + gj + ', fy: ' + fy + ', mz: ' + mz + ', ds: ' + ds + ', zj: ' + zj + ',',
                            '    str: ' + str + ', con: ' + con + ', dex: ' + dex + ', int: ' + int_ + ',',
                            '});',
                            diffShLine,
                            noFight ? '' : 'this.set_objects(["eq/lv0/cloth", 1, 1]);',
                            skillLines,
                            dropLines,
                            enterLine,
                            // Teacher callbacks
                            body.on_master_code || '',
                            body.on_teach_code || '',
                            body.on_checkskill_code || '',
                            // Merchant code — follows mishu.js pattern (add_action first, _goodsCache, on_sell)
                            (function() {
                                if (!body.is_merchant) return '';
                                var lines = [];
                                // add_action FIRST (before on_sell) — matches mishu.js
                                lines.push('');
                                lines.push('this.add_action("list", "浏览商品", function (me) {');
                                lines.push('    me.do_command("list", this.id);');
                                lines.push('});');
                                // on_kill / on_die for peaceful merchant
                                lines.push('');
                                lines.push('this.on_kill = function (me) {');
                                lines.push('    return me.notify_fail("' + npcName + '微微一笑：\\"我只是个做生意的，何必打打杀杀呢？\\"");');
                                lines.push('};');
                                lines.push('');
                                lines.push('this.on_die = function () {');
                                lines.push('    return false;');
                                lines.push('};');
                                // Build on_sell with direct item creation (no sell_list)
                                var sellItems2 = body.sell_items || '';
                                if (sellItems2) {
                                    var items2 = sellItems2.split(',').filter(Boolean).map(function(s2) {
                                        var parts2 = s2.trim().split(':');
                                        return { path: parts2[0].trim(), price: parts2[1] ? parseInt(parts2[1]) : 10000 };
                                    });
                                    if (items2.length > 0) {
                                        lines.push('');
                                        lines.push('this._goodsCache = null;');
                                        lines.push('');
                                        lines.push('this.on_sell = function (me) {');
                                        lines.push('    if (this._goodsCache) return this._goodsCache;');
                                        lines.push('');
                                        lines.push('    this._goodsCache = [];');
                                        for (var ii = 0; ii < items2.length; ii++) {
                                            lines.push('    var item' + ii + ' = OBJ.CREATE("' + items2[ii].path + '");');
                                            lines.push('    if (item' + ii + ') {');
                                            lines.push('        item' + ii + '.count = -1;');
                                            lines.push('        item' + ii + '.value = ' + items2[ii].price + ';');
                                            lines.push('        this._goodsCache.push(item' + ii + ');');
                                            lines.push('    }');
                                        }
                                        lines.push('    return this._goodsCache;');
                                        lines.push('};');
                                    }
                                }
                                if (body.on_sell_code) lines.push(body.on_sell_code);
                                if (body.on_accept_code) lines.push(body.on_accept_code);
                                return lines.join('\n');
                            })(),
                        ].filter(function(l) { return l; }).join('\n');
                    }

                    // Parse old placements from existing NPC file (before overwrite)
                    if (fs.existsSync(fullPath)) {
                        try {
                            var oldContent = fs.readFileSync(fullPath, 'utf8');
                            var oldPlaced = oldContent.match(/\/\/\s*placed_in:\s*(.+)/);
                            if (oldPlaced) {
                                var oldPaths = oldPlaced[1].split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                                // Remove NPC from rooms no longer in the list
                                for (var opi = 0; opi < oldPaths.length; opi++) {
                                    if (roomPaths.indexOf(oldPaths[opi]) < 0) {
                                        removeNpcFromRoom(oldPaths[opi], npcPath);
                                    }
                                }
                            }
                        } catch(ex) {}
                    }
                    // Add NPC to each specified room, collect errors
                    var placeErrors = [];
                    for (var rpi = 0; rpi < roomPaths.length; rpi++) {
                        var result = addNpcToRoom(roomPaths[rpi], npcPath);
                        if (!result.ok) placeErrors.push(result.msg);
                    }
                    // Write placement tracking comment into NPC content BEFORE saving
                    if (roomPaths.length > 0) {
                        content += '\n// placed_in: ' + roomPaths.join(', ');
                    }

                    fs.writeFileSync(fullPath, content, 'utf8');

                    // Hot-reload the NPC into the running game (clear caches first)
                    try {
                        var npcReloadKey = path.join(NPC_DIR, '/').replace(/\\/g, '/') + npcPath;
                        delete BASE.ITEMS[npcReloadKey];
                        if (WORLD && WORLD.NPC_STROE) WORLD.NPC_STROE.delete(npcPath);
                        BASE.CREATE(path.join(NPC_DIR, '/'), npcPath);
                    } catch(ex) {}

                    // Clear caches
                    itemCache = null;
                    var placeMsg = '';
                    if (roomPaths.length > 0) {
                        var successPaths = roomPaths.filter(function(p) { return !placeErrors.some(function(e) { return e.indexOf(p) >= 0; }); });
                        if (successPaths.length > 0) placeMsg += ' (已放置到 ' + successPaths.join(', ') + ')';
                        if (placeErrors.length > 0) placeMsg += ' ⚠房间不存在: ' + placeErrors.map(function(e) { return e.split(': ')[1] || e; }).join(', ');
                    }
                    sendJSON(res, { success: true, message: 'NPC ' + npcPath + ': 保存成功' + placeMsg, path: npcPath });
                } catch (e) { sendJSON(res, { error: 'Create failed: ' + e.message }, 500); }
            });
        }
        // POST /api/npc_delete — delete NPC file and clean up room references
        else if (url === '/api/npc_delete' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var npcPath3 = body.path;
                if (!npcPath3) { sendJSON(res, { error: 'path required' }, 400); return; }
                if (!/^[a-zA-Z0-9_\/]+$/.test(npcPath3)) { sendJSON(res, { error: 'Invalid path' }, 400); return; }
                var fullPath3 = path.join(NPC_DIR, npcPath3 + '.js');
                if (!fullPath3.startsWith(NPC_DIR)) { sendJSON(res, { error: 'Path traversal blocked' }, 400); return; }
                try {
                    if (!fs.existsSync(fullPath3)) { sendJSON(res, { error: 'NPC file not found' }, 404); return; }
                    // Read NPC to find placed rooms
                    var delContent = fs.readFileSync(fullPath3, 'utf8');
                    var placedMatch = delContent.match(/\/\/\s*placed_in:\s*(.+)/);
                    if (placedMatch) {
                        var placedRooms = placedMatch[1].split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                        for (var dri = 0; dri < placedRooms.length; dri++) {
                            removeNpcFromRoom(placedRooms[dri], npcPath3);
                        }
                    }
                    // Delete the file
                    fs.unlinkSync(fullPath3);
                    // Clear caches
                    var delFkey = path.join(NPC_DIR, '/').replace(/\\/g, '/') + npcPath3;
                    delete BASE.ITEMS[delFkey];
                    if (WORLD && WORLD.NPC_STROE) WORLD.NPC_STROE.delete(npcPath3);
                    itemCache = null;
                    sendJSON(res, { success: true, message: '已删除NPC: ' + npcPath3 });
                } catch (e) { sendJSON(res, { error: 'Delete failed: ' + e.message }, 500); }
            });
        }
        // GET /api/backups — list backup files
        else if (url === '/api/backups' && method === 'GET') {
            var list = [];
            try { list = WORLD.DATA.listBackups(); } catch(e) {}
            sendJSON(res, { success: true, data: list });
        }
        // POST /api/backup_rollback — rollback to a backup
        else if (url === '/api/backup_rollback' && method === 'POST') {
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var filename = body.filename;
                if (!filename) { sendJSON(res, { error: 'filename required' }, 400); return; }
                try {
                    var ok = WORLD.DATA.rollback(filename);
                    sendJSON(res, { success: ok, message: ok ? '回滚成功，请重启服务器' : '回滚失败' });
                } catch(e) { sendJSON(res, { error: '回滚失败: ' + e.message }, 500); }
            });
        }
        // POST /api/backup_create — trigger manual backup
        else if (url === '/api/backup_create' && method === 'POST') {
            WORLD.save().then(function () {
                WORLD.DATA.backup();
                sendJSON(res, { success: true, message: '备份完成' });
            }).catch(function (e) { sendJSON(res, { error: '备份失败: ' + e.message }, 500); });
        }
        // POST /api/eval
        else if (url === '/api/eval' && method === 'POST') {
            if (isFormalServer()) { sendJSON(res, { error: '正式服不允许执行代码' }, 403); return; }
            readBody(req, function (err, body) {
                if (err) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var code = body.code;
                if (!code) { sendJSON(res, { error: 'code required' }, 400); return; }
                try {
                    var fn = new Function('WORLD', 'BASE', 'SKILL', 'ROOM', 'AREA', 'db', 'return (' + code + ')');
                    var result = fn(WORLD, BASE, SKILL, ROOM, AREA, WORLD.DB);
                    sendJSON(res, { success: true, result: result });
                } catch (e) { sendJSON(res, { error: 'Eval error: ' + e.message }, 500); }
            });
        }
        // ===== File Manager APIs =====
        // GET /api/file_list?dir=xxx
        else if (url.startsWith('/api/file_list') && method === 'GET') {
            var reqDir = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).dir || '';
            // Allowed base directories
            var allowedBases = [
                path.join(__dirname, '..', 'world'),
                path.join(__dirname, '..', 'os'),
                path.join(__dirname, '..', 'api'),
                path.join(__dirname, '..', 'www'),
                path.join(__dirname, '..'),
            ];
            var fullDir = path.resolve(path.join(__dirname, '..', reqDir));
            // Security: ensure path is within allowed bases
            var allowed = false;
            for (var bi = 0; bi < allowedBases.length; bi++) {
                if (fullDir.startsWith(allowedBases[bi])) { allowed = true; break; }
            }
            if (!allowed) { sendJSON(res, { error: 'Access denied' }, 403); return; }
            try {
                if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
                    sendJSON(res, { error: 'Not a directory' }, 400); return;
                }
                var entries = fs.readdirSync(fullDir, { withFileTypes: true });
                var list = [];
                for (var ei = 0; ei < entries.length; ei++) {
                    var e = entries[ei];
                    if (e.name.startsWith('.')) continue;
                    var item = { name: e.name, is_dir: e.isDirectory() };
                    if (!e.isDirectory()) {
                        try {
                            var st = fs.statSync(path.join(fullDir, e.name));
                            item.size = st.size;
                            item.mtime = st.mtime.toISOString();
                        } catch(ex) {}
                    }
                    list.push(item);
                }
                list.sort(function(a, b) {
                    if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
                    return a.name.localeCompare(b.name);
                });
                sendJSON(res, { success: true, data: list, dir: reqDir });
            } catch(e) { sendJSON(res, { error: 'List failed: ' + e.message }, 500); }
        }
        // GET /api/file_read?path=xxx
        else if (url.startsWith('/api/file_read') && method === 'GET') {
            var filePath = (req.url.split('?')[1] || '').split('&').reduce(function(acc, p) {
                var parts = p.split('='); if (parts.length === 2) acc[parts[0]] = decodeURIComponent(parts[1]); return acc;
            }, {}).path || '';
            var fullPath = path.resolve(path.join(__dirname, '..', filePath));
            var rootDir = path.resolve(path.join(__dirname, '..'));
            if (!fullPath.startsWith(rootDir)) { sendJSON(res, { error: 'Access denied' }, 403); return; }
            try {
                if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
                    sendJSON(res, { error: 'Not a file' }, 400); return;
                }
                var fileContent = fs.readFileSync(fullPath, 'utf8');
                sendJSON(res, { success: true, data: { path: filePath, content: fileContent, size: fileContent.length } });
            } catch(e) { sendJSON(res, { error: 'Read failed: ' + e.message }, 500); }
        }
        // POST /api/file_save
        else if (url === '/api/file_save' && method === 'POST') {
            readBody(req, function(err, body) {
                if (err || !body) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var filePath = body.path;
                var fileContent = body.content;
                if (!filePath || fileContent === undefined) { sendJSON(res, { error: 'path and content required' }, 400); return; }
                var fullPath = path.resolve(path.join(__dirname, '..', filePath));
                var rootDir = path.resolve(path.join(__dirname, '..'));
                if (!fullPath.startsWith(rootDir)) { sendJSON(res, { error: 'Access denied' }, 403); return; }
                // Prevent overwriting critical system files
                var fileName = path.basename(fullPath);
                if (fileName === 'main.js' || fileName === 'web.js') {
                    sendJSON(res, { error: 'Cannot modify core system file: ' + fileName }, 403); return;
                }
                try {
                    var dir = path.dirname(fullPath);
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(fullPath, fileContent, 'utf8');
                    sendJSON(res, { success: true, message: 'File saved: ' + filePath });
                } catch(e) { sendJSON(res, { error: 'Save failed: ' + e.message }, 500); }
            });
        }
        // POST /api/file_delete
        else if (url === '/api/file_delete' && method === 'POST') {
            readBody(req, function(err, body) {
                if (err || !body) { sendJSON(res, { error: 'Invalid JSON' }, 400); return; }
                var filePath = body.path;
                if (!filePath) { sendJSON(res, { error: 'path required' }, 400); return; }
                var fullPath = path.resolve(path.join(__dirname, '..', filePath));
                var rootDir = path.resolve(path.join(__dirname, '..'));
                if (!fullPath.startsWith(rootDir)) { sendJSON(res, { error: 'Access denied' }, 403); return; }
                var fileName = path.basename(fullPath);
                if (fileName === 'main.js' || fileName === 'web.js') {
                    sendJSON(res, { error: 'Cannot delete core system file: ' + fileName }, 403); return;
                }
                try {
                    if (!fs.existsSync(fullPath)) { sendJSON(res, { error: 'File not found' }, 404); return; }
                    if (fs.statSync(fullPath).isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true });
                        sendJSON(res, { success: true, message: 'Directory deleted: ' + filePath });
                    } else {
                        fs.unlinkSync(fullPath);
                        sendJSON(res, { success: true, message: 'File deleted: ' + filePath });
                    }
                } catch(e) { sendJSON(res, { error: 'Delete failed: ' + e.message }, 500); }
            });
        }
                else { sendJSON(res, { error: 'Not found: ' + method + ' ' + url }, 404); }
    } catch (e) {
        console.error('IPC error:', e);
        sendJSON(res, { error: 'Internal error: ' + e.message }, 500);
    }
}

// Helper: parse all NPC entries from set_npc arguments (handles both "path" and ["path", count] formats)
function parseNpcArgs(argsStr) {
    var npcs = [];
    // Match array format: ["path", count]
    var arrayMatches = argsStr.match(/\["([^"]+)",\s*(\d+)\]/g) || [];
    arrayMatches.forEach(function(m) {
        var parts = m.match(/"([^"]+)",\s*(\d+)/);
        if (parts) npcs.push({ path: parts[1], count: parseInt(parts[2]) });
    });
    // Remove array matches, then match plain string format: "path"
    var remaining = argsStr.replace(/\["[^"]+",\s*\d+\]/g, '');
    var stringMatches = remaining.match(/"([^"]+)"/g) || [];
    stringMatches.forEach(function(m) {
        var name = m.replace(/"/g, '');
        if (name) npcs.push({ path: name, count: 1 });
    });
    return npcs;
}

// Helper: rebuild set_npc call from npc entries
function buildNpcCall(npcs) {
    if (npcs.length === 0) return null;
    // Use simple string format for single NPC with count=1, array format otherwise
    if (npcs.length === 1 && npcs[0].count === 1) {
        return 'this.set_npc("' + npcs[0].path + '");';
    }
    return 'this.set_npc(' + npcs.map(function(n) {
        return n.count === 1 ? '"' + n.path + '"' : '["' + n.path + '", ' + n.count + ']';
    }).join(', ') + ');';
}

// Helper: add NPC to room's set_npc. Returns {ok:true} or {ok:false, msg:string}
function addNpcToRoom(roomPath, npcPath) {
    var roomFile = path.join(__dirname, '..', 'world', 'map', roomPath + '.js');
    if (!fs.existsSync(roomFile)) {
        return { ok: false, msg: '房间不存在: ' + roomPath };
    }
    try {
        var content = fs.readFileSync(roomFile, 'utf8');
        // Parse existing set_npc entries — handle rooms with multiple set_npc calls
        var allNpcMatches = content.match(/this\.set_npc\([\s\S]*?\);/g) || [];
        var allNpcs = [];
        for (var ai = 0; ai < allNpcMatches.length; ai++) {
            var argsMatch = allNpcMatches[ai].match(/this\.set_npc\(([\s\S]*?)\);/);
            if (argsMatch) {
                var parsed = parseNpcArgs(argsMatch[1]);
                for (var pi = 0; pi < parsed.length; pi++) allNpcs.push(parsed[pi]);
            }
        }
        // Add if not exists
        if (!allNpcs.some(function(n) { return n.path === npcPath; })) {
            allNpcs.push({ path: npcPath, count: 1 });
        }
        // Remove ALL existing set_npc calls, replace with single consolidated call
        content = content.replace(/this\.set_npc\([\s\S]*?\);/g, '');
        // Clean up any blank lines left behind
        content = content.replace(/\n{3,}/g, '\n\n');
        // Add the consolidated set_npc
        var newNpc = buildNpcCall(allNpcs);
        if (newNpc) {
            content += '\n' + newNpc;
        }
        fs.writeFileSync(roomFile, content, 'utf8');
        // Hot-reload the room (clear cache first)
        try {
            var roomReloadKey = path.join(__dirname, '..', 'world', 'map', '/').replace(/\\/g, '/') + roomPath;
            delete BASE.ITEMS[roomReloadKey];
            BASE.CREATE(path.join(__dirname, '..', 'world', 'map', '/'), roomPath);
        } catch(ex) {}
        return { ok: true };
    } catch(ex) { console.error('addNpcToRoom failed:', roomPath, ex.message); return { ok: false, msg: ex.message }; }
}
// Helper: remove NPC from room's set_npc
function removeNpcFromRoom(roomPath, npcPath) {
    var roomFile = path.join(__dirname, '..', 'world', 'map', roomPath + '.js');
    try {
        if (!fs.existsSync(roomFile)) return;
        var content = fs.readFileSync(roomFile, 'utf8');
        // Parse ALL set_npc calls
        var allNpcMatches = content.match(/this\.set_npc\([\s\S]*?\);/g) || [];
        var allNpcs = [];
        for (var ai = 0; ai < allNpcMatches.length; ai++) {
            var argsMatch = allNpcMatches[ai].match(/this\.set_npc\(([\s\S]*?)\);/);
            if (argsMatch) {
                var parsed = parseNpcArgs(argsMatch[1]);
                for (var pi = 0; pi < parsed.length; pi++) allNpcs.push(parsed[pi]);
            }
        }
        // Remove the target NPC
        allNpcs = allNpcs.filter(function(n) { return n.path !== npcPath; });
        // Remove ALL old set_npc calls
        content = content.replace(/this\.set_npc\([\s\S]*?\);/g, '');
        content = content.replace(/\n{3,}/g, '\n\n');
        // Rebuild
        var newNpc = buildNpcCall(allNpcs);
        if (newNpc) content += '\n' + newNpc;
        fs.writeFileSync(roomFile, content, 'utf8');
        // Hot-reload the room (clear cache first)
        try {
            var roomReloadKey2 = path.join(__dirname, '..', 'world', 'map', '/').replace(/\\/g, '/') + roomPath;
            delete BASE.ITEMS[roomReloadKey2];
            BASE.CREATE(path.join(__dirname, '..', 'world', 'map', '/'), roomPath);
        } catch(ex) {}
    } catch(ex) { console.error('removeNpcFromRoom failed:', roomPath, ex.message); }
}

var ipcServer;
exports.start = function () {
    if (ipcServer) return;
    ipcServer = http.createServer(handleRequest);
    ipcServer.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            console.error('[Admin IPC] Port ' + IPC_PORT + ' in use, retrying in 3s...');
            ipcServer.close();
            ipcServer = null;
            setTimeout(function () { exports.start(); }, 3000);
        } else {
            console.error('[Admin IPC] Unexpected error:', err.message);
        }
    });
    ipcServer.listen({ port: IPC_PORT, host: '127.0.0.1', reuseAddr: true }, function () {
        console.log('[Admin IPC] listening on 127.0.0.1:' + IPC_PORT);
    });
};
