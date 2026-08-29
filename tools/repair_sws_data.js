#!/usr/bin/env node
"use strict";

/**
 * 修复山外山旧版本写入的玩家存档。
 *
 * 旧版本 ITEM.format_temp 将对象拼成 "[object Object]"，会使 JSON5 存档无法解析。
 * 本工具只处理明确包含该字面量的 players / players_bak 行，默认只预览；
 * 确认无误后追加 --apply 写回。执行 --apply 前请先停止游戏进程。
 *
 * 用法：
 *   node tools/repair_sws_data.js
 *   node tools/repair_sws_data.js /path/to/data/database.db
 *   node tools/repair_sws_data.js /path/to/data/database.db --apply
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const JSON5 = require("json5");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dbArg = args.find((arg) => !arg.startsWith("--"));
const dbPath = path.resolve(dbArg || path.join(__dirname, "..", "data", "database.db"));
const transientKeys = [
    "sws_active",
    "sws_layer",
    "sws_cleared",
    "sws_picked",
    "sws_picks",
    "sws_buffs",
    "sws_applied",
    "sws_base",
];

if (!fs.existsSync(dbPath)) {
    console.error("找不到数据库：" + dbPath);
    process.exit(1);
}

const db = new Database(dbPath);
const repairs = [];
const failures = [];

function inspectTable(table) {
    const rows = db.prepare(
        "SELECT id, name, data FROM " + table + " WHERE data LIKE '%[object Object]%'"
    ).all();
    for (const row of rows) {
        const raw = row.data;
        const repairedRaw = raw.replace(/\[object Object\]/g, "{}");
        let parsed;
        try {
            parsed = JSON5.parse(repairedRaw);
        } catch (err) {
            failures.push({
                table,
                id: row.id,
                name: row.name,
                error: err.message,
            });
            continue;
        }
        let removed = [];
        if (parsed && parsed.temp && typeof parsed.temp === "object") {
            for (const key of transientKeys) {
                if (Object.prototype.hasOwnProperty.call(parsed.temp, key)) {
                    delete parsed.temp[key];
                    removed.push(key);
                }
            }
        }
        repairs.push({
            table,
            id: row.id,
            name: row.name,
            data: JSON.stringify(parsed),
            removed,
        });
    }
}

inspectTable("players");
inspectTable("players_bak");

console.log("数据库：" + dbPath);
console.log("疑似受影响存档：" + (repairs.length + failures.length) + " 条");
for (const item of repairs) {
    console.log("  [可修复] " + item.table + " / " + item.id + " / " + (item.name || "(无名)") +
        (item.removed.length ? "，清理临时状态：" + item.removed.join(",") : ""));
}
for (const item of failures) {
    console.error("  [无法解析] " + item.table + " / " + item.id + " / " + (item.name || "(无名)") +
        "：" + item.error);
}

if (failures.length) {
    console.error("存在无法安全解析的行，未写回任何数据。请保留数据库备份后人工处理。");
    db.close();
    process.exit(2);
}
if (!repairs.length) {
    console.log("未发现旧版山外山对象序列化污染。");
    db.close();
    process.exit(0);
}
if (!apply) {
    console.log("当前为预览模式；确认列表后使用同样的数据库路径追加 --apply。");
    db.close();
    process.exit(0);
}

const backupPath = dbPath + ".before-sws-repair-" +
    new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14) + ".bak";
db.close();
fs.copyFileSync(dbPath, backupPath);
const writable = new Database(dbPath);
const statements = new Map();
for (const item of repairs) {
    if (!statements.has(item.table)) {
        statements.set(item.table, writable.prepare(
            "UPDATE " + item.table + " SET data=?, update_time=CURRENT_TIMESTAMP WHERE id=?"
        ));
    }
}
const transaction = writable.transaction(() => {
    for (const item of repairs) {
        statements.get(item.table).run(item.data, item.id);
    }
});
transaction();
writable.close();

console.log("已写回 " + repairs.length + " 条存档。");
console.log("备份：" + backupPath);
