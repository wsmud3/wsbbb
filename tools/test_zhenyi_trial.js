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

const root = path.join(__dirname, "..");
const roomSource = fs.readFileSync(path.join(root, "os", "room", "room.js"), "utf8");
const commandSource = fs.readFileSync(path.join(root, "world", "cmd", "skill", "zhenyi.js"), "utf8");
const npcSource = fs.readFileSync(path.join(root, "world", "npc", "pub", "zhenyi_trial.js"), "utf8");
assert.ok(roomSource.includes("zhenyi_trial_room") && roomSource.includes("zhenyi trial_complete") && roomSource.includes("zhenyi trial_exit"));
assert.ok(commandSource.includes('action === "trial_complete"') && commandSource.includes('action === "trial_exit"'));
assert.ok(npcSource.includes('this.trial_mode === "endure"') && npcSource.includes("this.on_before_fight") && npcSource.includes("this.on_kill"));
assert.ok(npcSource.includes("this.hp = 1") && npcSource.includes("return false"));
assert.ok(npcSource.indexOf('this.trial_mode === "endure"') < npcSource.indexOf("clearTimeout(this.trial_timeout_handler)"), "坚持类 NPC 被误击杀时不能清掉存活计时器");
console.log("真意试炼副本、动作栏、悟痕物品和坚持类 NPC 保护校验通过");

