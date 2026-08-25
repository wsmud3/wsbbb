
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

// These dialogs receive asynchronous model updates from the server. Such an
// update must never be treated as a request to open/switch the public dialog.
// Examples include login pack snapshots, item/title rewards, skill changes,
// event badges and administrator announcements.
const BACKGROUND_DIALOGS = new Set([
    "pack", "skills", "tasks", "jh", "events", "message", "list"
]);

// A few commands intentionally return their first screen as dialog data rather
// than opening a shell before the request. Keep those explicit responses
// working while all other unsolicited dialog data stays in the background.
function shouldOpenFromData(name, data) {
    if (!data) return false;
    if (name === "list") return !!(data.stores || data.selllist);
    if (name === "pack2") return !!data.items;
    // `cha <npc>` returns the mentor skill list as a `master` dialog.  It is
    // an explicit panel-opening response, not a background skill update.
    if (name === "master") return Array.isArray(data.items);
    // Shop updates also use this dialog name, so only its initial sell list
    // may open the panel when no shop is currently selected.
    if (name === "shop") return Array.isArray(data.selllist);
    return name === "trade" || name === "auto_pfm" || name === "zc";
}

const DIALOG_NAMES = [
    "score", "map", "keys", "setting", "extend", "channel", "pack",
    "skills", "tasks", "shop", "message", "stats", "jh", "relation",
    "team", "party", "trade", "events", "pm", "pack2", "master",
    "list", "auto_pfm", "zc"
];

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

    getDialog: function (name) {
        if (!name) return null;
        const dialog = this[name];
        if (!dialog) throw new Error('没有' + name);
        if (!dialog.created) {
            dialog.init();
            dialog.created = true;
        }
        return dialog;
    },

    // Entry point for server type="dialog" packets. Receiving model data is
    // deliberately separate from show(), which represents an actual UI open.
    receive: function (name, data) {
        if (!name || !data) return;
        const dialog = this.getDialog(name);
        const isCurrent = this.isShow && this.curItem === name;

        // A delayed close from a previous command must not close or create the
        // dialog the player is looking at now.
        if (data.close) {
            if (isCurrent) this.hide();
            return;
        }

        // Data for the panel already selected by the player is safe to render.
        if (isCurrent) {
            dialog.onData && dialog.onData(data);
            return;
        }

        // Preserve the handful of server responses whose documented behaviour
        // is to open a new panel (warehouse/shop list, target pack, trade, etc.).
        if (shouldOpenFromData(name, data)) {
            this.show(name, data);
            return;
        }

        // Known background models update caches/badges only. They can no longer
        // make the public header visible or replace another panel.
        if (BACKGROUND_DIALOGS.has(name)) {
            dialog.onData && dialog.onData(data);
            return;
        }

        console.warn("[DIALOG] ignored unsolicited data for " + name);
    },

    show: function (name, data) {
        if (!name) return;
        if (!data && this.isShow && name === this.curItem) return this.hide();

        const dialog = this.getDialog(name);
        if (this.curItem && name !== this.curItem) {
            const current = this[this.curItem];
            current && current.close && current.close();
            if (current) current.isShow = false;
            this.contentElement && this.contentElement.empty();
            this.footerElement && this.footer("");
            this.isShow = false;
        }

        this.init();
        this.curItem = name;
        if (data) dialog.onData && dialog.onData(data);
        else dialog.show && dialog.show(null);
        Process.message.scroll2end();
    },
    select: function (name) {
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
        if (this.isShow && this.element && !this.element.hasClass("hide")) return;
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
        // 同 hide()：不依赖 this（可能被 DOM 事件调用），显式用 Dialog.curItem
        var cur = Dialog.curItem;
        if (cur) {
            Dialog[cur].close && Dialog[cur].close();
            Dialog[cur].isShow = false;
        }
        Dialog.isShow = false;
        Dialog.curItem = null;
        $(".content-room").removeClass("hide");
        if (Dialog.element) Dialog.element.addClass("hide");
        else $(".dialog").addClass("hide");
    },
    // Disconnect/login can arrive while any child dialog owns detached DOM.
    // Reset the public shell and every child flag atomically so the next server
    // snapshot cannot encounter a stale `isShow` reference.
    reset: function () {
        for (let i = 0; i < DIALOG_NAMES.length; i++) {
            const child = this[DIALOG_NAMES[i]];
            if (!child) continue;
            child.isShow = false;
            if (child.objelement) {
                child.objelement.remove();
                child.objelement = null;
            }
            if (child.skill_element) {
                child.skill_element.remove();
                child.skill_element = null;
            }
            child.skill_element_id = null;
        }
        if (this.message) {
            this.message._inDetail = false;
            this.message.detailID = null;
        }
        this.isShow = false;
        this.curItem = null;
        const content = this.contentElement || $(".dialog>.dialog-content");
        const footer = this.footerElement || $(".dialog>.dialog-footer");
        content.empty();
        footer.empty();
        $(".dialog>.dialog-header>.dialog-title").empty();
        $(".content-room").removeClass("hide");
        $(".dialog").addClass("hide");
    },
    injectStyle: function (css) {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);
    },
};

export default Dialog;
