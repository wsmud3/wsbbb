// 日志/监控/崩溃恢复系统
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'log');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };
const currentLevel = LEVELS.INFO;

function timestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function format(level, msg, data) {
    var line = '[' + timestamp() + '] [' + level + '] ' + msg;
    if (data !== undefined) {
        try { line += ' | ' + JSON.stringify(data); } catch (e) { line += ' | [Object]'; }
    }
    return line + '\n';
}

function writeLog(filename, line) {
    var date = new Date().toISOString().slice(0, 10);
    var file = path.join(LOG_DIR, filename + '_' + date + '.log');
    fs.appendFileSync(file, line, 'utf8');
}

var logger = {
    debug: function (msg, data) {
        if (currentLevel <= LEVELS.DEBUG) {
            var line = format('DEBUG', msg, data);
            writeLog('debug', line);
        }
    },
    info: function (msg, data) {
        if (currentLevel <= LEVELS.INFO) {
            var line = format('INFO', msg, data);
            writeLog('info', line);
            console.log(line.trim());
        }
    },
    warn: function (msg, data) {
        if (currentLevel <= LEVELS.WARN) {
            var line = format('WARN', msg, data);
            writeLog('warn', line);
            console.warn(line.trim());
        }
    },
    error: function (msg, data) {
        if (currentLevel <= LEVELS.ERROR) {
            var line = format('ERROR', msg, data);
            writeLog('error', line);
            console.error(line.trim());
        }
    },
    fatal: function (msg, data) {
        var line = format('FATAL', msg, data);
        writeLog('fatal', line);
        console.error(line.trim());
    },

    // 监控
    monitor: {
        startTime: Date.now(),
        saveCount: 0,
        crashCount: 0,
        playerPeak: 0,
        getUptime: function () { return Math.floor((Date.now() - this.startTime) / 1000); },
        getStatus: function () {
            return {
                uptime: this.getUptime(),
                saveCount: this.saveCount,
                crashCount: this.crashCount,
                playerPeak: this.playerPeak,
                memory: Math.round(process.memoryUsage().heapUsed / 1048576) + 'MB',
            };
        }
    },

    // 自动保存保护
    safeSave: function (data, filepath) {
        var tmpPath = filepath + '.tmp';
        var bakPath = filepath + '.bak';
        try {
            // 先写临时文件
            fs.writeFileSync(tmpPath, data, 'utf8');
            // 备份旧文件
            if (fs.existsSync(filepath)) {
                fs.copyFileSync(filepath, bakPath);
            }
            // 原子重命名
            fs.renameSync(tmpPath, filepath);
            this.monitor.saveCount++;
            return true;
        } catch (e) {
            this.error('存档写入失败', { path: filepath, error: e.message });
            return false;
        }
    }
};

// 崩溃恢复
process.on('uncaughtException', function (error) {
    logger.fatal('未捕获异常', { message: error.message, stack: error.stack });
    logger.monitor.crashCount++;
    // 尝试紧急存档
    if (global.WORLD && WORLD.save && WORLD.DATA && WORLD.DATA.on_save) {
        WORLD.save().then(function () {
            logger.info('崩溃前紧急存档完成');
            setTimeout(function () { process.exit(1); }, 500);
        }).catch(function (e) {
            logger.error('紧急存档失败', e.message);
            setTimeout(function () { process.exit(1); }, 500);
        });
    } else {
        logger.warn('存档系统未初始化，跳过紧急存档');
        setTimeout(function () { process.exit(1); }, 500);
    }
});

process.on('unhandledRejection', function (reason) {
    logger.error('未处理的Promise拒绝', { reason: String(reason) });
});

// 定期健康检查
setInterval(function () {
    var mem = process.memoryUsage();
    var players = (global.WORLD && WORLD.USERS) ? WORLD.USERS.length : 0;
    if (players > logger.monitor.playerPeak) {
        logger.monitor.playerPeak = players;
    }
    // 内存告警 (>500MB)
    if (mem.heapUsed > 524288000) {
        logger.warn('内存使用过高', { heapMB: Math.round(mem.heapUsed / 1048576) });
    }
}, 300000); // 每5分钟

module.exports = logger;
