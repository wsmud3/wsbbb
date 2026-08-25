
import * as Util from './utils/util.js';
import { WS_HOST, WS_PORT } from './server-config.js';

let IsConnecting = false;
let ChangeServer = false;
let ReconnectTimer = null;
let ServerListTimer = null;
let ConnectionGeneration = 0;
let RECONNECT_TIMEOUT = 15000; // 15 seconds to complete reconnection
let LastPlayerId = null; // 鏂嚎鍓嶄繚鐣欙紝閲嶈繛鏃惰嚜鍔ㄧ櫥褰曠敤
export let GameClient = null;
export let SelectedServer = null;
export let LastCommand = null;
const SessionKey = "u";
const SessionToken = "p";

export function connectServer(server, pid) {
    if (IsConnecting) return;
    if (!server || !server.ip) {
        IsConnecting = false;
        ReceiveMessage("<red>鐠囧嘲鍘涢柅澶嬪閺堝秴濮熼崳顭掔礉閸愬秷绻樼悰宀€骞囬幋蹇旀惙娴ｆ嚎鈧?/red>");
        return;
    }

    SelectedServer = server;
    const generation = ++ConnectionGeneration;
    if (ServerListTimer) {
        clearTimeout(ServerListTimer);
        ServerListTimer = null;
    }
    console.log("閲嶆柊杩炴帴", GameClient == null ? "鏈繛鎺? : "宸茶繛鎺?);
    closeServer();

    // 閲嶈繛瓒呮椂淇濇姢锛歂绉掑唴娌℃敹鍒?login 鍝嶅簲鍒欏己鍒跺埛鏂伴〉闈?
    if (ReconnectTimer) clearTimeout(ReconnectTimer);
    ReconnectTimer = setTimeout(function() {
        if (generation !== ConnectionGeneration) return;
        ReconnectTimer = null;
        console.log("閲嶈繛瓒呮椂锛屽埛鏂伴〉闈?);
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
            if (err.isTrusted) err = "鏈嶅姟鍣ㄦ病鏈夊搷搴旓紝璇风◢鍚庨噸璇?;
            showLoader("<strong>杩炴帴澶辫触锛?/strong>" + err + "");
        }
    }
    client.OnConnect = () => {
        if (!isCurrent()) return;
        IsConnecting = false;
        console.log("[reconnect] OnConnect pid=", pid, "Process.player=", Process.player, "LastPlayerId=", LastPlayerId);
        if (!pid && !Process.player && !LastPlayerId) {
            showLoader('姝ｅ湪鑾峰彇瑙掕壊鍒楄〃...');
            SendCommand(Util.GetUserCookie(SessionKey) + " " + Util.GetUserCookie(SessionToken));
        } else if (!pid && LastPlayerId) {
            // 鏂嚎閲嶈繛锛氱敤淇濆瓨鐨処D鑷姩鐧诲綍
            console.log("[reconnect] 鑷姩鐧诲綍 LastPlayerId=", LastPlayerId);
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
            // 淇濆瓨鐜╁ID鐢ㄤ簬鑷姩閲嶈繛锛屼絾瑕佸畬鍏ㄩ噸缃甎I鐘舵€侀伩鍏嶆柊鏃ф暟鎹啿绐?
            LastPlayerId = Process.player;
            Process.player = null;
            Process.cur_room = null;
            Process.room_path = null;
            Process.room_exits = null;
            Process.clear();
            // 鍏叡澶栧３鍜屽瓙瀵硅瘽妗嗙殑鐘舵€佸繀椤讳竴璧烽噸缃紱鍙竻 DOM
            // 浼氱暀涓?child.isShow=true 鍜屽凡鑴辩 DOM 鐨?element 寮曠敤銆?
            Dialog.reset();
            document.querySelectorAll('.dialog-backdrop, .modal-backdrop, .overlay').forEach(function(el) {
                el.remove();
            });
            // 娓呯悊鎴块棿鏄剧ず
            $(".room-name").html("");
            $(".room_desc").html("");
            $(".room_items").html("");
            $(".state-bar").empty().css('visibility', 'hidden');
            ReceiveMessage("<red>浣犵殑杩炴帴涓柇浜嗭紝鐐瑰嚮浠绘剰鎸夐挳閲嶆柊杩炵嚎...</red>");
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
        if (!SelectedServer) return ReceiveMessage("<red>鐠囧嘲鍘涢柅澶嬪閺堝秴濮熼崳顭掔礉閸愬秷绻樼悰宀€骞囬幋蹇旀惙娴ｆ嚎鈧?/red>");
        ReceiveMessage("<red>杩炴帴涓柇锛屾鍦ㄩ噸鏂拌繛绾?..</red>");
        return connectServer(SelectedServer);
    }
    Dialog.extend.record(cmd);
    GameClient.Send(cmd);
}
window.SendCommand = SendCommand;

export function onLogin() {
    // 娓呴櫎閲嶈繛瓒呮椂瀹氭椂鍣?
    if (ReconnectTimer) {
        clearTimeout(ReconnectTimer);
        ReconnectTimer = null;
    }
    if (ServerListTimer) {
        clearTimeout(ServerListTimer);
        ServerListTimer = null;
    }

    // 鐧诲綍鎴愬姛鍚庢竻闄ゆ柇绾垮墠淇濆瓨鐨勭帺瀹禝D鍜屽懡浠?
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
        // 鏃犺鏄惁宸茶繛鎺ラ兘蹇呴』璋?Destroy鈥斺€斿畠浼氳缃?onclose=null
        // 闃叉鏃х殑 onclose 鍦ㄩ噸杩炶繃绋嬩腑鍐嶆瑙﹀彂锛屽鑷撮噸澶嶆竻鐞嗙晫闈?
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
                // The server sends JavaScript object literals (unquoted keys),
                // so JSON.parse is not compatible with all valid packets.
                packet = new Function("return (" + text + ");")();
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

