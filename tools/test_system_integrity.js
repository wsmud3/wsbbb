const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const zc = read("world/cmd/skill/zc.js");
const book = read("world/obj/zc/blank_book.js");
const combat = read("world/extends/char/combat.js");
const skill = read("os/skill/skill.js");
const recast = read("world/cmd/obj/recast.js");
const duanzao = read("world/cmd/obj/duanzao.js");
const wordStone = read("world/obj/st/p.js");
const checkobj = read("world/cmd/obj/checkobj.js");
const client = read("src/client.js");
const zcUi = read("src/dialog/zc.js");
const css = read("src/styles/main.css");
const frontendIndex = path.join(root, "www", "index.html");
assert.ok(fs.existsSync(frontendIndex), "生产前端必须包含 www/index.html，避免服务器拉取后白屏");
const frontendHtml = fs.readFileSync(frontendIndex, "utf8");
const frontendAssets = [];
for (const match of frontendHtml.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)) {
    const asset = path.join(root, "www", match[1].replace(/^\.\//, ""));
    frontendAssets.push(asset);
    assert.ok(fs.existsSync(asset), "生产入口引用的资源必须存在：" + match[1]);
}
assert.ok(frontendAssets.length >= 2, "生产入口必须同时引用 JS 和 CSS bundle");

assert.ok(zc.includes("validate_pfm_selections") && zc.includes("skill.is_custom") && zc.includes("等级不足3000"),
    "PFM 的手工命令入口必须执行来源、等级和自创技能校验");
assert.ok(zc.includes('position_key === "内功" && wordIndices[0] !== 506'),
    "内功对话框确认入口必须强制内力上限首词条");
assert.ok(zc.includes("clone_pfm_value(src_pfm, [], [])"), "复制 PFM 时必须隔离嵌套可变配置");
assert.ok(zc.includes("registeredOwned") && zc.includes("collidedId"), "自创技能 ID 冲突必须换号并迁移玩家技能数据");
assert.ok(book.includes("Multiple unclaimed skills") && book.includes("refusing unsafe fallback"),
    "多门未认领自创技能不得猜测恢复目标");
assert.ok(book.includes("this.get_quality_grade") && book.includes("Math.min(max, 6)"),
    "品质必须按单部位最大词条数计算且上限为6");
assert.ok(combat.includes("projectedHpPct <= 0.10") && combat.includes("return 0;"),
    "不灭必须按受击后阈值触发并挡住触发伤害");
assert.ok(combat.includes("livingEnemies.length === 1") && combat.includes("splashTarget = target"),
    "单目标溅射必须再次命中当前目标");
assert.ok(combat.includes('query_zc_attack_passive(this, attackskill, splashBase, "zc_splash")'),
    "溅射必须只读取本次攻击对应的自创部位");
assert.ok(!skill.includes("并吸收") && skill.includes("空手攻击时附加伤害加倍"),
    "战神描述不得宣称不存在的吸收效果");

assert.ok(recast.includes("if (rc >= 50) return [4, 4, 4, 3, 2]"), "洗练50次必须达到最高分类上限");
assert.ok(recast.includes("obj.recast_count") && !recast.includes("obj.refine_count"),
    "重铸系统必须使用独立计数，不能把普通精炼当作重铸");
assert.ok(recast.includes("^[\\u4E00-\\u9FFF]{2,5}$") && recast.includes("UTIL.check_word"),
    "装备改名必须限制2-5个汉字并过滤禁词");
assert.ok(recast.indexOf("consumedUpgradeStone = player.remove_obj") < recast.indexOf("existing.level = new_level"),
    "词条升级必须先扣石头再修改等级");
assert.ok(recast.indexOf("consumedStone = player.remove_obj") < recast.indexOf("obj.words[old_idx] ="),
    "词条替换必须先扣新石头再修改装备");
assert.ok(checkobj.includes('obj.path === "eq/cp"') && !checkobj.includes("obj.words && obj.words.length > 0"),
    "普通装备不能仅因带词条就获得自制装备重铸入口");
assert.ok(duanzao.includes("ignore_fy: 'diff_fy_per'") && duanzao.includes("final_damage: 'add_sh_per'") &&
    duanzao.includes("bj_sh: 'add_bjsh_per'") && duanzao.includes("limit_hp: 'max_hp'") &&
    duanzao.includes("limit_mp: 'max_mp'"),
    "五类旧词条必须全部映射到等效的现行词条");
assert.ok(wordStone.includes("duanzao.KEY_MIGRATION[prop_key]") && wordStone.includes('this.path = path + "#" + prop_key'),
    "旧词条石必须在加载时归一为现行词条石");

assert.ok(client.includes("JSON5.parse(text)") && !client.includes("new Function"),
    "WebSocket 数据包必须无代码执行地解析");
assert.ok(zcUi.includes("Array.isArray(data.available_words)") && zcUi.includes("index === 506"),
    "自创面板必须容错缺失数组并阻止移除内功基础词条");
assert.ok(css.includes("env(safe-area-inset-bottom)"), "移动端底栏必须避让安全区");

console.log("前端、真意、自创技能和自制装备关键回归校验通过");

