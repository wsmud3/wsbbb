// Shared HTTP/WS credentials. AES-GCM authenticates and seals the password
// verifier; clients keep treating p as opaque. Current DB state is authoritative.
const crypto = require('crypto');
function key() {
    const secret = __CONFIG.SESSION_SECRET || process.env.SESSION_SECRET;
    if (typeof secret !== 'string' || secret.length < 16) throw new Error('SESSION_SECRET 未配置或过短');
    return crypto.createHash('sha256').update(secret).digest();
}
function issue(user) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
    cipher.setAAD(Buffer.from('mud-session-v3'));
    const body = Buffer.concat([cipher.update(JSON.stringify({
        id: Number(user.id), pwd: user.pwd, issuedAt: Date.now()
    }), 'utf8'), cipher.final()]);
    return ['v3', iv.toString('base64url'), body.toString('base64url'), cipher.getAuthTag().toString('base64url')].join('.');
}
function verify(token) {
    try {
        if (typeof token !== 'string' || token.length > 4096) return null;
        const parts = token.split('.');
        if (parts.length !== 4 || parts[0] !== 'v3') return null;
        const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(parts[1], 'base64url'));
        decipher.setAAD(Buffer.from('mud-session-v3'));
        decipher.setAuthTag(Buffer.from(parts[3], 'base64url'));
        const user = JSON.parse(Buffer.concat([decipher.update(Buffer.from(parts[2], 'base64url')), decipher.final()]).toString('utf8'));
        const ttl = Number(process.env.SESSION_CERT_TTL_MS) || 180 * 24 * 3600000;
        if (!Number.isSafeInteger(user.id) || user.id <= 0 ||
            !Number.isSafeInteger(user.issuedAt) || user.issuedAt <= 0 ||
            user.issuedAt > Date.now() + 60000 || Date.now() - user.issuedAt > ttl) return null;
        const current = __CONFIG.DB.getUserBySync('id', user.id);
        if (!current || Number(current.state) === 0 || current.pwd !== user.pwd) return null;
        return { id: current.id, name: current.name, pwd: current.pwd,
            level: Number(current.level) || 0, time: user.issuedAt, loginTime: user.issuedAt };
    } catch (_) { return null; }
}
function adminProof(user) {
    return crypto.createHmac('sha256', key()).update(String(user.id) + ':' + user.pwd).digest('hex');
}
module.exports = { issue, verify, adminProof };
