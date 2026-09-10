// Only replace invalid bare values at root.temp.<known runtime key>.
// Strings, comments and nested/custom fields are copied byte-for-byte.
const known = new Set(['sws_active','sws_layer','sws_cleared','sws_picked','sws_picks','sws_buffs','sws_applied','sws_base']);
module.exports = function repairLegacySwsTemp(raw) {
    if (typeof raw !== 'string') return null;
    let i = 0, edits = [];
    function ws() {
        for (;;) {
            while (/\s/.test(raw[i] || '') && i < raw.length) i++;
            if (raw.slice(i,i+2) === '//') { i = raw.indexOf('\n',i+2); if (i < 0) i=raw.length; }
            else if (raw.slice(i,i+2) === '/*') { const end=raw.indexOf('*/',i+2); if(end<0)throw Error(); i=end+2; }
            else break;
        }
    }
    function string() {
        const start=i, quote=raw[i++];
        while(i<raw.length) {
            const c=raw[i++];
            if(c==='\\') { i++; continue; }
            if(c===quote) return raw.slice(start+1,i-1);
        }
        throw Error();
    }
    function value(path, depth) {
        if (depth > 100) throw Error();
        ws();
        if(path.length===2 && path[0]==='temp' && known.has(path[1]) && raw.slice(i,i+15)==='[object Object]') {
            edits.push([i,i+15]); i+=15; return;
        }
        if(raw[i]==='"'||raw[i]==="'") { string(); return; }
        if(raw[i]==='{') {
            i++; ws();
            while(raw[i]!=='}') {
                ws(); let key;
                if(raw[i]==='"'||raw[i]==="'") key=string();
                else { const m=/^[a-zA-Z_$][\w$]*/.exec(raw.slice(i)); if(!m)throw Error(); key=m[0];i+=key.length; }
                ws(); if(raw[i++]!==':')throw Error();
                value(path.concat(key),depth+1);ws();
                if(raw[i]==='}')break;
                if(raw[i++]!==',')throw Error();ws();
            }
            i++; return;
        }
        if(raw[i]==='[') {
            i++;ws();let n=0;
            while(raw[i]!==']') {
                value(path.concat(n++),depth+1);ws();
                if(raw[i]===']')break;
                if(raw[i++]!==',')throw Error();ws();
            }
            i++;return;
        }
        const m=/^[^\s,}\]]+/.exec(raw.slice(i));if(!m)throw Error();i+=m[0].length;
    }
    try {
        value([],0);ws();if(i!==raw.length)return null;
        for(let n=edits.length-1;n>=0;n--)raw=raw.slice(0,edits[n][0])+'{}'+raw.slice(edits[n][1]);
        return edits.length ? raw : null;
    } catch (_) { return null; }
};
