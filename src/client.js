
import * as Util from './utils/util.js';
import { WS_HOST, WS_PORT } from './server-config.js';

let IsConnecting = false;
let ChangeServer = false;
let ReconnectTimer = null;
let RECONNECT_TIMEOUT = 15000; // 15 seconds to complete reconnection
let LastPlayerId = null; // 断线前保留，重连时自动登录用
export let GameClient = null;
export let SelectedServer = null;
export let LastCommand = null;
const SessionKey = "u";
const SessionToken = "p";

export function connectServer(server, pid) {
    if (IsConnecting) return;

    SelectedServer = server;
    console.log("重新连接", GameClient == null ? "未连接" : "已连接");
    closeServer();

    // 重连超时保护：N秒内没收到 login 响应则强制刷新页面
    if (ReconnectTimer) clearTimeout(ReconnectTimer);
    ReconnectTimer = setTimeout(function() {
        console.log("重连超时，刷新页面");
        location.reload();
    }, RECONNECT_TIMEOUT);
    GameClient = new WSClient(server.ip, server.port, server.id || server.ID);
    IsConnecting = true;
    GameClient.OnError = (err) => {
        IsConnecting = false;
        if (err) {
            if (err.isTrusted) err = "服务器没有响应，请稍后重试";
            showLoader("<strong>连接失败：</strong>" + err + "");
        }
    }
    GameClient.OnConnect = () => {
        IsConnecting = false;
        console.log("[reconnect] OnConnect pid=", pid, "Process.player=", Process.player, "LastPlayerId=", LastPlayerId);
        if (!pid && !Process.player && !LastPlayerId) {
            showLoader('正在获取角色列表...');
            SendCommand(Util.GetUserCookie(SessionKey) + " " + Util.GetUserCookie(SessionToken));
        } else if (!pid && LastPlayerId) {
            // 断线重连：用保存的ID自动登录
            console.log("[reconnect] 自动登录 LastPlayerId=", LastPlayerId);
            SendCommand(Util.GetUserCookie(SessionKey) + " " + Util.GetUserCookie(SessionToken) + " " + LastPlayerId);
        } else {
            if (pid) {
                SendCommand(Util.GetUserCookie(SessionKey) + " " + Util.GetUserCookie(SessionToken) + " " + pid + " " + server.ID);
            } else {
                SendCommand(Util.GetUserCookie(SessionKey) + " " + Util.GetUserCookie(SessionToken) + " " + Process.player);
            }
        }
    }

    GameClient.OnClose = () => {
        IsConnecting = false;
        if (ChangeServer) {
            ChangeServer = false;
            return;
        }
        if (GameClient.Connected()) return;

        if (Process.player) {
            // 保存玩家ID用于自动重连，但要完全重置UI状态避免新旧数据冲突
            LastPlayerId = Process.player;
            Process.player = null;
            Process.cur_room = null;
            Process.room_path = null;
            Process.room_exits = null;
            Process.clear();
            // 强制清理所有 dialog 状态，防止残留导致元素引用失效
            Dialog.isShow = false;
            Dialog.curItem = null;
            // 清空对话框内容，避免残留 DOM 引用
            var dc = $(".dialog>.dialog-content");
            if (dc.length) dc.empty();
            $(".dialog>.dialog-footer").empty();
            $(".content-room").removeClass("hide");
            $(".dialog").addClass("hide");
            document.querySelectorAll('.dialog-backdrop, .modal-backdrop, .overlay').forEach(function(el) {
                el.remove();
            });
            // 清理房间显示
            $(".room-name").html("");
            $(".room_desc").html("");
            $(".room_items").html("");
            $(".state-bar").empty().css('visibility', 'hidden');
            ReceiveMessage("<red>你的连接中断了，点击任意按钮重新连线...</red>");
        } else {
            setTimeout(() => {
                hide2show($("#slist_panel"));
            }, 3000);
        }
    }
    GameClient.OnData = ReceiveData;
    GameClient.OnMessage = ReceiveMessage;
    GameClient.Connect();
}

export function isConnected() {
    if (!GameClient) return false;
    return GameClient.Connected();
}

export function SendCommand(cmd) {
    if (IsConnecting) return;
    if (!GameClient || !GameClient.Connected()) {
        LastCommand = cmd;
        ReceiveMessage("<red>连接中断，正在重新连线...</red>");
        return connectServer(SelectedServer);
    }
    Dialog.extend.record(cmd);
    GameClient.Send(cmd);
}
window.SendCommand = SendCommand;

export function onLogin() {
    // 清除重连超时定时器
    if (ReconnectTimer) {
        clearTimeout(ReconnectTimer);
        ReconnectTimer = null;
    }

    // 登录成功后清除断线前保存的玩家ID和命令
    LastPlayerId = null;
    LastCommand = null;
    // Reset scroll state on reconnect so new messages auto-scroll
    if (Process.message) {
        Process.message.allow_scroll = true;
        Process.message.scroll_button.hide();
    }
    if (Process.channel) {
        Process.channel.allow_scroll = true;
        Process.channel.scroll_button.hide();
    }
    // After reconnect, refresh the currently open dialog to restore its data
    if (Dialog.isShow && Dialog.curItem) {
        var cur = Dialog[Dialog.curItem];
        if (cur === Dialog.pack) {
            cur.isShow = false;
            cur.show();
        } else if (cur === Dialog.skills) {
            cur.isShow = false;
            cur.show();
        }
    }
}

export function ReceiveMessage(x) {
    if (Dialog.extend.message_filter(x)) return;
    Process.message.push(x);
    Process.message.scroll2end();
    Dialog.extend.trigger(x);
}

export function ReceiveData(data) {
    if (Dialog.extend.data_filter(data)) return;
    var func = Process[data.type];
    func && func(data);
    Dialog.extend.process(data);
}

export function closeServer() {
    if (GameClient) {
        // 无论是否已连接都必须调 Destroy——它会设置 onclose=null
        // 防止旧的 onclose 在重连过程中再次触发，导致重复清理界面
        GameClient.Destroy();
    }
    GameClient = null;
}

export function showInputError(inp, msg) {
    $(inp).focus().parent().find(".input-error").remove();
    $("<div class='input-error'>" + msg + "</div>").insertAfter(inp);
}

export function hide2show(elem2, callback) {
    var elem1;
    var p = $(".login-content").children();
    for (var i = 0; i < p.length; i++) {
        if ($(p[i]).css("display") != "none") {
            elem1 = $(p[i]); break;
        }
    }
    if (!elem1) elem1 = $("#login_panel");
    elem1.animate({ opacity: 0 }, "fast", function () {
        elem1.hide();
        if (elem2 == ".container") $(".login-content").hide();
        else $(".login-content").show();
        if (elem2) {
            elem2 = $(elem2);
            elem2.show();
            elem2.css("opacity", "0");
            elem2.animate({ opacity: 1 }, "slow", callback);
        }
    });
}

export function showLoader(msg, elem) {
    var p = $(".login-content").children();
    for (var i = 0; i < p.length; i++) {
        if ($(p[i]).css("display") != "none"
            && !$(p[i]).is(".signinfo")) {
            $(p[i]).hide();
        }
    }
    var loader = $("#loader").css("opacity", 1).show();
    loader.find("#loader_msg").html(msg);
}

let wsindex = 0;
export class WSClient {
    constructor(ip, port, serverId) {
        this.IP = ip;
        this.Port = port;
        this.ServerId = serverId;
    }
    Connect(callback) {
        try {
            var ip, port;
            if (WS_HOST && WS_PORT) {
                // APK mode
                ip = WS_HOST;
                port = WS_PORT;
            } else {
                // Web mode: route through web server proxy
                ip = location.hostname;
                port = location.port || (location.protocol == "https:" ? 443 : 80);
            }
            var pol = location.protocol == "http:" ? "ws" : "wss";
            var path = this.ServerId ? ('/ws/' + this.ServerId) : '';
            this.ws = new WebSocket(pol + '://' + ip + ':' + port + path);
            this.ws.onopen = this.OnConnect;
            this.ws.onclose = this.OnClose.bind(this);
            this.ws.onerror = this.OnError;
            this.ws.onmessage = this.OnReceived.bind(this);
            this.index = wsindex++;
        } catch (e) {
            this.OnError && this.OnError(e);
        }
    }
    OnReceived(evt) {
        if (!evt || !evt.data) return;
        var data = evt.data;
        if (data[0] == '{' || data[0] == '[') {
            var func = new Function("return " + data + ";");
            this.OnData(func());
        } else {
            this.OnMessage(data);
        }
    }
    Send(text) {
        try {
            this.ws.send(text);
        } catch (e) {
            ReceiveMessage(e);
        }
    }
    Destroy() {
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
        }
    }
    Close() {
        this.ws.close();
    }
    Connected() {
        return this.ws && this.ws.readyState == 1;
    }
}
