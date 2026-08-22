const assert = require("assert");
const fs = require("fs");
const path = require("path");

global.WORLD = { COMMANDS: {} };
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

const player = {
    items: [],
    add_obj(item) {
        assert.strictEqual(typeof item, "object", "悟痕奖励应先创建为物品对象");
        this.items.push(item);
        return item;
    }
};
const item = WORLD.ZHENYI.add_material(player, "jz", 1, 3);
assert.strictEqual(item.path, "st/zhenyi_hen#jz_1");
assert.strictEqual(item.count, 3);

// 化身死亡回调即使先清掉 active，也必须凭一次性成功标记完成解锁和奖励。
const completed = {
    id: "trial-player", family: { id: "HUASHAN" }, temp: { zy_trial_active: "jz_1", zy_trial_npc_dead: "jz_1" },
    items: [], messages: [],
    query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
    set_temp(key, value) { this.temp[key] = value; },
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
assert.ok(movementSource.includes("cur_room.zhenyi_trial_room") && movementSource.includes('"zy_trial_active"'), "试炼中不能用 goto 或直传绕过动作栏离场");
assert.ok(commandSource.includes('action === "trial_complete"') && commandSource.includes('action === "trial_confirm"') && commandSource.includes('action === "trial_cancel"'));
assert.ok(npcSource.includes('this.trial_mode === "endure"') && npcSource.includes("this.on_before_fight") && npcSource.includes("this.on_kill"));
assert.ok(npcSource.includes("this.hp = 1") && npcSource.includes("return false"));
assert.ok(npcSource.includes("zy_trial_npc_dead") && npcSource.includes("complete_trial(owner"));
assert.ok(zhenyiSource.includes("zy_trial_completed") && zhenyiSource.includes("confirmTrial") && zhenyiSource.includes("你已解锁"));
assert.ok(npcSource.indexOf('this.trial_mode === "endure"') < npcSource.indexOf("clearTimeout(this.trial_timeout_handler)"), "坚持类 NPC 被误击杀时不能清掉存活计时器");
console.log("真意试炼副本、动作栏、悟痕物品和坚持类 NPC 保护校验通过");

