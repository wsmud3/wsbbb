
import { Page } from '../base/page.js';
import API from '../api.js';
import * as Client from '../client.js';
import Util from '../utils/util.js';
import { Confirm } from '../confirm.js';
import { WS_HOST, WS_PORT } from '../server-config.js';

let SERVERS = null;

class ServerPage extends Page {
  constructor() {
    super();
    this.template = `
    <div id="slist_panel" class="mypanel" style="display:none">
            <ul>
                <li class="panel_item active">选择你要登录的游戏</li>
                <li class="content">
                    <ul class="server-list"></ul>
                </li>
                <li class="panel_item" command="SelectServer"><span class="glyphicon glyphicon-ok"></span><span
                        style="margin-left:0.5rem">选择服务器</span></li>
                <li class="panel_item" command="ToUpdate"><span class="glyphicon glyphicon-edit"></span><span
                        style="margin-left:0.5rem">修改密码</span></li>
                <li class="panel_item" command="BindPhone"><span class="glyphicon glyphicon-lock"></span><span
                        style="margin-left:0.5rem">绑定手机</span></li>
                <li class="panel_item" command="ReLogin"><span class="glyphicon glyphicon-chevron-left"></span><span
                        style="margin-left:0.5rem">返回登录</span></li>
            </ul>
        </div>
`;
  }

  showServers() {
    if (!SERVERS) {
      Client.showLoader("正在获取服务器列表");
      API.GetServer((x) => {
        if (!x || typeof x == "string" || !Array.isArray(x)) {
          Client.showInputError("#login_pwd", "获取服务器列表出错");
          Client.hide2show("#login_panel");
          return;
        }
        SERVERS = x;
        this.displayServer();
        this.showServers();
      });
      return;
    }
    var x = SERVERS;
    if (!x || !x.length) {
      Client.hide2show("#login_panel");
      Client.showInputError("#login_pwd", "获取服务器列表出错");
    } else {
      var sel_ser = Util.GetUserCookie("s");
      var sel_item = sel_ser ? SERVERS[sel_ser] : (x.length == 1 ? SERVERS[0] : null);
      if (sel_item) {
        Client.showLoader("正在连接服务器");
        return Client.connectServer(sel_item);
      }
      Client.hide2show("#slist_panel");
    }
  }

  selectServer() {
    if (!SERVERS) return;
    var index = parseInt($(".server-list>.select").attr("index"));
    if (!(index >= 0 && index < SERVERS.length)) {
      return Confirm.Show({ content: "你没有选择要连接的服务器。" });
    }
    var item = SERVERS[index];
    if (!item) {
      Confirm.Show({ content: "你没有选择要连接的服务器。" });
    }
    Client.showLoader("正在连接服务器");
    Client.connectServer(item);
    Util.SetCookie("s", index);
  }

  displayServer() {
    if (!SERVERS) return;
    var islocal = false;
    var istest = false;
    if (WS_HOST) {
      // APK模式：覆盖服务器IP为远程地址，确保移动端可连接
      for (var k = 0; k < SERVERS.length; k++) {
        SERVERS[k].ip = WS_HOST;
        SERVERS[k].port = parseInt(WS_PORT) || 80;
      }
      if (!SERVERS.length) {
        SERVERS.push(
          { id: 100, name: "本地测试", ip: WS_HOST, port: parseInt(WS_PORT) || 80, istest: 1 },
          { id: 200, name: "正式服", ip: WS_HOST, port: parseInt(WS_PORT) || 80, istest: 0 }
        );
      }
    } else {
      islocal = location.hostname.startsWith('127.0.0.1')
        || location.hostname.startsWith('localhost');
      istest = location.search.startsWith('?test');
      if (islocal && !SERVERS.length) {
        SERVERS.push(
          { id: 100, name: "本地测试", ip: "127.0.0.1", port: 31300, istest: 1 },
          { id: 200, name: "正式服", ip: "127.0.0.1", port: 31301, istest: 0 }
        );
      } else if (!islocal && !SERVERS.length) {
        var wsPort = location.port || (location.protocol == "https:" ? 443 : 80);
        SERVERS.push({ id: 200, name: "远程服务器", ip: location.hostname, port: wsPort, istest: 0 });
      }
    }
    var html = [];
    var named = "武神传说2";
    for (var i = 0; i < SERVERS.length; i++) {
      // 私服模式：显示所有服务器，不做 istest 过滤
      html.push("<li class='role-item");
      if (i == 0) html.push(" select");
      html.push("' index='" + i + "'>");
      html.push(named);
      html.push("&nbsp;&nbsp;");
      html.push(SERVERS[i].name);
      if (SERVERS[i].isdef) {
        html.push("<span style='color:red;font-size:0.5rem;line-height:2rem;height:2rem;'>&nbsp;（推荐）</span>");
      }
      html.push("</li>");
    }

    $(".server-list").html(html.join("")).on("click", 'li', function () {
      var elem = $(this);
      if (elem.is(".select")) return;
      elem.parent().find(".select").removeClass("select");
      elem.addClass("select");
    });
  }
}

export default ServerPage;
export { SERVERS };
