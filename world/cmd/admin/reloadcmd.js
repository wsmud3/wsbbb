this.inherits(COMMAND);
this.command = "reloadcmd";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.admin = true;
this.desc = "热更新世界脚本，清除BASE.ITEMS缓存后重新加载";

this.enter = function (me, path) {
    if (!path) {
        return me.notify("用法：reloadcmd <路径>\n例如：reloadcmd world/cmd/skill/xue");
    }

    // 清除缓存
    if (BASE.ITEMS[path]) {
        delete BASE.ITEMS[path];
        me.notify("已清除缓存: " + path + "，下次使用时将重新加载。");
    } else {
        // 模糊匹配
        var matched = [];
        for (var key in BASE.ITEMS) {
            if (key.indexOf(path) >= 0) {
                matched.push(key);
            }
        }
        if (matched.length > 0) {
            for (var i = 0; i < matched.length; i++) {
                delete BASE.ITEMS[matched[i]];
            }
            me.notify("已清除 " + matched.length + " 个缓存:\n" + matched.join("\n"));
        } else {
            me.notify("未找到匹配的缓存路径: " + path);
        }
    }
    return true;
};
