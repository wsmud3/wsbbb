// 回归测试：自动出招中施展会调用 reauto_attack 的绝招（如独孤九剑「无招」）时，
// 不得重入 auto_attack（旧行为会递归爆栈，且多开一条攻击循环使攻速翻倍）。
// 运行：node tools/test_auto_combat_reentry.js
const assert = require("assert");

function CHARACTER() {}
global.CHARACTER = CHARACTER;
global.WORLD = {};
require("../world/extends/char/auto_combat.js");

const timers = [];
const target = { hp: 1e9, fight_type: 1, end_attack() {} };
const me = new CHARACTER();
Object.assign(me, {
    hp: 100, fight_type: 1, gjsd: 500, auto_pfm: true, release_time: 0, is_busy: 0, is_faint: 0,
    attacks: 0, depth: 0, maxDepth: 0, casts: 0,
    query_enemy() { return target; },
    call_out(fn, ms) { const t = { fn, ms }; timers.push(t); return t; },
    end_attack() { return true; },
    do_attack() { this.attacks++; return 1; },
    check_pfms() {
        // 每次进入都施展一次「无招」：改攻速并调用 reauto_attack
        if (this.casts >= 50) return false;
        this.casts++;
        this.depth++; this.maxDepth = Math.max(this.maxDepth, this.depth);
        this.gjsd = 250;
        this.reauto_attack();
        this.depth--;
        return false;
    }
});

me.auto_attack();
assert.strictEqual(me.maxDepth, 1, "auto_attack 内施展的绝招不应触发 auto_attack 重入");
assert.strictEqual(me.attacks, 1, "一轮自动攻击只应普攻一次");
assert.strictEqual(timers.length, 1, "一轮自动攻击只应排定一个下一击定时器");
assert.strictEqual(timers[0].ms, 250, "下一击应按绝招改过的新攻速排定");
assert.strictEqual(me._in_auto_attack, false);

// auto_attack 之外（手动出招）调用 reauto_attack 仍应立即重排攻击
timers.length = 0; me.casts = 50;
me.attack_handler = { stale: true };
me.reauto_attack();
assert.strictEqual(me.attacks, 2, "手动出招后 reauto_attack 应立即进行一次自动攻击");
assert.strictEqual(timers.length, 1);

console.log("auto_combat 重入测试通过");
