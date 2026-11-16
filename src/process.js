
import MessageQueue from './message.js';
import FloatDialog from './floatdialog.js';
import { connectServer, hide2show, isConnected, onLogin, SendCommand, showLoader, GameClient, clearReconnectTimer, setChangeServer, clearLastPlayer, resetToLogin } from './client.js';
import Combat from './combat.js';
import Setting from './setting.js';
import MAP from './map.js';
import SCRIPT from './script.js';
import { roles } from './login/index.js';
import { SERVERS } from "./login/server.js";
import { chatText } from './utils/chat-text.js';

const MessageContent = () => $(".content-message");
const MessagePage = { append: (div) => $(".content-message").append(div) };

const Process = {
    itemsElement: null,
    contentScroll: true,
    message: null,
    channel: null,
    relogin() {
        resetToLogin();
    },
    clear: function () {
        MAP.CancelWalk();
        Dialog.pack.items = null;
        Dialog.skills.items = null;

        this.state(null);
        this.states = null;
        this.timer = null;
        if (this.message) {
            this.message.clear();
            this.message.allow_scroll = true;
            this.message.scroll_button.hide();
        }
        if (this.channel) {
            this.channel.clear();
            this.channel.allow_scroll = true;
            this.channel.scroll_button.hide();
        }
        if (Dialog.channel) Dialog.channel.datas = [];
    },
    init: function () {
        Process.itemsElement = $(".room_items");
        this.message = MessageQueue.create($(".content-message"));
        this.ChannelElement = $('.channel');
        this.ChannelElement.on("click", Dialog.channel.show.bind(Dialog.channel));
        this.channel = MessageQueue.create(this.ChannelElement, 4, 200);


    },
    startMoveMessage: function (e) {
        window.addEventListener('mousemove', Process.moveMessage);
        window.addEventListener("mouseup", Process.endMoveMessage);
        Process.mouseY = e.clientY;
    },
    moveMessage: function (e) {

        let diff = Process.mouseY - e.clientY;
        let mc = MessageContent();
        let elem = mc[0];
        let height = mc.height();
        let padding = elem.style.marginBottom;
        if (padding) padding = parseInt(padding.replace('px', ""));
        else padding = 0;
        padding = (padding + diff);
        if (padding < 0) padding = 0;
        else if (padding > height * 0.7) return;
        elem.style.marginBottom = padding + "px";
        Process.mouseY = e.clientY;
        e.preventDefault();
    },
    endMoveMessage: function () {
        window.removeEventListener('mousemove', Process.moveMessage);
        window.removeEventListener("mouseup", Process.endMoveMessage);
    },

    regist: function (x) {
        if (x.result) {
            hide2show("#addrole_panel");
            $("#addrole_panel .input-error").html(x.result);
        }
    },
    emote: function (data) {
        Process.emotes = data.items || 0;
        var str = [];
        for (var i = 0; i < Process.emotes.length; i++) {
            str.push('<span>');
            str.push(Process.emotes[i]);
            str.push("</span>");
        }
        $(".channel-emotes").html(str.join(""));
    }
    , deleterole: function (x) {
        if (x.result) {
            var item = $("#role_panel>ul>.content>.role-list>.role-item[roleid='" + x.id + "']");
            item.remove();
            var elems = $("#role_panel>ul>.content>.role-list>.role-item");
            if (item.is(".select") && elems.length) {
                $(elems[0]).addClass("select");
            } else if (!elems.length) {
                roles.addRole();
            }
        } else {
            Confirm.Show({
                content: "<span class='input-error'>" + (x.message || "删除失败") + "</span>",
            });
        }
    }, cross: function (data) {
        var serv = null;
        // 服务器列表（data/sql.js getServers 与本地兜底）字段是小写 id/name
        for (var i = 0; SERVERS && i < SERVERS.length; i++) {
            var sid = SERVERS[i].id != null ? SERVERS[i].id : SERVERS[i].ID;
            if (sid == data.sid) {
                serv = SERVERS[i];
            }
        }
        if (!serv) {
            console.log("跨服失败：找不到服务器", data.sid);
            return;
        }

        setChangeServer(true);
        clearLastPlayer();
        if (GameClient) GameClient.Close();
        Dialog.pack.items = null;
        if (data.cross_type == 'duizhan') {
            Dialog.skills.items = null;
            Dialog.skills.isShow = false;
        }
        console.log("重新连接到", serv.name || serv.Name);
        if (!data.pid) Process.die({ relive: true });
        connectServer(serv, data.pid);
    }
    ,
    roles: function (x) {
        if (!x || !Array.isArray(x.roles)) return;
        // 服务端已正常应答（等玩家选角），撤掉 15 秒强制刷新的保护
        clearReconnectTimer();
        var result = x.roles;
        if (!result.length) {
            roles.addRole();
        } else {
            hide2show("#role_panel");
            var html = [];
            for (var i = 0; i < result.length; i++) {
                html.push("<li class='role-item");
                if (i == 0) html.push(" select");
                html.push("' roleid='" + result[i].id + "'>");
                html.push(result[i].title);
                html.push("&nbsp;&nbsp;");
                html.push(result[i].name);
                html.push("</li>");
            }
            $(".role-list").html(html.join(""));
        }
    }, loginerror: function (msg) {
        // 不断开 socket 的登录失败（重复登录/读取失败/密码失效）不能再触发 15 秒刷新；
        // 断线前保存的角色也作废，避免下次连接继续自动登录它
        clearReconnectTimer();
        clearLastPlayer();
        $(".container").hide();
        $(".login-content").show();
        showLoader("<strong>登录失败：</strong>" + msg.msg + "");

        //hide2show ("#role_panel");
    }, login: function (x) {
        console.log("[reconnect] Process.login x.id=", x.id, "cur player=", Process.player);
        // 统一用最简单的方式：不用动画，直接设置 CSS
        $(".login-content").hide();
        $(".container").css({"display": "flex", "opacity": "1"});
        Dialog.reset();
        $(".content-room").removeClass("hide").css("display", "");

        // DOM 状态诊断
        setTimeout(function() {
            var cr = $(".content-room");
            console.log("[reconnect] DOM: content-room.display=" + cr.css("display") +
                " hide=" + cr.hasClass("hide") +
                " visible=" + cr.is(":visible") +
                " room-name=[" + $(".room-name").html() + "]" +
                " room-desc.len=" + $(".room_desc").html().length +
                " items.children=" + $(".room_items").children().length +
                " container.display=" + $(".container").css("display"));
        }, 3000);

        MAP.CancelWalk();
        Process.player = x.id;
        Process.level = x.level;
        // 设置载入失败（例如本地存储不可用）不能跳过 onLogin，否则重连定时器不会被清掉
        try {
            Setting.load(x.setting);
        } catch (e) {
            console.error("[login] Setting.load failed", e);
        } finally {
            onLogin();
        }
        //var panel = $(".player-panel").html(CreateHeadPanel(x));

    }, levelup: function (x) {
        Process.level = x.level;
    },

    selectItem: function (e) {
        var st = $(e.target).closest('.status-item')[0];
        if (st) {
            var sid = st.getAttribute("sid");
            let pid = $(st).closest('.room-item').attr('itemid');
            if (!sid) return;
            if (pid === Process.player)
                return SendCommand("status " + sid);
            return SendCommand("status " + sid + " " + pid);
        }
        var id = $(this).attr("itemid");
        if (id) {
            if (id == Process.player) {
                var name = $(this).find(".item-name").html();

                var cmds = [{ cmd: "look " + id, name: "查看" },
                { cmd: "dazuo", name: "打坐" },
                { cmd: "liaoshang", name: "疗伤" }];
                if (Dialog.team.items && Dialog.team.items.length) {
                    cmds.push({ cmd: "team out", name: "退出队伍" });
                    if (Dialog.team.isCap) {
                        cmds.push({ cmd: "team dismiss", name: "解散队伍" });
                        cmds.push({ cmd: "team set", name: "更改分配方式" });
                    }
                }
                Process.item({
                    id: id,
                    name: name,
                    me: 1,
                    desc: name,
                    commands: cmds
                });
                return;
            }
            SendCommand("select " + id);
        }
    }, countwidth: function (m1, m2) {
        var w = m1 * 100 / m2;
        if (w < 0) w = 0;
        if (w > 100) w = 100;
        return w;
    }, itemremove: function (data) {
        if (!data) return;
        var item = Combat.STATUS[data.id];
        if (item) {
            for (var si in item.items) {
                clearInterval(item.items[si].handler);
            }
            var div = item.elem.parent();
            if (div.next().is(".item-commands")) {
                div.next().remove();
            }
            div.remove();
            delete Combat.STATUS[data.id];
        }

        if (Process.cur_room && Array.isArray(Process.cur_room.items)) {
            Process.cur_room.items.RemoveAt(x => x.id === data.id);
        }
    }, itemadd: function (data) {
        if (!data) return;
        if (Setting.off_plist && data.p && data.id != Process.player) {
            return;
        }
        var item = data, player_item;
        if (Setting.item_firstme && item.id == Process.player) {

            player_item = $(Process.create_roomitem(item)).prependTo(Process.itemsElement);
        } else {
            player_item = $(Process.create_roomitem(item)).appendTo(Process.itemsElement);
        }
        if (Combat.STATUS[data.id]) Process.itemremove(data);
        Combat.AppendStatusItem(item.id, player_item.find(".item-status-bar"), item.status);
        Process.cur_room.items.push(item);
    }
    , items: function (room) {
        if (!room) return;
        if (!Array.isArray(room.items)) room.items = [];
        console.log("[reconnect] Process.items items=", room.items ? room.items.length : 0);
        Process.itemsElement.empty();
        Combat.STATUS = {};//更换房间，状态信息清空
        for (var i = 0; i < room.items.length; i++) {
            var item = room.items[i];
            if (!item) continue;
            item.player = item.p;
            if (item.m) {
                item.type = '师父';
                item.master = 1;
            }
            if (item.f) {
                item.type = '随从';
                item.follower = 1;
            }
            if (item.l) {
                item.type = '商人';
                item.trader = 1;
            }
            if (Setting.off_plist && item.p && item.id != Process.player) {
                continue;
            }
            var player_item;
            if (Setting.item_firstme && item.id == Process.player) {

                player_item = $(Process.create_roomitem(item)).prependTo(Process.itemsElement);
            } else {
                player_item = $(Process.create_roomitem(item)).appendTo(Process.itemsElement);
            }
            Combat.AppendStatusItem(item.id, player_item.find(".item-status-bar"), item.status);
        }
        if (!Process.cur_room) Process.cur_room = {};
        Process.cur_room.items = room.items;
    },

    get_hpnum: function (hp, max_hp) {
        var diff = hp / max_hp;
        if (diff > 0.8) return "<hiy>" + hp + "</hiy>";
        if (diff > 0.5) return "<yel>" + hp + "</yel>";
        if (diff > 0.2) return "<red>" + hp + "</red>";
        return "<hir>" + hp + "</hir>";
    }, create_roomitem: function (item) {
        var str = [];

        str.push("<div class='room-item' itemid='" + item.id + "'>");
        if (item.max_hp) {
            str.push('<div class="item-status"');
            if (!Combat.IsShow || Setting.off_hp) {
                str.push(' style="display:none;"');
            }

            str.push('>');
            str.push('<div class="progress hp"><div class="progress-bar" max="' + item.max_hp + '"  style="width:' + Process.countwidth(item.hp, item.max_hp) + '%"></div></div>');
            str.push('<div class="progress mp"><div class="progress-bar" max="' + item.max_mp + '"   style="width:' + Process.countwidth(item.mp, item.max_mp) + '%"></div></div>');
            str.push("</div>");
        }
        str.push("<span class='item-status-bar'>");

        str.push('</span>');


        str.push("<span class='item-name'>");
        str.push(item.name);
        if (Setting.show_hpnum && item.max_hp) {

            str.push('<span class="progress-num">['
                + this.get_hpnum(item.hp, item.max_hp) + "<nor>/</nor><hiy>" + item.max_hp + '</hiy>]</span>');
        }

        str.push('</span>');
        str.push("</div>");
        return str.join("");
    },
    room: function (room) {
        if (!room) return;
        const sameRoom = Process.room_path === room.path;
        if (!Array.isArray(room.items)) {
            room.items = sameRoom && Process.cur_room && Array.isArray(Process.cur_room.items)
                ? Process.cur_room.items : [];
        }
        if (!sameRoom) $(".room_items").html("");
        $(".room-name").html(room.name);
        $(".room_desc").html(room.desc);
        Process.room_name = room.name;
        if (!sameRoom && !Setting.keep_msg) {
            Process.message.clear();
        } else if (!sameRoom && Setting.keep_msg) {
            ReceiveMessage("你来到了" + room.name + "。");
        }
        if (Setting.show_roomitem) {
            Process.searchItems(room);
        }

        Combat.ShowRoomCommands(room);

        Process.room_path = room.path;
        Process.cur_room = room;
        MAP.SetRoom(room);
    }, roomHiddenItemsReg: /<\w{3}\scmd=['"](.+?)['"]>(.+?)<\/\w{3}>/g,
    searchItems: function (room) {
        if (!room) return;
        if (!Array.isArray(room.commands)) room.commands = [];
        this.roomHiddenItemsReg.lastIndex = 0;

        var result = null, roomdesc = room.desc || "";
        while ((result = this.roomHiddenItemsReg.exec(roomdesc)) !== null) {
            var exists = room.commands.some(function (command) {
                return command && command.cmd === result[1] && command.name === result[2];
            });
            if (!exists) {
                room.commands.push({
                    cmd: result[1],
                    name: result[2]
                });
            }
        }


    }, exits: function (room) {
        var items = room ? room.items : Process.room_exits;
        if (!items) return;
        Process.room_exits = items;
        $(".room_exits").html(MAP.CreateExitsMap(items, $(".container").width(), Process.room_name))
    },
    before_click_exits: function (e) {
        var elem = $(e.target);
        if (!elem.attr("dir")) return;
        if (elem.is("rect"))
            elem.attr("fill", "gray");
        else if (elem.is("text"))
            elem.prev().attr("fill", "gray");
    },
    click_exits: function (e) {
        var elem = $(e.target);
        var dir = elem.attr("dir");
        if (!dir) return;
        if (elem.is("rect"))
            elem.attr("fill", "#232323");
        else if (elem.is("text"))
            elem.prev().attr("fill", "#232323");
        SendCommand("go " + dir);
    }, query_rmitem: function (id) {
        if (!this.cur_room || !Array.isArray(this.cur_room.items)) return;
        for (let item of this.cur_room.items) {
            if (item.id === id) return item;
        }
    },
    item: function (item) {
        if (!item) return;
        ReceiveMessage(item.desc);
        item.commands = item.commands ?? [];
        let npc = Process.query_rmitem(item.id);
        if (npc) item = Object.assign(item, npc);

        SCRIPT.LAST_OBJ = item;
        Dialog.extend.append(item.commands, 'item', item);
        var html = ["<div class='item-commands'>"];
        for (var i = 0; i < item.commands.length; i++) {
            html.push("<span cmd='" + item.commands[i].cmd + "'>");
            html.push(item.commands[i].name);
            html.push("</span>");
        }
        html.push("</div>");
        if (Setting.show_command && Combat.STATUS[item.id]) {
            Process.itemsElement.find(".item-commands").remove();
            var roomitem = Combat.STATUS[item.id].elem.parent();
            $(html.join("")).insertAfter(roomitem);

            return Process.message.scroll2end();
        }
        ReceiveMessage(html.join(""));
    },
    actions: function (data) {
        Combat.ShowActions(data);
    }, cmds: function (data) {
        if (!data.items && !data.html) return;
        // 浮窗模式：把触发它的说明文字/富内容搬进浮窗，而不是占着主消息流
        if (Setting.float_dialog == 1) {
            // 说明文字：服务端给了 text 就用它；否则回退到「刚刚触发这条菜单的消息」。
            // 回退必须带新鲜度判断——_lastMessageText 是玩家收到的最后一条消息
            // （可能是聊天/战斗/别人的喊话），若中间插入了别的消息，直接采用会让
            // 浮窗顶部显示无关的旧文字。宁可不显示，也不要显示错的。
            var pass;
            if (data.text !== undefined) {
                pass = data.text;
            } else {
                var fresh = (Process._lastMessageTime && (Date.now() - Process._lastMessageTime) <= 800);
                pass = fresh ? (Process._lastMessageText || "") : "";
            }
            Process._lastMessageText = "";
            Process._lastMessageTime = 0;
            // 服务端明确给了 text（含空串）说明它已把内容交给我们，就不再按行数删消息队列
            // ——float_archive 那套「按行数 pop」依赖行数对齐，是脆弱的；仅在回退路径上仍需要它
            if (data.text === undefined && Setting.float_archive == 1 && pass) {
                var lines = String(pass).split("\n");
                for (var li = 0; li < lines.length; li++) {
                    Process.message.pop();
                }
            }
            FloatDialog.add(pass, data);
            return;
        }
        // 非浮窗模式：自创武学、重铸等面板的正文在 feedback/text/html 里，items 可能为空，
        // 只渲染 items 会输出一个空 div。这里按浮窗同样的顺序把它们输出到主消息流。
        var items = Array.isArray(data.items) ? data.items : (data.items ? [data.items] : []);
        var body = [];
        if (data.feedback) body.push(chatText(data.feedback));
        if (data.text) body.push(chatText(data.text));
        if (data.html) {
            var block = String(data.html);
            // 有 items 时 html 里往往带着同一批按钮，剥掉避免重复（与浮窗一致）
            if (items.length) block = block.replace(/<span\b[^>]*\bcmd="[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
            body.push(block);
        }
        if (body.length) ReceiveMessage(body.join("<br>"));
        if (!items.length) return;
        data.items = items;
        var html = ["<div class='item-commands'>"];
        for (var i = 0; i < data.items.length; i++) {
            var it = data.items[i];
            if (it.group) html.push("<div class='command-group-title'>", it.group, "</div>");
            // 空 cmd 不是可点按钮（点了服务器会回「什么？」），直接跳过
            if (!it.cmd) {
                if (it.text) html.push(it.text);
                if (it.br) html.push("<br>");
                continue;
            }
            html.push("<span cmd='" + it.cmd + "'>");
            html.push(it.name);
            html.push("</span>");
            if (it.text) html.push(it.text);
            if (it.br) html.push("<br>");
        }
        html.push("</div>");
        ReceiveMessage(html.join(""));
    }
    , map: function (x) {
        MAP.SetMapBuffer(x.map, x.path);
        MAP.ShowMap(x.map, x.path);
    }, updatemap: function (x) {
        MAP.UpdateMap(x.map, x);
    }, dialog: function (data) {
        Dialog.receive(data.dialog, data);
    }, relation: function (data) {
        Dialog.relation.onData(data);
    }, team_data: function (data) {
        Dialog.team.onData(data);
    }, party: function (data) {
        Dialog.party.onData(data);
    }, sc: function (data) {
        Combat.StatusChanged(data);
    }, perform: function (data) {
        Combat.ShowPFM(data);
    }, disobj: function (data) {
        Combat.DisObj(data);
    }, changepfm: function (data) {
        Combat.ChangeDistime(data);
    }, clearDistime: function (data) {
        Combat.ClearDistime(data);
    }, pay: function (data) {
        if (data.pay === 3) {//wxqr
            ReceiveMessage('<yel>请打开微信扫描二维码支付：</yel>\n');
            let div = $('<div style="width:100%;text-align:center;"><img style="border:solid 2px #808088" src="' + data.url + '"/></div>');

            div.children(0).on('load', function () {
                ReceiveMessage("");
            });
            MessagePage.append(div);
        } else {
            window.location.href = data.url;
        }
    },
    dispfm: function (data) {

        Combat.On_Perform(data);
    }, status: function (data) {
        Combat.StatusItemChanged(data);
    },
    combat: function (data) {
        if (data.start) {
            if (Setting.auto_showcombat == 1 && !Combat.IsShow) {
                Combat.Show();
            }
            if (Setting.auto_hideroom == 1) {
                if (!Setting.hide_roomdesc) {
                    $(".room_desc").hide();
                }
            }
        }
        if (data.end) {
            if (Setting.auto_hideroom == 1) {
                if (!Setting.hide_roomdesc) {
                    $(".room_desc").show();
                }
            }
        }
    }, state: function (data) {
        if (data && data.state) {

            var ary = ["<span class='title'>" + data.state + "</span>"];
            if (data.commands) {
                // ary.push("<div class='item-commands'>");
                for (var i = 0; i < data.commands.length; i++) {
                    ary.push("<span class='item-command' cmd='" + data.commands[i].cmd + "'>");
                    ary.push(data.commands[i].name);
                    ary.push("</span>");
                }
                // ary.push("</div>");
            }
            $(".state-bar").html(ary.join("")).css('visibility', 'visible');

            if (data.no_stop) $(".state-tool").hide();
            else $(".state-tool").show();
            Process.states = data.desc;
            if (Process.timer) clearInterval(Process.timer);
            if (Process.states && Process.states.length) {
                if (typeof Process.states == "string") {
                    Process.states = [Process.states];
                }
                Process.timer = setInterval(Process.updatestate, data.interval || 5000);
            }
        } else {
            $(".state-bar").empty().css('visibility', 'hidden');
            $(".state-tool").hide();
            clearInterval(Process.timer);
        }
    }, updatestate: function () {
        if (Process.states && isConnected()) {
            var length = Process.states.length;
            ReceiveMessage(Process.states[parseInt(Math.random() * length)]);
        }
    }, die: function (data) {
        if (data.relive) {
            return Process.state({});
        }
        Process.state({
            state: "<hiw>你已经死亡：</hiw>",
            no_stop: true,
            desc: ["<blk>一股阴冷的气息包围着你。</blk>", "<blu>朦胧中你好像听到有人在喊：过来吧，过来吧！</blu>"],
            commands: data.commands,
            interval: 12000
        });

    }, warn: function (data) {
        Warn.Show(data);
    }, msg: function (data) {
        var msg = Dialog.channel.createElement(data, !Setting.no_spmsg);
        if (!msg) return;
        if (!Setting.no_spmsg) {
            Process.channel.push(msg);
            Process.channel.scroll2end();
        } else {
            ReceiveMessage(msg);
        }
    }, addAction: function (data) {
        Combat.AddObj(data.id, data.name, data.distime);
    }, removeAction: function (data) {
        Combat.DisObj({ id: data.id, remove: true });
    }
};
function ReceiveMessage(x) {
    if (x == null || !Process.message) return;
    if (x instanceof Error) x = x.message;
    if (typeof x !== "string") x = String(x);
    Process.message.push(x);
    Process.message.scroll2end();
}


export default Process;
