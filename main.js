"use strict";

globalThis['__PATH'] = {
    BASE: "./os/",
    WORLD: "./world/",
    COMMAND: "./world/cmd/",
    SKILL: "./world/skill/",
    MAP: "./world/map/",
    NPC: "./world/npc/",
    OBJ: "./world/obj/",
    TASK: "./world/task/",
    AREA: "./world/area/",
    FAMILY: "./world/family/",
    EXTENDS: "./world/extends/",
    DATA: "./data/",
    DEF_DATA: "./data/def/"
};


require('dotenv').config();


const fs = require("fs");
function readdir(path) {
    var files = fs.readdirSync(path);
    for (var i = 0; i < files.length; i++) {
        var sub_path = path + files[i];
        var stat = fs.statSync(sub_path);
        if (stat.isDirectory()) {
            readdir(sub_path + "/");
        } else {
            require(sub_path);
        }
    }
}

globalThis['__CONFIG'] = require('./config');
async function require_os() {

    const path = require('path');
    for (var item in __PATH) {
        __PATH[item] = path.join(__dirname, __PATH[item]);
    }
    readdir(__PATH.BASE);
    await __CONFIG.init();
}
require_os().then(async () => {
    await WORLD.startup(process.argv[2]);
    // Admin IPC server for web.js <-> game process communication
    try {
        require("./os/admin-server").start();
    } catch (e) {
        console.error('[Admin IPC] Failed to start:', e.message);
    }
});


// 优雅关闭：保存所有玩家数据后再退出
async function gracefulShutdown(signal) {
    console.log('收到%s信号，正在保存数据...', signal);
    try {
        await WORLD.save();
        console.log('数据保存完成，服务器关闭');
    } catch (e) {
        console.error('保存数据失败:', e.message);
    }
    process.exit(0);
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);

});
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});

// === 运维定时任务 ===
setInterval(function () {
    try {
        if (WORLD && WORLD.DATA && WORLD.DATA.backup) WORLD.DATA.backup();
    } catch(e) { console.error('[备份] 失败:', e.message); }
    var mem = process.memoryUsage();
    if (mem.heapUsed > 524288000) {
        console.warn('[监控] 内存过高: ' + Math.round(mem.heapUsed/1048576) + 'MB, 执行GC');
        if (global.gc) global.gc();
    }
    var players = (WORLD && WORLD.USERS) ? WORLD.USERS.length : 0;
    if (players > 0) console.log('[监控] 在线: ' + players + ' | 内存: ' + Math.round(mem.heapUsed/1048576) + 'MB | 运行: ' + Math.floor(process.uptime()/3600) + 'h');
}, 3600000);