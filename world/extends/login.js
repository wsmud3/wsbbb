	const USERLOGIN = WORLD.USERLOGIN;
	// 检查用户是否允许创建角色/登录（createrole.js调用此方法）
	// 原bug说明：之前"自动登录导致角色重复"的问题根因在data/sql.js的getData()函数
	// 该函数忽略了角色ID参数，始终只查询a.userid=?，导致永远返回第一个角色
	USERLOGIN.check_user = function (loginuser, id) {

	    return true;
	}
	USERLOGIN.check_session = async function (user, str) {

	    if (user.userid) {
	        return this.login_error(user, '参数错误');
	    }
	    str = str.split(" ");

	    if (str.length < 2) {
	        return this.login_error(user, '参数错误');
	    }
	    var cookieUser = this.encryptUser(str[0], str[1]);
	    if (!cookieUser || cookieUser.id === 0) {
	        return this.login_error(user, "登录参数错误，请使用账号密码<CMD onclick=\\'Process.relogin()\\'>重新登录</CMD>");
	    }
	    user.user_level = cookieUser.level ?? 0;

	    // 认证通过后、角色加载完成前，忽略该连接的其他输入（不能让无角色的 USER 执行命令）；
	    // 加载成功由 loginIn 清空，失败分支统一回到 wait_login。
	    user.wait_input = USERLOGIN.wait_loading;
	    user.userid = cookieUser.id;
	    user.password = cookieUser.pwd;
	    user.loginTime = cookieUser.loginTime;
	    user.ip_address = user.socket.remoteAddress;
	    if (cookieUser.id !== WORLD.admin_user) {
	        if (WORLD.CONNECT_COUNT > WORLD.max_connect_count) {
	            return this.login_error(user, '服务器人数过多，请稍后再试。');
	        }
	        if (str.length === 2 && WORLD.USERS.length > WORLD.max_user_count) {
	            return this.login_error(user, '服务器人数过多，请稍后再试。');
	        }
	        if (!WORLD.before_login(user)) {
	            return this.login_error(user, '服务器正在关闭或开启，请稍后再试。');
	        }
	    }

	    if (str.length === 4) {
	        if (parseInt(str[3]) !== WORLD.SERVERID)
	            return this.login_error(user, '参数错误。');
	        var data = WORLD.can_cross(str[2]);
	        if (!data) {
	            return this.login_error(user, '不允许登录');
	        }
	        user.wait_input = null;
	        WORLD.on_user_cross_login(user, data);
	        if (!user.id) user.wait_input = this.wait_login;
	        return;

	    } else if (str.length === 3) {
	        // Auto-reconnect: key, token, playerID
	        user.serverid = WORLD.SERVERID;
	        var playerID = str[2];
	        var loginCmd = WORLD.COMMANDS["login"];
	        if (!loginCmd) {
	            return this.login_error(user, '登录系统未就绪');
	        }
	        var existingUser = WORLD.getUser(playerID);
	        if (existingUser) {
	            // Network reconnect: player still in memory
	            loginCmd.relogin(existingUser, user);
	        } else {
	            // Server restart: reload from DB
	            await loginCmd.loginIn(user, playerID);
	        }
	        return;
	    } else {
	        user.serverid = WORLD.SERVERID;
	    }
	    // 始终显示角色列表，让玩家主动选择，避免自动登录导致角色重复
	    this.load_roles(user);
	    user.wait_input = this.wait_login;
	}

	USERLOGIN.wait_loading = function () { };
	// 登录/重连/切换角色失败：回到选角状态（可选重发角色列表），避免连接停在「已认证、无角色」状态
	USERLOGIN.login_fail = function (user, msg, resendRoles) {
	    user.send("{type:'loginerror',msg:'" + msg + "'}");
	    if (user.id && WORLD.USERS.indexOf(user) >= 0) return false;
	    user.id = null;
	    user.wait_input = this.wait_login;
	    if (resendRoles && user.userid && user.socket) this.load_roles(user);
	    return false;
	};

	USERLOGIN.send_roles = function (roles, user) {
	    var str = ["{type:'roles',roles:["];
	    for (var i = 0; i < roles.length; i++) {
	        str.push("{name:'");
	        str.push(roles[i].name);
	        str.push("',title:'");
	        str.push(roles[i].title);
	        str.push("',id:'");
	        str.push(roles[i].id);
	        str.push("'}");
	        if (i !== roles.length - 1) str.push(",");
	    }
	    str.push("]}");
	    user.send(str.join(""));
	};

	USERLOGIN.wait_login = function (user, str) {
	    if (!str) return;
	    var i = str.indexOf(' ');
	    var cmd = str, pars = "";
	    if (i > 0) {
	        cmd = str.substr(0, i);
	        pars = str.substr(i + 1);
	    }
	    const command = WORLD.COMMANDS[cmd];
	    if (command && command.allow_login) {
	        return WORLD.COMMANDS[cmd].enter(user, pars);
	    }
	}


	USERLOGIN.load_roles = async function (user) {
	    try {
	        let roles = await WORLD.DB.getRoles(user.userid, user.serverid);

	        if (!roles || !roles.length) {
	            user.send("{type:'roles',roles:[]}");
	        } else {
	            USERLOGIN.send_roles(roles, user);
	        }
	    } catch (error) {
	        console.error(user.userid, '角色读取 ', error);
	        WORLD.log(null, "登陆失败：" + user.userid, error.message);
	        return USERLOGIN.login_error(user, '数据读取失败');
	    }
	}
