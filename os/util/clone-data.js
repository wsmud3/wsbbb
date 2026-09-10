'use strict';
module.exports = function cloneData(value, seen = new WeakMap()) {
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    const proto = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) return value;
    const out = Array.isArray(value) ? [] : Object.create(proto);
    seen.set(value, out);
    for (const key of Object.keys(value)) Object.defineProperty(out, key, { value: cloneData(value[key], seen), writable: true, enumerable: true, configurable: true });
    return out;
};
