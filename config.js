module.exports = {
    DB: require('./data/sql'),
    init: async function () {
        if (!(this.WEB_PORT > 1000)) throw new Error('缺少环境配置WEB_PORT');
        if (!(this.def_server.port > 1000)) throw new Error('缺少环境配置WS_PORT');
        if (!this.MD5) throw new Error('缺少环境配置md5');
        if (!this.DESIV) throw new Error('缺少环境配置DESIV');
        if (typeof this.SESSION_SECRET !== 'string' || this.SESSION_SECRET.length < 16) throw new Error('SESSION_SECRET 至少需要16位随机字符');
        const scope = require('./os/test-scope');
        await this.DB.connect(scope ? scope.db : 'database.db');
    },
    WEB_PORT: parseInt(process.env.WEB_PORT),
    CONNECT_LEVEL: 0,
    MD5: process.env.MD5_PREFIX,
    SESSION_SECRET: process.env.SESSION_SECRET,
    HEARTBEAT: 5000,

    DESIV: process.env.DESIV ? Buffer.from(process.env.DESIV, 'utf8') : null,

    def_server: {
        ip: "127.0.0.1",
        port: parseInt(process.env.WS_PORT),
        id: 100,
        name: "本地测试",
        istest: true
    },
    def_servers: [
        { id: 100, name: "本地测试", port: parseInt(process.env.WS_PORT) || 31300, istest: true, ip: "127.0.0.1" },
        { id: 200, name: "正式服", port: parseInt(process.env.WS_PORT_FORMAL) || 31301, istest: false, ip: "127.0.0.1" }
    ],
    ADMIN_IPC_PORT: parseInt(process.env.ADMIN_IPC_PORT) || 31303,
    ADMIN_IPC_PORT_FORMAL: parseInt(process.env.ADMIN_IPC_PORT_FORMAL) || 31304
};
