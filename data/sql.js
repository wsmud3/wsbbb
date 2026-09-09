const db = require('./db');

// 把毫秒时间戳格式化成与 SQLite CURRENT_TIMESTAMP 一致的 UTC 字符串，
// 便于和 players.create_time / update_time 做字符串比较。
function sqlTime(ms) {
    const d = new Date(ms);
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) +
        ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
}

module.exports = {

    connect: async function (path) {
        await db.init(path);
    },
    close: function () {
        return db.close();
    },
    getUserBy: function (type, value) {
        return this.getUser(type + "=?", [value]);
    },
    getUserByID: function (id) {
        return this.getUser("id=?", [id]);
    },
    getUser: function (cond, paras) {
        let sql = "select id,name,pwd,phone,state,level from users";

        if (cond) {
            sql += " where " + cond;
        }
        return db.get(sql, paras);
    },
    getUsers: function (cond, paras) {
        let sql = "select id,name,pwd,phone,state,create_time from users";

        if (cond) {
            sql += " where " + cond;
        }
        return db.all(sql, paras);
    },
    checkUserName: function (name) {
        let sql = "select name,phone from users where name=?";// or phone=?
        return db.get(sql, [name]);
    },
    updateUser: async function (user) {
        let sql = "update users set name=?,phone=?,pwd=? where id=?";
        let result = await db.query(sql, [user.name, user.phone, user.pwd, user.id]);
        return result.changes === 1;
    },
    createUser: async function (user) {

        let result = await db.query("insert into users(name,pwd,phone) values(?,?,?)",
            [user.name, user.pwd, user.phone]);
        if (!(result.lastID > 0)) return false;
        user.id = result.lastID;
        return true;
    },



    getServers: function () {
        let sql = "select id,name, ip,port,istest,isdef,create_time,start_time from servers";

        return db.all(sql);
    },
    getServer: function (id) {
        let sql = "select id,name, ip,port,istest,isdef from servers where id=?";

        return db.get(sql, [id]);
    },
    saveServer: async function (data) {
        let sql = "update servers set name=?, ip=?,port=?,istest=?,isdef=? where id=?";

        let result = await db.query(sql, [data.name, data.ip, data.port, data.istest, data.isdef, data.id]);

        return result.changes === 1;
    },
    addServer: async function (data) {
        let sql = "insert into servers(name,ip,port,istest,isdef) values(?,?,?,?,?)";
        let result = await db.query(sql,
            [data.name, data.ip, data.port, data.istest, data.isdef]);

        return result.lastID;

    },
    deleteServer: function (id) {
        return db.query("delete from servers where id =?", [id]);
    },

    getRoles: function (uid, server) {
        return db.all("select a.id,a.name,a.title,a.level from players a where a.userid=? and a.sid=?",
            [uid, server]);

    },
    addRole: function (role) {

        return db.query("insert into players(userid,id,name,title,level,sid,data) values(?,?,?,?,?,?,?)",
            [role.userid, role.id, role.name, role.title, role.level, role.server, role.data]);

    },
    deleteRole: async function (userid, roleid) {

        let sql = "insert into players_bak(id,name,userid,title,level,sid,data,create_time,update_time) select id,name,userid,title,level,sid,data,create_time,update_time from players where id=? and userid=?";
        let result = await db.query(sql, [roleid, userid]);
        if (result.changes != 1)
            return false;
        sql = "delete from players where id=? and userid=?";
        result = await db.query(sql, [roleid, userid]);
        if (result.changes != 1)
            return false;
        return true;

    },
    saveRole: function (role) {
        // update_time 同时作为"最后活跃时间"（登录/存档都会刷新），后台活跃统计依赖它。
        return db.query("update players set name=?,title=?,level=?,data=?,update_time=CURRENT_TIMESTAMP where userid=? and id=?",
            [role.name, role.title, role.level, role.data, role.userid, role.id]);
    },
    // 登录时刷新最后活跃时间（即使角色随后崩溃、未触发存档，也能记录活跃）
    touchRole: function (id) {
        return db.query("update players set update_time=CURRENT_TIMESTAMP where id=?", [id]);
    },
    // 后台统计：注册角色数 / 7日、30日活跃 / 今日新增 / 注册账号数
    getPlayerStats: function (sid) {
        const now = Date.now();
        const d7 = sqlTime(now - 7 * 86400000);
        const d30 = sqlTime(now - 30 * 86400000);
        const t0 = new Date();
        t0.setHours(0, 0, 0, 0);
        const dayStart = sqlTime(t0.getTime());
        return db.get(
            "select " +
            "(select count(*) from players where sid=?) as totalPlayers, " +
            "(select count(*) from players where sid=? and coalesce(update_time,create_time)>=?) as active7, " +
            "(select count(*) from players where sid=? and coalesce(update_time,create_time)>=?) as active30, " +
            "(select count(*) from players where sid=? and create_time>=?) as todayNew, " +
            "(select count(*) from users) as totalUsers",
            [sid, sid, d7, sid, d30, sid, dayStart]);
    },
    // 后台"全部玩家"列表（含离线），keyword 支持角色名/角色ID/账号ID
    listPlayers: function (sid, keyword, limit, offset) {
        let sql = "select id,name,userid,sid,level,title,create_time,update_time from players where sid=?";
        const params = [sid];
        if (keyword) {
            sql += " and (name like ? or id like ? or cast(userid as text)=?)";
            params.push('%' + keyword + '%', '%' + keyword + '%', keyword);
        }
        sql += " order by coalesce(update_time,create_time) desc limit ? offset ?";
        params.push(limit, offset);
        return db.all(sql, params);
    },
    countPlayers: function (sid, keyword) {
        let sql = "select count(*) as total from players where sid=?";
        const params = [sid];
        if (keyword) {
            sql += " and (name like ? or id like ? or cast(userid as text)=?)";
            params.push('%' + keyword + '%', '%' + keyword + '%', keyword);
        }
        return db.get(sql, params).then(function (row) { return (row && row.total) || 0; });
    },
    exitsRoleName: function (name) {
        let sql = "select name from players where name=?";// or phone=?
        return db.get(sql, [name]);
    },

    getData: function (userid, id) {
        return db.get("select a.id,a.name,a.title,a.level,a.data,b.pwd,b.level user_level from players a left join users b on a.userid=b.id  where  a.userid=? and a.id=?",
            [userid, id]);
    },
    updateUserLevel: function (uid, level) {
        return db.query("update users set level=? where id=?", [level, uid]);
    },
    getAdminUsers: function (keyword) {
        if (keyword) {
            return db.all("select id,name,level from users where name like ? or id=? order by level desc limit 50",
                ['%' + keyword + '%', keyword]);
        }
        return db.all("select id,name,level from users where level>=5 order by level desc, id asc limit 50");
    },
    updateRoleName: async function (id, name) {
        return db.query("update players set name=? where id=?",
            [name, id]);
    },
    updateUserid: async function (id, fromuserid, touserid) {
        return db.query("update players set userid=? where id=? and userid=?",
            [touserid, id, fromuserid]);
    }

};

