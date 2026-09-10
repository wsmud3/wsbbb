
this.inherits(COMMAND);
this.command = "login";
this.allow_login = true;
this.enter = function (user, id) {
    if (user.serverid !== WORLD.SERVERID) return;

    // 同一连接切换角色：创建新user对象，避免旧角色残留
    if (user.id && user.id !== id) {
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
        sock.user = new USER();
        sock.user.socket = sock;
        sock.user.ip_address = sock.remoteAddress;
        sock.user.userid = uid;
        sock.user.password = pw;
        sock.user.loginTime = lt;
        sock.user.user_level = ul;
        sock.user.serverid = WORLD.SERVERID;
        this.loginIn(sock.user, id);
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
        if (this.on_user_relogin(oldUser, user) === false) return;
        if (oldUser.password !== user.password && oldUser.loginTime > user.loginTime) {
            return user.send("{type:'loginerror',msg:'密码失效，请<CMD onclick=\\'HideAndShow(\"#login_panel\")\\'>重新登录</CMD>'}");
        }
        oldUser.password = user.password;
        oldUser.loginTime = user.loginTime;

        oldUser.ip_address = user.socket.remoteAddress;
        oldUser.disconnect(true);
        user.socket.setTimeout(0);
        return oldUser.relogin(user);
    } else {
        WORLD.log(null, "登陆失败：" + oldUser.id + ",原始ID："
            + oldUser.userid + "，现在ID：" + user.userid);
        return user.send("{type:'loginerror',msg:'当前使用的登陆凭证和角色不一致'}");
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
        const data = await WORLD.DB.getRoleData(user.userid, id);
        if (!data) return user.send("{type:'loginerror',msg:'角色读取失败，请重新登陆 '}");

        if (!user.socket || user.socket.destroyed) return;
        const oldUser = WORLD.getUser(id);
        if (oldUser) return user.send("{type:'loginerror',msg:'重复登录'}");
        if (data.pwd !== user.password)
            return user.send("{type:'loginerror',msg:'密码失效，请<CMD onclick=\\'Process.relogin()\\'>重新登录</CMD>'}");

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
