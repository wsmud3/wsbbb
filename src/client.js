
import * as Util from './utils/util.js';
import { WS_HOST, WS_PORT } from './server-config.js';
import JSON5 from 'json5';

let IsConnecting = false;
let ChangeServer = false;
let ReconnectTimer = null;
let ServerListTimer = null;
let ConnectionGeneration = 0;
let RECONNECT_TIMEOUT = 15000; // 15 seconds to complete reconnection
let LastPlayerId = null; // 断线前保留，重连时自动登录用
export let GameClient = null;
export let SelectedServer = null;
export let LastCommand = null;
const SessionKey = "u";
const SessionToken = "p";

export function connectServer(server, pid) {
    if (IsConnecting) return;
    if (!server || !server.ip) {
        IsConnecting = false;
        ReceiveMessage("<red>璇峰厛閫夋嫨鏈嶅姟鍣紝鍐嶈繘琛岀幇鎴忔搷浣溿€?/red>");
        return;
    }

    SelectedServer = server;
    const generation = ++ConnectionGeneration;
    if (ServerListTimer) {
        clearTimeout(ServerListTimer);
        ServerListTimer = null;
    }
    console.log("重新连接", GameClient == null ? "未连接" : "已连接");
    closeServer();

    // 重连超时保护：N秒内没收到 login 响应则强制刷新页面
    if (ReconnectTimer) clearTimeout(ReconnectTimer);
    ReconnectTimer = setTimeout(function() {
        if (generation !== ConnectionGeneration) return;
        ReconnectTimer = null;
        console.log("重连超时，刷新页面");
        location.reload();
    }, RECONNECT_TIMEOUT);
    const client = new WSClient(server.ip, server.port, server.id || server.ID);
    GameClient = client;
    IsConnecting = true;
    const isCurrent = () => generation === ConnectionGeneration && GameClient === client;
    client.OnError = (err) => {
        if (!isCurrent()) return;
        IsConnecting = false;
        if (ReconnectTimer) {
            clearTimeout(ReconnectTimer);
            ReconnectTimer = null;
        }
        if (err) {
            if (err.isTrusted) err = "服务器没有响应，请稍后重试";
            showLoader("<strong>连接失败：</strong>" + err + "");
        }
    }
    client.OnConnect = () => {
        if (!isCurrent()) return;
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

    client.OnClose = () => {
        if (!isCurrent()) return;
        IsConnecting = false;
        if (ChangeServer) {
            ChangeServer = false;
            return;
        }
        if (client.Connected()) return;

        if (ReconnectTimer) {
            clearTimeout(ReconnectTimer);
            ReconnectTimer = null;
        }

        if (Process.player) {
            // 保存玩家ID用于自动重连，但要完全重置UI状态避免新旧数据冲突
            LastPlayerId = Process.player;
            Process.player = null;
            Process.cur_room = null;
            Process.room_path = null;
            Process.room_exits = null;
            Process.clear();
            // 公共外壳和子对话框的状态必须一起重置；只清 DOM
            // 会留下 child.isShow=true 和已脱离 DOM 的 element 引用。
            Dialog.reset();
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
            if (ServerListTimer) clearTimeout(ServerListTimer);
            ServerListTimer = setTimeout(() => {
                if (generation !== ConnectionGeneration || GameClient !== client) return;
                hide2show($("#slist_panel"));
            }, 3000);
        }
    }
    client.OnData = ReceiveData;
    client.OnMessage = ReceiveMessage;
    client.Connect();
}

export function isConnected() {
    if (!GameClient) return false;
    return GameClient.Connected();
}

export function SendCommand(cmd) {
    if (IsConnecting) return;
    if (!GameClient || !GameClient.Connected()) {
        LastCommand = cmd;
        if (!SelectedServer) return ReceiveMessage("<red>璇峰厛閫夋嫨鏈嶅姟鍣紝鍐嶈繘琛岀幇鎴忔搷浣溿€?/red>");
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
    if (ServerListTimer) {
        clearTimeout(ServerListTimer);
        ServerListTimer = null;
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
}

export function ReceiveMessage(x) {
    if (x == null || !Process.message) return;
    if (x instanceof Error) x = x.message;
    if (typeof x !== "string") x = String(x);
    try {
        if (Dialog.extend.message_filter(x)) return;
    } catch (e) {
        console.error("[message] filter failed", e);
    }
    Process.message.push(x);
    Process.message.scroll2end();
    try {
        Dialog.extend.trigger(x);
    } catch (e) {
        console.error("[message] extension failed", e);
    }
}

export function ReceiveData(data) {
    if (!data || typeof data !== "object") return;
    try {
        if (Dialog.extend.data_filter(data)) return;
    } catch (e) {
        console.error("[data] filter failed", e);
    }
    var func = Object.prototype.hasOwnProperty.call(Process, data.type)
        ? Process[data.type] : null;
    if (typeof func === "function") {
        try {
            func(data);
        } catch (e) {
            console.error("[data] handler failed", data.type, e);
        }
    }
    try {
        Dialog.extend.process(data);
    } catch (e) {
        console.error("[data] extension failed", e);
    }
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
        if (!evt || evt.data == null) return;
        var raw = evt.data;
        if (typeof raw !== "string") {
            try {
                if (this.OnData) this.OnData(raw);
            } catch (e) {
                console.error("[ws] packet handler failed", e);
            }
            return;
        }
        var text = raw.trim();
        if (!text) return;
        if (text[0] == '{' || text[0] == '[') {
            var packet;
            try {
                // 兼容服务端历史的未加引号键/单引号包，同时绝不执行数据包中的代码。
                try { packet = JSON.parse(text); }
                catch (jsonError) { packet = JSON5.parse(text); }
            } catch (e) {
                console.error("[ws] invalid server packet", e);
                return;
            }
            if (!packet || typeof packet !== "object") return;
            try {
                if (this.OnData) this.OnData(packet);
            } catch (e) {
                console.error("[ws] packet handler failed", e);
            }
        } else if (this.OnMessage) {
            try {
                this.OnMessage(raw);
            } catch (e) {
                console.error("[ws] text handler failed", e);
            }
        }
    }
    Send(text) {
        try {
            this.ws.send(text);
        } catch (e) {
            ReceiveMessage(e instanceof Error ? e.message : e);
        }
    }
    Destroy() {
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
        }
    }
    Close() {
        if (this.ws) this.ws.close();
    }
    Connected() {
        return this.ws && this.ws.readyState == 1;
    }
}
