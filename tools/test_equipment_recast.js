const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const equipmentSource = fs.readFileSync(path.join(__dirname, "..", "os/item/equipment.js"), "utf8");
const recastSource = fs.readFileSync(path.join(__dirname, "..", "world/cmd/obj/recast.js"), "utf8");

const context = {
    console,
    require: () => ({}),
    EQUIP_TYPE: { WEAPON: 0, CLOTH: 1, SHOES: 2, PANTS: 3, RING: 5, NECKLACE: 6, JEWELS: 7, WRIST: 8 },
    PROPERTIES: {},
    WORLD: { COMMANDS: {} },
    UTIL: {},
};
vm.createContext(context);
vm.runInContext(`
Function.prototype.inherits = function (parent) {
    this.prototype = Object.create(parent.prototype);
    this.prototype.constructor = this;
};
var OBJ = function () {};
OBJ.CREATE = function () { return null; };
`, context);
vm.runInContext(equipmentSource, context, { filename: "os/item/equipment.js" });

function loadCustom(level, fields) {
    const item = new context.EQUIPMENT();
    item.path = "eq/cp#sword";
    item.load_db([item.path, "test", level, "custom"].concat(fields || []));
    return item;
}

assert.strictEqual(loadCustom(12, ["rc", 12]).recast_count, 0,
    "只有+12精炼的旧装备不能被迁移成12次重铸");
assert.strictEqual(loadCustom(12, ["rc", 42]).recast_count, 30,
    "旧混合计数应扣除12次普通精炼，保留实际30次重铸");
assert.strictEqual(loadCustom(6, ["rc", 50]).recast_count, 44,
    "旧混合计数应按当前精炼等级换算重铸次数");
assert.strictEqual(loadCustom(12, ["rc", 42, "rrc", 7]).recast_count, 7,
    "新存档的独立重铸次数必须优先于旧混合字段");

const untouched = new context.EQUIPMENT();
untouched.path = "eq/lv5/example";
untouched.load_db([untouched.path, "normal", 12, "rc", 12]);
assert.strictEqual(untouched.recast_count, undefined,
    "普通装备不得执行自制装备的旧重铸迁移");

const zero = loadCustom(12, ["rc", 12]);
const saved = [];
zero.save_db(saved);
assert.ok(saved.join("").includes(',"rrc",0'),
    "自制装备必须保存独立重铸零值，防止重复迁移");

assert.ok(!recastSource.includes("obj.refine_count"),
    "重铸逻辑不得再读取或修改普通精炼计数");
assert.ok(recastSource.includes("obj.recast_count = rc + maxTimes"),
    "消耗元晶后只能增加独立重铸计数");

console.log("自制装备精炼/重铸独立计数与旧存档迁移校验通过");
