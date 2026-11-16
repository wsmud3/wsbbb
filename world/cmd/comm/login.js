
this.inherits(COMMAND);
this.command = "login";
this.allow_login = true;
// 已登录时 login 即「切换角色」，会立即退出当前角色：战斗中不允许，防止借此瞬间脱战/逃避 PK。
// （busy、昏迷、死亡、状态中由 check_command 默认拦截）
this.allow_fight = false;
this.enter = function (user, id) {
    if (user.serverid !== WORLD.SERVERID) return;

    // 同一连接切换角色：先校验目标角色，通过后再退出旧角色（失败时旧角色保持在线，连接不会卡住）。
    if (user.id && user.id !== id) {
        this.switch_role(user, id).catch(function (e) {
            console.error('切换角色失败', e);
            WORLD.log(user, "切换角色失败", e.message);
        });
        return;
    }
    if (user.id) return;

    user.ip_address = user.socket.remoteAddress;
    const oldUser = this.check_user(user, id);
    if (!oldUser) return;
    if (oldUser.id) {
        this.relogin(oldUser, user);
    } else {
        this.loginIn(user, id);
    }
}
this.switch_role = async function (user, id) {
    if (user._switching) return;
    user._switching = true;
    var target;
    try {
        target = await this.check_switch_target(user, id);
    } finally {
        user._switching = false;
    }
    if (!target) return;
    if (!user.socket || user.socket.destroyed || user.socket.user !== user) return;
    // 校验与退出之间有一次 await，期间可能已进入战斗
    if (user.fight_type > 0) return user.notify_fail("你正在战斗，无法切换角色。");
    var sock = user.socket;
    var pw = user.password;
    var lt = user.loginTime;
    var ul = user.user_level;
    var uid = user.userid;
    // 完整退出旧角色
    user.socket = null;
    try { user.quit(); }
    catch (error) { user.socket = sock; throw error; }
    // 创建新user对象复用socket
    var nu = new USER();
    sock.user = nu;
    nu.socket = sock;
    nu.ip_address = sock.remoteAddress;
    nu.userid = uid;
    nu.password = pw;
    nu.loginTime = lt;
    nu.user_level = ul;
    nu.serverid = WORLD.SERVERID;
    var oldUser = target.online;
    if (oldUser) {
        // 目标角色断线挂机中：直接接管
        this.relogin(oldUser, nu);
    } else {
        this.loginIn(nu, id);
    }
}
// 切换前的目标校验：归属本账号、本服；在内存中的必须是同一账号（走 relogin 接管）。
// 失败时只提示，不动当前角色。
this.check_switch_target = async function (user, id) {
    if (!id || typeof id !== 'string') { user.notify_fail("参数错误。"); return null; }
    var online = WORLD.getUser(id);
    if (online) {
        if (online.userid !== user.userid) { user.notify_fail("角色读取失败。"); return null; }
        return { online: online };
    }
    var data;
    try { data = await WORLD.DB.getRoleData(user.userid, id, WORLD.SERVERID); }
    catch (e) { WORLD.log(user, "切换角色读取失败", e.message); data = null; }
    if (!data) { user.notify_fail("角色读取失败。"); return null; }
    if (data.pwd !== user.password) { user.notify_fail("登录凭证已失效，请重新登录。"); return null; }
    return { online: null };
}
this.check_user = function (loginuser, id) {
    for (var i = 0; i < WORLD.USERS.length; i++) {
        let user = WORLD.USERS[i];
        if (user.id === id) {
            return user;
        }
    }
    return {};
}
this.relogin = function (oldUser, user) {
    if (oldUser.userid === user.userid) {
        if (this.on_user_relogin(oldUser, user) === false) {
            if (!user.id) user.wait_input = WORLD.USERLOGIN.wait_login;
            return;
        }
        if (oldUser.password !== user.password && oldUser.loginTime > user.loginTime) {
            return WORLD.USERLOGIN.login_fail(user, "密码失效，请<CMD onclick=\\'Process.relogin()\\'>重新登录</CMD>");
        }
        oldUser.password = user.password;
        oldUser.loginTime = user.loginTime;
        // token 校验时读的是数据库当前等级；断线挂机期间被改过权限的，在这里同步
        oldUser.user_level = user.user_level;

        oldUser.ip_address = user.socket.remoteAddress;
        oldUser.disconnect(true);
        user.socket.setTimeout(0);
        return oldUser.relogin(user);
    } else {
        WORLD.log(null, "登陆失败：" + oldUser.id + ",原始ID："
            + oldUser.userid + "，现在ID：" + user.userid);
        return WORLD.USERLOGIN.login_fail(user, '当前使用的登陆凭证和角色不一致', true);
    }
}
this.on_user_relogin = function (user, me) {

    if (user.state && user.state.id == "cross") {
        if (user.state.is_over || Date.now() - user.state.stime > 1800000) {
            user.moveto(user.query_temp("enter_room") || "yz/wumiao");
            return true;
        } else {
            me.send("{type:'cross',sid:" + user.state.sid + ",pid:'" + user.id + "',cross_type:'" + user.state.cross_type + "'}");
        }
        return false;
    }

    return true;
}

this.loginIn = async function (user, id) {
    if (user._loadingRole) return;
    user._loadingRole = true;
    try {
        // 显式传入本服 sid：同一账号可能在两服都有角色，不传会跨服取档。
        const data = await WORLD.DB.getRoleData(user.userid, id, WORLD.SERVERID);
        if (!data) return WORLD.USERLOGIN.login_fail(user, '角色读取失败，请重新登陆', true);

        if (!user.socket || user.socket.destroyed) return;
        const oldUser = WORLD.getUser(id);
        if (oldUser) return WORLD.USERLOGIN.login_fail(user, '重复登录', true);
        if (data.pwd !== user.password)
            return WORLD.USERLOGIN.login_fail(user, "密码失效，请<CMD onclick=\\'Process.relogin()\\'>重新登录</CMD>");

        user.loadData(data);
        // 记录最后活跃时间（后台"活跃玩家"统计依据），失败不影响登录
        try { Promise.resolve(WORLD.DB.touchRole(user.id)).catch(e => WORLD.log(user, "更新活跃时间失败", e.message)); }
        catch (e) { WORLD.log(user, "更新活跃时间失败", e.message); }
        // Publish only after parsing and initialization; a corrupt save must
        // not leave a half-initialized role in the heartbeat/save registry.
        WORLD.USERS.push(user);
        user.do_login();
        user.wait_input = null;
        if (user.socket)
            user.socket.setTimeout(0);
        this.on_user_login(user);
    } catch (e) {
        var userIndex = WORLD.USERS.indexOf(user);
        if (userIndex >= 0) WORLD.USERS.splice(userIndex, 1);
        try {
            if (user.environment && user.environment.item_changed)
                user.environment.item_changed(user, false);
        } catch (_) {}
        user.environment = null;
        console.error('登陆失败', e);
        WORLD.log(user, "登陆失败", e.message);
        user.send("{type:'loginerror',msg:'数据加载失败'}");
        user.id = null;
        user.wait_input = WORLD.USERLOGIN.wait_login;
    } finally {
        user._loadingRole = false;
    }
}

this.on_user_login = function (user) {
    user.send("欢迎登陆<HIW>MUD游戏</HIW>");

    const area = user.environment.parent;
    area.on_login && area.on_login(user);

    if (user.force_skill.on_relive) {
        user.force_skill.on_relive(user);
    }
}
