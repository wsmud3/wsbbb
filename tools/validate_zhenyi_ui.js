const assert = require("assert");
const fs = require("fs");
const path = require("path");

global.WORLD = { COMMANDS: {} };
require(path.join(__dirname, "..", "world", "zhenyi.js"));

const root = path.join(__dirname, "..");
const panel = fs.readFileSync(path.join(root, "src", "dialog", "score.js"), "utf8");
const panelCss = fs.readFileSync(path.join(root, "src", "styles", "dialog.css"), "utf8");
const guide = fs.readFileSync(path.join(root, "world", "npc", "pub", "zhenyi_shiyantai.js"), "utf8");
const material = fs.readFileSync(path.join(root, "world", "obj", "st", "zhenyi_hen.js"), "utf8");
const movement = fs.readFileSync(path.join(root, "os", "char", "chara_move.js"), "utf8");
const area = fs.readFileSync(path.join(root, "world", "extends", "map", "area.js"), "utf8");
const legacyRewardNpc = fs.readFileSync(path.join(root, "world", "npc", "zw", "zhenwujian_ling.js"), "utf8");
const room = fs.readFileSync(path.join(root, "os", "room", "room.js"), "utf8");
const trialNpc = fs.readFileSync(path.join(root, "world", "npc", "pub", "zhenyi_trial.js"), "utf8");

assert.ok(panel.includes("show_zhenyi_detail") && panel.includes("skill-item zy-item grade"), "真意面板必须沿用技能列表的点击展开结构与 grade 颜色");
assert.ok(panelCss.includes(".zy-item>.zy-name") && panelCss.includes("color: var(--border-color)"), "grade 必须直接改变真意名称颜色，不能只显示颜色文字");
for (const forbidden of ["扫荡一次", "扫荡十次", "zy_xuanjing", "cost_xj", "cost_mat", "下重需要"]) {
    assert.ok(!panel.includes(forbidden), `真意面板不应包含：${forbidden}`);
}
for (const redundantDetail of ["当前第", "第一重效果预览", "grade_name", "品质与重数不改变效果"]) {
    assert.ok(!panel.includes(redundantDetail), `真意详情不应重复显示：${redundantDetail}`);
}
assert.ok(guide.includes('"扫荡一次"') && guide.includes('"扫荡十次"'), "扫荡入口必须位于禁地试炼 NPC");
assert.ok(guide.includes("身姿挺拔、目光锐利的守试者") && guide.includes("镇守【"), "试炼引导 NPC 描述应只保留外貌与镇守试炼");
assert.ok(!guide.includes("准确效果可在属性页") && !guide.includes("此处只可请教与开启，不可击杀"), "试炼引导 NPC 描述不应重复流程说明");
assert.ok(material.includes("combined: true") && material.includes("zhenyi_hen#"), "悟痕必须是可堆叠的真实背包道具");
assert.ok(movement.includes("can_enter_area") && movement.includes("find_by_key(next_room.parent.id)"), "直传房间也必须校验门派禁地权限");
assert.ok(area.includes("public_owner") && area.includes("zy_trial_owner"), "公共禁地与独立试炼必须使用不同实例 owner");
assert.ok(!legacyRewardNpc.includes('set_temp("zw_zhenwu"'), "旧真武剑灵不得再直接发放草创真意");
assert.ok(room.includes("allow_public_npc(this.path, obj_path)"), "禁地房间创建 NPC 时必须过滤无关旧 NPC");
assert.ok(trialNpc.includes("trial_stats(intent)") && !/player\.(max_hp|max_mp|gj|fy|mz|ds|zj)\s*\*/.test(trialNpc), "试炼 NPC 必须采用旧 NPC 固定档位，不得再按玩家属性倍乘");

const pureMechanics = [];
for (const data of Object.values(WORLD.ZHENYI.DATA)) {
    for (const intent of data.list) {
        for (let level = 1; level <= 10; level++) {
            const desc = WORLD.ZHENYI.describe(data, intent, level);
            assert.ok(desc && !/[约～]/.test(desc), `${data.key}_${intent.id} 第${level}重仍含约数或范围措辞`);
            assert.ok(!/\d+\.\d+/.test(desc), `${data.key}_${intent.id} 第${level}重仍含小数`);
            assert.ok(!desc.includes("非红色"), `${data.key}_${intent.id} 第${level}重暴露了开发者使用的品质排除术语`);
            assert.ok(!desc.includes("点破防"), `${data.key}_${intent.id} 第${level}重仍把百分比破防写成点数`);
            assert.ok(!/grade|品质|当前第\d+重/.test(desc), `${data.key}_${intent.id} 第${level}重效果重复展示了内部品级或重数`);
        }
        if (WORLD.ZHENYI.describe(data, intent, 1).startsWith("纯机制：")) pureMechanics.push(intent.effect);
    }
}
assert.deepStrictEqual(pureMechanics, ["sl_vajra"], "纯机制真意清单发生变化时必须显式复核");

console.log("真意界面与流程通过：原生技能样式、grade 色阶、精确描述、悟痕道具、NPC 扫荡、公共禁地和独立试炼均已静态校验；纯机制真意 1 项。");
