
require("./util/util");

const db = require("./util/data");
WORLD = {
    USERS: [],
    COMMANDS: {},
    SKILLS: {},
    ROOMS: {},
    RUN_ROOMS: [],
    DEFAULT_SKILLS: {},
    AREAS: [],
    TASKS: [],
    SYSTEMTASKS: [],
    USER_EVENTS: [],
    OBJ_STROE: new Map(),
    NPC_STROE: new Map(),
    HEARTBEATCOUNT: 0,
    RECEIVED: [],
    LOGS: [],
    SERVERID: 0,
    SERVERS: [],
    CONNECT_COUNT: 0,
    DATA: require('./data'),
    USERLOGIN: require('./login'),
    DB: db,
    SocketCount: 0,
    LISTENER: require("./ws"),
    max_connect_count: 1100,
    max_user_count: 5100,
    MESSAGE: {
        stores: new Map(),
        NOTICES: [],
    },
    STATS: {
        TOPS: [],
        EXP: [],
        SCORE: [],
        WEAPON: [],
    },
    status: -1,//-1关闭 0正常 >1 用户等级>连接
    SocketIn: function () {
        this.SocketCount++;
    },
    connect: function (socket) {
        if (WORLD.status < 0)
            return socket.end();
        if (!WORLD.check_connect(socket))
            return socket.end();

        socket.user = new USER();

        socket.user.socket = socket;
        socket.user.wait_input = this.USERLOGIN.check_session.bind(this.USERLOGIN);

        socket.setTimeout(60000);
    },
    check_connect: function (socket) {
        return true;
    },
    before_login: function (user) {
        if (this.status < 0) return false;
        if (this.status === 0) return true;
        return this.status <= user.user_level;
    },
    disconnect: function (socket) {
        if (socket.user) {
            socket.user.socket = null;
            socket.user.disconnect();
        }
        this.SocketCount--;
        if (socket.oserver) {
            socket.oserver.disconnect();
            socket.oserver = null;
        }
    }, request: function (request, socket) {
        if (!request || WORLD.status < 0) return;
        var user = socket.user;
        if (!user) {
            return;
        }
        if (user.request_count > 20) {
            return user.send("不要急，慢慢来。");
        }
        user.request_count = user.request_count + 1;
        var time = Date.now();
        var auditCommand = user.userid ? request : '[authentication]';
        try {
            user.command(request);
        } catch (e) {
            console.log(user.name, "命令错误：", auditCommand, e.message);
            WORLD.log(user, auditCommand, user.userid ? e.message : "认证失败");
        }
        WORLD.RECEIVED.push({
            time: time,
            cmd: auditCommand + " " + (Date.now() - time).toString(),
            user: user.id
        });
        if (WORLD.RECEIVED.length > 1000) {
            WORLD.saveRequest();
        }
    }, saveRequest: function () {
        if (!WORLD.RECEIVED.length) return Promise.resolve(true);
        const batch = WORLD.RECEIVED.splice(0, WORLD.RECEIVED.length);
        return db.saveRequest(batch).then(() => true).catch(error => {
            WORLD.RECEIVED.unshift(...batch);
            console.error('请求日志保存失败:', error);
            return false;
        });
    },
    // 聊天记录持久化（供运维机器人按时间段查询）。
    // 放在 WORLD 对象内部、startup 之前：此时 WORLD 已定义。
    // （曾放在文件开头导致 'chatlog 加载失败 WORLD is not defined'，钩子因保护判断而不记录）
    startup: async function (sid) {
        if (sid) {
            sid = parseInt(sid);
            this.SERVERS = await db.getServers();
            this.SERVER = this.getServer(sid);
        } else {
            this.SERVER = __CONFIG.def_server;
        }

        if (!this.SERVER) throw "服务器设置错误，无法启动";
        this.SERVERID = this.SERVER.id;

        await db.initDataDir();
        // 真意是命令、地图、NPC和战斗共同依赖的数据层，须在资源扫描前初始化。
        BASE.CREATE(__PATH.WORLD, "zhenyi");
        loadResource();
        await this.DATA.load();
        await this.LISTENER.start(this.SERVER.port);
        console.log("服务", this.SERVER.name, "(" + this.SERVERID + ")启动");
        console.log("ws://" + this.SERVER.ip + ":" + this.SERVER.port);
        this.heart_beat_service = setInterval(WORLD.heart_beat, __CONFIG.HEARTBEAT);

        this.status = __CONFIG.CONNECT_LEVEL ?? 0;
        this.on_startup();
        if (this.status > 0)
            console.log('当前允许级别' + this.status + "账号登陆");
    },


    sendAll: function (msg) {
        for (var i = 0; i < WORLD.USERS.length; i++) {
            WORLD.USERS[i].send(msg);
        }
    },
    getUser: function (id) {
        if (!id) return;
        for (var i = 0; i < WORLD.USERS.length; i++) {
            if (WORLD.USERS[i].id == id) return WORLD.USERS[i];
        }

    }, getServer: function (id) {
        if (!id) return;
        for (var i = 0; i < WORLD.SERVERS.length; i++) {
            if (WORLD.SERVERS[i].id == id) return WORLD.SERVERS[i];
        }
    }, find_user: function (name) {
        if (!name) return;
        for (var i = 0; i < WORLD.USERS.length; i++) {
            if (WORLD.USERS[i].name == name) return WORLD.USERS[i];
        }
    },
    on_user_login: function (user) {

    },
    on_user_cross_login: function (user) {

    },
    on_startup: function () {

    },
    on_user_quit: function (user) {

    },
    on_user_relogin: function (user) {

    }
    ,
    on_heart_beat: function (user) {

    },
    heart_beat: function () {
        const dt = Date.now();
        const users = WORLD.USERS.slice();
        WORLD.CONNECT_COUNT = 0;
        for (const obj of users) {
            if (!obj || WORLD.USERS.indexOf(obj) < 0) continue;
            try {
                if (obj.socket) WORLD.CONNECT_COUNT++;
                obj.heart_beat(dt);
            } catch (e) {
                const label = obj.path ?? obj.name ?? obj.id ?? "";
                console.error(label, "心跳错误:", e, e.stack);
                WORLD.log(null, e.message, e.stack);
            }
        }
        try { WORLD.on_heart_beat(dt); }
        catch (e) { console.error("全局心跳错误:", e, e.stack); WORLD.log(null, e.message, e.stack); }
        const rooms = WORLD.RUN_ROOMS.slice();
        for (const room of rooms) {
            if (!room || WORLD.RUN_ROOMS.indexOf(room) < 0) continue;
            try { room.heart_beat(dt); }
            catch (e) { console.error(room.path ?? room.name ?? "", "房间心跳错误:", e, e.stack); WORLD.log(null, e.message, e.stack); }
        }
        WORLD.HEARTBEATCOUNT++;
        if (WORLD.HEARTBEATCOUNT > 720) {
            WORLD.HEARTBEATCOUNT = 0;
            Promise.resolve(WORLD.save()).then(ok => {
                if (!ok) console.error("定期存档失败");
            }).catch(e => console.error("定期存档失败:", e));
        }

    },
    login_out: function (user) {
        this.on_user_quit(user);
        if (user.serverid === WORLD.SERVERID) {
            // quit() is called from synchronous command/heartbeat paths, so
            // attach an error observer even though the caller cannot await it.
            // This prevents an unhandled rejection and makes failed logout
            // saves visible in the server log.
            try {
                var savePromise = user.save();
                if (savePromise && typeof savePromise.catch === 'function') {
                    savePromise.catch(function (error) {
                        console.error('下线保存角色失败：', user && user.id, error);
                    });
                }
            } catch (error) {
                console.error('下线保存角色失败：', user && user.id, error);
            }
        }
        WORLD.USERS.remove(user);

        if (user.socket) {
            try {
                user.socket.end();
                user.socket.destroy();
            } catch (e) {
                console.log(e.message, e.stack);
            }
        }
    }, send: function (text) {
        for (var i = 0; i < this.USERS.length; i++) {
            this.USERS[i].send(text);
        }
    }, log: function (user, cmd, msg) {
        WORLD.LOGS.push({
            time: Date.now(),
            cmd: cmd,
            user: user ? user.name : "",
            msg: msg
        });
        if (WORLD.LOGS.length > 500) {
            this.saveLog();
        }
    }, saveLog: function () {
        if (!WORLD.LOGS.length) return Promise.resolve(true);
        const batch = WORLD.LOGS.splice(0, WORLD.LOGS.length);
        return db.saveLogs(batch).then(() => true).catch(error => {
            WORLD.LOGS.unshift(...batch);
            console.error('系统日志保存失败:', error);
            return false;
        });
    }
    ,
    is_server: function (user) {
        return user.serverid == WORLD.SERVERID;
    },
    save: function () {
        if (this._savePromise) { this._saveAgain = true; return this._savePromise; }
        this._savePromise = (async () => {
            let ok = true;
            do {
                this._saveAgain = false;
                if (!await this._saveOnce()) ok = false;
            } while (this._saveAgain);
            return ok;
        })().finally(() => { this._savePromise = null; });
        return this._savePromise;
    },
    _saveOnce: async function () {

        var roles = [];
        var roleErrors = [];
        for (var i = 0; i < WORLD.USERS.length; i++) {
            if (WORLD.USERS[i].serverid != WORLD.SERVERID) continue;
            try {
                roles.push(WORLD.USERS[i].getData());
            } catch (error) {
                roleErrors.push({ id: WORLD.USERS[i].id, error: error });
                console.error('玩家数据序列化失败', WORLD.USERS[i].id, error);
            }
        }
        console.time('saved');
        var ok = true;
        try { await db.saveRoles(roles); console.log('玩家数据已保存'); }
        catch (error) { ok = false; console.error('玩家数据保存失败', error.message); }
        if (roleErrors.length) {
            ok = false;
            console.error('部分玩家数据序列化失败', roleErrors);
        }
        try { await this.DATA.save(); console.log('全局数据已经保存'); }
        catch (error) { ok = false; console.error('全局数据保存失败', error.message); }
        if (!await this.saveLog()) ok = false;
        if (!await this.saveRequest()) ok = false;
        console.log('日志数据已经保存');
        console.timeEnd('saved');
        return ok;
    },
    writeHeapSnapshot: function () {
        let v8 = UTIL.require('v8');
        let dt = new Date();
        let fname = __PATH.DATA + "/" + dt.getFullYear() + "_" + dt.getMonth() + "_"
            + dt.getDate() + "_" + dt.getHours() + "_" + dt.getMinutes() + ".heapsnapshot";
        v8.writeHeapSnapshot(fname);
        console.log('快照保存到', fname);
    }
    ,
    loadLocalData: function () {
        let data = db.getLocalRoles();
        if (!data || !data.length) return;
        console.log("加载上次未保存的本地用户%d", data.length);
        for (let i = 0; i < data.length; i++) {
            let user = new USER();
            user.loadData(data[i]);
            this.USERS.push(user);
        }
        db.deleteLocalRoles();
    },
    on_cross_response: function (id, sid) {
        //允许跨服
    },
    can_cross: function (id) {
        //允许跨服
    }, on_user_die: function (me, killer, corpse) {

    }, on_resource_loaded: function () {

    }
};

// 聊天记录持久化模块挂到 WORLD 上（在 WORLD 定义之后加载，避免 WORLD 未定义）
try { WORLD.chatlog = require('./chatlog'); } catch (e) { console.error('chatlog 加载失败', e.message); }
function loadResource() {
    let fs = require("fs");
    // 本次加载的失败记录。以前这里是"一个 try 包住全部 8 个目录"：任何一个目录
    // 缺失（ENOENT）都会让**后面的目录完全不再加载**，只留一行 console.log，
    // 然后 status=0 照常开门 —— 表现为大量命令/物件/技能不存在，玩家只看到
    // "点了没反应"或「什么？」。实测：world/family 缺失时只加载 157/1914 个文件，
    // 占 91% 的 OBJ/AREA/SKILL/MAP/TASK 全部静默缺失。
    var loadFailures = [];
    var skipped = [];
    function readdir(basePath, path) {
        path = path || basePath;
        let files = fs.readdirSync(path);
        let count = 0;
        for (let i = 0; i < files.length; i++) {
            let sub_path = path + files[i];
            let stat = fs.statSync(sub_path);
            if (stat.isDirectory()) {
                count += readdir(basePath, sub_path + "/");
            } else if (sub_path.endsWith(".js")) {
                let fname = sub_path.replace(basePath, "").replace(".js", "");
                BASE.CREATE(basePath, fname);
                count++;
            } else {
                // 目录里的非脚本文件（例如 world/npc_server_config.json）：
                // 以前也会 count++ 并送进 BASE.CREATE，导致日志里的数字虚高。
                skipped.push(sub_path);
            }
        }
        return count;
    }
    // 逐目录加载：某个目录缺失/读取失败只记录，**继续**后面的目录
    function loadDir(dir) {
        try {
            let count = readdir(dir);
            console.log("%s %d ", dir, count);
            return count;
        } catch (e) {
            loadFailures.push(dir + ": " + ((e && e.message) ? e.message : e));
            console.log("%s 加载失败: %s", dir, (e && e.message) || e);
            return 0;
        }
    }
    let sum = 0;
    sum += loadDir(__PATH.EXTENDS);
    sum += loadDir(__PATH.COMMAND);
    sum += loadDir(__PATH.FAMILY);
    sum += loadDir(__PATH.OBJ);
    sum += loadDir(__PATH.AREA);
    sum += loadDir(__PATH.SKILL);
    sum += loadDir(__PATH.MAP);
    sum += loadDir(__PATH.TASK);
    console.log('资源脚本加载%d', sum);
    if (skipped.length) console.log("跳过非脚本文件 %d 个", skipped.length);
    if (loadFailures.length) {
        // 明确的一行汇总：以前这类问题只会散落在日志里，很难被发现
        console.log("【资源加载异常】%d 个目录未能加载，相关功能会静默缺失:", loadFailures.length);
        for (var i = 0; i < loadFailures.length; i++) console.log("  - " + loadFailures[i]);
    }
    try {
        WORLD.on_resource_loaded();
    } catch (e) {
        console.log("on_resource_loaded error: ", e, e.stack);
    }
}
