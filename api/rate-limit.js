'use strict';
const buckets = new Map();
module.exports = function rateLimit(req, res, next) {
    const route = req.path;
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
