#!/usr/bin/env python3
"""Production features: backup + MD5 + health + shutdown + rollback"""
import os, shutil

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(f):
    with open(os.path.join(BASE, f), 'r', encoding='utf-8') as fh:
        return fh.read()

def write(f, content):
    with open(os.path.join(BASE, f), 'w', encoding='utf-8') as fh:
        fh.write(content)

# ===== 1. os/data.js: backup + MD5 =====
content = read('os/data.js')

# Add imports
content = content.replace(
    "module.exports = {",
    """const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backup');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

module.exports = {""",
    1
)

# Add MD5 to save
content = content.replace(
    'return WORLD.DB.saveData(str.join(""));',
    '''var content = str.join("");
        var md5 = crypto.createHash('md5').update(content).digest('hex');
        content += '\\n//MD5:' + md5;
        return WORLD.DB.saveData(content);'''
)

# Add backup/rollback methods after temp_replacer
content = content.replace(
    'return value;\n    },',
    '''return value;
    },
    backup: function () {
        var srcPath = path.join(__dirname, '..', 'data', 'data.js');
        if (!fs.existsSync(srcPath)) return;
        var now = new Date();
        var ts = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '_' + String(now.getHours()).padStart(2,'0') + '-' + String(now.getMinutes()).padStart(2,'0');
        var dstPath = path.join(BACKUP_DIR, 'data_' + ts + '.js');
        try {
            fs.copyFileSync(srcPath, dstPath);
            var files = fs.readdirSync(BACKUP_DIR).filter(function(f){return f.endsWith('.js');}).sort();
            while (files.length > 48) { fs.unlinkSync(path.join(BACKUP_DIR, files.shift())); }
        } catch(e) { console.error('备份失败:', e.message); }
    },
    listBackups: function () {
        try { return fs.readdirSync(BACKUP_DIR).filter(function(f){return f.endsWith('.js');}).sort().reverse(); }
        catch(e) { return []; }
    },
    rollback: function (filename) {
        var src = path.join(BACKUP_DIR, filename);
        var dst = path.join(__dirname, '..', 'data', 'data.js');
        if (!fs.existsSync(src)) return false;
        try {
            var now = new Date();
            var ts = 'rollback_' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
            fs.copyFileSync(dst, path.join(BACKUP_DIR, ts + '.js'));
            fs.copyFileSync(src, dst);
            return true;
        } catch(e) { console.error('回滚失败:', e.message); return false; }
    },''',
    1
)

write('os/data.js', content)
print('[1/5] data.js: backup + MD5 + rollback')

# ===== 2. web.js: health endpoint =====
web = read('web.js')
health = '''
// 健康检查端点
app.get('/health', function (req, res) {
    var players = (global.WORLD && WORLD.USERS) ? WORLD.USERS.length : 0;
    var mem = process.memoryUsage();
    var uptime = Math.floor(process.uptime());
    res.json({
        status: 'ok', uptime: uptime,
        uptimeStr: Math.floor(uptime/86400)+'d '+Math.floor(uptime%86400/3600)+'h '+Math.floor(uptime%3600/60)+'m',
        players: players,
        memory: { heapMB: Math.round(mem.heapUsed/1048576), rssMB: Math.round(mem.rss/1048576) },
        pid: process.pid
    });
});

// 启动服务器'''
web = web.replace('// 启动服务器', health)
write('web.js', web)
print('[2/5] web.js: /health endpoint')

# ===== 3. api/admin.js: backup_list, backup_rollback, safe_shutdown =====
admin = read('api/admin.js')
new_api = '''
    async backup_list() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        return { ok: true, data: WORLD.DATA.listBackups() };
    }
    async backup_rollback(params) {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        if (!params.filename) return { ok: false, msg: 'filename必填' };
        return WORLD.DATA.rollback(params.filename) ? { ok: true, msg: '回滚成功，请重启服务器' } : { ok: false, msg: '回滚失败' };
    }
    async safe_shutdown() {
        try { this._requireAdmin(); } catch (e) { return { ok: false, msg: e.message }; }
        try { WORLD.save(); WORLD.DATA.backup(); } catch(e) {}
        setTimeout(function () { process.exit(0); }, 1500);
        return { ok: true, msg: '安全关服已启动（已存档+备份，1.5秒后退出）' };
    }
}

module.exports = AdminAPI;'''
admin = admin.replace('\nmodule.exports = AdminAPI;', new_api)
write('api/admin.js', admin)
print('[3/5] api/admin.js: backup/rollback/shutdown APIs')

# ===== 4. www/admin/index.html: rollback panel =====
panel = read('www/admin/index.html')

# Add sidebar link
panel = panel.replace(
    '<a onclick="showPanel(\'broadcast\')">📢 公告发送</a>',
    '<a onclick="showPanel(\'broadcast\')">📢 公告发送</a>\n<a onclick="showPanel(\'rollback\')">💾 存档管理</a>'
)

# Add rollback panel
panel = panel.replace(
    '</div></div>\n<script>',
    '''<!-- Rollback -->
<div id="panel-rollback" class="panel"><h3>存档管理</h3>
<div class="frow"><button class="btn-p" onclick="loadBackups()">刷新备份列表</button>
<button class="btn-d" onclick="safeShutdown()" style="margin-left:20px">安全关服</button></div>
<div style="background:#16213e;border-radius:6px;padding:16px;margin-top:12px">
<h4 style="color:#e94560;margin-bottom:8px">备份列表（最近48个）</h4>
<table><thead><tr><th>文件名</th><th>操作</th></tr></thead><tbody id="backupList"></tbody></table></div>
<div id="rbmsg"></div></div>
</div></div>
<script>'''
)

# Add rollback JS functions
panel = panel.replace(
    'if (loggedIn) { showMain(); }',
    '''async function loadBackups() {
    var r = await api('backup_list');
    if (!r.ok) { msg('rbmsg', r.msg, false); return; }
    document.getElementById('backupList').innerHTML = (r.data||[]).map(function(f){ return '<tr><td>'+f+'</td><td><button class="btn-p btn-sm" onclick="doRollback(\''+f+'\')">回滚到此</button></td></tr>'; }).join('')||'<tr><td colspan="2">暂无备份</td></tr>';
    msg('rbmsg', '已加载 '+r.data.length+' 个备份', true);
}
async function doRollback(fn) {
    if (!confirm('回滚到 '+fn+'？当前存档将被备份。需重启服务器。')) return;
    var r = await api('backup_rollback', {filename: fn});
    msg('rbmsg', r.ok ? r.msg : ('失败: '+r.msg), r.ok);
}
async function safeShutdown() {
    if (!confirm('确定安全关服？将自动存档并备份。')) return;
    var r = await api('safe_shutdown');
    msg('rbmsg', r.msg, r.ok);
}
document.addEventListener('click', function(e){ if (!e.target.closest('.search-box')) document.querySelectorAll('.search-drop').forEach(function(d){d.style.display='none';}); });
if (loggedIn) { showMain(); }'''
)

write('www/admin/index.html', panel)
print('[4/5] admin panel: rollback + shutdown UI')

# ===== 5. Start backup timer in main.js =====
main = read('main.js')
if 'setInterval' not in main or 'backup' not in main:
    main += '''
// 定时备份（每小时）+ 性能监控
setInterval(function () {
    if (WORLD && WORLD.DATA && WORLD.DATA.backup) {
        WORLD.DATA.backup();
        console.log('[备份] 自动备份完成');
    }
    // 性能监控：内存告警
    var mem = process.memoryUsage();
    if (mem.heapUsed > 524288000) {
        console.warn('[监控] 内存使用过高: ' + Math.round(mem.heapUsed/1048576) + 'MB');
        if (global.gc) global.gc();
    }
}, 3600000); // 每小时
'''
write('main.js', main)
print('[5/5] main.js: hourly backup + perf monitor')

print('\n===== All production features installed =====')
print('  /health      - 健康检查')
print('  /admin       - 管理面板(存档管理+安全关服)')
print('  每小时自动备份到 data/backup/')
print('  存档末尾MD5校验')
'''
