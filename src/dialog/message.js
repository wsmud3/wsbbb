

import { showFlag } from '../game/tool.js';
export default {
    init: function () {

        Dialog.injectStyle(message_css);
    },
    close: function () {

        this.element.remove();
        this.isShow = false;
    }, hide: function () {
        // 鍦ㄨ鎯呴〉鏃惰繑鍥炲垪琛紝涓嶅叧闂璇濇
        if (this._inDetail) {
            this.hide_detail();
            return false;
        }
    }, hide_detail: function () {
        this.element.removeClass("detail");
        this.detailID = null;
        this._inDetail = false;
        Dialog.footerElement.find('.item-commands').empty();
        // 鎭㈠搴曢儴 tab 鏍?
        this.create_footer();
        this.footerChanged(this.selected_item);
    },
    selected_item: 0,
    messages: [],
    isLoad: false,
    unRead: 0,
    onData: function (data) {
        if (data.receive) return this.updateMessageState(data.receive, data.index);
        if (data.items) {
            return this.createMessageDetail(data.id, data.items);
        }
        if (data.clear) return this.clear_message(data.clear);

        if (data.unRead != undefined) {
            this.unRead = data.unRead;
        }
        if (data.messages) {
            for (var i = 0; i < data.messages.length; i++) {
                this.addMessage(data.messages[i]);
            }
        }

        if (data.message) {
            if (!this.isShow) this.unRead++;
            if (this.messages)
                this.addMessage(data.message);
            if (data.message.id == "notice") {
                this.showNotice(data.message);
            }
        }
        if (this.isShow && this.element)
            this.showMessages();
        if (this.isShow) {
            if (data.message && this.element.is(".detail")
                && this.detailID == data.message.id) {
                this.detailElement.prepend($(this.createMessageDetailItem(data.message.id,
                    data.message.name, data.message)));
            }
        } else
            this.showUnread();

    }, showUnread: function () {
        if (this.unRead) showFlag("message", this.unRead);
        else showFlag("message", 0);
    },
    addMessage: function (msg) {
        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].id == msg.id) {
                this.messages[i] = msg;
                return;
            }
        }
        this.messages.push(msg);
    }, clear_message: function (type) {
        // 鏈墦寮€杩囨秷鎭璇濇鏃?element 涓嶅瓨鍦紝鐩存帴蹇界暐锛坰howMessages 闇€瑕?element锛?
        if (!this.element) return;
        for (let i = 0; i < this.messages.length; i++) {
            let from = this.messages[i].id;
            if ((type === true && from !== 'notice') || from == type) {
                this.messages.splice(i, 1);
                i--;
            }
        }
        this.showMessages();
        if (!this.isShow) return;
        if (this.element.is(".detail")
            && (type === true || this.detailID == type)) {
            this.hide_detail();
        }
    },
    show: function (data) {
        this.unRead = 0;
        this.showUnread();
        if (this.isShow) return;
        this.isShow = true;
        Dialog.title("娑堟伅");
        Dialog.icon("envelope");
        this.create_footer();
        this.footerChanged(this.selected_item);
        if (this.isLoad) return;
        SendCommand("message");
        this.isLoad = true;

        //  this.element.on("click", ".detail-item", this.showDetailCommand);
    },
    inner_show: function () {

        Dialog.title("娑堟伅");
        Dialog.icon("envelope");
        // 鍏堣В缁戝啀缁戝畾锛岄伩鍏嶆瘡娆″垏鎹㈠簳閮?tab / 浠庤鎯呰繑鍥炲垪琛ㄦ椂
        // 閲嶅缁戝畾锛屽鑷寸偣鍑讳竴鏉℃秷鎭Е鍙戝娆?showMessageDetail
        this.element.off("click", ".message-item")
            .on("click", ".message-item", this.showMessageDetail);
    },
    inner_close: function () {
        this.element.remove();
        this.isShow = false;
    },
    footers: ["娑堟伅", "闃熶紞", "鍏崇郴", "甯淳"],
    footerElements: ["message", "team", "relation", "party"],
    create_footer: function () {
        var html = [];
        for (var i = 0; i < this.footers.length; i++) {
            html.push("<span class='footer-item" + (i == this.selected_item ? " select" : "") + "' for='" + i + "''>"
                + this.footers[i] + "</span>");
        }
        html.push('<div class="item-commands"></div>');
        Dialog.footer(html.join(""));


    }, footerChanged: function (index) {
        //if (index == this.selected_item) return;
        this.selected_item = index;
        Dialog.footerElement.find('.item-commands').empty();
        this.showChild();
    }, showChild: function () {
        var child = Dialog[this.footerElements[this.selected_item]];
        //if (this.selectedChild == child) return;
        if (this.selectedChild) this.selectedChild.inner_close();
        if (!child.element) child.element = child.createElement();
        Dialog.contentElement.html(child.element);
        child.inner_show();

        this.selectedChild = child;
    }, showNotice: function (nt) {
        var str = ["\n<hiy>绯荤粺鍏憡</hiy>\n"];
        var dt = new Date(nt.time);
        str.push(dt.getFullYear());
        str.push("骞?);
        str.push(dt.getMonth() + 1);
        str.push("鏈?);
        str.push(dt.getDate());
        str.push("鏃?");
        str.push(dt.getHours());
        str.push("鏃?);
        str.push(dt.getMinutes());
        str.push("鍒哱n<hic>");
        str.push(nt.content);
        str.push("\n</hic>");
        ReceiveMessage(str.join(""));
    }, showMessages: function (newmsg) {
        var str = [];
        for (var i = 0; i < this.messages.length; i++) {
            var msg = this.messages[i];
            str.push("<div class='message-item' fromid=\"");
            str.push(msg.id);
            str.push("\"><div class='message-title'>");
            str.push(msg.name);

            str.push("<span class='message-time'>");
            str.push(this.getTimedesc(msg.time));
            str.push("</span>");
            str.push("</div>");
            str.push("<div class='message-content'>");
            str.push(msg.content);
            str.push("</div>");
            str.push("</div>");
        }
        if (!str.length) str.push('<div class="empty">鏆傛棤鏂版秷鎭?/div>');
        if (!this.listElement) this.listElement = this.element.find(".message-list");
        // 璁板綍婊氬姩瀹瑰櫒褰撳墠浣嶇疆锛岄伩鍏嶉噸寤哄垪琛ㄦ椂璺冲洖椤堕儴锛?
        // 鍘熸湰鍦ㄥ簳閮ㄥ垯璺熼殢鏂版秷鎭粴鍔ㄥ埌搴曪紝鍚﹀垯淇濇寔鍘熶綅缃笉鍔?
        var scrollElem = (Dialog.contentElement && Dialog.contentElement[0]) || null;
        var scrollTop = scrollElem ? scrollElem.scrollTop : 0;
        var atBottom = !scrollElem || (scrollTop + scrollElem.clientHeight >= scrollElem.scrollHeight - 50);
        this.listElement.html(str.join(""));
        if (scrollElem) {
            if (atBottom) scrollElem.scrollTop = scrollElem.scrollHeight;
            else scrollElem.scrollTop = scrollTop;
        }

    }, getTimedesc: function (long) {
        var now = new Date();
        var time = new Date(long);
        var dt = (now - time) / 1000;
        if (dt < 60) return "鍒氬垰";
        else if (dt < 3600) return parseInt(dt / 60) + "鍒嗛挓鍓?;
        else if (time.getFullYear() == now.getFullYear() && time.getMonth() == now.getMonth()) {
            var diff_day = time.getDate() - now.getDate();
            var msg = "浠婂ぉ " + this.add_zero(time.getHours()) + ":" + this.add_zero(time.getMinutes());
            if (diff_day == 0) return msg;
            else if (diff_day == 1) return "鏄ㄥぉ " + msg;
            else if (diff_day == 2) return "鍓嶅ぉ " + msg;

        }
        var str = (time.getMonth() + 1) + "鏈? + time.getDate() + "鏃?" + this.add_zero(time.getHours()) + "锛? + this.add_zero(time.getMinutes());
        if (now - time > 2332800000) {
            str += "<mem>鍗冲皢杩囨湡</mem>";
        }
        return str;

    }, add_zero: function (num) {
        if (num < 10) return "0" + num;
        return num;
    }, showMessageDetail: function () {
        var id = $(this).attr("fromid");
        if (!id) return;
        // 娉ㄦ剰锛氭澶勭殑 this 鏄偣鍑荤殑娑堟伅鑺傜偣锛坖Query 浜嬩欢鍥炶皟锛夛紝
        // 蹇呴』鏄惧紡鎶?detailID/_inDetail 鍐欏埌瀵硅瘽妗嗗璞′笂锛屽惁鍒?hide() 妫€鏌?
        // 鍒ゆ柇"鏄惁鍦ㄨ鎯呴〉"浼氬け鏁堬紝鐐瑰叧闂細鐩存帴鍏虫帀鏁翠釜瀵硅瘽妗嗚€屾棤娉曡繑鍥炲垪琛?
        Dialog.message.detailID = id;
        Dialog.message._inDetail = true;
        SendCommand("message " + id);
        Dialog.message.element.addClass("detail");

    }, getMessageitem: function (id) {
        for (var i = 0; i < this.messages.length; i++) {
            if (this.messages[i].id == id) return this.messages[i];
        }
    }, createMessageDetail: function (id, items) {
        if (!this.detailElement) {
            this.detailElement = this.element.find(".detail-list");
        }
        // 鍏堣褰曞綋鍓嶈鎯?id锛屼繚璇佸嵆浣挎秷鎭笉鍦ㄥ垪琛ㄤ腑涔熻兘姝ｅ父"杩斿洖涓婁竴绾?
        this.detailID = id;
        this._inDetail = true;
        var msg = this.getMessageitem(id);
        if (!msg) return;
        var str = [];
        let has_rec = false;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            str.push(this.createMessageDetailItem(id, msg.name, item));
            if (item.attach && !item.rec) {
                has_rec = true;
            }
        }
        this.detailElement.html(str.join(""));
        let cmds = `<span cmd="_closed">杩斿洖</span>`;
        if (id !== 'notice') {
            cmds += `<span cmd="message delete ${id}">鍒犻櫎</span><span cmd="receive ${id}">棰嗗彇鍏ㄩ儴</span>`;
        }
        Dialog.footerElement.find('.item-commands').html(cmds);

    }, createMessageDetailItem: function (id, name, item) {
        var str = [];
        str.push("<div class='detail-item' rec='",
            item.attach && !item.rec ? 1 : 0,
            "' fid='", id, "' index='" + item.index + "'>");
        str.push("<span class='detail-name'>");
        str.push(name);
        str.push("</span>");
        str.push("<span class='detail-time'>");
        str.push(this.getTimedesc(item.time));
        str.push("</span>");
        str.push("<pre class='detail-content'>");
        str.push(item.content);
        str.push("</pre>");
        if (item.attach) {
            for (var j = 0; j < item.attach.length; j++) {
                str.push("<div class='detail-attach'>");
                str.push(item.attach[j].name);
                str.push("</div>");
            }
            if (item.rec) {
                str.push("<div class='detail-rec'>宸查鍙?/div>");
            } else {
                str.push("<div  class='detail-rec' cmd='receive " + id
                    + " " + item.index + "'><hig>棰嗗彇</hig></div>");
            }
        }
        str.push("</div>");
        return str.join("");
    },
    createElement: function () {
        var el = $('<div class="dialog-message"><div class="message-list"></div><div class="detail-list"></div></div>');
        // 璇︽儏鐣岄潰锛氱偣鍑讳换鎰忓尯鍩熻繑鍥炰笂涓€绾э紙娑堟伅鍒楄〃锛夛紝
        // 涓庤儗鍖呯墿鍝佽鎯呫€佹妧鑳借鎯呬繚鎸佷竴鑷达紱甯?cmd 鐨勫懡浠ゆ寜閽紙濡傞鍙栵級闄ゅ
        el.find(".detail-list").on("click", function (e) {
            if (!Dialog.message._inDetail) return;
            if ($(e.target).closest('[cmd]').length > 0) return;
            Dialog.message.hide_detail();
        });
        return el;
    }, updateMessageState: function (rec, index) {
        if (this.detailID != rec) return;
        const elem = this.detailElement.find(".detail-item[index='" + index + "']>.detail-rec");
        elem.html("宸查鍙?).removeAttr('cmd');
    }
};
const message_css = `

.dialog-message{
    height: 25em;
    max-height: 30em;
}

.dialog-message>.message-list>.empty{
    color: #505050;
    padding-top: 1em;
    text-align: center;
}

.dialog-message>.message-list>.message-item {

    padding-left: 1em;
    border-radius: 4px;
    border-left-width: 2px;
    border-left-style: solid;
    border-left-color: gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
    cursor: pointer;

}

.dialog-message>.message-list>.message-item>.message-title {
    color: #FFFF00;
    line-height: 2em;
}

.dialog-message>.message-list>.message-item>.message-content {
    white-space: break-spaces;
    word-wrap: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-bottom: 0.5em;
}

.dialog-message>.message-list>.message-item>.message-title>.message-time {
    float: right;
    margin-right: 0.5em;

}

.detail {
    min-height: 25em;
    max-height: 25em;
}

.detail>.message-list {
    display: none;
}

.dialog-message>.detail-list {
    display: none;
}

.detail>.detail-list {
    display: block;
}


.dialog-team,
.dialog-party,
.dialog-relation {
    height: 25em;
    max-height: 30em;
}

.dialog-team>.empty {
    color: #505050;
    padding-top: 1em;
    text-align: center;
}

.dialog-team>.team-item {
    padding-left: 0.5em;
    border-radius: 4px;
    border-left-width: 2px;
    border-left-style: solid;
    border-left-color: gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
    line-height: 2em;
    cursor: pointer;
}

.dialog-team>.team-item>.item-commands {
    padding-left: 2em;
}

.dialog-team>.team-item>.team-flag {
    width: 2em;
    display: inline-block;
    text-align: center;
    color: #FFFF00
}

.dialog-team>.team-item>.team-name {
    display: inline-block;
}

.dialog-relation>.relation-item {
    padding-left: 0.5em;
    border-radius: 4px;
    border-left-width: 2px;
    border-left-style: solid;
    border-left-color: gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
    line-height: 2em;
    display: flex;
    flex-direction: row;
}

.dialog-relation>.relation-item>.relation-desc {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.dialog-relation>.relation-item>.relation-cmd {
    flex: 0;
    background-color: #222;
    padding-left: 1em;
    padding-right: 1em;
    cursor: pointer;
    border-left: 2px solid #111;
}

.detail-item {
    margin-bottom: 0.5em;
    margin-top: 0.5em;
    padding: 0.5em;
    background-color: #111;
    padding-left: 1em;
    border-radius: 4px;
    border-top-width: 2px;
    border-top-style: solid;
    border-top-color: gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
}

.detail-item>.detail-name {
    color: #FFFF00;
}

.detail-item>.detail-time {
    margin-left: 1em;
    color: gray;
}

.detail-item>.detail-content {
    white-space: pre-wrap;
}

.detail-item>.detail-rec {
    margin-top: 1em;
    background-color: #222;
    color: gray;
    display: inline-block;
    font-size: 0.8em;
    padding-left: 1em;
    padding-right: 1em;
    border-radius: 1em;
    cursor: pointer;
}

`;

