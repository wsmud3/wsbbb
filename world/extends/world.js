
WORLD.on_startup = function () {
    init_fams();
    WORLD.COMMANDS.jh.init();
    // 每日自动备份，保留7天
    startDailyBackup();
}

function startDailyBackup() {
    // 每小时检查一次，如果超过24小时没备份就执行
    setInterval(function () {
        try {
            var now = Date.now();
            var lastBackup = WORLD.DATA.query_temp('last_auto_backup', 0);
            if (now - lastBackup > 86400000) { // 24小时
                WORLD.save();
                WORLD.DATA.backup();
                WORLD.DATA.set_temp('last_auto_backup', now);
                // 清理7天前的备份
                var fs = require('fs');
                var path = require('path');
                var backupDir = path.join(__dirname, '..', '..', 'data', 'backup');
                if (fs.existsSync(backupDir)) {
                    var files = fs.readdirSync(backupDir).filter(function(f) { return f.endsWith('.js'); }).sort();
                    var cutoff = now - 7 * 86400000; // 7天前
                    for (var i = 0; i < files.length; i++) {
                        var fp = path.join(backupDir, files[i]);
                        try {
                            var stat = fs.statSync(fp);
                            if (stat.mtimeMs < cutoff) {
                                fs.unlinkSync(fp);
                                console.log('[备份清理] 删除过期备份:', files[i]);
                            }
                        } catch(e) {}
                    }
                }
                console.log('[自动备份] 完成, 时间:', new Date().toISOString());
            }
        } catch(e) { console.error('[自动备份] 失败:', e.message); }
    }, 3600000); // 每小时检查
}

function init_fams() {
    for (let fam in FAMILIES) {
        FAMILIES[fam].init();
    }
}

WORLD.on_user_quit = function (user) {
    //在玩家退出游戏时调用
    if (WORLD.is_server(user)) {
        if (user.query_temp('pt')) {
            WORLD.COMMANDS['party'].on_user_login(user, false);//帮派初始化
        }
        WORLD.on_user_save(user);
    } else {
        if (user.query_temp('cross_type') == 'duizhan') {
            WORLD.PUB_USERS.push(user);
            user.disconnect_time = 0;
        }
    }
}
WORLD.on_user_save = function (user) {
    //在玩家退出游戏，或者游戏关闭时候调用

}


WORLD.on_heart_beat = function (now) {

}

const illegalUARegex = /node|python|java|curl|wget|postman|robot|spider|bot/i;
const Origins = [];
WORLD.check_connect = function (socket) {
    if (WORLD.SERVER.istest) return true;

    return true;
}

/**
 * Records a recoverable action for potential admin rollback.
 * Called when a player drops, sells, decomposes items or forgets skills.
 *
 * @param {Object} player - The player object
 * @param {Object} obj_info - The item/game-object or a plain object with relevant data
 * @param {number} type - Action type: 0=drop, 1=sell, 2=fenjie, 3=fangqi, 12=shop
 * @param {*} extra  - Optional extra data (e.g. count for fenjie, mtype for shop)
 */
WORLD.add_recover_obj = function (player, obj_info, type, extra) {
    if (!player || !obj_info) return;
    if (!player._recover_list) {
        player._recover_list = [];
    }
    // Keep the list from growing unbounded (max 200 entries per player)
    if (player._recover_list.length >= 200) {
        player._recover_list.shift();
    }
    var record = {
        time: Date.now(),
        type: type,
    };
    // Copy relevant fields from obj_info (may be a game object or a plain object)
    if (obj_info.name !== undefined) record.name = obj_info.name;
    if (obj_info.id !== undefined) record.id = obj_info.id;
    if (obj_info.path !== undefined) record.path = obj_info.path;
    if (obj_info.count !== undefined) record.count = obj_info.count;
    if (obj_info.value !== undefined) record.value = obj_info.value;
    if (obj_info.limit_key !== undefined) record.limit_key = obj_info.limit_key;
    if (obj_info.max_key !== undefined) record.max_key = obj_info.max_key;
    if (obj_info.rcash !== undefined) record.rcash = obj_info.rcash;
    if (obj_info.up_count !== undefined) record.up_count = obj_info.up_count;
    if (obj_info.addin !== undefined) record.addin = obj_info.addin;
    if (obj_info.level !== undefined) record.level = obj_info.level;
    if (obj_info.pot !== undefined) record.pot = obj_info.pot;
    if (extra !== undefined) record.extra = extra;
    player._recover_list.push(record);
};

WORLD.close = async function () {
    WORLD.status = 5;
    console.log('正在尝试关闭数据连接');
    for (let user of this.USERS) {
        if (user.socket)
            user.socket.end();
    }
    //await this.LISTENER.close();
    console.log('关闭网络连接');
    clearInterval(this.heart_beat_service);
    // console.time('savedb');
    if (await WORLD.save()) {
        //  console.timeEnd('savedb');
        //await this.DB.close();
        console.log('关闭数据连接');
        return true;
    }
    return false;
}