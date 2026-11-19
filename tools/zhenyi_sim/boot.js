"use strict";
// 进程内加载真实引擎（不监听端口、不连正式库），供真意试炼模拟使用。
const path = require("path"), fs = require("fs");
const ROOT = path.join(__dirname, "../..");
process.chdir(ROOT);
const id = require("crypto").randomBytes(16).toString("hex");
const root = (fs.mkdirSync(path.join(require("os").tmpdir(), "zysim"), { recursive: true }), fs.mkdtempSync(path.join(require("os").tmpdir(), "zysim", "run-")));
Object.assign(process.env, { NODE_ENV: "test", WS_E2E_BOOT_ID: id, WS_E2E_ROOT: root, WEB_PORT: "18088", WS_PORT: "41300", MD5_PREFIX: "x", DESIV: "12345678", SESSION_SECRET: "simsimsimsimsimsim" });
globalThis.__PATH = { BASE: "./os/", WORLD: "./world/", COMMAND: "./world/cmd/", SKILL: "./world/skill/", MAP: "./world/map/", NPC: "./world/npc/", OBJ: "./world/obj/", TASK: "./world/task/", AREA: "./world/area/", FAMILY: "./world/family/", EXTENDS: "./world/extends/", DATA: "./data/", DEF_DATA: "./data/def/" };
fs.mkdirSync(root + "/def", { recursive: true });
const scope = require(ROOT + "/os/test-scope"); __PATH.DATA = scope.data; __PATH.DEF_DATA = root + "/def/";
for (const k in __PATH) __PATH[k] = path.isAbsolute(__PATH[k]) ? __PATH[k] : path.join(ROOT, __PATH[k]);
globalThis.__CONFIG = require(ROOT + "/config");
function readdir(p) { for (const f of fs.readdirSync(p)) { const s = p + f; if (fs.statSync(s).isDirectory()) readdir(s + "/"); else require(s); } }
module.exports = async function boot() {
    readdir(__PATH.BASE);
    await __CONFIG.init();
    WORLD.LISTENER.start = async () => {};
    WORLD.DB.readData = async () => ({});
    const log = console.log; console.log = () => {};
    try { await WORLD.startup(); } finally { console.log = log; }
    clearInterval(WORLD.heart_beat_service);
    return WORLD;
};
