'use strict';
const assert = require('assert/strict'), fs = require('fs'), os = require('os'), path = require('path');
const db = require('../data/db'), sql = require('../data/sql'), routes = require('../api/routes');
async function main() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsbbb-admin-stats-'));
    const oldPassword = process.env.INITIAL_ADMIN_PASSWORD;
    delete process.env.INITIAL_ADMIN_PASSWORD;
    try {
        await db.init(path.join(dir, 'fixture.db'));
        const admin = db.db.prepare('SELECT state,pwd FROM users WHERE id=1').get();
        assert.equal(admin.state, 0, 'fresh administrator must not be enabled by a default password');
        assert.equal(db.db.prepare('SELECT count(*) AS n FROM servers').get().n, 2);
        assert(db.db.prepare("SELECT name FROM sqlite_master WHERE name='idx_players_sid'").get());
        db.db.prepare("INSERT INTO players(id,name,userid,sid,title,create_time,update_time) VALUES(?,?,?,?,?,datetime('now','-40 days'),datetime('now','-40 days'))").run('fixture', '合并测试', 1, 200, '');
        assert.equal((await sql.getPlayerStats(200)).active7, 0);
        sql.saveRoleSync({id:'fixture',userid:1,name:'合并测试',title:'',level:1,data:'{}'});
        assert.equal((await sql.getPlayerStats(200)).active7, 1, 'synchronous saves must refresh activity too');
        // 后台状态栏的「注册玩家」按全部服务器统计（含离线角色），分服数值看 *Sid 字段
        assert.equal((await sql.getPlayerStats(100)).totalPlayersSid, 0, 'per-server registration count stays isolated');
        assert.equal((await sql.getPlayerStats(100)).totalPlayers, 1, 'registration total spans every server');
        assert.equal((await sql.getPlayerStats(200)).totalPlayersSid, 1);
        assert.equal(await sql.countPlayers(200, '合并'), 1);
        assert.equal(await sql.countPlayers(200, "' OR 1=1 --"), 0);
        assert.equal((await sql.listPlayers(200, '', 50, 0))[0].id, 'fixture');
        assert(routes.allowed('admin', 'players_all', 'POST'));
        assert(!routes.allowed('admin', 'players_all', 'GET'));
        const filename = db.db_path;
        await db.init(filename);
        assert.equal(db.db.prepare('SELECT state FROM users WHERE id=1').get().state, 0);
        console.log('PASS merged admin stats, synchronous activity, route allowlist and secure fresh/reopened schema');
    } finally {
        if (db.db && db.db.open) db.db.close();
        db.stmtCaches.clear();
        if (oldPassword === undefined) delete process.env.INITIAL_ADMIN_PASSWORD;
        else process.env.INITIAL_ADMIN_PASSWORD = oldPassword;
        fs.rmSync(dir, {recursive:true,force:true});
    }
}
main().catch(e => {console.error(e); process.exitCode=1;});
