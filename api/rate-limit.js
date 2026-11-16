'use strict';
const buckets = new Map();
// 规范化路径：Express 路由不区分大小写、允许结尾 /、会对参数 URL 解码，
// 因此 /API/user/login/、/api/user/%6cogin 都会命中同一个接口，限流必须按同样规则归一。
function normalizePath(p) {
    const parts = String(p || '').split('/').filter(Boolean).map(seg => {
        try { return decodeURIComponent(seg); } catch (e) { return seg; }
    });
    return '/' + parts.join('/').toLowerCase();
}
module.exports = function rateLimit(req, res, next) {
    const route = normalizePath(req.path);
    if (!['/api/user/login','/api/user/regist','/api/user/validimage','/api/admin/login'].includes(route)) return next();
    const now = Date.now();
    const windowMs = route.endsWith('/regist') ? 600000 : 60000;
    const limit = route.endsWith('/regist') ? 10 : 30;
    const key = String(req.ip || req.socket?.remoteAddress || 'unknown') + ':' + route;
    let item = buckets.get(key);
    if (!item || now >= item.until) {
        for (const [k,v] of buckets) if (now >= v.until) buckets.delete(k);
        if (buckets.size >= 4096) buckets.delete(buckets.keys().next().value);
        item = { count: 0, until: now + windowMs }; buckets.set(key, item);
    }
    if (++item.count > limit) {
        res.setHeader('Retry-After', String(Math.ceil((item.until-now)/1000)));
        return res.status(429).json({ code: 0, result: '请求过于频繁，请稍后再试' });
    }
    next();
};
module.exports.normalizePath = normalizePath;
