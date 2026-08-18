
import DialogScore from './score.js';
import DialogMap from './map.js';
import DialogKeys from './keys.js';
import DialogSetting from './setting.js';
import DialogExtend from './extend.js';
import DialogChannel from './channel.js';
import DialogPack from './packet.js';
import DialogSkills from './skills.js';
import DialogTasks from './tasks.js';
import DialogShop from './shop.js';
import DialogMessage from './message.js';
import DialogStats from './stats.js';
import DialogJh from './jh.js';
import DialogRelation from './relation.js';
import DialogTeam from './team.js';
import DialogParty from './party.js';
import DialogTrade from './trade.js';
import DialogEvents from './events.js';
import DialogPm from './paimai.js';
import DialogPack2 from './packet2.js';
import DialogMaster from './master.js';
import DialogList from './list.js';
import DialogAutoPfm from './auto_pfm.js';
import DialogZc from './zc.js';



const Dialog = {
    isShow: false,
    curItem: null,
    score: DialogScore,
    map: DialogMap,
    keys: DialogKeys,
    setting: DialogSetting,
    extend: DialogExtend,
    channel: DialogChannel,
    pack: DialogPack,
    skills: DialogSkills,
    tasks: DialogTasks,
    shop: DialogShop,
    message: DialogMessage,
    stats: DialogStats,
    jh: DialogJh,
    relation: DialogRelation,
    team: DialogTeam,
    party: DialogParty,
    trade: DialogTrade,
    events: DialogEvents,
    pm: DialogPm,
    pack2: DialogPack2,
    master: DialogMaster,
    list: DialogList,
    auto_pfm: DialogAutoPfm,
    zc: DialogZc,

    show: function (name, data) {
        console.log("[DIALOG] show name=" + name + " hasData=" + !!data + " isShow=" + this.isShow + " curItem=" + this.curItem + " stack=" + new Error().stack.split("\n")[2].trim());
        if (!name) return;
		// Toggle: clicking the same dialog button without data closes it
		if (!data && this.isShow && name === this.curItem) {
			return this.hide();
		}
        const dialog = this[name];
        if (!dialog) throw new Error('没有' + name);
        if (!dialog.created) {
            dialog.init();
            dialog.created = true;
        }
        // Prevent background data updates from hijacking the currently open
        // dialog (e.g. buying items, dungeon sweep, auto-store, learning skills,
        // events badge updates). These are silent data changes that should not
        // switch panels.
        if (data && this.isShow && name != this.curItem
            && (name === "pack" || name === "pack2" || name === "list" || name === "skills" || name === "jh" || name === "events" || name === "message" || name === "tasks")) {
            // 注意：与下方 139 行的 hasInteractive 保持一致，纯 items 更新
            // 不算交互数据，否则背包刷新（任务奖励/登录刷新等）会劫持
            // 当前打开的对话框，把用户切换到空白面板
            var hasInteractive = data.rcdesc || data.jldesc || data.xqdesc || data.desc;
            // tasks 的 desc 推送是任务完成的后台更新（服务端 task.js 下发），
            // 不是用户主动查看，且 tasks 没有 init_element 方法，带 desc 强开面板会崩溃
            if (!hasInteractive || name === "tasks") {
                dialog.onData(data);
                return;
            }
            // Redirect recast/jinglian/xiangqian to message area instead of switching dialog
            if ((name === "pack" || name === "pack2") && (data.rcdesc || data.jldesc || data.xqdesc)) {
                dialog.onData(data);
                return;
            }
        }
        // When no dialog is open, silently process ALL server-pushed data
        // without opening a panel. Dialog should only open on explicit user
        // button clicks, never from automated server data pushes (e.g. pack
        // refresh on login, skill updates, event badge changes).
        if (data && !this.isShow
            && (name === "pack" || name === "pack2" || name === "list" || name === "skills" || name === "jh" || name === "events" || name === "message" || name === "tasks")) {
            dialog.onData(data);
            return;
        }
        // Forward skills desc data to master dialog if it's currently open,
        // avoiding panel switch that would break the master skill view
        if (data && this.isShow && name === "skills" && data.desc
            && this.curItem === "master" && this.master && this.master.isShow) {
            this.master.onData(data);
            return;
        }
        // Forward pack item desc data to list dialog if it's open,
        // avoiding panel switch that would show an empty backpack
        if (data && this.isShow && name === "pack" && (data.desc || data.rcdesc || data.jldesc || data.xqdesc)
            && this.curItem === "list" && this.list && this.list.isShow) {
            this.pack.onData(data);
            return;
        }
        // Ensure dialog is open, but skip pack fetch when data is provided
        if (!this.isShow || name != this.curItem) {
            // Prevent item-only pack updates (e.g. task rewards) from
            // hijacking the active dialog to an empty pack panel
            if (data && name === "pack" && data.name && !data.items
                && !data.desc && !data.rcdesc && !data.jldesc && !data.xqdesc
                && this.curItem && this.curItem !== "pack") {
                this.pack.onData(data);
                return;
            }
            if (this.curItem && name != this.curItem) {
                Dialog[Dialog.curItem].close && Dialog[Dialog.curItem].close();
                Dialog[Dialog.curItem].isShow = false;
                Dialog.contentElement.empty();
                Dialog.footer("");
                // Ensure init runs fully: reset isShow since the previous
                // dialog was closed directly without going through Dialog.close()
                this.isShow = false;
            }
            this.init();
            this.curItem = name;
            if (!data) {
                dialog.show(null);
            }
            Process.message.scroll2end();
        }
        if (data) {
            // Only auto-open dialog for interactive content (rcdesc/jldesc/xqdesc/desc)
            // Simple item updates should NOT open the dialog
            var hasInteractive = data.rcdesc || data.jldesc || data.xqdesc || data.desc;
            if (!dialog.isShow && hasInteractive) {
                dialog.isShow = true;
                dialog.init_element();
                dialog.element.appendTo(Dialog.contentElement);
            }
            // For non-interactive data, only call onData if dialog is already shown
            // or if the data doesn't need interactive display (simple updates)
            if (dialog.isShow || !hasInteractive) {
                dialog.onData(data);
            }
        }
    },    select: function (name) {
        if (this.isShow && name == this.curItem) return this.hide();
        if (this.curItem && name != this.curItem) {
            Dialog[Dialog.curItem].close && Dialog[Dialog.curItem].close();
            Dialog[Dialog.curItem].isShow = false;
            Dialog.contentElement.empty();
            Dialog.footer("");
            this.isShow = false;
        }
        this.init();
        this.curItem = name;
    },
    init: function () {
        console.log("[DIALOG] init called, isShow=" + this.isShow + " stack=" + new Error().stack.split("\n")[2].trim());
        if (this.isShow) return;
        if (!this.isInit) {
            this.contentElement = $(".dialog>.dialog-content");
            this.titleElement = $(".dialog>.dialog-header>.dialog-title");
            this.iconElement = $(".dialog>.dialog-header>.dialog-icon");
            this.footerElement = $(".dialog>.dialog-footer")
                .on("click", ".footer-item", Dialog.footerClick);
            this.hiddenElement = $(".hidden-item");
            this.element = $(".dialog");
            $(".dialog>.dialog-header>.dialog-close").on("click", function () {
                Dialog.hide();
            });
            this.isInit = true;
        }
        $(".content-room").addClass("hide");
        this.element.removeClass("hide");
        this.isShow = true;
    },
    hide: function () {
        // 注意：本函数会被 .on("click", function(){ Dialog.hide(); }) 间接绑定，
        // 此时 this 是 Dialog 对象（方法调用样式），但为了安全仍显式用 Dialog.curItem
        var cur = Dialog.curItem;
        // 消息详情页：X 返回列表而非关闭对话框
        if (cur === "message" && Dialog.message && Dialog.message._inDetail) {
            Dialog.message.hide_detail();
            return;
        }
        if (cur && Dialog[cur] && Dialog[cur].hide) {
            if (Dialog[cur].hide() === false) return;
        }
        Dialog.close();
    },
    footerClick: function () {
        var elem = $(this);
        if (elem.is(".select")) return;
        var cmd = elem.attr("for");
        elem.parent().find(".footer-item.select").removeClass("select");
        elem.addClass("select");
        Dialog[Dialog.curItem].footerChanged(cmd, elem);
    },
    title: function (title) {
        Dialog.titleElement.html(title);
    },
    icon: function (css) {
        this.iconElement.attr("class", "dialog-icon glyphicon glyphicon-" + css);
    },
    footer: function (html) {
        html ? this.footerElement.html(html) : this.footerElement.empty();
    },
    close: function () {
        if (!Dialog.isShow) return;
        // 同 hide()：不依赖 this（可能被 DOM 事件调用），显式用 Dialog.curItem
        var cur = Dialog.curItem;
        if (cur) {
            Dialog[cur].close && Dialog[cur].close();
            Dialog[cur].isShow = false;
        }
        Dialog.isShow = false;
        Dialog.curItem = null;
        $(".content-room").removeClass("hide");
        Dialog.element.addClass("hide");
    },
    injectStyle: function (css) {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);
    },
};

export default Dialog;
