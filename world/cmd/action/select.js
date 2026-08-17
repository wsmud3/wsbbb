
this.inherits(COMMAND);
this.command = "select,command";
this.allow_busy = true;
this.allow_state = true;
this.enter = function (me, arg) {
    if (!me.environment) return;
    if (arg) {
        var target = me.environment.find_obj(arg);
        if (!target) {
            return me.notify("这里没有这个东西。");
        }
        me.notify(target.query_commands(me));
        if (target.hp) {
            var str = ["{type:\"cmds\",items:["];

            if (target.path && me.query_temp('yb_npc2') == target.path) {
                str.push("{cmd:\"task yunbiao ");
                str.push(target.id);
                str.push(" give\",name:\"交镖银\"}");
            }
            str.push("]}");
            if (str.length > 2) {

                me.send(str.join(''));
            }

        }
        if (me.user_level > 0 && target.is_player) {
            me.send_commands("setuser " + target.id + " chat1", "永久禁言",

                "setuser " + target.id + " chat2", "禁言24小时",
                "setuser " + target.id + " quit", "踢出游戏",
                "setuser " + target.id + " dis", "登录限制",
                "setuser " + target.id + " query", "查询信息",
                "setuser " + target.id + " reback", "开始回档");
        }

    } else {
        me.notify(me.environment.query_commands(me, true));
    }
}
this.exec = function (me, target) {
    var str = ['{type:"'];\nstr.push(me == target ? 'login"' : 'select"');\nif (target) {\nstr.push(',hp:');\nstr.push(target.hp);\nstr.push(',mp:');\nstr.push(target.mp);\nstr.push(',max_hp:');\nstr.push(target.max_hp);\nstr.push(',max_mp:');\nstr.push(target.max_mp);\nstr.push(',name:"');
        str.push(target.long_name());
        str.push('",level:');\nstr.push(target.level);\nstr.push(',id:"');
        str.push(target.id);


        str.push('",status:[');\nif (target.status) {\nfor (var item in target.status) {\nstr.push(target.status[item].to_json());\n}\n}\nstr.push(']');\n}\nstr.push('}');\nif (me != target) {\nif (me.action_target) {\nme.action_target.remove_listen(me);\n}\nme.action_target = target;\nif (target)\nme.action_target.add_listen(me);\n}\nreturn this.notify(str.join(""));\n}\n