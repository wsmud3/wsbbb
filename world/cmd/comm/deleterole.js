this.inherits(COMMAND);
this.command = "deleterole";
this.allow_login = true;
this.enter = function (me, pars) {
    if (!pars) return;
    var olduser = WORLD.getUser(pars);
    if (olduser) {
        return me.notify("{type:\"deleterole\",result:0,message:\"登陆中的角色不允许删除\"}");
    }
    // 限定本服 sid：「是否在线」只能检查本进程，不能删别的服的角色
    Promise.resolve().then(() => __CONFIG.DB.deleteRole(me.userid, pars, WORLD.SERVERID)).then(x => {
        if (x) {
            me.notify("{type:\"deleterole\",result:1,id:\"" + pars + "\"}");
            var user = WORLD.getUser(pars);
            if (user) {
                if (user.environment) user.environment.item_changed(user, false);
                WORLD.USERS.remove(user);
            }
        } else {
            me.notify("{type:\"deleterole\",result:0}");
        }
    }).catch(err => {
        me.notify("{type:\"deleterole\",result:0}");
    });
}