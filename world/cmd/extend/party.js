	this.inherits(COMMAND);
	this.command = "party";
	this.allow_busy = true;
	this.allow_state = true;
	this.allow_die = true;
	this.admin = true;
	this.regex = /^(\w+)(?:\s+(.+?))?(?:\s+(\w+))?$/;

	// 发送帮派数据到客户端UI
	this.send_party_data = function (me) {
	    var pt = me.query_party();
	    if (!pt) {
	        return me.notify('{type:"party"}');
	    }
	    var data = {
	        type: "party",
	        name: pt.name,
	        level: pt.level,
	        notice: pt.notice || "",
	        roles: []
	    };
	    for (var i = 0; i < pt.roles.length; i++) {
	        var role = pt.roles[i];
	        data.roles.push({
	            id: role.id,
	            name: role.name,
	            level: role.level,
	            sc: role.sc || 0,
	            online: role.online || false
	        });
	    }
	    me.notify(JSON.stringify(data));
	};

	// 玩家登录时更新在线状态
	this.on_user_login = function (user, online) {
	    var ptId = user.query_temp("pt");
	    if (!ptId) return;
	    var pt = WORLD.DATA.parties.get(ptId);
	    if (!pt) { user.remove_temp("pt"); user.remove_temp("pt_lv"); return; }
	    var role = pt.get_role(user.id);
	    if (role) {
	        role.online = online;
	        if (online) {
	            // 名字变更时同步更新
	            if (role.name !== user.name) {
	                role.name = user.name;
	            }
	        }
	    }
	};

	this.enter = function (me, cmd, par, par2) {
	    if (!me.is_player) return;

	    switch (cmd) {
	        case "load":
	            return this.load(me);
	        case "list":
	            return this.list(me);
	        case "create2":
	            return this.create2(me, par);
	        case "join":
	            return this.join(me, par);
	        case "out":
	            return this.out(me);
	        case "dissmiss":
	            return this.dissmiss(me);
	        case "uplevel":
	            return this.uplevel(me, par);
	        case "downlevel":
	            return this.downlevel(me, par);
	        case "remove":
	            return this.remove(me, par);
	        case "trans":
	            return this.trans(me, par);
	        case "setting":
	            return this.setting(me, par);
	        case "notice":
	            return this.set_notice(me, par);
	        case "levelup":
	            return this.levelup(me, par);
	        case "stores":
	            return this.stores(me);
	        case "alloc":
	            return this.alloc(me, par);
	        case "fam":
	            return this.fam(me);
	        case "boss":
	            return this.boss(me);
	        case "xiangyang":
	            return this.xiangyang(me);
	        case "lvliu":
	        case "lvliu_stop":
	            return this.lvliu_stop(me);
	            return me.notify("请通过帮会管理员的活跃度查询开启绿柳山庄活动。");
	        default:
	            break;
	    }
	};

	// 加载帮派数据（打开帮派面板时调用）
	this.load = function (me) {
	    this.send_party_data(me);
	};

	// 列出所有帮派
	this.list = function (me) {
	    var list = [];
	    WORLD.DATA.parties.forEach(function (pt) {
	        list.push([pt.name, pt.roles.length]);
	    });
	    me.notify('{type:"party",list:' + JSON.stringify(list) + '}');
	};

	// 创建帮派
	this.create2 = function (me, name) {
	    if (me.query_temp("pt")) {
	        return me.notify("你已经加入了一个帮派，需要先退出才能创建。");
	    }
	    if (!name || name.length < 2 || name.length > 5) {
	        return me.notify("帮派名字需要是2-5中文字符。");
	    }
	    // 检查重名
	    var exists = false;
	    WORLD.DATA.parties.forEach(function (pt) {
	        if (pt.name === name) exists = true;
	    });
	    if (exists) {
	        return me.notify("已存在同名的帮派，请换一个名字。");
	    }
	    // 扣钱：500两黄金
	    var gold = me.money;
	    if (gold < 5000000) {
	        return me.notify("创建帮派需要500两黄金，你的钱不够。");
	    }
	    me.add_money(-5000000);

	    var pt = new Party(name, me);
	    WORLD.DATA.parties.set(pt.id, pt);
	    me.set_temp("pt", pt.id);
	    me.set_temp("pt_lv", 1);

	    me.notify("<hig>你成功创建了帮派【" + name + "】！</hig>");
	    this.send_party_data(me);
	};

	// 加入帮派
	this.join = function (me, name) {
	    if (me.query_temp("pt")) {
	        return me.notify("你已经加入了一个帮派，需要先退出才能加入其他帮派。");
	    }
	    if (!name) return me.notify("请输入要加入的帮派名称。");

	    var targetPt = null;
	    WORLD.DATA.parties.forEach(function (pt) {
	        if (pt.name === name) targetPt = pt;
	    });
	    if (!targetPt) {
	        return me.notify("找不到名为【" + name + "】的帮派。");
	    }
	    if (targetPt.roles.length >= targetPt.max_roles()) {
	        return me.notify("该帮派人数已满。");
	    }

	    targetPt.roles.push({
	        id: me.id,
	        name: me.name,
	        level: 5,   // 默认帮众
	        sc: 0,
	        online: true
	    });
	    me.set_temp("pt", targetPt.id);
	    me.set_temp("pt_lv", 5);

	    me.notify("<hig>你已成功加入帮派【" + name + "】！</hig>");
	    this.send_party_data(me);
	};

	// 退出帮派
	this.out = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role) return me.notify("数据异常，找不到你的帮派成员信息。");
	    if (role.level === 1) {
	        return me.notify("帮主不能直接退出，请先转让帮主或解散帮派。");
	    }

	    pt.roles.remove(role);
	    me.remove_temp("pt");
	    me.remove_temp("pt_lv");
	    me.notify("你已退出帮派【" + pt.name + "】。");
	    me.notify('{type:"party"}');
	};

	// 解散帮派（仅帮主）
	this.dissmiss = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level !== 1) {
	        return me.notify("只有帮主才能解散帮派。");
	    }

	    // 通知在线成员
	    for (var i = 0; i < pt.roles.length; i++) {
	        var r = pt.roles[i];
	        if (r.id !== me.id) {
	            var member = WORLD.USERS.find(function (u) { return u.id === r.id; });
	            if (member) {
	                member.remove_temp("pt");
	                member.remove_temp("pt_lv");
	                member.notify("<red>帮派【" + pt.name + "】已被帮主解散。</red>");
	            }
	        }
	    }

	    WORLD.DATA.parties.delete(pt.id);
	    me.remove_temp("pt");
	    me.remove_temp("pt_lv");
	    me.notify("你已解散帮派【" + pt.name + "】。");
	    me.notify('{type:"party"}');
	};

	// 提升成员职位
	this.uplevel = function (me, targetId) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var myRole = pt.get_role(me.id);
	    var targetRole = pt.get_role(targetId);
	    if (!targetRole) return me.notify("找不到该成员。");
	    if (targetRole.level <= 1) return me.notify("该成员已是最高职位。");
	    if (myRole.level >= targetRole.level) return me.notify("你的职位不够高，无法提升该成员。");

	    targetRole.level--;
	    var levelNames = ["", "帮主", "副帮主", "长老", "堂主", "帮众"];
	    me.notify("已将" + targetRole.name + "提升为" + levelNames[targetRole.level] + "。");

	    var targetUser = WORLD.USERS.find(function (u) { return u.id === targetId; });
	    if (targetUser) {
	        targetUser.set_temp("pt_lv", targetRole.level);
	        targetUser.notify("你已被提升为帮派【" + pt.name + "】的" + levelNames[targetRole.level] + "。");
	    }
	    this.send_party_data(me);
	};

	// 降低成员职位
	this.downlevel = function (me, targetId) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var myRole = pt.get_role(me.id);
	    var targetRole = pt.get_role(targetId);
	    if (!targetRole) return me.notify("找不到该成员。");
	    if (targetRole.level >= 5) return me.notify("该成员已是最低职位。");
	    if (myRole.level >= targetRole.level) return me.notify("你的职位不够高，无法降级该成员。");

	    targetRole.level++;
	    var levelNames = ["", "帮主", "副帮主", "长老", "堂主", "帮众"];
	    me.notify("已将" + targetRole.name + "降级为" + levelNames[targetRole.level] + "。");

	    var targetUser = WORLD.USERS.find(function (u) { return u.id === targetId; });
	    if (targetUser) {
	        targetUser.set_temp("pt_lv", targetRole.level);
	        targetUser.notify("你已被降级为帮派【" + pt.name + "】的" + levelNames[targetRole.level] + "。");
	    }
	    this.send_party_data(me);
	};

	// 开除成员
	this.remove = function (me, targetId) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var myRole = pt.get_role(me.id);
	    var targetRole = pt.get_role(targetId);
	    if (!targetRole) return me.notify("找不到该成员。");
	    if (myRole.level >= targetRole.level) return me.notify("你的职位不够高，无法开除该成员。");
	    if (targetRole.level === 1) return me.notify("无法开除帮主。");

	    pt.roles.remove(targetRole);
	    var targetUser = WORLD.USERS.find(function (u) { return u.id === targetId; });
	    if (targetUser) {
	        targetUser.remove_temp("pt");
	        targetUser.remove_temp("pt_lv");
	        targetUser.notify("<red>你已被踢出帮派【" + pt.name + "】。</red>");
	    }
	    me.notify("已将" + targetRole.name + "开除出帮派。");
	    this.send_party_data(me);
	};

	// 转让帮主
	this.trans = function (me, targetId) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var myRole = pt.get_role(me.id);
	    if (!myRole || myRole.level !== 1) return me.notify("只有帮主才能转让。");

	    var targetRole = pt.get_role(targetId);
	    if (!targetRole) return me.notify("找不到该成员。");
	    if (targetRole.level !== 2) return me.notify("只能转让给副帮主。");

	    myRole.level = 2;
	    targetRole.level = 1;
	    me.set_temp("pt_lv", 2);

	    var targetUser = WORLD.USERS.find(function (u) { return u.id === targetId; });
	    if (targetUser) {
	        targetUser.set_temp("pt_lv", 1);
	        targetUser.notify("<hig>你已成为帮派【" + pt.name + "】的新帮主！</hig>");
	    }
	    me.notify("你已将帮主之位转让给" + targetRole.name + "。");
	    this.send_party_data(me);
	};

	// 帮派设置
	this.setting = function (me, type) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level > 2) return me.notify("只有帮主和副帮主才能修改帮派设置。");

	    if (!type) {
	        var settings = {
	            power: pt.query_temp("power", 0),
	            join: pt.query_temp("join", 0),
	            open_sc: pt.query_temp("open_sc", 0),
	            alloc: pt.query_temp("alloc", 0)
	        };
	        return me.notify("当前帮派设置：\n权限等级:" + settings.power + "\n加入方式:" + (settings.join ? "需要审批" : "自由加入") + "\n活动开关:" + (settings.open_sc ? "开启" : "关闭") + "\n分配方式:" + (settings.alloc ? "按活跃度" : "随机"));
	    }
	    // 切换对应设置
	    var current = pt.query_temp(type, 0);
	    pt.set_temp(type, current ? 0 : 1);
	    me.notify("帮派设置已更新。");
	};

	// 发布公告
	this.set_notice = function (me, text) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level > 2) return me.notify("只有帮主和副帮主才能发布公告。");

	    if (!text) {
	        pt.notice = "";
	        return me.notify("已清除帮派公告。");
	    }
	    pt.notice = text;
	    me.notify("帮派公告已更新：" + text);
	    this.send_party_data(me);
	};

	// 设施升级
	this.levelup = function (me, facility) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level > 2) return me.notify("只有帮主和副帮主才能升级设施。");

	    if (facility === "liangong") {
	        var lv = pt.query_temp("liangong", 0);
	        var cost = (lv + 1) * 100;
	        var score = pt.query_score();
	        if (score < cost) return me.notify("帮派活跃度不足，升级练功房需要" + cost + "点活跃度，当前仅有" + score + "点。");
	        pt.set_temp("liangong", lv + 1);
	        me.notify("练功房已升级到" + (lv + 1) + "级！");
	    } else if (facility === "lianyao") {
	        var lv = pt.query_temp("lianyao", 0);
	        var cost = (lv + 1) * 100;
	        var score = pt.query_score();
	        if (score < cost) return me.notify("帮派活跃度不足，升级炼药房需要" + cost + "点活跃度，当前仅有" + score + "点。");
	        pt.set_temp("lianyao", lv + 1);
	        me.notify("炼药房已升级到" + (lv + 1) + "级！");
	    } else {
	        return me.notify("可升级的设施：liangong(练功房)、lianyao(炼药房)");
	    }
	};

	// 仓库盘点
	this.stores = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    me.notify("帮派仓库功能暂未开放。");
	};

	// 战利品分配
	this.alloc = function (me, type) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    me.notify("战利品分配功能暂未开放。");
	};

	// 帮派对门派战
	this.fam = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level > 2) return me.notify("只有帮主和副帮主才能发起帮战。");
	    me.notify("帮派对门派战功能暂未开放。");
	};

	// 英雄帖BOSS
	this.boss = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    var role = pt.get_role(me.id);
	    if (!role || role.level > 2) return me.notify("只有帮主和副帮主才能发送英雄帖。");
	    me.notify("英雄帖功能暂未开放。");
	};

	// 守卫襄阳
	this.xiangyang = function (me) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");

	    me.notify("守卫襄阳报名功能请通过相关NPC进行。");
	};
