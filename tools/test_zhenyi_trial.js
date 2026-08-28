const assert = require("assert");
const fs = require("fs");
const path = require("path");

global.WORLD = { COMMANDS: {} };
global.UTIL = { diff_time() { return 0; } };
global.OBJ = {
    CREATE(itemPath, count) {
        return { path: itemPath, count: count || 1, notify_action() {} };
    }
};
require("../world/zhenyi.js");

const room = { exits: { west: "jz/wuyitai" }, exits_changed() { this.changed = true; } };
WORLD.ZHENYI.configure_trial_room(room);
assert.strictEqual(room.zhenyi_trial_room, true, "试炼副本必须标记为真意副本");
assert.deepStrictEqual(room.exits, {}, "真意试炼副本不能保留公共房间出口");
assert.strictEqual(room.changed, true, "清空出口后必须刷新出口缓存");

const hotPlayer = {
    id: "hot-player", is_player: true, family: { id: "HUASHAN" }, level: 5,
    temp: { zy_trial_active: "jz_1", zy_trial_owner: "zhenyi_trial:jz:hot-player", zy_trial_deadline: Date.now() + 60000 },
    query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
    set_temp(key, value) { this.temp[key] = value; },
    notify(msg) { this.message = msg; }
};
let hotNpc = null;
global.NPC = {
    CLONE() {
        hotNpc = {
            init_trial(owner, data, intent) { this.owner = owner; this.intent = intent; },
            do_kill(owner) { this.killed = owner; }
        };
        return hotNpc;
    }
};
const hotRoom = {
    items: [hotPlayer], exits: { west: "jz/wuyitai" },
    exits_changed() {}, item_changed(obj) { this.items.push(obj); obj.environment = this; }
};
assert.strictEqual(WORLD.ZHENYI.rehydrate_trial_room(hotRoom, "zhenyi_trial:jz:hot-player"), true, "热更新后应重新接管真意副本");
assert.strictEqual(hotRoom.zhenyi_trial_room, true);
assert.strictEqual(hotNpc.owner, hotPlayer, "热更新后应为原玩家重建化身");
assert.strictEqual(hotNpc.killed, hotPlayer, "重建化身应继续原试炼战斗");

const player = {
    items: [],
    add_obj(itemPath, count) {
        assert.strictEqual(typeof itemPath, "string", "悟痕奖励应由背包接口直接按参数化路径创建");
        const item = { path: itemPath, count: count || 1 };
        this.items.push(item);
        return item;
    }
};
const item = WORLD.ZHENYI.add_material(player, "jz", 1, 3);
assert.strictEqual(item.path, "st/zhenyi_hen#jz_1");
assert.strictEqual(item.count, 3);

function sweeper(failMaterial) {
    return {
        id: "sweeper", family: { id: "HUASHAN" }, level: 5, expended: 0,
        temp: { wd100: 1, zy_jz_1: 1, zy_level_jz_1: 1, zy_clear_jz_1: 1 }, bits: {}, items: [], messages: [],
        environment: { parent: { id: "jz" } },
        query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
        set_temp(key, value) { this.temp[key] = value; },
        add_temp(key, value) { this.temp[key] = (this.temp[key] || 0) + value; return this.temp[key]; },
        remove_temp(key) { delete this.temp[key]; },
        query_bool(key, bit) { return !!((this.bits[key] || 0) & (1 << bit)); },
        set_bool(key, bit, value) { this.bits[key] = value ? ((this.bits[key] || 0) | (1 << bit)) : ((this.bits[key] || 0) & ~(1 << bit)); },
        is_fighting() { return false; }, query_jingli() { return 200; },
        expend_jingli(value) { this.expended += value; return true; },
        random() { return 0; }, notify(msg) { this.messages.push(msg); },
        find_obj_bypath(itemPath) { return this.items.find(obj => obj.path === itemPath); },
        add_obj(obj, count) {
            const itemPath = typeof obj === "string" ? obj : obj.path;
            if (failMaterial && itemPath.indexOf("st/zhenyi_hen#") === 0) return null;
            const itemCount = typeof obj === "string" ? (count || 1) : (obj.count || 1);
            let current = this.find_obj_bypath(itemPath);
            if (current) current.count += itemCount;
            else { current = { path: itemPath, count: itemCount }; this.items.push(current); }
            return current;
        },
        remove_obj(obj, count) {
            if (!obj || obj.count < count) return null;
            obj.count -= count;
            if (!obj.count) this.items.splice(this.items.indexOf(obj), 1);
            return { path: obj.path, count };
        }
    };
}

const failedSweep = sweeper(true);
assert.strictEqual(WORLD.ZHENYI.sweep(failedSweep, 1, 1), false, "悟痕发放失败时扫荡必须整体失败");
assert.strictEqual(failedSweep.expended, 0, "奖励失败不得消耗精力");
assert.strictEqual(failedSweep.query_temp("zy_daily_jz_1", 0), 0, "奖励失败不得消耗今日完成次数");

const successfulSweep = sweeper(false);
assert.strictEqual(WORLD.ZHENYI.sweep(successfulSweep, 1, 1), true, "奖励完整加入背包后扫荡应成功");
assert.strictEqual(successfulSweep.expended, 20, "成功扫荡才消耗精力");
assert.strictEqual(successfulSweep.query_temp("zy_daily_jz_1", 0), 1, "成功扫荡才增加今日完成次数");
assert.ok(successfulSweep.find_obj_bypath("st/zhenyi_hen#jz_1"), "成功扫荡的悟痕必须在背包中");

// 化身死亡回调即使先清掉 active，也必须凭一次性成功标记完成解锁和奖励。
const completed = {
    id: "trial-player", family: { id: "HUASHAN" }, temp: { zy_trial_active: "jz_1", zy_trial_npc_dead: "jz_1" },
    items: [], messages: [],
    query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
    set_temp(key, value) { this.temp[key] = value; },
    add_temp(key, value) { this.temp[key] = (this.temp[key] || 0) + value; return this.temp[key]; },
    remove_temp(key) { delete this.temp[key]; },
    notify(msg) { this.messages.push(msg); },
    send_commands(...args) { this.commands = args; },
    call_out() {},
    random() { return 0; },
    find_obj_bypath(path) { return this.items.find(obj => obj.path === path); },
    add_obj(obj, count) {
        if (typeof obj === "string") obj = { path: obj, count: count || 1 };
        const old = this.find_obj_bypath(obj.path);
        if (old) old.count += obj.count || 1;
        else this.items.push(obj);
        return old || obj;
    }
};
assert.strictEqual(WORLD.ZHENYI.complete_trial(completed, "jz", 1), true, "化身死亡标记必须触发试炼结算");
assert.strictEqual(completed.temp.zy_jz_1, 1, "击杀化身后必须解锁真意");
assert.strictEqual(completed.temp.zy_trial_completed, "jz_1", "完成试炼后必须保留待确认离场标记");
assert.strictEqual(completed.temp.zy_daily_jz_1, 1, "亲自试炼只在成功完成时增加今日次数");
WORLD.ZHENYI.complete_trial(completed, "jz", 1);
assert.strictEqual(completed.temp.zy_daily_jz_1, 1, "重复死亡回调不得重复增加完成次数");
assert.strictEqual(completed.find_obj_bypath("st/zhenyi_hen#jz_1"), undefined, "手动试炼不应发放悟痕掉落");
assert.strictEqual(WORLD.ZHENYI.finish_trial_action(completed), true, "完成副本应打开主消息页确认");
assert.deepStrictEqual(completed.commands, ["zhenyi trial_confirm", "确认完成并离开", "zhenyi trial_cancel", "暂不离开"]);
assert.strictEqual(WORLD.ZHENYI.confirm_trial(completed), true, "确认完成副本应离开试炼");
assert.strictEqual(completed.temp.zy_trial_active, undefined, "确认离场后必须清理试炼状态");

const root = path.join(__dirname, "..");
const roomSource = fs.readFileSync(path.join(root, "os", "room", "room.js"), "utf8");
const movementSource = fs.readFileSync(path.join(root, "os", "char", "chara_move.js"), "utf8");
const commandSource = fs.readFileSync(path.join(root, "world", "cmd", "skill", "zhenyi.js"), "utf8");
const npcSource = fs.readFileSync(path.join(root, "world", "npc", "pub", "zhenyi_trial.js"), "utf8");
const zhenyiSource = fs.readFileSync(path.join(root, "world", "zhenyi.js"), "utf8");
assert.ok(roomSource.includes("zhenyi_trial_room") && roomSource.includes("zhenyi trial_complete") && !roomSource.includes("zhenyi trial_exit"));
assert.ok(movementSource.includes("cur_room.zhenyi_trial_room") && movementSource.includes('"zy_trial_active"') && movementSource.includes('"zy_trial_exiting"'), "试炼中只能由受控离场流程越过移动拦截");
assert.ok(commandSource.includes('action === "trial_complete"') && commandSource.includes('action === "trial_confirm"') && commandSource.includes('action === "trial_cancel"'));
assert.ok(npcSource.includes('this.trial_mode === "endure"') && npcSource.includes("this.on_before_fight") && npcSource.includes("this.on_kill"));
assert.ok(npcSource.includes("this.hp = 1") && npcSource.includes("return false"));
assert.ok(npcSource.includes("zy_trial_npc_dead") && npcSource.includes("complete_trial(owner"));
assert.ok(zhenyiSource.includes("zy_trial_completed") && zhenyiSource.includes("confirmTrial") && zhenyiSource.includes("你已解锁"));
assert.ok(zhenyiSource.includes("rehydrateTrialRoom") && roomSource.includes("rehydrate_trial_room(newRm, key)"), "热更新必须重建真意副本隔离与化身");
assert.ok(zhenyiSource.includes("zy_trial_deadline") && npcSource.includes('query_temp("zy_trial_deadline"'), "热更新续接不得重置试炼总时限");
assert.ok(zhenyiSource.includes("rollbackReward") && zhenyiSource.includes("本次未消耗精力和次数"), "奖励失败必须整体回滚且不消耗扫荡资源");
assert.ok(zhenyiSource.includes("snapshotEnergy") && zhenyiSource.includes("restoreEnergy"), "试炼建立失败必须恢复完整精力字段");
assert.ok(npcSource.indexOf('this.trial_mode === "endure"') < npcSource.indexOf("clearTimeout(this.trial_timeout_handler)"), "坚持类 NPC 被误击杀时不能清掉存活计时器");
console.log("真意试炼副本、动作栏、悟痕物品和坚持类 NPC 保护校验通过");
