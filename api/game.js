


const APIBASE = require('./base');
let SERVERS = null;
const { DB } = __CONFIG;
class GameAPI extends APIBASE {

    async servers(user) {
        if (!SERVERS) {
            SERVERS = await DB.getServers();
        }
        return SERVERS;
    }
    // Internal cache invalidation is intentionally not exposed as a public
    // API method.  Use the authenticated /reload route when an administrator
    // actually needs to refresh server metadata.
    async _reload() {
        SERVERS = null;
    }
    async search_role(paras) {
        const user = this.getUser();
        if (!user) return { code: 0, result: '未登录' };
        const { type, value } = paras;
        if (!type || !value) return { code: 0, result: "错误参数" };
        if (!ALLOW_TYPES[type]) return { code: 0, result: "错误参数" };
        if (typeof value !== 'string' || value.length > 64) return { code: 0, result: "错误参数" };
        let result = await DB.query_role(type, value, user.id);
        return { code: 1, result: result };
    }
}

const ALLOW_TYPES = {
    uname: true,
    name: true
};
module.exports = GameAPI;








